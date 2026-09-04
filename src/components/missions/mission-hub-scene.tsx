import { Suspense, useEffect, useRef, useState } from "react";
import { Html, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Character } from "@/components/meta/character";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { PlayerController } from "@/components/game/core/player-controller";
import { updateThirdPersonCamera } from "@/components/game/core/camera-follower";
import { type InputManager } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";

const playerController = new PlayerController();
const PLAYER_SPAWN: [number, number, number] = [0, 0, 4.9];
const PLAYER_BOUNDS = { minX: -9.9, maxX: 9.9, minZ: -7.0, maxZ: 7.0 };
const CAMERA_BOUNDS = { minX: -10.6, maxX: 10.6, minY: 1.0, maxY: 4.5, minZ: -7.8, maxZ: 7.8 };

function WallPanel({
  position,
  rotationY = 0,
  accent,
  eyebrow,
  title,
  detail,
}: {
  position: [number, number, number];
  rotationY?: number;
  accent: string;
  eyebrow: string;
  title: string;
  detail: string;
}) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.25, 2.4, 0.16]} />
        <meshStandardMaterial color="#081321" roughness={0.42} metalness={0.35} />
      </mesh>
      <mesh position={[0, 1.08, 0.09]}>
        <boxGeometry args={[4.05, 0.08, 0.03]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      <Text
        position={[0, 0.66, 0.1]}
        fontSize={0.16}
        color={accent}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {eyebrow}
      </Text>
      <Text
        position={[0, 0.08, 0.1]}
        fontSize={0.34}
        maxWidth={3.55}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
      >
        {title}
      </Text>
      <Text
        position={[0, -0.62, 0.1]}
        fontSize={0.15}
        maxWidth={3.45}
        color="#a9bed2"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        lineHeight={1.25}
      >
        {detail}
      </Text>
    </group>
  );
}

function CommandTable() {
  return (
    <group position={[0, 0, 0.2]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.8, 0.35, 48]} />
        <meshStandardMaterial color="#0b2036" roughness={0.34} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.76, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.65, 2.3, 64]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={1.25}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0.8, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[1.45, 48]} />
        <meshStandardMaterial color="#07111f" emissive="#0c4a6e" emissiveIntensity={0.35} />
      </mesh>
      <Text
        position={[0, 0.84, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.34}
        color="#bae6fd"
        anchorX="center"
        anchorY="middle"
      >
        MISSION MAP
      </Text>
    </group>
  );
}

