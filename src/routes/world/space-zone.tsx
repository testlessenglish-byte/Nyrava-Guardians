import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Compass } from "lucide-react";
import { SpaceZoneScene } from "@/components/space/space-zone-scene";
import { SpaceZoneMapModal } from "@/components/space/space-zone-map-modal";
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

export const Route = createFileRoute("/world/space-zone")({
  ssr: false,
  component: SpaceZonePage,
});

function SpaceZonePage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const navigate = useNavigate();
  const { guardianName } = useGuardian();
  const guardian = CLASS_GUARDIANS.find((g) => g.id === "byte") ?? CLASS_GUARDIANS[0]!;
  const playerColor = guardian.color ?? "#c084fc";
  const playerLabel = `${guardianName || "Explorer"} · Byte`;
  const inputManager = useMemo(() => new InputManager(), []);

  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    getProgression().then(setProgress).catch(() => undefined);
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
    completeWorldActivity({ data: { worldId: "space-zone", activityKey } })
      .then(() => setNotification(`🎉 Discovered activity: ${activityKey}`))
      .catch(() => undefined);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNavigateWorld = (targetRoute: string) => {
    navigate({ to: targetRoute as any });
  };

  return (
    <div className="game-viewport space-viewport fixed inset-0 bg-background">
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
            <SpaceZoneScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId="byte"
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

      {/* TOP BAR HUD */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <div className="pointer-events-auto flex items-center gap-3">
          <Link
            to="/world"
            className="flex items-center gap-2 rounded-2xl border border-purple-500/30 bg-slate-950/80 px-4 py-2 text-xs font-black text-purple-300 shadow-xl backdrop-blur transition hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            World Map
          </Link>
          <div className="hidden rounded-2xl border border-purple-500/20 bg-slate-950/80 px-4 py-2 text-xs font-black text-purple-200 backdrop-blur sm:flex">
            🚀 Space Zone
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <Button
            onClick={() => setIsMapOpen(true)}
            variant="outline"
            className="gap-2 rounded-2xl border-purple-500/30 bg-slate-950/80 text-xs font-black text-purple-300 hover:bg-slate-900"
          >
            <Compass className="h-4 w-4 text-purple-400" />
            Interactive Map
          </Button>
          <PauseMenu />
          <GameSettings />
        </div>
      </div>

      {notification && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 -translate-x-1/2 rounded-2xl border border-purple-400/50 bg-slate-950/90 px-5 py-2.5 text-xs font-black text-purple-300 shadow-2xl backdrop-blur">
          {notification}
        </div>
      )}

      {/* TOUCH CONTROLS */}
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
      <SpaceZoneMapModal
        open={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={(pos) => setTeleportTarget(pos)}
        onLaunchActivity={handleLaunchActivity}
      />
    </div>
  );
}
