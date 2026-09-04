import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text, useProgress } from "@react-three/drei";
import worldFont from "@fontsource/nunito/files/nunito-latin-400-normal.woff?url";
import * as THREE from "three";
import { Character } from "./character";
import { CLASS_GUARDIANS, type ClassGuardian } from "@/lib/class-guardians";
import { PlayerController } from "@/components/game/core/player-controller";
import { updateThirdPersonCamera } from "@/components/game/core/camera-follower";
import { type InputManager } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";
import {
  InteractionManager,
  type InteractiveTarget,
} from "@/components/game/core/interaction-manager";
import {
  CLASSROOM_TRAVEL_BOUNDS,
  isRoomPositionColliding,
} from "@/components/game/player/classroom-collision";
import { STUDENT_SEATS } from "./academy-classroom-set";
import { BUILDER_SEATS } from "./builder-lab-set";
import { COMMUNICATION_SEATS } from "./communication-studio-set";
import { TRUTH_SEATS } from "./truth-lab-set";

export type ClassroomRoom = "security" | "builder" | "communication" | "truth";

const PLAYER_SPAWN: [number, number, number] = [0, 0, 5.0];
const CAMERA_BOUNDS = { minX: -12.0, maxX: 12.0, minY: 1.0, maxY: 4.4, minZ: -9.0, maxZ: 9.0 };
const EMPTY_OPEN_DOORS = new Set<string>();

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-full border border-cyan-400/40 bg-slate-950/90 px-4 py-2 font-mono text-sm text-cyan-300 backdrop-blur">
        Loading Classroom… {Math.round(progress)}%
      </div>
    </Html>
  );
}

/**
 * Authoritative Teacher NPC (Sarah)
 * Anchored to world position [-4.0, 0.2, -6.0] with 3D text label.
 */
function TeacherNpc({
  guardian,
  position,
  rotation = 0.3,
}: {
  guardian: ClassGuardian;
  position: [number, number, number];
  rotation?: number;
}) {
  return (
    <group position={position} rotation-y={rotation}>
      <Character color={guardian.color} clip="idle" guardianId={guardian.id} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.7, 0.95, 36]} />
        <meshStandardMaterial
          color={guardian.color}
          emissive={guardian.color}
          emissiveIntensity={1.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* 3D World Space Label anchored to Sarah's head */}
      <group position={[0, 2.15, 0]}>
        <Text
          fontSize={0.16}
          color={guardian.color}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.06}
        >
          {`${guardian.name} · ${guardian.role}`}
        </Text>
      </group>
    </group>
  );
}

const playerController = new PlayerController();
const interactionManager = new InteractionManager();