export function MissionHubScene({
  playerColor = "#f4f7ff",
  playerLabel = "You",
  guardianId = "lex",
  inputManager,
  blocked = false,
  onOpenBoard,
}: {
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  inputManager: InputManager;
  blocked?: boolean;
  onOpenBoard?: () => void;
}) {
  const playerRef = useRef<THREE.Group>(null);
  const [moving, setMoving] = useState(false);
  const [nearSarah, setNearSarah] = useState(false);
  const sarah = CLASS_GUARDIANS.find((guardian) => guardian.id === "sarah") ?? CLASS_GUARDIANS[0]!;

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(...PLAYER_SPAWN);
      playerRef.current.rotation.y = Math.PI;
    }
    playerController.velocity.set(0, 0, 0);
    playerController.rotationY = Math.PI;
    inputManager.reset();
    inputManager.cameraYaw = 0;
    inputManager.cameraPitch = 0.12;
  }, [inputManager]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const player = playerRef.current;
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
      // Command table at [0, 0, 0.2], radius 2.8, top height 0.725
      const distTable = Math.hypot(pos.x - 0, pos.z - 0.2);
      if (distTable < 2.7) return 0.725;
      // Sarah platform at [0, 0, -5.6], radius 1.6, top height 0.3
      const distPlatform = Math.hypot(pos.x - 0, pos.z + 5.6);
      if (distPlatform < 1.6) return 0.3;
      return 0;
    };
    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      PLAYER_BOUNDS,
      undefined,
      getSurfaceHeight,
    );
    player.rotation.y = playerController.rotationY;
    if (playerController.isMoving !== moving) setMoving(playerController.isMoving);
    if (camera instanceof THREE.PerspectiveCamera)
      updateThirdPersonCamera(
        camera,
        player.position,
        inputManager.cameraYaw,
        inputManager.cameraPitch,
        delta,
        5.5,
        1.45,
        [],
        CAMERA_BOUNDS,
      );
    const close = Math.hypot(player.position.x, player.position.z + 5.6) < 2.7;
    if (close !== nearSarah) setNearSarah(close);
    if (!blocked && close && input.interactPressed) onOpenBoard?.();
  });

  return (
    <>
      <color attach="background" args={["#050a13"]} />
      <fog attach="fog" args={["#050a13", 22, 44]} />
      <ambientLight intensity={0.82} color="#c7d2fe" />
      <directionalLight position={[7, 13, 6]} intensity={1.75} color="#dbeafe" />
      <pointLight position={[0, 4.1, -5.2]} color="#22d3ee" intensity={9} distance={17} />
      <pointLight position={[-8.5, 3.2, 1.5]} color="#6366f1" intensity={5} distance={10} />
      <pointLight position={[8.5, 3.2, 1.5]} color="#f59e0b" intensity={5} distance={10} />

      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#172033" roughness={0.5} metalness={0.28} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 5, 0]}>
        <planeGeometry args={[24, 18]} />
        <meshStandardMaterial color="#07101d" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.5, -8.55]} receiveShadow>
        <boxGeometry args={[24, 5, 0.3]} />
        <meshStandardMaterial color="#0d1726" />
      </mesh>
      <mesh position={[0, 2.5, 8.55]} receiveShadow>
        <boxGeometry args={[24, 5, 0.3]} />
        <meshStandardMaterial color="#0d1726" />
      </mesh>
      <mesh position={[-11.55, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.3, 5, 17]} />
        <meshStandardMaterial color="#0d1726" />
      </mesh>
      <mesh position={[11.55, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.3, 5, 17]} />
        <meshStandardMaterial color="#0d1726" />
      </mesh>

      <mesh rotation-x={-Math.PI / 2} position={[0, 0.015, -1.0]}>
        <planeGeometry args={[1.5, 13.5]} />
        <meshStandardMaterial color="#123450" emissive="#0891b2" emissiveIntensity={0.28} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.025, 3.9]}>
        <ringGeometry args={[0.85, 1.15, 48]} />
        <meshStandardMaterial color="#67e8f9" emissive="#0891b2" emissiveIntensity={0.9} />
      </mesh>

      <group position={[0, 2.9, -8.36]}>
        <mesh position={[0, 0, -0.03]} receiveShadow>
          <boxGeometry args={[11.2, 2.55, 0.08]} />
          <meshStandardMaterial color="#071522" roughness={0.4} metalness={0.4} />
        </mesh>
        <Text
          position={[0, 0.72, 0.04]}
          fontSize={0.18}
          color="#22d3ee"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.11}
        >
          NYRAVA GUARDIANS
        </Text>
        <Text
          position={[0, 0.12, 0.04]}
          fontSize={0.52}
          maxWidth={10.0}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
        >
          MISSION COMMAND CENTER
        </Text>
        <Text
          position={[0, -0.55, 0.04]}
          fontSize={0.16}
          color="#a9bed2"
          anchorX="center"
          anchorY="middle"
        >
          Choose an operation. Talk to Sarah. Deploy when ready.
        </Text>
      </group>

      <WallPanel
        position={[-9.1, 2.0, 0.4]}
        rotationY={Math.PI / 2}
        accent="#818cf8"
        eyebrow="ACTIVE INCIDENT"
        title="Digital City"
        detail="Current investigation and response"
      />
      <WallPanel
        position={[9.1, 2.0, 0.4]}
        rotationY={-Math.PI / 2}
        accent="#fbbf24"
        eyebrow="ACADEMY"
        title="Safety Foundations"
        detail="Training and scored assessments"
      />
      <CommandTable />

      <group position={[0, 0.15, -5.6]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.45, 1.6, 0.3, 40]} />
          <meshStandardMaterial color="#123c4c" emissive="#0891b2" emissiveIntensity={0.5} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.18, 0]}>
          <ringGeometry args={[1.05, 1.34, 48]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.1} />
        </mesh>
      </group>

      <Suspense fallback={null}>
        <group position={[0, 0.2, -5.6]} rotation-y={Math.PI}>
          <Character color={sarah.color} clip="idle" guardianId={sarah.id} />
          <Text
            position={[0, 2.35, 0]}
            fontSize={0.16}
            color="#67e8f9"
            anchorX="center"
            anchorY="middle"
          >
            SARAH · SECURITY SPECIALIST
          </Text>
          {nearSarah && !blocked && (
            <Html position={[0, 2.78, 0]} center distanceFactor={10} occlude={false}>
              <div className="pointer-events-none whitespace-nowrap rounded-full border border-amber-300/40 bg-slate-950/95 px-4 py-1.5 text-[11px] font-black text-amber-200 shadow-xl">
                Press E to open Mission Board
              </div>
            </Html>
          )}
        </group>
        <group ref={playerRef} position={PLAYER_SPAWN} rotation-y={Math.PI}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.55, 0.72, 40]} />
            <meshStandardMaterial
              color={playerColor}
              emissive={playerColor}
              emissiveIntensity={1.35}
              transparent
              opacity={0.82}
            />
          </mesh>
          <Text
            position={[0, 2.28, 0]}
            fontSize={0.17}
            color="#bae6fd"
            anchorX="center"
            anchorY="middle"
          >
            {playerLabel.toUpperCase()}
          </Text>
        </group>
      </Suspense>
    </>
  );
}
