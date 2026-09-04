import { useEffect, useState } from "react";
import { islaControls, toggleIslaView, useIsla, resetIslaControls } from "@/lib/isla-store";
import { AnalogJoystick, LookPad, HoldAction } from "@/components/game/touch-controls";
import { actionHaptic } from "@/services/platform/device";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Eye,
  Footprints,
  Hand,
  Minus,
  Plus,
  Rocket,
} from "lucide-react";

/**
 * On-screen navigation + camera controls for Isla Central.
 * Mirrors the keyboard bindings so the world is playable with a mouse alone.
 */

const BTN =
  "pointer-events-auto flex items-center justify-center rounded-xl border border-cyan-400/40 bg-slate-950/80 text-cyan-100 shadow-lg backdrop-blur transition active:scale-95 hover:border-cyan-300";

function stop(e: React.PointerEvent | React.MouseEvent) {
  e.stopPropagation();
  e.preventDefault();
}

function HoldKey({
  dir,
  icon,
  label,
}: {
  dir: "w" | "a" | "s" | "d";
  icon: React.ReactNode;
  label: string;
}) {
  const press = (e: React.PointerEvent) => {
    stop(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    islaControls.keys.add(dir);
  };
  const release = (e: React.PointerEvent) => {
    stop(e);
    islaControls.keys.delete(dir);
  };
  return (
    <button
      aria-label={label}
      className={`${BTN} h-12 w-12`}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
    >
      {icon}
    </button>
  );
}

export function IslaControls({ guardianName }: { guardianName?: string } = {}) {
  const state = useIsla();
  const busy = !!state.challengeFor || state.reporting;
  const [view, setView] = useState(islaControls.view);
  const [sprint, setSprint] = useState(islaControls.sprint);
  useEffect(() => {
    if (busy) resetIslaControls();
  }, [busy]);

  useEffect(() => {
    const onView = () => setView(islaControls.view);
    window.addEventListener("isla-view", onView as EventListener);
    return () => window.removeEventListener("isla-view", onView as EventListener);
  }, []);

  const zoom = (factor: number) => {
    islaControls.camDistance = Math.min(34, Math.max(3.5, islaControls.camDistance * factor));
    if (islaControls.camDistance <= 4 && islaControls.view === "third") toggleIslaView();
    if (islaControls.camDistance > 5 && islaControls.view === "first") toggleIslaView();
  };

  if (busy) return null;
  return (
    <>
      <div
        className="mobile-game-controls pointer-events-none fixed inset-0 z-40"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="game-left">
          <AnalogJoystick target={islaControls.joystick} />
        </div>
        <div className="game-right">
          <LookPad target={islaControls} />
        </div>
        <div className="game-actions">
          <HoldAction
            label="Run"
            onChange={(pressed) => {
              islaControls.sprint = pressed;
            }}
          />
          <button
            className="game-action"
            aria-label="Interact"
            onClick={() => {
              islaControls.interact = true;
              actionHaptic();
            }}
          >
            Use
          </button>
          <button
            className="game-action"
            aria-label="Jump"
            onClick={() => {
              islaControls.jump = true;
              actionHaptic();
            }}
          >
            Jump
          </button>
        </div>
      </div>
      <div
        className="desktop-game-controls pointer-events-none fixed inset-0 z-40"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Movement pad */}
        <div className="absolute bottom-8 left-8 grid grid-cols-3 gap-1.5">
          <span />
          <HoldKey dir="w" label="Walk forward" icon={<ArrowUp className="h-5 w-5" />} />
          <span />
          <HoldKey dir="a" label="Walk left" icon={<ArrowLeft className="h-5 w-5" />} />
          <HoldKey dir="s" label="Walk back" icon={<ArrowDown className="h-5 w-5" />} />
          <HoldKey dir="d" label="Walk right" icon={<ArrowRight className="h-5 w-5" />} />
        </div>

        {/* Action + camera cluster */}
        <div className="absolute bottom-8 right-8 flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              aria-label="Zoom out"
              className={`${BTN} h-11 w-11`}
              onPointerDown={(e) => {
                stop(e);
                zoom(1.25);
              }}
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              aria-label="Zoom in"
              className={`${BTN} h-11 w-11`}
              onPointerDown={(e) => {
                stop(e);
                zoom(0.8);
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
            <button
              aria-label="Toggle first or third person view"
              className={`${BTN} h-11 gap-1.5 px-3 text-xs font-black uppercase tracking-wider`}
              onPointerDown={(e) => {
                stop(e);
                toggleIslaView();
                setView(islaControls.view);
              }}
            >
              <Eye className="h-4 w-4" />
              {view === "first" ? "1st" : "3rd"}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              aria-label="Toggle sprint"
              className={`${BTN} h-12 gap-1.5 px-3 text-xs font-black uppercase tracking-wider ${
                sprint ? "border-amber-400 bg-amber-500/80 text-slate-950" : ""
              }`}
              onPointerDown={(e) => {
                stop(e);
                islaControls.sprint = !islaControls.sprint;
                setSprint(islaControls.sprint);
              }}
            >
              <Footprints className="h-4 w-4" />
              Run
            </button>
            <button
              aria-label="Interact"
              className={`${BTN} h-12 gap-1.5 px-3 text-xs font-black uppercase tracking-wider`}
              onPointerDown={(e) => {
                stop(e);
                islaControls.interact = true;
              }}
            >
              <Hand className="h-4 w-4" />
              Use
            </button>
            <button
              aria-label="Jump"
              className={`${BTN} h-12 gap-1.5 border-emerald-400/50 px-4 text-xs font-black uppercase tracking-wider text-emerald-200`}
              onPointerDown={(e) => {
                stop(e);
                islaControls.jump = true;
              }}
            >
              <Rocket className="h-4 w-4" />
              Jump
            </button>
          </div>
          <p className="pointer-events-none rounded-lg bg-slate-950/70 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-300">
            WASD / Arrows · Shift run · Space jump · E use · V view
          </p>
        </div>
      </div>
    </>
  );
}
