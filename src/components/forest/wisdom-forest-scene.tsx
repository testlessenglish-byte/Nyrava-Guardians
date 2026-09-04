import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import worldFont from "@fontsource/nunito/files/nunito-latin-400-normal.woff?url";
import * as THREE from "three";
import { Character } from "@/components/meta/character";
import { PlayerController } from "@/components/game/core/player-controller";
import { updateThirdPersonCamera } from "@/components/game/core/camera-follower";
import { type InputManager } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";

const playerController = new PlayerController();

export function WisdomForestScene({
  playerColor = "#34d399",
  playerLabel = "Lex",
  guardianId = "lex",
  inputManager,
  blocked = false,
  onLaunchActivity,
  teleportTarget = null,
}: {
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  inputManager: InputManager;
  blocked?: boolean;
  onLaunchActivity?: (activityKey: string) => void;
  teleportTarget?: [number, number, number] | null;
}) {
  const group = useRef<THREE.Group>(null);
  const [moving, setMoving] = useState(false);
  const [activeStation, setActiveStation] = useState<string | null>(null);

  useEffect(() => {
    if (teleportTarget && group.current) {
      group.current.position.set(teleportTarget[0], teleportTarget[1], teleportTarget[2]);
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
      if (Math.hypot(pos.x, pos.z) < 8) return 0.4;
      return 0;
    };

    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      { minX: -45, maxX: 45, minZ: -45, maxZ: 45 },
      undefined,
      getSurfaceHeight,
    );

    player.rotation.y = playerController.rotationY;
    if (playerController.isMoving !== moving) setMoving(playerController.isMoving);

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
      { key: "seed-rescue", pos: [0, 0, 24], dist: 3.5 },
      { key: "evidence-trail", pos: [-18, 0, 14], dist: 3.5 },
      { key: "pattern-grove", pos: [-24, 0, -8], dist: 3.5 },
      { key: "ecosystem-balance", pos: [18, 0, 14], dist: 3.5 },
      { key: "research-station", pos: [24, 0, -8], dist: 3.5 },
      { key: "source-signal", pos: [0, 0, -28], dist: 3.5 },
      { key: "wisdom-mastery", pos: [0, 0, 0], dist: 4.5 },
    ];

    let foundNearby: string | null = null;
    for (const st of stations) {
      const stX = st.pos[0]!;
      const stZ = st.pos[2]!;
      if (Math.hypot(player.position.x - stX, player.position.z - stZ) < st.dist) {
        foundNearby = st.key;
        if (!blocked && input.interactPressed) {
          onLaunchActivity?.(st.key);
        }
        break;
      }
    }
    if (foundNearby !== activeStation) setActiveStation(foundNearby);
  });

  return (
    <>
      <color attach="background" args={["#041a12"]} />
      <fog attach="fog" args={["#082e1d", 25, 90]} />

      <ambientLight intensity={0.8} color="#6ee7b7" />
      <directionalLight position={[40, 60, 30]} intensity={2.2} color="#fef08a" castShadow />
      <pointLight position={[0, 22, 0]} color="#00f0ff" intensity={20} distance={60} />

      {/* Emerald Mossy Ground Base */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial color="#0f3d26" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Branching Forest Pathways */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.02}>
            <mesh position={[0, 0, 22]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.2, 40]} />
              <meshStandardMaterial color="#1a4d33" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.02, 22]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.15, 40]} />
              <meshBasicMaterial color="#34d399" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* ENORMOUS CENTRAL TREE OF WISDOM & SANCTUARY [0, 0, 0] */}
      <group position={[0, 0, 0]}>
        {/* Main Tree Trunk */}
        <mesh position={[0, 10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[6.5, 9.5, 20, 20]} />
          <meshStandardMaterial color="#362217" roughness={0.9} />
        </mesh>

        {/* Glowing Cyan Energy Core inside trunk */}
        <mesh position={[0, 10, 0]}>
          <cylinderGeometry args={[4.2, 4.2, 14, 16, 1, true]} />
          <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={3} transparent opacity={0.75} toneMapped={false} />
        </mesh>

        {/* Multi-tiered Spiraling Canopy Walkways */}
        {[3, 7.5, 12, 16].map((h, idx) => (
          <mesh key={h} position={[0, h, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[7.5 + idx * 0.4, 0.45, 12, 32]} />
            <meshStandardMaterial color="#543625" roughness={0.7} />
          </mesh>
        ))}

        {/* Multi-Layered Emerald Canopy Foliage */}
        <mesh position={[0, 21, 0]}>
          <coneGeometry args={[18, 10, 12]} />
          <meshStandardMaterial color="#059669" roughness={0.6} />
        </mesh>
        <mesh position={[0, 25, 0]}>
          <coneGeometry args={[14, 8, 12]} />
          <meshStandardMaterial color="#10b981" roughness={0.5} />
        </mesh>
        <mesh position={[0, 28, 0]}>
          <coneGeometry args={[10, 6, 12]} />
          <meshStandardMaterial color="#34d399" roughness={0.4} />
        </mesh>

        <Text position={[0, 7.5, 0]} fontSize={1.2} font={worldFont} color="#a7f3d0" anchorX="center">
          Tree of Wisdom Sanctuary
        </Text>

        {activeStation === "wisdom-mastery" && (
          <Html position={[0, 9.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-emerald-950/90 px-4 py-1.5 text-xs font-black text-emerald-200 shadow-xl">
              [E] Wisdom Mastery Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: ARRIVAL GROVE [0, 0, 24] */}
      <group position={[0, 0, 24]}>
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[4.5, 32]} />
          <meshStandardMaterial color="#047857" emissive="#065f46" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 3, 0]} fontSize={0.9} font={worldFont} color="#6ee7b7" anchorX="center">
          Arrival Grove
        </Text>
        {activeStation === "seed-rescue" && (
          <Html position={[0, 4.3, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Knowledge Seed Rescue
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 2: EVIDENCE TRAIL [-18, 0, 14] */}
      <group position={[-18, 0, 14]}>
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[6, 5, 6]} />
          <meshStandardMaterial color="#065f46" emissive="#047857" emissiveIntensity={0.4} />
        </mesh>
        {/* Bioluminescent Flowers */}
        {[-2, 2].map((offX) => (
          <mesh key={offX} position={[offX, 0.5, 3.5]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} toneMapped={false} />
          </mesh>
        ))}
        <Text position={[0, 5.8, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
          Evidence Trail
        </Text>
        {activeStation === "evidence-trail" && (
          <Html position={[0, 7.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Evidence Classifier
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 3: PATTERN CANOPY [-24, 0, -8] */}
      <group position={[-24, 0, -8]}>
        <mesh position={[0, 4, 0]}>
          <cylinderGeometry args={[4, 4.5, 8, 16]} />
          <meshStandardMaterial color="#047857" emissive="#065f46" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 8.8, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
          Pattern Canopy
        </Text>
        {activeStation === "pattern-grove" && (
          <Html position={[0, 10.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Pattern Grove
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 4: ECOSYSTEM GARDENS [18, 0, 14] */}
      <group position={[18, 0, 14]}>
        {/* Glass Botanical Dome */}
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[4.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#34d399" transparent opacity={0.35} metalness={0.6} roughness={0.1} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[2, 2.5, 3, 12]} />
          <meshStandardMaterial color="#065f46" />
        </mesh>
        <Text position={[0, 9, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
          Ecosystem Gardens
        </Text>
        {activeStation === "ecosystem-balance" && (
          <Html position={[0, 10.4, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Ecosystem Balance
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 5: RESEARCH TREEHOUSES [24, 0, -8] */}
      <group position={[24, 0, -8]}>
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[6, 5, 6]} />
          <meshStandardMaterial color="#543625" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.8, 1, 4, 12]} />
          <meshStandardMaterial color="#362217" />
        </mesh>
        <Text position={[0, 8.2, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
          Research Treehouses
        </Text>
        {activeStation === "research-station" && (
          <Html position={[0, 9.6, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Research Station
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 6: WATERFALL ARCHIVES [0, 0, -28] */}
      <group position={[0, 0, -28]}>
        {/* Waterfall Water Wall */}
        <mesh position={[0, 6, 0]}>
          <planeGeometry args={[14, 12]} />
          <meshStandardMaterial color="#00f0ff" emissive="#0284c7" emissiveIntensity={1.2} transparent opacity={0.65} toneMapped={false} />
        </mesh>
        <Text position={[0, 13, 0]} fontSize={0.9} font={worldFont} color="#a5f3fc" anchorX="center">
          Waterfall Archives
        </Text>
        {activeStation === "source-signal" && (
          <Html position={[0, 14.4, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-cyan-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-xl">
              [E] Source Signal Hunt
            </span>
          </Html>
        )}
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, 0, 24]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-emerald-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
