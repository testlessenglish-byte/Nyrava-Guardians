import { Suspense, useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import worldFont from "@fontsource/nunito/files/nunito-latin-400-normal.woff?url";
import * as THREE from "three";
import { Character } from "@/components/meta/character";
import { PlayerController } from "@/components/game/core/player-controller";
import { updateThirdPersonCamera } from "@/components/game/core/camera-follower";
import { type InputManager } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";
import { valeTerrainHeight, valeTerrainNormal, VALE_WATER_LEVEL, VALE_WORLD_SIZE } from "@/lib/vale-terrain";
import { buildValeWildlife, type ValeWildlife } from "@/components/mountains/vale-aurora-wildlife";

const playerController = new PlayerController();

function ProceduralValeTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const seg = 180;
    const geo = new THREE.PlaneGeometry(VALE_WORLD_SIZE, VALE_WORLD_SIZE, seg, seg);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes["position"] as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);

    const sand = new THREE.Color("#ddcaa2");
    const grass = new THREE.Color("#6f9459");
    const grassDark = new THREE.Color("#4a7346");
    const rock = new THREE.Color("#8e8c8f");
    const snow = new THREE.Color("#f6f9fc");
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = valeTerrainHeight(x, z);
      pos.setY(i, y);

      const n = valeTerrainNormal(x, z, 2.5);
      const slope = 1 - n.y;

      if (y < VALE_WATER_LEVEL + 1.6) c.copy(sand);
      else if (y < 34) c.copy(grass).lerp(grassDark, Math.min(1, y / 40));
      else if (y < 78) c.copy(grassDark).lerp(rock, (y - 34) / 44);
      else c.copy(rock).lerp(snow, Math.min(1, (y - 78) / 45));

      if (y > VALE_WATER_LEVEL + 2) c.lerp(rock, Math.min(1, slope * 2.4));
      if (y > 96 && slope < 0.35) c.lerp(snow, Math.min(1, (y - 96) / 30));

      const v = 0.95 + ((Math.sin(x * 7.3) + Math.cos(z * 5.1)) * 0.5 + 0.5) * 0.12;
      colors[i * 3] = c.r * v;
      colors[i * 3 + 1] = c.g * v;
      colors[i * 3 + 2] = c.b * v;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh ref={meshRef} geometry={geometry} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.05} />
    </mesh>
  );
}

function InstancedPineForest() {
  const groupRef = useRef<THREE.Group>(null);

  const { trunksMesh, leavesMesh, rocksMesh } = useMemo(() => {
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.45, 4.2, 6);
    trunkGeo.translate(0, 2.1, 0);
    const leafGeo = new THREE.ConeGeometry(2.1, 8.5, 8);
    leafGeo.translate(0, 7.6, 0);

    const trunkMat = new THREE.MeshStandardMaterial({ color: "#6b5138", roughness: 0.95 });
    const leafMat = new THREE.MeshStandardMaterial({ color: "#4c7a48", roughness: 0.9 });

    const max = 1200;
    const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, max);
    const leaves = new THREE.InstancedMesh(leafGeo, leafMat, max);
    trunks.castShadow = leaves.castShadow = true;
    leaves.receiveShadow = true;

    const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    let count = 0;
    let tries = 0;
    const half = VALE_WORLD_SIZE / 2 - 40;

    while (count < max && tries < max * 30) {
      tries++;
      const x = (Math.random() * 2 - 1) * half;
      const z = (Math.random() * 2 - 1) * half;
      const y = valeTerrainHeight(x, z);
      if (y < VALE_WATER_LEVEL + 1.4 || y > 74) continue;
      const n = valeTerrainNormal(x, z, 2);
      if (n.y < 0.82) continue;
      if (Math.hypot(x - 0, z - 20) < 15) continue; // Keep spawn clear

      const s = 0.7 + Math.random() * 0.9;
      dummy.position.set(x, y - 0.3, z);
      dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
      dummy.scale.set(s, s * (0.85 + Math.random() * 0.5), s);
      dummy.updateMatrix();
      trunks.setMatrixAt(count, dummy.matrix);
      leaves.setMatrixAt(count, dummy.matrix);
      col.setHSL(0.26 + Math.random() * 0.07, 0.3 + Math.random() * 0.16, 0.3 + Math.random() * 0.16);
      colorAttr.setXYZ(count, col.r, col.g, col.b);
      count++;
    }
    trunks.count = leaves.count = count;
    leaves.instanceColor = colorAttr;

    // Rocks
    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: "#8e8c8f", roughness: 0.95, flatShading: true });
    const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 300);
    let rc = 0;
    for (let i = 0; i < 2000 && rc < 300; i++) {
      const x = (Math.random() * 2 - 1) * half;
      const z = (Math.random() * 2 - 1) * half;
      const y = valeTerrainHeight(x, z);
      if (y < VALE_WATER_LEVEL - 2) continue;
      const s = 0.6 + Math.random() * 2.2;
      dummy.position.set(x, y + s * 0.3, z);
      dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      dummy.scale.set(s, s * 0.8, s * (0.8 + Math.random() * 0.5));
      dummy.updateMatrix();
      rocks.setMatrixAt(rc++, dummy.matrix);
    }
    rocks.count = rc;

    return { trunksMesh: trunks, leavesMesh: leaves, rocksMesh: rocks };
  }, []);

  return (
    <group ref={groupRef}>
      <primitive object={trunksMesh} />
      <primitive object={leavesMesh} />
      <primitive object={rocksMesh} />
    </group>
  );
}

