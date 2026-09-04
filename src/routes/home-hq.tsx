import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect, useMemo } from "react";
import { Award, ArrowLeft, Trophy, Package } from "lucide-react";
import { HomeHqScene } from "@/components/hq/home-hq-scene";
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
import { levelFor } from "@/domain/progression/engine";
import type { PlayerProgress } from "@/domain/progression/types";

export const Route = createFileRoute("/home-hq")({ ssr: false, component: HomeHqPage });

function HomeHqPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const { guardianId, guardianName, locale } = useGuardian();
  const es = locale.startsWith("es");
  const chosen = CLASS_GUARDIANS.find((g) => g.id === guardianId);
  const playerColor = chosen?.color ?? "#f4f7ff";
  const playerLabel = `${guardianName || "You"}${chosen ? ` · ${chosen.name}` : ""}`;
  const inputManager = useMemo(() => new InputManager(), []);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  useEffect(() => {
    getProgression()
      .then(setProgress)
      .catch(() => undefined);
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

  const xp = progress?.xp ?? 0;
  const level = levelFor(xp);
  const nextLevelBase = (level - 1) * 1000;
  const xpIntoLevel = xp - nextLevelBase;
  const levelPercent = Math.max(0, Math.min(100, (xpIntoLevel / 1000) * 100));
  const itemCount =
    progress?.inventory.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  const certificateCount = progress?.certificates.length ?? 0;
  const trophyCount =
    progress?.inventory.items.filter(
      (item) =>
        item.id.includes("badge") ||
        item.id.includes("hunter") ||
        item.id.includes("protector") ||
        item.id.includes("keeper"),
    ).length ?? 0;

  return (
    <div className="game-viewport hq-viewport fixed inset-0 bg-background font-sans text-slate-100">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !(event.target instanceof HTMLCanvasElement)) return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (dragging.current) inputManager.setCameraLook(event.movementX, event.movementY);
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
            camera={{ position: [0, 2.5, 4.5], fov: 58 }}
          >
            <HomeHqScene
              playerColor={playerColor}
              playerLabel={playerLabel}
              guardianId={chosen?.id ?? "lex"}
              inputManager={inputManager}
              level={level}
              xp={xp}
              trophyCount={trophyCount}
              certificateCount={certificateCount}
              itemCount={itemCount}
            />
          </Canvas>
        </GameErrorBoundary>
      </div>

      <div className="absolute top-4 left-4 z-40">
        <Link to="/isla">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-950/80 text-white hover:bg-slate-800 font-bold"
          >
            <ArrowLeft className="size-4 mr-1" /> Isla Central
          </Button>
        </Link>
      </div>

      <div className="absolute bottom-6 left-6 z-40 w-96 rounded-3xl border border-amber-500/40 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-amber-950 border border-amber-500/50 text-amber-400 font-black text-lg">
              L{level}
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {guardianName || (es ? "Guardián" : "Guardian")}
              </h3>
              <p className="text-xs font-bold text-amber-400">
                {es ? "Rango basado en progreso real" : "Rank based on real progress"}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-950 border border-amber-500/40 px-3 py-1 text-xs font-black text-amber-300">
            {xp} XP
          </span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-extrabold text-slate-300">
            <span>{es ? "Progreso de nivel" : "Level Progress"}</span>
            <span>{xpIntoLevel} / 1000 XP</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full shadow-lg"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col items-center rounded-xl bg-slate-900/80 p-2 border border-slate-800 text-center">
            <Trophy className="size-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-black text-slate-200">
              {trophyCount} {es ? "trofeos" : "trophies"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-slate-900/80 p-2 border border-slate-800 text-center">
            <Award className="size-5 text-cyan-400 mb-1" />
            <span className="text-[10px] font-black text-slate-200">
              {certificateCount} {es ? "certificados" : "certificates"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-slate-900/80 p-2 border border-slate-800 text-center">
            <Package className="size-5 text-emerald-400 mb-1" />
            <span className="text-[10px] font-black text-slate-200">
              {itemCount} {es ? "objetos" : "items"}
            </span>
          </div>
        </div>
      </div>

      <div className="mobile-game-controls pointer-events-none fixed inset-0 z-40">
        <div className="game-left pointer-events-auto">
          <AnalogJoystick target={inputManager.joystick} />
        </div>
        <div className="game-right pointer-events-auto">
          <LookPad target={inputManager} />
        </div>
      </div>
      <WorldLoading />
      <GameSettings />
      <PauseMenu />
    </div>
  );
}
