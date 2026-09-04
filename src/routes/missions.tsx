import { createFileRoute, Link } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import { Award, ArrowLeft, ArrowRight, Calendar, CheckCircle2, Target, X } from "lucide-react";
import { MissionHubScene } from "@/components/missions/mission-hub-scene";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { useGuardian } from "@/lib/guardian-context";
import { Button } from "@/components/ui/button";
import { missions as domainMissions } from "@/domain/progression/catalog";
import {
  advancePhishingStory,
  getPhishingStoryStep,
  setPhishingStoryStep,
} from "@/lib/phishing-story-state";
import { GameErrorBoundary, GameSettings, WorldLoading } from "@/components/game/game-feedback";
import { QUALITY, useQuality } from "@/services/game/quality";
import { useAppActive } from "@/services/platform/lifecycle";
import { InputManager } from "@/components/game/core/input-manager";
import { AnalogJoystick, LookPad } from "@/components/game/touch-controls";
import { PauseMenu } from "@/components/game/pause-menu";

export const Route = createFileRoute("/missions")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Mission Hub — Nyrava Guardians" },
      { name: "description", content: "Walkable Guardian mission command room." },
    ],
  }),
  component: MissionHubPage,
});

function selectMission(missionId: string) {
  if (typeof window !== "undefined")
    window.sessionStorage.setItem("nyrava-selected-mission", missionId);
}