function WildlifeController({ playerPos }: { playerPos: React.MutableRefObject<THREE.Vector3> }) {
  const { scene } = useThree();
  const wildlifeRef = useRef<ValeWildlife | null>(null);

  useEffect(() => {
    wildlifeRef.current = buildValeWildlife(scene);
  }, [scene]);

  useFrame((_, delta) => {
    if (wildlifeRef.current && playerPos.current) {
      wildlifeRef.current.update(delta, performance.now() * 0.001, playerPos.current);
    }
  });

  return null;
}

export function KnowledgeMountainsScene({
  playerColor = "#38bdf8",
  playerLabel = "Tess",
  guardianId = "tess",
  inputManager,
  blocked = false,
  onLaunchActivity,
  onNavigateWorld,
  teleportTarget = null,
}: {
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  inputManager: InputManager;
  blocked?: boolean;
  onLaunchActivity?: (activityKey: string) => void;
  onNavigateWorld?: (targetRoute: string) => void;
  teleportTarget?: [number, number, number] | null;
}) {
  const group = useRef<THREE.Group>(null);
  const playerPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 20));
  const [moving, setMoving] = useState(false);
  const [activeStation, setActiveStation] = useState<string | null>(null);

  useEffect(() => {
    if (teleportTarget && group.current) {
      const y = valeTerrainHeight(teleportTarget[0], teleportTarget[2]);
      group.current.position.set(teleportTarget[0], y + 0.2, teleportTarget[2]);
    }
  }, [teleportTarget]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const player = group.current;
    if (!player) return;

    const input = inputManager.getSnapshot();
    const mode: PlayerMode = blocked
      ? "interacting"
      : input.moveX !== 0 || input.moveY !== 0
        ? input.run
          ? "running"
          : "walking"
        : "idle";

    const getSurfaceHeight = (pos: THREE.Vector3) => {
      return Math.max(valeTerrainHeight(pos.x, pos.z), VALE_WATER_LEVEL);
    };

    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      { minX: -200, maxX: 200, minZ: -200, maxZ: 200 },
      undefined,
      getSurfaceHeight,
    );

    player.rotation.y = playerController.rotationY;
    if (playerController.isMoving !== moving) setMoving(playerController.isMoving);
    playerPos.current.copy(player.position);

    if (camera instanceof THREE.PerspectiveCamera) {
      updateThirdPersonCamera(
        camera,
        player.position,
        inputManager.cameraYaw,
        inputManager.cameraPitch,
        delta,
        5.5,
        1.6,
      );
    }

    const stations = [
      { key: "logic-peak", pos: [-18, valeTerrainHeight(-18, 12), 12], dist: 4.5 },
      { key: "strategic-matrix", pos: [-22, valeTerrainHeight(-22, -8), -8], dist: 4.5 },
      { key: "fallacy-spotter", pos: [22, valeTerrainHeight(22, -8), -8], dist: 4.5 },
      { key: "mountain-mastery", pos: [0, valeTerrainHeight(0, 0), 0], dist: 5.5 },
      { key: "portal-hub", pos: [0, valeTerrainHeight(0, 20), 20], dist: 4.5, isPortal: true, route: "/world/isla-central" },
    ];

    let foundNearby: string | null = null;
    for (const st of stations) {
      const stX = st.pos[0]!;
      const stZ = st.pos[2]!;
      if (Math.hypot(player.position.x - stX, player.position.z - stZ) < st.dist) {
        foundNearby = st.key;
        if (!blocked && input.interactPressed) {
          if (st.isPortal && st.route) {
            onNavigateWorld?.(st.route);
          } else {
            onLaunchActivity?.(st.key);
          }
        }
        break;
      }
    }
    if (foundNearby !== activeStation) setActiveStation(foundNearby);
  });

  const baseCampY = valeTerrainHeight(0, 20);
  const sanctuaryY = valeTerrainHeight(0, 0);
  const logicPeakY = valeTerrainHeight(-18, 12);
  const crystalSummitY = valeTerrainHeight(-22, -8);
  const windRidgeY = valeTerrainHeight(22, -8);

  return (
    <>
      <color attach="background" args={["#cbdcea"]} />
      <fog attach="fog" args={["#cbdcea", 60, 450]} />

      <ambientLight intensity={0.9} color="#dceaff" />
      <directionalLight position={[100, 200, 100]} intensity={2.8} color="#fff4e0" castShadow />

      {/* Procedural Vale Terrain & Forest */}
      <ProceduralValeTerrain />
      <InstancedPineForest />

      {/* Mirror Lake Water Surface */}
      <mesh rotation-x={-Math.PI / 2} position={[0, VALE_WATER_LEVEL + 0.1, 0]}>
        <planeGeometry args={[VALE_WORLD_SIZE, VALE_WORLD_SIZE]} />
        <meshStandardMaterial color="#2b6070" roughness={0.1} metalness={0.8} opacity={0.85} transparent />
      </mesh>

      {/* Wildlife System */}
      <WildlifeController playerPos={playerPos} />

      {/* CENTRAL MOUNT NYRAVA SANCTUARY [0, y, 0] */}
      <group position={[0, sanctuaryY, 0]}>
        <mesh position={[0, 0.15, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[7, 32]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.6} />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <octahedronGeometry args={[3, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text
          position={[0, 9, 0]}
          fontSize={1.1}
          font={worldFont}
          color="#e0f2fe"
          anchorX="center"
          anchorY="middle"
        >
          Everest Peak Sanctuary
        </Text>
        {activeStation === "mountain-mastery" && (
          <Html position={[0, 10.5, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-sky-950/90 px-4 py-1.5 text-xs font-black text-sky-200 shadow-xl">
              [E] Mountain Mastery Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: BASE CAMP & PORTAL [0, y, 20] */}
      <group position={[0, baseCampY, 20]}>
        <mesh position={[0, 3.5, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[3, 0.4, 16, 32]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text position={[0, 5.5, 0]} fontSize={0.9} font={worldFont} color="#bae6fd" anchorX="center">
          Summit Base Camp
        </Text>
        {activeStation === "portal-hub" && (
          <Html position={[0, 6.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-sky-300 shadow-xl">
              [E] Return to Isla Central Hub
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 2: LOGIC PEAK [-18, y, 12] */}
      <group position={[-18, logicPeakY, 12]}>
        <mesh position={[0, 3, 0]}>
          <octahedronGeometry args={[3.5, 0]} />
          <meshStandardMaterial color="#0369a1" emissive="#0284c7" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#bae6fd" anchorX="center">
          Logic Peak Lab
        </Text>
        {activeStation === "logic-peak" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-sky-300 shadow-xl">
              [E] Logic Peak Lab
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 3: CRYSTAL SUMMIT [-22, y, -8] */}
      <group position={[-22, crystalSummitY, -8]}>
        <mesh position={[0, 4, 0]}>
          <coneGeometry args={[3, 8, 6]} />
          <meshStandardMaterial color="#0c4a6e" emissive="#0284c7" emissiveIntensity={0.6} />
        </mesh>
        <Text position={[0, 8.5, 0]} fontSize={0.8} font={worldFont} color="#bae6fd" anchorX="center">
          Crystal Summit
        </Text>
        {activeStation === "strategic-matrix" && (
          <Html position={[0, 9.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-sky-300 shadow-xl">
              [E] Strategic Matrix
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 4: WIND RIDGE LAB [22, y, -8] */}
      <group position={[22, windRidgeY, -8]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[7, 6, 7]} />
          <meshStandardMaterial color="#075985" emissive="#0369a1" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#bae6fd" anchorX="center">
          Wind Ridge Lab
        </Text>
        {activeStation === "fallacy-spotter" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-sky-300 shadow-xl">
              [E] Fallacy Spotter
            </span>
          </Html>
        )}
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, baseCampY + 0.2, 20]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-sky-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-sky-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
