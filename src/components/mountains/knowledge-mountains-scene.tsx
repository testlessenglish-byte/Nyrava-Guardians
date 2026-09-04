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
      if (Math.hypot(pos.x, pos.z) < 7) return 0.3;
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
      { key: "logic-peak", pos: [-18, 0, 12], dist: 3.5 },
      { key: "strategic-matrix", pos: [-22, 0, -8], dist: 3.5 },
      { key: "fallacy-spotter", pos: [22, 0, -8], dist: 3.5 },
      { key: "mountain-mastery", pos: [0, 0, 0], dist: 4.5 },
      { key: "portal-hub", pos: [0, 0, 24], dist: 3.5, isPortal: true, route: "/world/isla-central" },
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

  return (
    <>
      <color attach="background" args={["#03172e"]} />
      <fog attach="fog" args={["#082b4a", 30, 95]} />

      <ambientLight intensity={0.8} color="#93c5fd" />
      <directionalLight position={[40, 60, 30]} intensity={2.2} color="#e0f2fe" castShadow />
      <pointLight position={[0, 20, 0]} color="#38bdf8" intensity={18} distance={55} />

      {/* Snow & Ice Summit Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial color="#1e3a5f" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Crystalline Radial Pathways */}
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.02}>
            <mesh position={[0, 0, 20]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.4, 38]} />
              <meshStandardMaterial color="#0c4a6e" roughness={0.3} metalness={0.6} />
            </mesh>
          </group>
        );
      })}

      {/* CENTRAL MOUNT NYRAVA SANCTUARY [0, 0, 0] */}
      <group position={[0, 0, 0]}>
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
          Mount Nyrava Sanctuary
        </Text>
        {activeStation === "mountain-mastery" && (
          <Html position={[0, 10.5, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-sky-400 bg-sky-950/90 px-4 py-1.5 text-xs font-black text-sky-200 shadow-xl">
              [E] Mountain Mastery Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: BASE CAMP & PORTAL [0, 0, 20] */}
      <group position={[0, 0, 20]}>
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

      {/* DISTRICT 2: LOGIC PEAK [-18, 0, 12] */}
      <group position={[-18, 0, 12]}>
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

      {/* DISTRICT 3: CRYSTAL SUMMIT [-22, 0, -8] */}
      <group position={[-22, 0, -8]}>
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

      {/* DISTRICT 4: WIND RIDGE LAB [22, 0, -8] */}
      <group position={[22, 0, -8]}>
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
        <group ref={group} position={[0, 0, 20]}>
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
