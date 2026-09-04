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

export function SpaceZoneScene({
  playerColor = "#c084fc",
  playerLabel = "Byte",
  guardianId = "byte",
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
      { key: "satellite-repair", pos: [-18, 0, 12], dist: 3.5 },
      { key: "constellation-logic", pos: [-22, 0, -8], dist: 3.5 },
      { key: "space-mastery", pos: [0, 0, 0], dist: 4.5 },
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
      <color attach="background" args={["#070714"]} />
      <fog attach="fog" args={["#120c24", 30, 95]} />

      <ambientLight intensity={0.8} color="#d8b4fe" />
      <directionalLight position={[40, 60, 30]} intensity={2.2} color="#f3e8ff" castShadow />
      <pointLight position={[0, 20, 0]} color="#a855f7" intensity={18} distance={55} />

      {/* Orbital Station Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Neon Solar Grid Lines */}
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.02}>
            <mesh position={[0, 0, 20]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.4, 38]} />
              <meshStandardMaterial color="#312e81" roughness={0.2} metalness={0.8} />
            </mesh>
          </group>
        );
      })}

      {/* CENTRAL CELESTIAL CORE SANCTUARY [0, 0, 0] */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.15, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[7, 32]} />
          <meshStandardMaterial color="#6b21a8" emissive="#581c87" emissiveIntensity={0.8} />
        </mesh>
        <mesh position={[0, 4, 0]}>
          <dodecahedronGeometry args={[3]} />
          <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text
          position={[0, 8, 0]}
          fontSize={1.1}
          font={worldFont}
          color="#f3e8ff"
          anchorX="center"
          anchorY="middle"
        >
          Celestial Core Sanctuary
        </Text>
        {activeStation === "space-mastery" && (
          <Html position={[0, 9.5, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-purple-400 bg-purple-950/90 px-4 py-1.5 text-xs font-black text-purple-200 shadow-xl">
              [E] Space Mastery Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: ORBITAL LAUNCHPAD & PORTAL [0, 0, 20] */}
      <group position={[0, 0, 20]}>
        <mesh position={[0, 3.5, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[3, 0.4, 16, 32]} />
          <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text position={[0, 5.5, 0]} fontSize={0.9} font={worldFont} color="#e9d5ff" anchorX="center">
          Orbital Launchpad
        </Text>
        {activeStation === "portal-hub" && (
          <Html position={[0, 6.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-purple-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-purple-300 shadow-xl">
              [E] Return to Isla Central Hub
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 2: ZERO-G ENGINEERING BAY [-18, 0, 12] */}
      <group position={[-18, 0, 12]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#581c87" emissive="#6b21a8" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#e9d5ff" anchorX="center">
          Zero-G Engineering Bay
        </Text>
        {activeStation === "satellite-repair" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-purple-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-purple-300 shadow-xl">
              [E] Zero-G Satellite Repair
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 3: STAR OBSERVATORY [-22, 0, -8] */}
      <group position={[-22, 0, -8]}>
        <mesh position={[0, 3.5, 0]}>
          <sphereGeometry args={[3.5, 16, 16]} />
          <meshStandardMaterial color="#4c1d95" emissive="#7e22ce" emissiveIntensity={0.6} />
        </mesh>
        <Text position={[0, 7.5, 0]} fontSize={0.8} font={worldFont} color="#e9d5ff" anchorX="center">
          Star Observatory
        </Text>
        {activeStation === "constellation-logic" && (
          <Html position={[0, 8.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-purple-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-purple-300 shadow-xl">
              [E] Constellation Logic
            </span>
          </Html>
        )}
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, 0, 20]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-purple-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-purple-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