function MissionHubPage() {
  const quality = QUALITY[useQuality()];
  const active = useAppActive();
  const dragging = useRef(false);
  const { guardianId, guardianName, locale } = useGuardian();
  const es = locale.startsWith("es");
  const chosen = CLASS_GUARDIANS.find((guardian) => guardian.id === guardianId);
  const playerColor = chosen?.color ?? "#f4f7ff";
  const playerLabel = guardianName || (es ? "Tú" : "You");
  const inputManager = useMemo(() => new InputManager(), []);
  const [boardOpen, setBoardOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"story" | "daily" | "weekly">("story");

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

  const setBoardState = (open: boolean) => {
    inputManager.setEnabled(!open);
    if (!open) inputManager.reset();
    setBoardOpen(open);
  };

  const openMissionBoardWithSarah = () => {
    const step = getPhishingStoryStep();
    if (step === "GOTO_MISSION_HUB") advancePhishingStory("GOTO_MISSION_HUB", "TALK_SARAH");
    if (step === "RETURN_SARAH") advancePhishingStory("RETURN_SARAH", "MISSION_COMPLETED");
    setBoardState(true);
  };

  const acceptPhishingMission = () => {
    selectMission("phishing-defense");
    const current = getPhishingStoryStep();
    if (
      current === "SPAWN_ISLA" ||
      current === "GOTO_MISSION_HUB" ||
      current === "TALK_SARAH" ||
      current === "MISSION_COMPLETED"
    ) {
      setPhishingStoryStep("TRAVEL_DIGITAL_CITY");
    }
  };

  return (
    <div className="game-viewport fixed inset-0 bg-[#040916] text-slate-100 font-sans">
      <div
        className="absolute inset-0 touch-none"
        onPointerDown={(event) => {
          if (boardOpen) return;
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
          if (dragging.current && !boardOpen)
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
            camera={{ position: [0, 3.1, 10.2], fov: 54 }}
          >
            <Suspense fallback={null}>
              <MissionHubScene
                playerColor={playerColor}
                playerLabel={playerLabel}
                guardianId={chosen?.id ?? guardianId ?? "lex"}
                inputManager={inputManager}
                blocked={boardOpen}
                onOpenBoard={openMissionBoardWithSarah}
              />
            </Suspense>
          </Canvas>
        </GameErrorBoundary>
      </div>

      <div className="absolute left-4 top-4 z-40">
        <Link to="/isla">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-950/85 text-white font-bold"
          >
            <ArrowLeft className="size-4 mr-1" /> Isla Central
          </Button>
        </Link>
      </div>

      {!boardOpen && (
        <>
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border border-cyan-400/30 bg-slate-950/80 px-4 py-2 text-[11px] font-bold text-slate-300 backdrop-blur">
            {es
              ? "WASD para moverte · arrastra para mirar · habla con Sarah"
              : "WASD to move · drag to look · talk to Sarah"}
          </div>
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
        </>
      )}

      {boardOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-5 md:p-8 backdrop-blur-xl">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
                  NYRAVA GUARDIANS
                </p>
                <h1 className="mt-1 text-3xl font-black text-white">
                  {es ? "Tablero de Misiones" : "Mission Board"}
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Sarah · {es ? "Especialista de Seguridad" : "Security Specialist"}
                </p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setBoardState(false)}
                className="border-slate-700 bg-slate-900 text-white"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 border-b border-slate-800 pb-4">
              {[
                { id: "story", label: es ? "Misiones" : "Story Missions", icon: Target },
                { id: "daily", label: es ? "Retos diarios" : "Daily Challenges", icon: Calendar },
                { id: "weekly", label: es ? "Operaciones semanales" : "Weekly Ops", icon: Award },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
                    className={
                      "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition " +
                      (selectedTab === tab.id
                        ? "bg-cyan-500 text-slate-950"
                        : "bg-slate-900 text-slate-400 hover:text-white")
                    }
                  >
                    <Icon className="size-4" /> {tab.label}
                  </button>
                );
              })}
            </div>
            {selectedTab === "story" && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {domainMissions.map((mission, index) => {
                  const phishing = mission.id === "phishing-defense";
                  const destination = phishing ? "/city" : "/classroom";
                  return (
                    <article
                      key={mission.id}
                      className="flex flex-col rounded-3xl border border-cyan-500/30 bg-slate-900/70 p-5 shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-cyan-950 px-3 py-1 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
                          {es ? "MISIÓN" : "MISSION"} {index + 1}
                        </span>
                        <span className="text-xs font-black text-amber-400">+{mission.xp} XP</span>
                      </div>
                      <h2 className="mt-4 text-xl font-black text-white">
                        {es ? mission.title.es : mission.title.en}
                      </h2>
                      <p className="mt-2 flex-1 text-xs leading-5 text-slate-300">
                        {es ? mission.summary.es : mission.summary.en}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                        <CheckCircle2 className="size-4 text-emerald-400" /> {mission.badgeId} ·{" "}
                        {mission.credits} Credits
                      </div>
                      <Link
                        to={destination}
                        className="mt-5"
                        onClick={() =>
                          phishing ? acceptPhishingMission() : selectMission(mission.id)
                        }
                      >
                        <Button className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black">
                          {phishing
                            ? es
                              ? "Desplegar a Ciudad Digital"
                              : "Deploy to Digital City"
                            : es
                              ? "Ir a entrenamiento"
                              : "Go to Training"}{" "}
                          <ArrowRight className="size-4 ml-1" />
                        </Button>
                      </Link>
                    </article>
                  );
                })}
              </div>
            )}
            {selectedTab === "daily" && (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <Calendar className="mx-auto size-10 text-cyan-400" />
                <h3 className="mt-3 text-lg font-black text-white">
                  {es ? "Retos diarios en preparación" : "Daily Challenges In Preparation"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {es
                    ? "Se activarán cuando estén conectados al progreso real."
                    : "They will activate when connected to real progression."}
                </p>
              </div>
            )}
            {selectedTab === "weekly" && (
              <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center">
                <Award className="mx-auto size-10 text-amber-400" />
                <h3 className="mt-3 text-lg font-black text-white">
                  {es ? "Operaciones semanales bloqueadas" : "Weekly Operations Locked"}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {es
                    ? "Se habilitarán cuando exista una operación real."
                    : "They will unlock when a real operation is available."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <WorldLoading />
      <GameSettings />
      <PauseMenu />
    </div>
  );
}
