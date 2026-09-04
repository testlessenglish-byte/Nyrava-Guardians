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

export function HistoryValleyScene({
  playerColor = "#f59e0b",
  playerLabel = "Nova",
  guardianId = "nova",
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
      if (Math.hypot(pos.x, pos.z) < 7) return 0.25;
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
      { key: "artifact-reconstruction", pos: [-18, 0, 12], dist: 3.5 },
      { key: "timeline-decoder", pos: [-22, 0, -8], dist: 3.5 },
      { key: "preservation-vault", pos: [22, 0, -8], dist: 3.5 },
      { key: "history-mastery", pos: [0, 0, 0], dist: 4.5 },
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
      <color attach="background" args={["#1c100b"]} />
      <fog attach="fog" args={["#2e1910", 30, 95]} />

      <ambientLight intensity={0.8} color="#fde68a" />
      <directionalLight position={[40, 60, 30]} intensity={2.2} color="#ffedd5" castShadow />
      <pointLight position={[0, 18, 0]} color="#f59e0b" intensity={18} distance={55} />

      {/* Terracotta Canyon Ground */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[50, 64]} />
        <meshStandardMaterial color="#8c5338" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Ancient Stone Pathways */}
      {Array.from({ length: 6 }, (_, index) => {
        const angle = (index / 6) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.02}>
            <mesh position={[0, 0, 20]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.4, 38]} />
              <meshStandardMaterial color="#5c3826" roughness={0.7} />
            </mesh>
          </group>
        );
      })}

      {/* CENTRAL HISTORICAL SANCTUARY [0, 0, 0] */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.12, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[7, 32]} />
          <meshStandardMaterial color="#b45309" emissive="#78350f" emissiveIntensity={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((idx) => {
          const ang = (idx / 4) * Math.PI * 2;
          return (
            <mesh key={idx} position={[Math.cos(ang) * 5, 4, Math.sin(ang) * 5]}>
              <cylinderGeometry args={[0.6, 0.8, 8, 12]} />
              <meshStandardMaterial color="#78350f" roughness={0.6} />
            </mesh>
          );
        })}
        <Text
          position={[0, 6.5, 0]}
          fontSize={1.1}
          font={worldFont}
          color="#fef3c7"
          anchorX="center"
          anchorY="middle"
        >
          Historical Sanctuary
        </Text>
        {activeStation === "history-mastery" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-amber-400 bg-amber-950/90 px-4 py-1.5 text-xs font-black text-amber-200 shadow-xl">
              [E] History Mastery Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: VALLEY ENTRANCE & PORTAL [0, 0, 20] */}
      <group position={[0, 0, 20]}>
        <mesh position={[0, 3.5, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[3, 0.4, 16, 32]} />
          <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
        <Text position={[0, 5.5, 0]} fontSize={0.9} font={worldFont} color="#fde68a" anchorX="center">
          Valley Entrance
        </Text>
        {activeStation === "portal-hub" && (
          <Html position={[0, 6.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-amber-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-amber-300 shadow-xl">
              [E] Return to Isla Central Hub
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 2: ARCHIVES RUINS [-18, 0, 12] */}
      <group position={[-18, 0, 12]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#92400e" emissive="#78350f" emissiveIntensity={0.3} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#fde68a" anchorX="center">
          Archives Ruins
        </Text>
        {activeStation === "artifact-reconstruction" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-amber-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-amber-300 shadow-xl">
              [E] Artifact Reconstruction
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 3: ANCIENT LIBRARY [-22, 0, -8] */}
      <group position={[-22, 0, -8]}>
        <mesh position={[0, 3.5, 0]}>
          <cylinderGeometry args={[4, 4.5, 7, 16]} />
          <meshStandardMaterial color="#78350f" emissive="#451a03" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 7.5, 0]} fontSize={0.8} font={worldFont} color="#fde68a" anchorX="center">
          Ancient Library
        </Text>
        {activeStation === "timeline-decoder" && (
          <Html position={[0, 8.8, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-amber-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-amber-300 shadow-xl">
              [E] Timeline Decoder
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 4: PRESERVATION VAULT [22, 0, -8] */}
      <group position={[22, 0, -8]}>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[7, 6, 7]} />
          <meshStandardMaterial color="#9a3412" emissive="#7c2d12" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#fde68a" anchorX="center">
          Preservation Vault
        </Text>
        {activeStation === "preservation-vault" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-orange-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-orange-300 shadow-xl">
              [E] Preservation Vault
            </span>
          </Html>
        )}
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, 0, 20]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-amber-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
