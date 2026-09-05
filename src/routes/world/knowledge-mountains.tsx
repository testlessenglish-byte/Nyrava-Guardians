import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Compass, CheckCircle, Shield } from "lucide-react";
import { KnowledgeMountainsScene } from "@/components/mountains/knowledge-mountains-scene";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { Button } from "@/components/ui/button";
import { PauseMenu } from "@/components/game/pause-menu";
import { getProgression, completeWorldActivity } from "@/lib/progression.functions";
import type { PlayerProgress } from "@/domain/progression/types";
import { walletService } from "@/services/wallet-service";
import { KnowledgeMountainsMapModal } from "@/components/mountains/knowledge-mountains-map-modal";

export const Route = createFileRoute("/world/knowledge-mountains")({
  ssr: false,
  component: KnowledgeMountainsPage,
});

function KnowledgeMountainsPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const navigate = useNavigate();
  const { guardianId, guardianName } = useGuardian();
  
  const chosenGuardian =
    CLASS_GUARDIANS.find((g) => g.id === guardianId) ??
    CLASS_GUARDIANS.find((g) => g.id === "tess") ??
    CLASS_GUARDIANS[0]!;

  const playerColor = chosenGuardian.color ?? "#38bdf8";
  const playerLabel = `${guardianName || "Explorer"} · ${chosenGuardian.name}`;
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
    completeWorldActivity({ data: { worldId: "knowledge-mountains", activityKey } })
      .then(() => setNotification(`🎉 Discovered activity: ${activityKey}`))
      .catch(() => undefined);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNavigateWorld = (targetRoute: string) => {
    navigate({ to: targetRoute as any });
  };

  return (
    <div className="game-viewport mountains-viewport fixed inset-0 bg-slate-950 overflow-hidden">
      {/* 3D R3F EVEREST PEAK SCENE WITH PLAYER AVATAR AND CONTROLS */}
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
            <KnowledgeMountainsScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId={chosenGuardian.id}
              inputManager={inputManager}
              blocked={isModalOpen}
              onLaunchActivity={handleLaunchActivity}
              onNavigateWorld={handleNavigateWorld}
              teleportTarget={teleportTarget}
            />
          </Canvas>
        </GameErrorBoundary>
      </div>

      <WorldLoading />

      {/* TOP NAVIGATION HUD & AVATAR VIEW BADGE */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between p-4 md:p-6">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/realm"
            className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-slate-950/80 px-4 py-2 text-xs font-black text-sky-300 shadow-xl backdrop-blur transition hover:bg-slate-900 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4 text-sky-400" />
            World Map
          </Link>
          
          {/* AVATAR VIEW BADGE */}
          <div className="flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-slate-950/85 px-3 py-1.5 text-xs font-black text-sky-200 shadow-xl backdrop-blur">
            <span
              className="flex h-6 w-6 items-center justify-center rounded-full text-slate-950 text-[10px] font-black"
              style={{ backgroundColor: playerColor }}
            >
              {chosenGuardian.name[0]}
            </span>
            <span className="hidden sm:inline-block">{playerLabel}</span>
          </div>

          <div className="hidden rounded-2xl border border-sky-500/30 bg-slate-950/80 px-4 py-2 text-xs font-black text-sky-200 backdrop-blur md:flex">
            🏔️ Everest Peak
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <Button
            onClick={() => setIsMapOpen(true)}
            variant="outline"
            className="gap-2 rounded-2xl border-sky-500/40 bg-slate-950/80 text-xs font-black text-sky-300 hover:bg-slate-900 shadow-lg"
          >
            <Compass className="h-4 w-4 text-sky-400" />
            Interactive Map
          </Button>
          <PauseMenu />
          <GameSettings />
        </div>
      </div>

      {/* REWARD NOTIFICATION BANNER */}
      {notification && (
        <div className="pointer-events-none absolute top-20 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-sky-400/50 bg-slate-950/95 px-5 py-3 text-xs font-black text-sky-300 shadow-2xl backdrop-blur flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-sky-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* TOUCH MOBILE CONTROLS OVERLAY */}
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
              className="game-action font-black"
              aria-label="Interact"
              onClick={() => inputManager.triggerInteract()}
            >
              Use
            </button>
          </div>
        </div>
      )}

      {/* 2D MAP MODAL */}
      <KnowledgeMountainsMapModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={(pos) => {
          setTeleportTarget(pos);
          setIsMapOpen(false);
        }}
        onLaunchActivity={handleLaunchActivity}
      />
    </div>
  );
}
