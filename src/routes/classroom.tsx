import { createFileRoute } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { ClassroomScene } from "@/components/meta/classroom-scene";
import { AcademyClassroomSet } from "@/components/meta/academy-classroom-set";
import { BuilderLabSet } from "@/components/meta/builder-lab-set";
import { CommunicationStudioSet } from "@/components/meta/communication-studio-set";
import { TruthLabSet } from "@/components/meta/truth-lab-set";
import { ClassHud } from "@/components/meta/class-hud";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { readSelectedClassroom } from "@/lib/classroom-selection";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { FullViewportCourseExperience } from "@/components/progression/full-course-experience";
import { SeatedCourseBoard } from "@/components/classroom/seated-course-board";
import { PauseMenu } from "@/components/game/pause-menu";
import { missions } from "@/domain/progression/catalog";
import { processClassCompletionBadgeAwardService } from "@/lib/badge-progression.functions";
import { ShieldCelebrationModal } from "@/components/badges/ShieldCelebrationModal";
import type { ShieldDefinition } from "@/domain/progression/badge-evaluator";

export const Route = createFileRoute("/classroom")({ ssr: false, component: ClassroomPage });

function readSelectedMission() {
  if (typeof window === "undefined") return missions[0]!.id;
  const saved = window.sessionStorage.getItem("nyrava-selected-mission");
  return missions.some((mission) => mission.id === saved) ? saved! : missions[0]!.id;
}

function ClassroomPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const { guardianId, guardianName, hydrated } = useGuardian();
  const chosen = (guardianId ? CLASS_GUARDIANS.find((g) => g.id === guardianId) : undefined) ?? CLASS_GUARDIANS[0]!;
  const playerColor = chosen?.color ?? "#f4f7ff";
  const playerLabel = guardianName || "Guardian";
  const inputManager = useMemo(() => new InputManager(), []);
  const currentRoom = useMemo(() => readSelectedClassroom(), []);
  const [courseOpen, setCourseOpen] = useState(false);
  const [activeSeatId, setActiveSeatId] = useState<string | null>(null);
  const [openDoorIds, setOpenDoorIds] = useState<Set<string>>(new Set());
  const [selectedMissionId, setSelectedMissionId] = useState(readSelectedMission);
  const [activeInteraction, setActiveInteraction] = useState<{
    id: string;
    type: string;
    label: { en: string; es: string };
    action: () => void;
  } | null>(null);

  useEffect(() => {
    const down = (event: KeyboardEvent) => inputManager.onKeyDown(event);
    const up = (event: KeyboardEvent) => inputManager.onKeyUp(event);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      inputManager.dispose();
    };
  }, [inputManager]);

  const startCourse = (targetMissionId?: string) => {
    let missionId = targetMissionId;
    if (!missionId) {
      if (currentRoom === "security") missionId = readSelectedMission();
      else if (currentRoom === "builder") missionId = "builder-lab";
      else if (currentRoom === "communication") missionId = "communication-studio";
      else if (currentRoom === "truth") missionId = "truth-lab";
      else missionId = missions[0]!.id;
    }
    setSelectedMissionId(missionId);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("nyrava-selected-mission", missionId);
    }
    inputManager.setEnabled(false);
    setCourseOpen(true);
  };

  const exitCourse = () => {
    inputManager.setEnabled(true);
    inputManager.reset();
    inputManager.cameraYaw = 0;
    inputManager.cameraPitch = 0.12;
    setCourseOpen(false);
  };

  if (!hydrated) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-slate-950 text-cyan-300">
        <div className="rounded-2xl border border-cyan-400/30 bg-slate-900/80 px-6 py-4 text-sm font-black tracking-wide shadow-2xl">
          Loading your Guardian…
        </div>
      </div>
    );
  }

  if (!chosen) {
    return (
      <div className="fixed inset-0 grid place-items-center bg-slate-950 p-6 text-white">
        <div className="max-w-md rounded-3xl border border-amber-400/30 bg-slate-900/90 p-6 text-center shadow-2xl">
          <h1 className="text-xl font-black">Choose your Guardian first</h1>
          <p className="mt-2 text-sm text-slate-300">
            Your classroom will not substitute a different avatar. Return to Isla Central, select
            your Guardian, then enter class again.
          </p>
          <button
            type="button"
            onClick={() => window.location.assign("/isla")}
            className="mt-5 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-black text-slate-950"
          >
            Return to Isla Central
          </button>
        </div>
      </div>
    );
  }

  const [unlockedShield, setUnlockedShield] = useState<ShieldDefinition | null>(null);

  const handleCourseComplete = async (score: number) => {
    if (score < 75) return;
    try {
      const res = await processClassCompletionBadgeAwardService({
        learnerUserId: "usr_child_1",
        classId: selectedMissionId,
        score,
      });

      if (res.success && res.summary && res.newlyAwardedBadges.length > 0 && res.summary.currentShield) {
        setUnlockedShield(res.summary.currentShield);
      }
    } catch {}
  };

  if (courseOpen) {
    return (
      <FullViewportCourseExperience
        missionId={selectedMissionId}
        onExit={exitCourse}
        onComplete={(score) => void handleCourseComplete(score)}
      />
    );
  }

  return (
    <div className="game-viewport classroom-viewport fixed inset-0 bg-background">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          const target = event.target as HTMLElement | null;
          if (
            target?.closest(
              "button, a, select, input, summary, details, label, [role='button'], .game-panel, .game-panel-content",
            )
          )
            return;
          if (event.pointerType === "mouse" && event.button !== 0) return;
          dragging.current = true;
        }}
        onPointerMove={(event) => {
          if (!dragging.current) return;
          inputManager.setCameraLook(event.movementX, event.movementY);
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => {
          dragging.current = false;
          inputManager.reset();
        }}
        onLostPointerCapture={() => (dragging.current = false)}
      >
        <GameErrorBoundary>
          <Canvas
            frameloop={active ? "always" : "never"}
            shadows={quality.shadows}
            dpr={quality.dpr}
            camera={{ position: [0, 3.2, 13.2], fov: 58 }}
          >
            <Suspense fallback={null}>
              <ClassroomScene
                room={currentRoom}
                playerColor={playerColor}
                playerLabel={playerLabel}
                guardianId={chosen.id}
                inputManager={inputManager}
                onStartCourse={startCourse}
                activeSeatId={activeSeatId}
                setActiveSeatId={setActiveSeatId}
                openDoorIds={openDoorIds}
                setOpenDoorIds={setOpenDoorIds}
                setActiveInteraction={setActiveInteraction}
              />
              {currentRoom === "security" && (
                <AcademyClassroomSet activeSeatId={activeSeatId} openDoorIds={openDoorIds} />
              )}
              {currentRoom === "builder" && (
                <BuilderLabSet activeSeatId={activeSeatId} openDoorIds={openDoorIds} />
              )}
              {currentRoom === "communication" && (
                <CommunicationStudioSet activeSeatId={activeSeatId} openDoorIds={openDoorIds} />
              )}
              {currentRoom === "truth" && (
                <TruthLabSet activeSeatId={activeSeatId} openDoorIds={openDoorIds} />
              )}
            </Suspense>
          </Canvas>
        </GameErrorBoundary>
      </div>

      <ClassHud
        room={currentRoom}
        activeInteraction={activeInteraction}
        activeSeatId={activeSeatId}
      />
      <div className="mobile-game-controls pointer-events-none fixed inset-0 z-40">
        <div className="game-left pointer-events-auto">
          <AnalogJoystick target={inputManager.joystick} />
        </div>
        <div className="game-right pointer-events-auto">
          <LookPad target={inputManager} />
        </div>
        <div className="game-actions pointer-events-auto">
          <button
            type="button"
            className="game-action"
            aria-label="Interact"
            onClick={() => inputManager.triggerInteract()}
          >
            Use
          </button>
        </div>
      </div>
      {activeSeatId && (
        <SeatedCourseBoard
          room={currentRoom}
          locale={chosen ? "en-US" : "en-US"}
          onStartTest={(targetId) => {
            startCourse(targetId);
          }}
          onStandUp={() => {
            setActiveSeatId(null);
          }}
        />
      )}
      <WorldLoading />
      <GameSettings />
      <PauseMenu />
      {unlockedShield && (
        <ShieldCelebrationModal shield={unlockedShield} onClose={() => setUnlockedShield(null)} />
      )}
    </div>
  );
}
