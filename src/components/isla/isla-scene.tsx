import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html, Text } from "@react-three/drei";
import worldFont from "@fontsource/nunito/files/nunito-latin-400-normal.woff?url";
import * as THREE from "three";
import { Character } from "@/components/meta/character";
import { ACADEMY_DOOR, CRYSTALS, REGIONS, SECRETS, type RegionId } from "@/data/isla";
import {
  collectSecret,
  enterRegion,
  getIsla,
  islaControls,
  isRegionLocked,
  patchIsla,
  tryCollectCrystal,
} from "@/lib/isla-store";
import {
  ISLAND_RADIUS,
  WATER_LEVEL,
  WORLD_SCALE as S,
  isWalkable,
  terrainHeight,
  ws,
} from "@/lib/isla-terrain";

import { audioEngine } from "@/services/audio/audio-engine";
import { conversationalVoiceEngine } from "@/services/ai/conversational-voice-engine";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { cameraMovement } from "@/services/game/input";
import { QUALITY, useQuality } from "@/services/game/quality";

const SPEED = 9.5;
const SWIM_SPEED = 5.6;
/** How far out from the island you may swim before the current pushes you back. */
const SWIM_LIMIT = ISLAND_RADIUS + 70;
/** Water surface the swimmer floats at (the ocean plane bobs around y = -0.1). */
const SWIM_Y = WATER_LEVEL - 0.55;
const move = new THREE.Vector3();
const JOURNEY_BOARD: [number, number] = [7, 20];
const PLAYER_SPAWN: [number, number] = [0, 12 * S];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function regionAt(x: number, z: number): RegionId {
  let best: RegionId = "city";
  let bestScore = Infinity;
  for (const r of REGIONS) {
    const d = Math.hypot(x - r.center[0], z - r.center[1]) - r.radius;
    if (d < bestScore) {
      bestScore = d;
      best = r.id;
    }
  }
  return best;
}

/* ------------------------------------------------------------------ terrain */

function Terrain() {
  const { terrainSegments } = QUALITY[useQuality()];
  const geometry = useMemo(() => {
    const size = ISLAND_RADIUS * 2.6;
    const seg = terrainSegments;
    const geo = new THREE.PlaneGeometry(size, size, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);
      const region = regionAt(x, z);
      if (h < 0.6) c.set("#e8d9a8");
      else if (region === "desert") c.set("#d9a441");
      else if (region === "beach") c.set("#f0e2b6");
      else if (region === "mountains") c.set(h > 18 ? "#e7ecff" : h > 10 ? "#7b8399" : "#4c5a52");
      else if (region === "forest") c.set("#1f6b3f");
      else if (region === "valley") c.set("#8a7a4e");
      else if (region === "spaceport") c.set("#3a4763");
      else c.set("#2f7d52");
      c.offsetHSL(0, 0, (Math.sin(x * 0.7) + Math.cos(z * 0.6)) * 0.012);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [terrainSegments]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh
      geometry={geometry}
      receiveShadow
      onPointerUp={(e) => {
        if (islaControls.dragged) return;
        e.stopPropagation();
        islaControls.moveTarget = { x: e.point.x, z: e.point.z };
      }}
    >
      <meshStandardMaterial vertexColors roughness={0.96} metalness={0.02} />
    </mesh>
  );
}

function Ocean() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y = Math.sin(clock.elapsedTime * 0.5) * 0.12 - 0.1;
    ref.current.rotation.y = clock.elapsedTime * 0.002;
  });
  return (
    <group ref={ref} position-y={-0.1}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1400, 96]} />
        <meshStandardMaterial
          color="#087fa2"
          transparent
          opacity={0.9}
          roughness={0.16}
          metalness={0.28}
          emissive="#063e58"
          emissiveIntensity={0.45}
        />
      </mesh>
      {[190, 280, 390].map((radius, index) => (
        <mesh key={radius} rotation-x={-Math.PI / 2} position-y={0.035 + index * 0.012}>
          <ringGeometry args={[radius, radius + 1.4, 96]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.18 - index * 0.035} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------------- props */

type Instance = { p: [number, number, number]; s: number; r: number };

function useScatter(
  seed: number,
  count: number,
  center: [number, number],
  radius: number,
  minHeight = 0.8,
) {
  return useMemo<Instance[]>(() => {
    const rand = mulberry32(seed);
    const out: Instance[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 30) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * radius;
      const x = center[0] + Math.cos(a) * d;
      const z = center[1] + Math.sin(a) * d;
      const y = terrainHeight(x, z);
      if (y < minHeight || !isWalkable(x, z)) continue;
      out.push({ p: [x, y, z], s: 0.7 + rand() * 0.9, r: rand() * Math.PI * 2 });
    }
    return out;
  }, [seed, count, center, radius, minHeight]);
}

function Instanced({
  items,
  color,
  children,
  yOffset = 0,
  emissive,
}: {
  items: Instance[];
  color: string;
  children: React.ReactNode;
  yOffset?: number;
  emissive?: string;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    items.forEach((item, i) => {
      dummy.position.set(item.p[0], item.p[1] + yOffset * item.s, item.p[2]);
      dummy.rotation.y = item.r;
      dummy.scale.setScalar(item.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    // Without this the batch keeps the single-geometry bounds and the whole
    // clump vanishes as soon as you walk close to it.
    mesh.computeBoundingSphere();
    mesh.count = items.length;
  }, [items, yOffset]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, Math.max(items.length, 1)]}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      {children}
      <meshStandardMaterial
        color={color}
        roughness={0.8}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissive ? 0.5 : 0}
      />
    </instancedMesh>
  );
}

/** Island-wide dressing: grass tufts, wildflowers, bushes and boulders. */
function GroundCover() {
  const { scatter } = QUALITY[useQuality()];
  const r = ISLAND_RADIUS * 0.92;
  const grass = useScatter(101, Math.round(1400 * scatter), [0, 0], r, 0.9);
  const flowers = useScatter(103, Math.round(380 * scatter), [0, 0], r * 0.8, 1.2);
  const bushes = useScatter(107, Math.round(320 * scatter), [0, 0], r * 0.85, 1.1);
  const boulders = useScatter(109, Math.round(180 * scatter), [0, 0], r * 0.9, 1.4);
  return (
    <>
      <Instanced items={grass} color="#4f9e4a" yOffset={0.42}>
        <coneGeometry args={[0.22, 0.95, 4]} />
      </Instanced>
      <Instanced items={flowers} color="#f7b1d8" yOffset={0.75} emissive="#f7b1d8">
        <icosahedronGeometry args={[0.16, 0]} />
      </Instanced>
      <Instanced items={bushes} color="#2f6f42" yOffset={0.4}>
        <dodecahedronGeometry args={[0.75, 0]} />
      </Instanced>
      <Instanced items={boulders} color="#8b8d92" yOffset={0.25}>
        <icosahedronGeometry args={[0.85, 0]} />
      </Instanced>
    </>
  );
}

/** Drifting cloud banks + a lazy flock, so the sky is not a flat gradient. */
function Sky() {
  const clouds = useRef<THREE.Group>(null);
  const birds = useRef<THREE.Group>(null);
  const puffs = useMemo(() => {
    const rand = mulberry32(211);
    return Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const d = 120 + rand() * ISLAND_RADIUS * 1.1;
      return {
        p: [Math.cos(a) * d, 95 + rand() * 70, Math.sin(a) * d] as [number, number, number],
        s: 14 + rand() * 26,
      };
    });
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (clouds.current) clouds.current.rotation.y = t * 0.004;
    if (birds.current) {
      birds.current.rotation.y = t * 0.05;
      birds.current.position.y = 46 + Math.sin(t * 0.4) * 4;
    }
  });

  return (
    <>
      <group ref={clouds}>
        {puffs.map((c, i) => (
          <group key={i} position={c.p}>
            {[0, 1, 2].map((k) => (
              <mesh
                key={k}
                position={[k * c.s * 0.5 - c.s * 0.5, (k % 2) * c.s * 0.14, (k % 2) * c.s * 0.3]}
              >
                <sphereGeometry args={[c.s * (0.5 + (k % 2) * 0.18), 10, 8]} />
                <meshStandardMaterial color="#ffffff" roughness={1} transparent opacity={0.82} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
      <group ref={birds} position={[0, 46, 0]}>
        {Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const d = 150 + (i % 3) * 40;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * d, (i % 4) * 5, Math.sin(a) * d]}
              rotation-y={-a}
            >
              <coneGeometry args={[0.5, 2.4, 3]} />
              <meshStandardMaterial color="#1f2937" />
            </mesh>
          );
        })}
      </group>
    </>
  );
}

