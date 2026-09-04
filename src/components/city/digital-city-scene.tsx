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

export function DigitalCityScene({
  playerColor = "#22d3ee",
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
      if (Math.hypot(pos.x, pos.z) < 6) return 0.3;
      return 0;
    };

    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      { minX: -40, maxX: 40, minZ: -40, maxZ: 40 },
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
        5.0,
        1.5,
      );
    }

    const stations = [
      { key: "phishing-detective", pos: [-16, 0, 12], dist: 3.5 },
      { key: "password-lab", pos: [-22, 0, -6], dist: 3.5 },
      { key: "privacy-sort", pos: [22, 0, -6], dist: 3.5 },
      { key: "safe-messaging", pos: [-14, 0, -20], dist: 3.5 },
      { key: "tower-challenge", pos: [0, 0, 0], dist: 4.0 },
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
      <color attach="background" args={["#040d1a"]} />
      <fog attach="fog" args={["#071b30", 25, 80]} />

      <ambientLight intensity={0.7} color="#60a5fa" />
      <directionalLight position={[30, 50, 20]} intensity={2.2} color="#e0f2fe" castShadow />
      <pointLight position={[0, 18, 0]} color="#00f0ff" intensity={18} distance={50} />

      {/* Cyber City Base Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[44, 64]} />
        <meshStandardMaterial color="#0b1e30" roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Radial Neon Pathways */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.02}>
            <mesh position={[0, 0, 20]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.2, 38]} />
              <meshStandardMaterial color="#112940" roughness={0.3} metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.02, 20]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.15, 38]} />
              <meshBasicMaterial color="#00f0ff" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* BACKGROUND METROPOLITAN SKYSCRAPERS */}
      {[
        { x: -32, z: 20, h: 22, color: "#0284c7" },
        { x: -35, z: -10, h: 28, color: "#0369a1" },
        { x: -28, z: -32, h: 20, color: "#0f172a" },
        { x: 30, z: 22, h: 24, color: "#0369a1" },
        { x: 34, z: -12, h: 30, color: "#0284c7" },
        { x: 26, z: -30, h: 18, color: "#1e293b" },
      ].map((bld, idx) => (
        <group key={idx} position={[bld.x, bld.h / 2, bld.z]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[8, bld.h, 8]} />
            <meshStandardMaterial color={bld.color} roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Neon Window Stripes */}
          <mesh position={[0, 0, 4.05]}>
            <planeGeometry args={[6, bld.h - 4]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
          </mesh>
        </group>
      ))}

      {/* CENTRAL GUARDIAN TOWER [0, 0, 0] */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3, 4.5, 16, 16]} />
          <meshStandardMaterial color="#0f2b45" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Rotating Counter-Rings */}
        <mesh position={[0, 14, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[5, 0.3, 16, 32]} />
          <meshBasicMaterial color="#00f0ff" toneMapped={false} />
        </mesh>
        <mesh position={[0, 18, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[3.5, 0.25, 16, 32]} />
          <meshBasicMaterial color="#38bdf8" toneMapped={false} />
        </mesh>
        <Text position={[0, 9, 0]} fontSize={1.1} font={worldFont} color="#bae6fd" anchorX="center">
          Central Nyrava Tower
        </Text>
        {activeStation === "tower-challenge" && (
          <Html position={[0, 10.5, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-cyan-400 bg-cyan-950/90 px-4 py-1.5 text-xs font-black text-cyan-200 shadow-xl">
              [E] Guardian Tower Challenge
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 1: ARRIVAL PLAZA [0, 0, 18] */}
      <group position={[0, 0, 18]}>
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[4.5, 32]} />
          <meshStandardMaterial color="#0284c7" emissive="#0369a1" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 3, 0]} fontSize={0.8} font={worldFont} color="#7dd3fc" anchorX="center">
          Arrival Plaza
        </Text>
      </group>

      {/* DISTRICT 2: DIGITAL SAFETY TRAINING [-16, 0, 12] */}
      <group position={[-16, 0, 12]}>
        <mesh position={[0, 3, 0]} castShadow>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#1e293b" emissive="#0f172a" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 6.8, 0]} fontSize={0.8} font={worldFont} color="#fde047" anchorX="center">
          Digital Safety Training
        </Text>
        {activeStation === "phishing-detective" && (
          <Html position={[0, 8.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-amber-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-amber-300 shadow-xl">
              [E] Phishing Detective
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 3: ACADEMY DISTRICT [-22, 0, -6] */}
      <group position={[-22, 0, -6]}>
        <mesh position={[0, 4, 0]} castShadow>
          <cylinderGeometry args={[4, 5, 8, 16]} />
          <meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 8.8, 0]} fontSize={0.8} font={worldFont} color="#7dd3fc" anchorX="center">
          Academy District
        </Text>
        {activeStation === "password-lab" && (
          <Html position={[0, 10.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-cyan-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-xl">
              [E] Password Power Lab
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 4: BUILDER LAB DISTRICT [22, 0, -6] */}
      <group position={[22, 0, -6]}>
        <mesh position={[0, 4, 0]} castShadow>
          <boxGeometry args={[8, 8, 8]} />
          <meshStandardMaterial color="#064e3b" emissive="#047857" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 8.8, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
          Builder Lab District
        </Text>
        {activeStation === "privacy-sort" && (
          <Html position={[0, 10.2, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Privacy Sort Station
            </span>
          </Html>
        )}
      </group>

      {/* DISTRICT 5: GUARDIAN GARDENS [-14, 0, -20] */}
      <group position={[-14, 0, -20]}>
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[6, 32]} />
          <meshStandardMaterial color="#14532d" />
        </mesh>
        <Text position={[0, 3, 0]} fontSize={0.8} font={worldFont} color="#86efac" anchorX="center">
          Guardian Gardens
        </Text>
        {activeStation === "safe-messaging" && (
          <Html position={[0, 4.4, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl">
              [E] Safe Messaging
            </span>
          </Html>
        )}
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, 0, 18]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-cyan-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