export function ClassroomScene({
  room = "security",
  playerColor = "#f4f7ff",
  playerLabel = "You",
  guardianId = "lex",
  inputManager,
  onStartCourse,
  activeSeatId,
  setActiveSeatId,
  openDoorIds,
  setActiveInteraction,
}: {
  room?: ClassroomRoom;
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  inputManager: InputManager;
  onStartCourse?: (() => void) | undefined;
  activeSeatId?: string | null;
  setActiveSeatId?: (id: string | null) => void;
  openDoorIds?: Set<string>;
  setOpenDoorIds?: (updater: (prev: Set<string>) => Set<string>) => void;
  setActiveInteraction?: (
    interaction: {
      id: string;
      type: string;
      label: { en: string; es: string };
      action: () => void;
    } | null,
  ) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const lastInteractionKey = useRef<string | null>(null);
  const [moving, setMoving] = useState(false);

  const roomData = useMemo(() => {
    if (room === "builder") return { seats: BUILDER_SEATS, teacherId: "jacob" };
    if (room === "communication") return { seats: COMMUNICATION_SEATS, teacherId: "dayana" };
    if (room === "truth") return { seats: TRUTH_SEATS, teacherId: "nova" };
    return { seats: STUDENT_SEATS, teacherId: "sarah" };
  }, [room]);

  useEffect(() => {
    if (group.current) {
      group.current.position.set(...PLAYER_SPAWN);
      group.current.rotation.y = 0;
    }
    playerController.velocity.set(0, 0, 0);
    playerController.rotationY = 0;
    inputManager.reset();
    inputManager.cameraYaw = 0;
    inputManager.cameraPitch = 0.12;
    lastInteractionKey.current = null;
    setActiveInteraction?.(null);
  }, [room, inputManager, setActiveInteraction]);

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const player = group.current;
    if (!player) return;

    const input = inputManager.getSnapshot();
    const mode: PlayerMode = activeSeatId
      ? "seated"
      : input.moveX !== 0 || input.moveY !== 0
        ? input.run
          ? "running"
          : "walking"
        : "idle";
    const currentOpenDoors = openDoorIds ?? EMPTY_OPEN_DOORS;

    const getSurfaceHeight = (pos: THREE.Vector3) => {
      // Teacher podium at [-4.0, -6.0]
      if (Math.hypot(pos.x + 4.0, pos.z + 6.0) < 2.2) return 0.25;
      // Student desks (tables only - chairs are sat IN via E key, not stepped ON)
      const deskPositions: [number, number][] = [
        [-6.5, 2.5],
        [-6.5, 6.0],
        [6.5, 2.5],
        [6.5, 6.0],
      ];
      for (const [dx, dz] of deskPositions) {
        if (Math.hypot(pos.x - dx, pos.z - dz) < 1.1) return 0.75;
      }
      return 0;
    };

    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      CLASSROOM_TRAVEL_BOUNDS,
      (nextPos) => isRoomPositionColliding(room, nextPos, currentOpenDoors, 0.45),
      getSurfaceHeight,
    );

    if (!activeSeatId) player.rotation.y = playerController.rotationY;
    if (playerController.isMoving !== moving) setMoving(playerController.isMoving);

    if (camera instanceof THREE.PerspectiveCamera) {
      updateThirdPersonCamera(
        camera,
        player.position,
        inputManager.cameraYaw,
        inputManager.cameraPitch,
        delta,
        5.7,
        1.35,
        [],
        CAMERA_BOUNDS,
      );
    }

    const pPos: [number, number, number] = [
      player.position.x,
      player.position.y,
      player.position.z,
    ];
    const targets: InteractiveTarget[] = [];

    if (activeSeatId) {
      targets.push({
        id: "stand-action",
        type: "seat",
        position: pPos,
        range: 1,
        priority: 100,
        label: { en: "Press E to Stand", es: "Presiona E para levantarte" },
        action: () => {
          const seat = roomData.seats.find((item) => item.id === activeSeatId);
          if (seat && group.current) group.current.position.set(...seat.standPosition);
          setActiveSeatId?.(null);
        },
      });
    }

    targets.push({
      id: `board-${room}`,
      type: "lesson",
      position: [-4.0, 0, -6.0],
      range: 3.5,
      priority: 80,
      label: {
        en: "Press E to Talk to Sarah / Start Class",
        es: "Presiona E para hablar con Sarah / Iniciar clase",
      },
      action: () => onStartCourse?.(),
    });

    for (const seat of roomData.seats) {
      targets.push({
        id: `seat-${seat.id}`,
        type: "seat",
        position: seat.position,
        range: 2,
        priority: 40,
        label: { en: "Press E to Sit", es: "Presiona E para sentarte" },
        action: () => {
          if (group.current) {
            group.current.position.set(...seat.seatPosition);
            group.current.rotation.y = seat.seatRotation;
          }
          setActiveSeatId?.(seat.id);
        },
        enabled: !activeSeatId,
      });
    }

    targets.push({
      id: "portal-action",
      type: "portal",
      position: [11.2, 0, 2.0],
      range: 2.5,
      priority: 20,
      label: {
        en: "Press E / Tap to Enter Mission Hub",
        es: "Presiona E / Toca para entrar al Centro de Misiones",
      },
      action: () => {
        if (typeof window !== "undefined") window.location.assign("/missions");
      },
    });

    const best = interactionManager.getBestInteraction(pPos, targets);
    const nextKey = best ? `${best.id}:${best.label.en}` : null;
    if (nextKey !== lastInteractionKey.current) {
      lastInteractionKey.current = nextKey;
      setActiveInteraction?.(
        best ? { id: best.id, type: best.type, label: best.label, action: best.action } : null,
      );
    }
    if (best && input.interactPressed) best.action();
  });

  const teacher =
    CLASS_GUARDIANS.find((guardian) => guardian.id === roomData.teacherId) ?? CLASS_GUARDIANS[0]!;

  return (
    <>
      <color attach="background" args={["#0f172a"]} />
      <fog attach="fog" args={["#0f172a", 22, 52]} />
      <Suspense fallback={<Loader />}>
        {/* Sarah standing welcomingly at podium */}
        <TeacherNpc guardian={teacher} position={[-4.0, 0.2, -6.0]} rotation={0.3} />

        {/* Player Avatar */}
        <group ref={group} position={PLAYER_SPAWN} rotation-y={0}>
          <Character
            color={playerColor}
            clip={moving ? "walk" : "idle"}
            guardianId={guardianId}
            height={1.7}
          />
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
            <ringGeometry args={[0.55, 0.72, 40]} />
            <meshStandardMaterial
              color={playerColor}
              emissive={playerColor}
              emissiveIntensity={1.5}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight position={[0, 1.7, 0]} color={playerColor} intensity={4} distance={5} />
          <group position={[0, 2.15, 0]}>
            <Text font={worldFont} fontSize={0.16} color="#38bdf8" anchorX="center" anchorY="middle" letterSpacing={0.05}>
              {playerLabel}
            </Text>
          </group>
        </group>
      </Suspense>
    </>
  );
}
