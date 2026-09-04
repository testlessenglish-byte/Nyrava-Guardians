import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { ArrowLeft, Compass, Globe } from "lucide-react";
import { IslaCentralScene } from "@/components/isla/isla-central-scene";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { Button } from "@/components/ui/button";
import { PauseMenu } from "@/components/game/pause-menu";
import { IslaCentralMapModal } from "@/components/isla/isla-central-map-modal";

export const Route = createFileRoute("/world/isla-central")({ ssr: false, component: IslaCentralPage });

function IslaCentralPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const navigate = useNavigate();
  const { guardianId, guardianName } = useGuardian();
  const chosen = CLASS_GUARDIANS.find((g) => g.id === guardianId);
  const playerColor = chosen?.color ?? "#38bdf8";
  const playerLabel = `${guardianName || "You"}${chosen ? ` · ${chosen.name}` : ""}`;
  const inputManager = useMemo(() => new InputManager(), []);
  
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [teleportTarget, setTeleportTarget] = useState<[number, number, number] | null>(null);

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

  useEffect(() => {
    inputManager.setEnabled(!isMapOpen);
    if (!isMapOpen) inputManager.reset();
  }, [isMapOpen, inputManager]);

  const handleNavigateWorld = (targetRoute: string) => {
    navigate({ to: targetRoute as any });
  };

  return (
    <div className="game-viewport isla-viewport fixed inset-0 bg-background">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (
            event.pointerType !== "mouse" ||
            isMapOpen ||
            !(event.target instanceof HTMLCanvasElement)
          )
            return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging.current && !isMapOpen)
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
            camera={{ position: [0, 6, 28], fov: 58 }}
          >
            <IslaCentralScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId={chosen?.id ?? "lex"}
              inputManager={inputManager}
              blocked={isMapOpen}
              onNavigateWorld={handleNavigateWorld}
              teleportTarget={teleportTarget}
            />
          </Canvas>
        </GameErrorBoundary>
      </div>

      {/* Top Left Navigation Controls */}
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
          className="border-cyan-500/40 bg-slate-950/90 text-cyan-300 hover:bg-cyan-950 font-black text-xs shadow-lg"
        >
          <Compass className="size-4 mr-1" /> 2D Hub Navigator
        </Button>
      </div>

      {/* Touch Mobile Controls */}
      {!isMapOpen && (
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

      {/* 2D Accessible Map Modal */}
      <IslaCentralMapModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onTeleport={(pos) => setTeleportTarget(pos)}
        onNavigateWorld={handleNavigateWorld}
      />

      <WorldLoading />
      <GameSettings />
      <PauseMenu />
    </div>
  );
}
