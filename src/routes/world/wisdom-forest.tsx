import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Compass, CheckCircle } from "lucide-react";
import { WisdomForestScene } from "@/components/forest/wisdom-forest-scene";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { Button } from "@/components/ui/button";
import { PauseMenu } from "@/components/game/pause-menu";
import { getProgression } from "@/lib/progression.functions";
import type { PlayerProgress } from "@/domain/progression/types";
import { walletService } from "@/services/wallet-service";

// Import Minigames & 2D Map Overlay
import { SourceSignalHuntModal } from "@/components/forest/minigames/source-signal-hunt-modal";
import { PatternGroveModal } from "@/components/forest/minigames/pattern-grove-modal";
import { EcosystemBalanceModal } from "@/components/forest/minigames/ecosystem-balance-modal";
import { EvidenceTrailModal } from "@/components/forest/minigames/evidence-trail-modal";
import { ResearchStationModal } from "@/components/forest/minigames/research-station-modal";
import { KnowledgeSeedRescueModal } from "@/components/forest/minigames/knowledge-seed-rescue-modal";
import { WisdomMasteryModal } from "@/components/forest/minigames/wisdom-mastery-modal";
import { WisdomForestMapModal } from "@/components/forest/wisdom-forest-map-modal";

export const Route = createFileRoute("/world/wisdom-forest")({ ssr: false, component: WisdomForestPage });

function WisdomForestPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const navigate = useNavigate();
  const { guardianName } = useGuardian();
  const lexGuardian = CLASS_GUARDIANS.find((g) => g.id === "lex") ?? CLASS_GUARDIANS[0]!;
  const playerColor = lexGuardian.color ?? "#34d399";
  const playerLabel = `${guardianName || "Alex"} · Lex`;
  const inputManager = useMemo(() => new InputManager(), []);
  
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const refreshProgress = () =>
    getProgression()
      .then(setProgress)
      .catch(() => undefined);

  useEffect(() => {
    refreshProgress();
  }, []);

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

  const isModalOpen = activeMinigame !== null || isMapOpen;

  useEffect(() => {
    inputManager.setEnabled(!isModalOpen);
    if (!isModalOpen) inputManager.reset();
  }, [isModalOpen, inputManager]);

  const handleLaunchActivity = (activityKey: string) => {
    setActiveMinigame(activityKey);
  };

  const handleCompleteActivity = async (activityKey: string, score: number, passed: boolean) => {
    if (!passed) return;

    try {
      let xpEarned = 100;
      let pointsEarned = 25;

      if (activityKey === "wisdom-mastery") {
        xpEarned = 300;
        pointsEarned = 50;
      }

      const res = await walletService.awardCourseReward(
        `forest-${activityKey}`,
        score,
        score >= 100,
      );

      if (res.awarded) {
        setNotification(`🎉 Activity Complete! +${res.points_awarded} AI Builder Points Earned`);
      } else {
        setNotification(`🎉 Activity Completed!`);
      }
      setTimeout(() => setNotification(null), 4000);
      refreshProgress();
    } catch (e) {
      console.error("Failed to record activity completion", e);
    }
  };

  return (
    <div className="game-viewport forest-viewport fixed inset-0 bg-background">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (
            event.pointerType !== "mouse" ||
            isModalOpen ||
            !(event.target instanceof HTMLCanvasElement)
          )
            return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging.current && !isModalOpen)
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
            camera={{ position: [0, 6, 30], fov: 58 }}
          >
            <WisdomForestScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId="lex"
              inputManager={inputManager}
              blocked={isModalOpen}
              onLaunchActivity={handleLaunchActivity}
              teleportTarget={teleportTarget}
            />
          </Canvas>
        </GameErrorBoundary>
      </div>

      {/* Top Left Navigation Buttons */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
        <Link to="/world">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-950/80 text-white hover:bg-slate-800 font-bold text-xs"
          >
            <ArrowLeft className="size-4 mr-1" /> World Map
          </Button>
        </Link>
        <Button
          onClick={() => setIsMapOpen(true)}
          variant="outline"
          size="sm"
          className="border-emerald-500/40 bg-slate-950/90 text-emerald-300 hover:bg-emerald-950 font-black text-xs shadow-lg"
        >
          <Compass className="size-4 mr-1" /> 2D Forest Map
        </Button>
      </div>

      {/* Reward Notification Banner */}
      {notification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-emerald-500/40 bg-slate-950/90 px-5 py-3 text-xs font-black text-emerald-300 shadow-2xl backdrop-blur flex items-center gap-2">
          <CheckCircle className="size-5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Touch Mobile Controls */}
      {!isModalOpen && (
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
      )}

      {/* Activity Modals */}
      <SourceSignalHuntModal
        isOpen={activeMinigame === "source-signal"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("source-signal", score, passed)}
      />

      <PatternGroveModal
        isOpen={activeMinigame === "pattern-grove"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("pattern-grove", score, passed)}
      />

      <EcosystemBalanceModal
        isOpen={activeMinigame === "ecosystem-balance"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("ecosystem-balance", score, passed)}
      />

      <EvidenceTrailModal
        isOpen={activeMinigame === "evidence-trail"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("evidence-trail", score, passed)}
      />

      <ResearchStationModal
        isOpen={activeMinigame === "research-station"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("research-station", score, passed)}
      />

      <KnowledgeSeedRescueModal
        isOpen={activeMinigame === "seed-rescue"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("seed-rescue", score, passed)}
      />

      <WisdomMasteryModal
        isOpen={activeMinigame === "wisdom-mastery"}
        onClose={() => setActiveMinigame(null)}
        onComplete={(score, passed) => handleCompleteActivity("wisdom-mastery", score, passed)}
      />

      {/* 2D Accessible Map Modal */}
      <WisdomForestMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={(pos) => setTeleportTarget(pos)}
        onLaunchActivity={handleLaunchActivity}
      />

      <WorldLoading />
      <GameSettings />
      <PauseMenu />
    </div>
  );
}
