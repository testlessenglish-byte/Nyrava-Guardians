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
import {
  type GuardianTier,
  type PlacedStructure,
  BUILDABLE_ZONES,
  GUARDIAN_TIERS,
} from "@/domain/realm/realm-types";

const playerController = new PlayerController();

export function NyravaGuardianRealmScene({
  playerColor = "#38bdf8",
  playerLabel = "Lex",
  guardianId = "lex",
  tier = 1,
  placedStructures = [],
  inputManager,
  blocked = false,
  onOpenZoneBuilder,
  teleportTarget = null,
}: {
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  tier?: GuardianTier;
  placedStructures?: PlacedStructure[];
  inputManager: InputManager;
  blocked?: boolean;
  onOpenZoneBuilder?: (zoneId: string) => void;
  teleportTarget?: [number, number, number] | null;
}) {
  const group = useRef<THREE.Group>(null);
  const [moving, setMoving] = useState(false);
  const [activeZone, setActiveZone] = useState<string | null>(null);

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
      { minX: -50, maxX: 50, minZ: -50, maxZ: 50 },
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

    // Distance-clamped zone check: max 1 zone active within 3.5m radius
    let foundZone: string | null = null;
    for (const zone of BUILDABLE_ZONES) {
      const zX = zone.pos[0]!;
      const zZ = zone.pos[2]!;
      if (Math.hypot(player.position.x - zX, player.position.z - zZ) < 4.0) {
        foundZone = zone.id;
        if (!blocked && input.interactPressed) {
          onOpenZoneBuilder?.(zone.id);
        }
        break;
      }
    }
    if (foundZone !== activeZone) setActiveZone(foundZone);
  });

  return (
    <>
      {/* Sky & Atmospheric Effects */}
      <color attach="background" args={["#2fb5f6"]} />
      <fog attach="fog" args={["#bae6fd", 40, 130]} />

      <ambientLight intensity={1.3} color="#f0f9ff" />
      <directionalLight position={[50, 70, 40]} intensity={2.8} color="#ffffff" castShadow />
      <pointLight position={[0, 25, -10]} color="#00f0ff" intensity={25} distance={75} />

      {/* Main Natural Meadow Floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[55, 64]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Winding River & Small Lake */}
      <mesh rotation-x={-Math.PI / 2} position={[15, 0.02, 0]}>
        <planeGeometry args={[8, 70]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.3} emissive="#0284c7" emissiveIntensity={0.3} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[22, 0.03, 15]}>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.3} emissive="#0284c7" emissiveIntensity={0.3} />
      </mesh>

      {/* CASCADING MULTI-TIER WATERFALL [-18, 0, -25] */}
      <group position={[-18, 0, -25]}>
        <mesh position={[0, 10, 0]}>
          <boxGeometry args={[16, 20, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 8, 4.1]}>
          <planeGeometry args={[10, 16]} />
          <meshStandardMaterial color="#00f0ff" emissive="#38bdf8" emissiveIntensity={2} transparent opacity={0.75} toneMapped={false} />
        </mesh>
      </group>

      {/* DISTANT SNOWY MOUNTAIN PEAKS */}
      <group position={[45, 0, -45]}>
        <mesh position={[0, 15, 0]}>
          <coneGeometry args={[16, 30, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        <mesh position={[0, 24, 0]}>
          <coneGeometry args={[8, 14, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
      </group>

      {/* CENTRAL GUARDIAN PLATEAU & TIER-EVOLVING STRUCTURES [0, 0, 0] */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.15, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[8, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.6} />
        </mesh>

        {/* TIER 1: Starter Shelter */}
        {tier === 1 && (
          <group position={[0, 2.5, 0]}>
            <coneGeometry args={[4, 5, 8]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} />
          </group>
        )}

        {/* TIER 2: Tree House & Bridges */}
        {tier >= 2 && (
          <group position={[-18, 6, -12]}>
            <boxGeometry args={[6, 5, 6]} />
            <meshStandardMaterial color="#543625" roughness={0.8} />
            <Text position={[0, 4, 0]} fontSize={0.8} font={worldFont} color="#6ee7b7" anchorX="center">
              Tree House Haven
            </Text>
          </group>
        )}

        {/* TIER 3: Guardian Workshop & Privacy Scanner */}
        {tier >= 3 && (
          <group position={[-22, 3, 14]}>
            <boxGeometry args={[7, 6, 7]} />
            <meshStandardMaterial color="#0369a1" emissive="#0284c7" emissiveIntensity={0.4} />
            <Text position={[0, 4.5, 0]} fontSize={0.8} font={worldFont} color="#7dd3fc" anchorX="center">
              Guardian Workshop
            </Text>
          </group>
        )}

        {/* TIER 4: AI Learning Lab & Holograms */}
        {tier >= 4 && (
          <group position={[0, 4, 0]}>
            <cylinderGeometry args={[4, 5, 8, 16]} />
            <meshStandardMaterial color="#0f172a" emissive="#0284c7" emissiveIntensity={0.6} />
            <mesh position={[0, 6, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[5, 0.3, 16, 32]} />
              <meshBasicMaterial color="#00f0ff" toneMapped={false} />
            </mesh>
            <Text position={[0, 7.5, 0]} fontSize={1.0} font={worldFont} color="#bae6fd" anchorX="center">
              AI Learning Lab
            </Text>
          </group>
        )}

        {/* TIER 5: Master Guardian HQ & Aurora Sky Beam */}
        {tier === 5 && (
          <group position={[0, 45, 0]}>
            <cylinderGeometry args={[1.5, 3, 60, 16, 1, true]} />
            <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={4} transparent opacity={0.8} toneMapped={false} />
          </group>
        )}
      </group>

      {/* DYNAMICALLY PLACED CHILD STRUCTURES */}
      {placedStructures.map((struct) => (
        <group key={struct.id} position={struct.pos} rotation-y={struct.rotY} scale={struct.scale}>
          <mesh position={[0, 2, 0]} castShadow>
            <boxGeometry args={[4, 4, 4]} />
            <meshStandardMaterial color="#f59e0b" emissive="#d97706" emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, 4.8, 0]} fontSize={0.7} font={worldFont} color="#fef3c7" anchorX="center">
            {struct.name}
          </Text>
        </group>
      ))}

      {/* 5 BUILDABLE CLEARING ZONES */}
      {BUILDABLE_ZONES.map((zone) => {
        const isActive = activeZone === zone.id;
        const isUnlocked = zone.requiredTier <= tier;
        const tierInfo = GUARDIAN_TIERS[zone.requiredTier];

        return (
          <group key={zone.id} position={zone.pos}>
            <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[3, 4, 32]} />
              <meshBasicMaterial color={isUnlocked ? "#34d399" : "#f59e0b"} toneMapped={false} />
            </mesh>
            <Text position={[0, 3.2, 0]} fontSize={0.8} font={worldFont} color="#f8fafc" anchorX="center">
              {zone.name}
            </Text>

            {isActive && (
              <Html position={[0, 4.5, 0]} center distanceFactor={14}>
                <button
                  onClick={() => onOpenZoneBuilder?.(zone.id)}
                  className="animate-bounce rounded-full border border-emerald-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-emerald-300 shadow-xl"
                >
                  {isUnlocked ? `[E] AI Builder - ${zone.name}` : `🔒 Requires ${tierInfo.title}`}
                </button>
              </Html>
            )}
          </group>
        );
      })}

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