function Forest() {
  const trees = useScatter(11, 420, ws([-44, -40]), 32 * S, 1.2);
  return (
    <>
      <Instanced items={trees} color="#5b3a22" yOffset={1.6}>
        <cylinderGeometry args={[0.28, 0.42, 3.4, 6]} />
      </Instanced>
      <Instanced items={trees} color="#1f8a4c" yOffset={5}>
        <coneGeometry args={[2.1, 5.2, 7]} />
      </Instanced>
      <Waterfall />
    </>
  );
}

function Waterfall() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const m = ref.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.65 + Math.sin(clock.elapsedTime * 3) * 0.1;
    }
  });
  const x = -47 * S;
  const z = -47 * S;
  return (
    <group position={[x, terrainHeight(x, z), z]}>
      <mesh ref={ref} position={[0, 3.4, 0]}>
        <planeGeometry args={[4.6, 7]} />
        <meshStandardMaterial
          color="#9be8ff"
          transparent
          opacity={0.7}
          emissive="#38bdf8"
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.06, 2.4]}>
        <circleGeometry args={[4, 24]} />
        <meshStandardMaterial color="#38bdf8" transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

function Mountains() {
  const rocks = useScatter(21, 220, ws([44, -46]), 32 * S, 3);
  const peaks = useMemo<Instance[]>(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const d = rand() * 22 * S;
      const x = 44 * S + Math.cos(a) * d;
      const z = -46 * S + Math.sin(a) * d;
      return {
        p: [x, terrainHeight(x, z), z] as [number, number, number],
        s: 1.4 + rand() * 2.2,
        r: rand() * 3,
      };
    });
  }, []);
  return (
    <>
      <Instanced items={rocks} color="#6b7280" yOffset={0.6}>
        <icosahedronGeometry args={[1.2, 0]} />
      </Instanced>
      <Instanced items={peaks} color="#94a3b8" yOffset={3.2}>
        <coneGeometry args={[3.4, 8, 6]} />
      </Instanced>
      {/* Summit observation temple */}
      <group position={[46 * S, terrainHeight(46 * S, -52 * S), -52 * S]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 3.4,
              2.2,
              Math.sin((i / 4) * Math.PI * 2) * 3.4,
            ]}
            castShadow
          >
            <cylinderGeometry args={[0.4, 0.5, 4.4, 8]} />
            <meshStandardMaterial color="#c2a373" roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 4.7, 0]} castShadow>
          <boxGeometry args={[9, 0.6, 9]} />
          <meshStandardMaterial color="#a5b4fc" emissive="#4338ca" emissiveIntensity={0.25} />
        </mesh>
      </group>
    </>
  );
}

function Valley() {
  // Large weathered ruins instead of a forest of thin posts: broad broken
  // columns on stepped plinths, heavy capitals and toppled blocks.
  const columns = useScatter(31, 34, ws([-26, 48]), 22 * S, 0.7);
  const rubble = useScatter(37, 46, ws([-26, 48]), 24 * S, 0.7);
  return (
    <>
      {/* stepped plinths */}
      <Instanced items={columns} color="#b9a077" yOffset={0.6}>
        <boxGeometry args={[5.2, 1.2, 5.2]} />
      </Instanced>
      {/* massive fluted column shafts */}
      <Instanced items={columns} color="#d3c1a0" yOffset={5.4}>
        <cylinderGeometry args={[1.5, 1.9, 9.6, 12]} />
      </Instanced>
      {/* broken capitals crowning the shafts */}
      <Instanced items={columns} color="#c9b489" yOffset={10.6}>
        <boxGeometry args={[4.2, 1.4, 4.2]} />
      </Instanced>
      {/* toppled blocks and shattered drums scattered between them */}
      <Instanced items={rubble} color="#bfae8c" yOffset={0.8}>
        <boxGeometry args={[3.4, 1.6, 2.2]} />
      </Instanced>

      <group position={[-26 * S, terrainHeight(-26 * S, 48 * S), 48 * S]}>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.07, 0]} receiveShadow>
          <ringGeometry args={[6, 12, 32]} />
          <meshStandardMaterial color="#e7d4a3" />
        </mesh>
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[2.4, 6, 2.4]} />
          <meshStandardMaterial color="#d6c396" emissive="#fbbf24" emissiveIntensity={0.15} />
        </mesh>
      </group>
    </>
  );
}

function Desert() {
  const ruins = useScatter(41, 120, ws([-58, 16]), 26 * S, 0.8);
  return (
    <Instanced items={ruins} color="#b98b3d" yOffset={1.2}>
      <boxGeometry args={[1.6, 2.6, 1.6]} />
    </Instanced>
  );
}

function Beach() {
  const palms = useScatter(51, 120, ws([30, 52]), 24 * S, 0.7);
  return (
    <>
      <Instanced items={palms} color="#8a5a2b" yOffset={2.2}>
        <cylinderGeometry args={[0.2, 0.3, 4.4, 6]} />
      </Instanced>
      <Instanced items={palms} color="#22c55e" yOffset={4.6}>
        <sphereGeometry args={[1.7, 8, 6]} />
      </Instanced>
      {/* docks + boats */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[(34 + i * 5) * S, 0.4, (62 + i * 2) * S]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.2, 0.3, 14]} />
            <meshStandardMaterial color="#8b5e3c" />
          </mesh>
          <mesh position={[2.6, 0.3, 5]} castShadow>
            <boxGeometry args={[2.2, 0.9, 4.4]} />
            <meshStandardMaterial color="#a9805a" roughness={0.95} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function SpacePort({ locked }: { locked: boolean }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ring.current) ring.current.rotation.z += d * 0.4;
  });
  const y = terrainHeight(62 * S, 8 * S);
  return (
    <group position={[62 * S, y, 8 * S]}>
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[1.6, 2.6, 18, 12]} />
        <meshStandardMaterial color="#cbb79a" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 19.4, 0]} castShadow>
        <coneGeometry args={[1.6, 4, 12]} />
        <meshStandardMaterial color="#c084fc" emissive="#7c3aed" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={ring} position={[0, 6, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[9, 0.3, 8, 48]} />
        <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={0.9} />
      </mesh>
      {locked && (
        <Text
          font={worldFont}
          position={[0, 3, 10]}
          fontSize={1.5}
          color="#fca5a5"
          anchorX="center"
        >
          🔒 LAUNCH GATE LOCKED
        </Text>
      )}
    </group>
  );
}

/** Simple furniture kit used to dress every hut interior. */
function HutInterior() {
  return (
    <group>
      {/* woven floor rug */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.72, 0]} receiveShadow>
        <circleGeometry args={[2.2, 24]} />
        <meshStandardMaterial color="#b45309" roughness={1} />
      </mesh>
      {/* bed */}
      <group position={[-1.5, 0.7, -1.1]} rotation-y={0.5}>
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 0.4, 2]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.56, 0.1]} castShadow>
          <boxGeometry args={[1.05, 0.18, 1.7]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.68, -0.75]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.35]} />
          <meshStandardMaterial color="#f8fafc" roughness={1} />
        </mesh>
      </group>
      {/* table + two stools */}
      <group position={[1.4, 0.7, 0.4]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.1, 12]} />
          <meshStandardMaterial color="#a16207" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 0.72, 8]} />
          <meshStandardMaterial color="#6f4a2c" roughness={1} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 1.15, 0.28, s * 0.3]} castShadow>
            <cylinderGeometry args={[0.3, 0.32, 0.55, 10]} />
            <meshStandardMaterial color="#7c5a3a" roughness={1} />
          </mesh>
        ))}
        {/* fruit bowl */}
        <mesh position={[0, 0.86, 0]} castShadow>
          <sphereGeometry args={[0.2, 12, 10]} />
          <meshStandardMaterial color="#f97316" roughness={0.7} />
        </mesh>
      </group>
      {/* shelf with books */}
      <group position={[0.2, 0.7, -2.1]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[1.8, 0.1, 0.5]} />
          <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
        </mesh>
        {[-0.6, -0.3, 0, 0.35, 0.65].map((x, i) => (
          <mesh key={x} position={[x, 1.32, 0]} castShadow>
            <boxGeometry args={[0.16, 0.36, 0.3]} />
            <meshStandardMaterial
              color={(["#38bdf8", "#f472b6", "#facc15", "#4ade80", "#c084fc"] as const)[i]!}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>
      {/* hanging lantern */}
      <mesh position={[0, 2.9, 0]}>
        <sphereGeometry args={[0.28, 14, 12]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#f59e0b"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        position={[0, 2.7, 0]}
        color="#ffb457"
        intensity={9}
        distance={9}
        castShadow={false}
      />
    </group>
  );
}

/**
 * A tropical palapa hut you can actually walk into: the cane wall is built
 * from segments with a doorway gap at the front, and the inside is furnished.
 */
/**
 * Futuristic Guardian Sci-Fi Building (Eco-Tower / Tech-Dome)
 * Replaces old primitive huts with high-tech sci-fi architecture matching World 1: Isla Central specification.
 */
function GuardianBuilding({
  position,
  scale = 1,
  rotation = 0,
  variant = 0,
}: {
  position: [number, number, number];
  scale?: number;
  rotation?: number;
  variant?: number;
}) {
  const accentColor = variant % 3 === 0 ? "#00f0ff" : variant % 3 === 1 ? "#a855f7" : "#22e07a";

  return (
    <group position={position} rotation-y={rotation} scale={scale}>
      {/* Metallic pedestal base */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.2, 3.6, 0.8, 16]} />
        <meshStandardMaterial
          color="#2d78a6"
          emissive="#0c4a6e"
          emissiveIntensity={0.16}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>

      {/* Glowing neon accent ring at base */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.82, 0]}>
        <ringGeometry args={[3.0, 3.25, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Main sleek eco-structure body */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.4, 3.0, 4.8, 16]} />
        <meshStandardMaterial
          color="#4b9bc0"
          emissive="#075985"
          emissiveIntensity={0.14}
          metalness={0.16}
          roughness={0.32}
        />
      </mesh>

      {/* Futuristic Glass Dome Roof */}
      <mesh position={[0, 5.8, 0]} castShadow>
        <sphereGeometry args={[2.3, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.65}
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
          roughness={0.1}
        />
      </mesh>

      {/* Glowing holographic window strip */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[2.42, 2.42, 1.2, 16, 1, true]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.5}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* Layered balconies and luminous ribs make the skyline readable from a distance. */}
      {[1.7, 4.65].map((height, band) => (
        <mesh key={height} position={[0, height, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[2.7 - band * 0.18, 0.13, 8, 32]} />
          <meshStandardMaterial
            color={band === 0 ? "#f8fafc" : accentColor}
            emissive={accentColor}
            emissiveIntensity={band === 0 ? 0.45 : 1.25}
            metalness={0.7}
            roughness={0.18}
          />
        </mesh>
      ))}
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <mesh
            key={angle}
            position={[Math.sin(angle) * 2.72, 3.1, Math.cos(angle) * 2.72]}
            rotation-y={angle}
          >
            <boxGeometry args={[0.14, 3.7, 0.16]} />
            <meshBasicMaterial color={accentColor} toneMapped={false} />
          </mesh>
        );
      })}

      {/* Roof gardens connect the tech towers to the lush reference world. */}
      {[-1, 0, 1].map((offset) => (
        <mesh key={offset} position={[offset * 0.85, 5.8, 0.2]} castShadow>
          <icosahedronGeometry args={[0.48 + (offset === 0 ? 0.12 : 0), 1]} />
          <meshStandardMaterial color="#34d399" roughness={0.82} />
        </mesh>
      ))}

      {/* Spire / Antenna */}
      <mesh position={[0, 7.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.2, 3.2, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 9.2, 0]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function CityTransit() {
  const shuttles = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (shuttles.current) shuttles.current.rotation.y = clock.elapsedTime * 0.1;
  });
  const radius = 14.2 * S;
  const railHeight = 9;
  return (
    <group position-y={2.26 * S * 0.8}>
      <mesh rotation-x={Math.PI / 2} position-y={railHeight}>
        <torusGeometry args={[radius, 0.12, 6, 96]} />
        <meshStandardMaterial
          color="#67e8f9"
          emissive="#06b6d4"
          emissiveIntensity={1.1}
          transparent
          opacity={0.72}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={railHeight + 0.04}>
        <torusGeometry args={[radius + 0.34, 0.055, 5, 96]} />
        <meshBasicMaterial color="#fde68a" transparent opacity={0.8} toneMapped={false} />
      </mesh>
      <group ref={shuttles} position-y={railHeight}>
        {[0, 1, 2].map((index) => {
          const angle = (index / 3) * Math.PI * 2;
          return (
            <group
              key={index}
              position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
              rotation-y={angle}
            >
              <mesh castShadow>
                <capsuleGeometry args={[0.6, 2.4, 6, 12]} />
                <meshStandardMaterial
                  color="#e0f2fe"
                  emissive="#0ea5e9"
                  emissiveIntensity={0.5}
                  metalness={0.48}
                  roughness={0.18}
                />
              </mesh>
              <pointLight color="#22d3ee" intensity={2.5} distance={7} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

function CityGardens() {
  const trees = useMemo<Instance[]>(() => {
    const result: Instance[] = [];
    for (let index = 0; index < 44; index++) {
      const angle = (index / 44) * Math.PI * 2;
      const radius = (11.6 + (index % 2) * 1.55) * S;
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      if (z > 0 && Math.abs(x) < 4.5) continue;
      result.push({ p: [x, 2.26 * S * 0.8, z], s: 0.7 + (index % 4) * 0.08, r: angle });
    }
    return result;
  }, []);
  return (
    <>
      <Instanced items={trees} color="#7c4a22" yOffset={1.15}>
        <cylinderGeometry args={[0.15, 0.24, 2.3, 6]} />
      </Instanced>
      <Instanced items={trees} color="#22c55e" yOffset={2.45}>
        <icosahedronGeometry args={[1.05, 1]} />
      </Instanced>
    </>
  );
}

function CentralCity() {
  const { scatter } = QUALITY[useQuality()];
  const towers = useMemo<Instance[]>(() => {
    const rand = mulberry32(99);
    const out: Instance[] = [];
    const total = Math.round(18 + scatter * 10);
    for (let i = 0; i < total; i++) {
      const a = (i / total) * Math.PI * 2 + rand() * 0.35;
      const d = (16 + rand() * 8) * S;
      const x = Math.cos(a) * d;
      const z = Math.sin(a) * d;
      out.push({ p: [x, terrainHeight(x, z), z], s: 0.85 + rand() * 1.3, r: rand() * 3 });
    }
    return out;
  }, [scatter]);

  return (
    <>
      {/* Sci-Fi Eco-City Guardian Towers */}
      {towers.map((tower, i) => (
        <GuardianBuilding
          key={i}
          position={tower.p}
          scale={0.8 + (tower.s % 1) * 0.4}
          rotation={tower.r}
          variant={i}
        />
      ))}
      <CityTransit />
      <CityGardens />

      {/* Guardian Main Plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 2.26 * S * 0.8, 0]} receiveShadow>
        <circleGeometry args={[11 * S, 64]} />
        <meshStandardMaterial
          color="#0b4f6c"
          emissive="#082f49"
          emissiveIntensity={0.14}
          roughness={0.42}
          metalness={0.12}
        />
      </mesh>

      {/* Radial pedestrian avenues break up the plaza and guide the player visually. */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={2.26 * S * 0.8 + 0.04}>
            <mesh position={[0, 0, 16]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.4, 32]} />
              <meshStandardMaterial color="#d6e5ec" roughness={0.46} metalness={0.18} />
            </mesh>
            <mesh position={[0, 0.035, 16]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.13, 31]} />
              <meshBasicMaterial color="#22d3ee" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* Plaza Glowing Neon Energy Rings */}
      {[5, 8, 10.4].map((r, idx) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position={[0, 2.26 * S * 0.8 + 0.03, 0]}>
          <ringGeometry args={[r * S - 0.4, r * S, 72]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#00f0ff" : "#a855f7"}
            emissive={idx % 2 === 0 ? "#00f0ff" : "#a855f7"}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Living terraces soften the central command tower. */}
      {[3.2, 6.8].map((radius, index) => (
        <group key={radius} position-y={2.26 * S * 0.8 + 0.16 + index * 0.08}>
          <mesh rotation-x={-Math.PI / 2} receiveShadow>
            <ringGeometry args={[radius * S - 1.25, radius * S, 64]} />
            <meshStandardMaterial color={index ? "#2f855a" : "#3aa76d"} roughness={0.86} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2} position-y={0.035}>
            <ringGeometry args={[radius * S - 0.12, radius * S + 0.05, 64]} />
            <meshBasicMaterial color="#a7f3d0" transparent opacity={0.75} />
          </mesh>
        </group>
      ))}

      {/* Nyrava Command Center — Central Sci-Fi Hyper-Tower */}
      <group position={[0, 2.26 * S * 0.8, 0]}>
        {/* Tier 1 Base */}
        <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[5.2, 6.8, 7, 16]} />
          <meshStandardMaterial
            color="#256f9d"
            emissive="#0c4a6e"
            emissiveIntensity={0.2}
            metalness={0.18}
            roughness={0.3}
          />
        </mesh>

        {/* The shield portal gives the city an unmistakable Nyrava front door. */}
        <mesh position={[0, 3.6, 6.45]}>
          <torusGeometry args={[2.15, 0.2, 10, 48]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
        <Text
          font={worldFont}
          position={[0, 3.6, 6.7]}
          fontSize={2.7}
          color="#fde68a"
          anchorX="center"
          anchorY="middle"
        >
          N
        </Text>

        {/* Tier 2 Tower Body */}
        <mesh position={[0, 15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.2, 4.8, 16, 16]} />
          <meshStandardMaterial
            color="#4b9fc4"
            emissive="#075985"
            emissiveIntensity={0.18}
            metalness={0.14}
            roughness={0.28}
          />
        </mesh>

        {/* Glowing Central Energy Core */}
        <mesh position={[0, 15, 0]}>
          <cylinderGeometry args={[3.3, 3.3, 10, 16, 1, true]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2}
            transparent
            opacity={0.65}
            toneMapped={false}
          />
        </mesh>

        {/* Floating Halo Ring */}
        <mesh position={[0, 22, 0]} rotation-x={Math.PI / 6}>
          <torusGeometry args={[5.5, 0.4, 16, 48]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0ea5e9"
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

        {[0, 1, 2, 3].map((index) => {
          const angle = (index / 4) * Math.PI * 2;
          return (
            <mesh
              key={index}
              position={[Math.sin(angle) * 4.45, 14, Math.cos(angle) * 4.45]}
              rotation-y={angle}
              castShadow
            >
              <boxGeometry args={[1.15, 13, 0.32]} />
              <meshStandardMaterial
                color="#dbeafe"
                emissive="#38bdf8"
                emissiveIntensity={0.4}
                metalness={0.7}
                roughness={0.2}
              />
            </mesh>
          );
        })}

        {/* Floating Top Energy Crest ('N') */}
        <mesh position={[0, 26, 0]} castShadow>
          <octahedronGeometry args={[3.5, 0]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>

        <Text
          font={worldFont}
          position={[0, 31, 0]}
          fontSize={2.4}
          color="#00f0ff"
          anchorX="center"
        >
          NYRAVA CIUDAD CENTRAL
        </Text>
      </group>

      {/* Academy Entrance — Sci-Fi High-Tech Portal */}
      <group
        position={[
          ACADEMY_DOOR[0],
          terrainHeight(ACADEMY_DOOR[0], ACADEMY_DOOR[1]),
          ACADEMY_DOOR[1] - 12,
        ]}
      >
        <mesh position={[0, 5, 0]} castShadow receiveShadow>
          <boxGeometry args={[20, 10, 14]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
        </mesh>

        {/* Glass Dome Entrance Roof */}
        <mesh position={[0, 10.5, 0]} castShadow>
          <sphereGeometry args={[8, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            emissive="#0ea5e9"
            emissiveIntensity={1}
          />
        </mesh>

        {/* Holographic Door Frame */}
        <mesh position={[0, 3.5, 7.1]}>
          <planeGeometry args={[6, 7]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        <Text
          font={worldFont}
          position={[0, 12.5, 0]}
          fontSize={1.8}
          color="#00f0ff"
          anchorX="center"
        >
          AI ACADEMY
        </Text>
      </group>

      {/* Mission Board — Futuristic Hologram Screen */}
      <group position={[8 * S, terrainHeight(8 * S, 10 * S) + 2, 10 * S]}>
        <mesh castShadow>
          <boxGeometry args={[4.8, 3.2, 0.3]} />
          <meshStandardMaterial color="#0f172a" emissive="#00f0ff" emissiveIntensity={0.8} />
        </mesh>
        <Text
          font={worldFont}
          position={[0, 0, 0.2]}
          fontSize={0.45}
          color="#00f0ff"
          maxWidth={4.2}
          anchorX="center"
        >
          WORLD 1 — ISLA CENTRAL
        </Text>
      </group>
    </>
  );
}

/* -------------------------------------------------------------- collectibles */

function Pickup({
  position,
  color,
  found,
  shape,
}: {
  position: [number, number];
  color: string;
  found: boolean;
  shape: "crystal" | "secret";
}) {
  const ref = useRef<THREE.Mesh>(null);
  const y = terrainHeight(position[0], position[1]);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.02;
    ref.current.position.y = 1.4 + Math.sin(clock.elapsedTime * 1.6 + position[0]) * 0.25;
  });
  if (found) return null;
  return (
    <group position={[position[0], y, position[1]]}>
      <mesh ref={ref} castShadow>
        {shape === "crystal" ? (
          <octahedronGeometry args={[0.75, 0]} />
        ) : (
          <tetrahedronGeometry args={[0.55, 0]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      <pointLight position={[0, 1.6, 0]} color={color} intensity={7} distance={9} />
    </group>
  );
}

/** A real world-space interaction point. Detailed UI opens only after approach/click. */
function JourneyBoard() {
  const y = terrainHeight(JOURNEY_BOARD[0], JOURNEY_BOARD[1]);
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 5 + Math.sin(clock.elapsedTime * 2) * 1.5;
  });
  return (
    <group
      position={[JOURNEY_BOARD[0], y, JOURNEY_BOARD[1]]}
      rotation-y={-0.25}
      onPointerUp={(event) => {
        event.stopPropagation();
        window.dispatchEvent(new Event("nyrava-open-journey"));
      }}
    >
      <mesh position={[-2.25, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 3.2, 8]} />
        <meshStandardMaterial color="#a86c25" />
      </mesh>
      <mesh position={[2.25, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 3.2, 8]} />
        <meshStandardMaterial color="#a86c25" />
      </mesh>
      <mesh position={[0, 2.8, 0]} castShadow>
        <boxGeometry args={[5, 2.7, 0.28]} />
        <meshStandardMaterial
          color="#071426"
          emissive="#063c56"
          emissiveIntensity={0.8}
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 2.8, 0.18]}>
        <ringGeometry args={[0.62, 0.78, 6]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={1.2} />
      </mesh>
      <Text
        font={worldFont}
        position={[0, 2.8, 0.22]}
        fontSize={0.72}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        N
      </Text>
      <Text
        font={worldFont}
        position={[0, 4.65, 0]}
        fontSize={0.38}
        color="#e0f2fe"
        anchorX="center"
      >
        GUARDIAN JOURNEY
      </Text>
      <pointLight ref={glow} position={[0, 3, 1]} color="#22d3ee" distance={12} />
    </group>
  );
}

/* -------------------------------------------------------------------- player */

function Player({ color, name, guardianId }: { color: string; name: string; guardianId: string }) {
  const group = useRef<THREE.Group>(null);
  const [gait, setGait] = useState<"idle" | "walk" | "run" | "swim">("idle");
  const nearRef = useRef<string | null>(null);
  const nearStationRef = useRef<string | null>(null);
  const talkingRef = useRef(false);
  const regionRef = useRef<RegionId>("city");
  const vy = useRef(0);
  const airborne = useRef(false);
  const swimming = useRef(false);
  const camPos = useRef(new THREE.Vector3());
  const [firstPerson, setFirstPerson] = useState(islaControls.view === "first");

  useEffect(() => {
    const onView = () => setFirstPerson(islaControls.view === "first");
    window.addEventListener("isla-view", onView);
    return () => window.removeEventListener("isla-view", onView);
  }, []);

  useEffect(() => {
    if (group.current) {
      const [sx, sz] = PLAYER_SPAWN;
      group.current.position.set(sx, terrainHeight(sx, sz), sz);
      islaControls.player.x = sx;
      islaControls.player.z = sz;
    }
  }, []);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const player = group.current;
    if (!player) return;
    const snapshot = getIsla();
    const busy = !!snapshot.challengeFor || snapshot.reporting;

    const keys = islaControls.keys;
    let ix = (keys.has("d") ? 1 : 0) - (keys.has("a") ? 1 : 0);
    let iz = (keys.has("w") ? 1 : 0) - (keys.has("s") ? 1 : 0);
    ix += islaControls.joystick.x;
    iz -= islaControls.joystick.y;

    let len = Math.hypot(ix, iz);
    const yaw = islaControls.cameraYaw;

    // Camera-relative movement: forward is the direction the camera looks.
    if (len > 0.08) {
      islaControls.moveTarget = null;
      const direction = cameraMovement(ix, iz, yaw);
      move.set(direction.x, 0, direction.z);
    } else if (islaControls.moveTarget) {
      // Click-to-walk: steer toward the clicked spot until we arrive.
      const dx = islaControls.moveTarget.x - player.position.x;
      const dz = islaControls.moveTarget.z - player.position.z;
      const d = Math.hypot(dx, dz);
      if (d < 1.4) {
        islaControls.moveTarget = null;
        len = 0;
      } else {
        move.set(dx / d, 0, dz / d);
        len = 1;
      }
    } else {
      len = 0;
    }

    const sprinting = islaControls.sprint || keys.has("shift");
    const isMoving = len > 0.08 && !busy;

    // You can enter the ocean: anything below the waterline is swimmable as long
    // as you stay within the reef ring around Isla Central.
    const canEnter = (x: number, z: number) => {
      if (isRegionLocked(regionAt(x, z))) return false;
      if (isWalkable(x, z)) return true;
      return Math.hypot(x, z) < SWIM_LIMIT;
    };

    const wasSwimming = swimming.current;
    if (isMoving) {
      const base = wasSwimming ? SWIM_SPEED : sprinting ? SPEED * 1.85 : SPEED;
      const step = base * delta;
      const nx = player.position.x + move.x * step;
      const nz = player.position.z + move.z * step;
      if (canEnter(nx, nz)) {
        player.position.x = nx;
        player.position.z = nz;
      } else if (canEnter(player.position.x, nz)) {
        player.position.z = nz;
      } else if (canEnter(nx, player.position.z)) {
        player.position.x = nx;
      } else {
        islaControls.moveTarget = null;
      }

      const targetRot = Math.atan2(move.x, move.z);
      let diff = targetRot - player.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      player.rotation.y += diff * (1 - Math.exp(-12 * delta));
    }

    // jump + gravity + height stepping
    const baseGround = terrainHeight(player.position.x, player.position.z);
    
    // Check plinths, boulders, and plaza steps height offsets
    let surfaceOffset = 0;
    // Central Plaza Emblem / Wayfinder steps
    if (Math.hypot(player.position.x, player.position.z) < 5.2) surfaceOffset = 0.12;
    // Valley plinths [-26*S, 48*S]
    if (Math.hypot(player.position.x + 26 * S, player.position.z - 48 * S) < 12) surfaceOffset = 0.6;
    
    const ground = baseGround + surfaceOffset;
    const inWater = ground < WATER_LEVEL - 0.5;
    swimming.current = inWater;

    if (islaControls.jump || keys.has(" ") || keys.has("space")) {
      islaControls.jump = false;
      if (!airborne.current && !busy && !inWater) {
        vy.current = 9.5;
        airborne.current = true;
      }
    }
    if (inWater) {
      // float to the surface and bob with the swell
      airborne.current = false;
      vy.current = 0;
      const bob = Math.sin(performance.now() * 0.0016) * 0.12;
      player.position.y += (SWIM_Y + bob - player.position.y) * (1 - Math.exp(-6 * delta));
    } else if (airborne.current) {
      vy.current -= 24 * delta;
      player.position.y += vy.current * delta;
      if (player.position.y <= ground) {
        player.position.y = ground;
        vy.current = 0;
        airborne.current = false;
      }
    } else {
      player.position.y += (ground - player.position.y) * (1 - Math.exp(-18 * delta));
    }

    const nextGait = inWater ? "swim" : !isMoving ? "idle" : sprinting ? "run" : "walk";
    if (nextGait !== gait) setGait(nextGait);

    islaControls.player.x = player.position.x;
    islaControls.player.z = player.position.z;
    islaControls.player.y = player.position.y;

    // region tracking
    const region = regionAt(player.position.x, player.position.z);
    if (region !== regionRef.current) {
      regionRef.current = region;
      enterRegion(region);
      audioEngine.setWorldZone(region === "city" ? "digital-city" : "hq");
    }

    // Guardian Station Proximity Detection & Conversational Voice Trigger
    let nearestStation: (typeof CLASS_GUARDIANS)[0] | null = null;
    let minDist = 14;
    for (const station of CLASS_GUARDIANS) {
      const d = Math.hypot(
        player.position.x - station.position[0],
        player.position.z - station.position[2],
      );
      if (d < minDist) {
        minDist = d;
        nearestStation = station;
      }
    }

    const stationKey = nearestStation ? nearestStation.id : null;
    if (stationKey !== nearStationRef.current) {
      // No auto pop-up or talking: only remember who is nearby. The student
      // starts the conversation by clicking the talk box or pressing E.
      if (!stationKey && talkingRef.current) {
        conversationalVoiceEngine.handleWalkAway();
        talkingRef.current = false;
      }
      nearStationRef.current = stationKey;
      patchIsla({ nearGuardian: stationKey });
    }

    // proximity: journey board, crystals, secrets, academy door
    let near: ReturnType<typeof getIsla>["near"] = null;
    let best = 6;
    const journeyDistance = Math.hypot(
      player.position.x - JOURNEY_BOARD[0],
      player.position.z - JOURNEY_BOARD[1],
    );
    if (journeyDistance < best) {
      best = journeyDistance;
      near = { kind: "journey", id: "journey-board", label: "Guardian Journey Board" };
    }
    for (const c of CRYSTALS) {
      if (snapshot.crystals.includes(c.id)) continue;
      const d = Math.hypot(player.position.x - c.position[0], player.position.z - c.position[1]);
      if (d < best) {
        best = d;
        near = { kind: "crystal", id: c.id, label: "a glowing Knowledge Crystal" };
      }
    }
    for (const sec of SECRETS) {
      if (snapshot.secrets.includes(sec.id)) continue;
      const d = Math.hypot(
        player.position.x - sec.position[0],
        player.position.z - sec.position[1],
      );
      if (d < best) {
        best = d;
        near = { kind: "secret", id: sec.id, label: sec.name };
      }
    }
    const dAcademy = Math.hypot(
      player.position.x - ACADEMY_DOOR[0],
      player.position.z - ACADEMY_DOOR[1],
    );
    if (dAcademy < 10 && dAcademy < best) {
      near = { kind: "academy", id: "academy", label: "the Nyrava Academy doors" };
    }
    const nearKey = near ? `${near.kind}:${near.id}` : null;
    if (nearKey !== nearRef.current) {
      nearRef.current = nearKey;
      patchIsla({ near });
    }

    if (islaControls.interact) {
      islaControls.interact = false;
      if (stationKey && !talkingRef.current) {
        // Student explicitly asked to start: greet only now.
        talkingRef.current = true;
        conversationalVoiceEngine.triggerProximityGreeting(stationKey);
      }
      if (near?.kind === "crystal") tryCollectCrystal(near.id);
      if (near?.kind === "secret") {
        const secret = SECRETS.find((item) => item.id === near.id);
        if (secret) collectSecret(secret.id, secret.name, secret.note);
      }
      if (near?.kind === "academy") patchIsla({ reporting: true });
      if (near?.kind === "journey") window.dispatchEvent(new Event("nyrava-open-journey"));
    }

    // ---- camera: first person (avatar's eyes) or orbiting third person
    const pitch = islaControls.cameraPitch;
    if (islaControls.view === "first") {
      const eye = new THREE.Vector3(
        player.position.x - Math.sin(player.rotation.y) * 0.15,
        player.position.y + 1.62,
        player.position.z - Math.cos(player.rotation.y) * 0.15,
      );
      camera.position.lerp(eye, 1 - Math.exp(-22 * delta));
      camera.lookAt(
        eye.x + Math.sin(yaw) * -10,
        eye.y - Math.sin(pitch) * 10,
        eye.z + Math.cos(yaw) * -10,
      );
    } else {
      const dist = islaControls.camDistance;
      const camTarget = new THREE.Vector3(
        player.position.x + Math.sin(yaw) * dist * Math.cos(pitch),
        player.position.y + 2.2 + dist * Math.sin(pitch) + dist * 0.18,
        player.position.z + Math.cos(yaw) * dist * Math.cos(pitch),
      );
      const camGround = terrainHeight(camTarget.x, camTarget.z) + 1.8;
      camTarget.y = Math.max(camTarget.y, camGround);
      camPos.current.copy(camera.position).lerp(camTarget, 1 - Math.exp(-8 * delta));
      camera.position.copy(camPos.current);
      camera.lookAt(player.position.x, player.position.y + 1.6, player.position.z);
    }
  });

  return (
    <>
      <group ref={group} visible={!firstPerson}>
        <Character color={color} clip={gait} guardianId={guardianId} height={1.7} />
        <Billboard position={[0, 2.35, 0]}>
          <Text font={worldFont} fontSize={0.2} color="#e0f2fe" anchorX="center">
            {name}
          </Text>
        </Billboard>
      </group>
    </>
  );
}

/* --------------------------------------------------------------------- scene */

import { type GameInputState } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";

function CentralGuardianPlaza() {
  return (
    <group position={[0, 0, 0]}>
      {/* CENTRAL GUARDIAN EMBLEM RUG */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.08, 0]}>
        <ringGeometry args={[4.5, 5.2, 64]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={1.2} />
      </mesh>

      {/* WAYFINDER SIGNPOST */}
      <group position={[0, 0, -4]}>
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 5, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
        </mesh>
        <Html position={[0, 4.2, 0]} transform distanceFactor={14} occlude={false}>
          <div className="w-64 rounded-2xl border border-cyan-400/40 bg-slate-950/90 p-3 text-center text-white shadow-2xl backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              ISLA CENTRAL WAYFINDER
            </p>
            <div className="mt-2 space-y-1 text-[11px] font-extrabold">
              <p className="text-amber-300">← Academy District</p>
              <p className="text-cyan-300">→ Mission Hub</p>
              <p className="text-emerald-300">↑ Digital City</p>
              <p className="text-purple-300">↙ Builder District</p>
              <p className="text-pink-300">↘ Home HQ Route</p>
            </div>
          </div>
        </Html>
      </group>

      {/* EVENT & MISSION BOARD */}
      <group position={[6, 0, -2]} rotation-y={-Math.PI / 6}>
        <mesh position={[0, 2.0, 0]}>
          <boxGeometry args={[3.6, 2.2, 0.15]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <Html position={[0, 2.0, 0.1]} transform distanceFactor={14} occlude={false}>
          <div className="w-[280px] select-none rounded-xl border border-amber-500/40 bg-slate-950/90 p-3 text-white backdrop-blur">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400">
                WORLD EVENT
              </span>
              <span className="rounded-full bg-amber-950 px-2 py-0.5 text-[8px] font-extrabold text-amber-300">
                ACTIVE
              </span>
            </div>
            <p className="mt-2 text-xs font-black text-white">Safer Internet Week</p>
            <p className="mt-1 text-[10px] font-medium text-slate-300">
              Suspicious phishing messages reported in Digital City. Talk to Sarah at Mission Hub!
            </p>
          </div>
        </Html>
      </group>
    </group>
  );
}

export function IslaScene({
  playerColor,
  playerName,
  playerGuardian = "lex",
  inputState,
  playerMode,
  cameraYaw,
  cameraPitch,
}: {
  playerColor: string;
  playerName: string;
  playerGuardian?: string;
  inputState?: GameInputState;
  playerMode?: PlayerMode;
  cameraYaw?: number;
  cameraPitch?: number;
}) {
  const found = getIsla();
  const quality = QUALITY[useQuality()];
  const crystals = found.crystals;
  const secrets = found.secrets;

  return (
    <>
      <color attach="background" args={["#8ec8ea"]} />
      <fog attach="fog" args={["#9fd4ef", 200, 620]} />
      <hemisphereLight args={["#cfe9ff", "#3b4a3f", 0.85]} />
      <directionalLight
        position={[140, 210, 90]}
        color="#fff5d6"
        intensity={2.1}
        castShadow
        shadow-mapSize-width={quality.shadowSize}
        shadow-mapSize-height={quality.shadowSize}
        shadow-camera-left={-240}
        shadow-camera-right={240}
        shadow-camera-top={240}
        shadow-camera-bottom={-240}
        shadow-camera-far={700}
      />
      <directionalLight position={[-120, 85, -90]} color="#67e8f9" intensity={0.38} />
      <pointLight position={[0, 36, 0]} color="#38bdf8" intensity={7} distance={82} />
      <Terrain />
      <Ocean />
      <Sky />
      <GroundCover />
      <CentralGuardianPlaza />
      <CentralCity />
      <Forest />
      <Mountains />
      <Valley />
      <Desert />
      <Beach />
      <SpacePort locked={isRegionLocked("spaceport")} />
      <JourneyBoard />

      {CRYSTALS.map((c) => (
        <Pickup
          key={c.id}
          position={c.position}
          color="#38bdf8"
          found={crystals.includes(c.id)}
          shape="crystal"
        />
      ))}
      {SECRETS.map((s) => (
        <Pickup
          key={s.id}
          position={s.position}
          color="#fbbf24"
          found={secrets.includes(s.id)}
          shape="secret"
        />
      ))}

      <Player color={playerColor} name={playerName} guardianId={playerGuardian} />
    </>
  );
}
