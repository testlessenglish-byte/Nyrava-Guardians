import { useEffect, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { controls, useClassState } from "@/lib/class-store";
import { useGuardian } from "@/lib/guardian-context";
import { FOUNDATION_CERTIFICATE, missions } from "@/domain/progression/catalog";
import { levelFor } from "@/domain/progression/engine";
import type { PlayerProgress } from "@/domain/progression/types";
import { getProgression } from "@/lib/progression.functions";
import type { ClassroomRoom } from "./classroom-scene";

function selectedMissionId() {
  if (typeof window === "undefined") return missions[0]!.id;
  return window.sessionStorage.getItem("nyrava-selected-mission") ?? missions[0]!.id;
}

const ROOM_TEACHERS: Record<ClassroomRoom, string> = {
  security: "sarah",
  builder: "jacob",
  communication: "dayana",
  truth: "nova",
};

export function ClassHud({
  room = "security",
  activeInteraction,
  activeSeatId,
}: {
  room?: ClassroomRoom;
  activeInteraction?: {
    type: string;
    label: { en: string; es: string };
    action: () => void;
  } | null;
  activeSeatId?: string | null;
}) {
  const { messages } = useClassState();
  const [hasMoved, setHasMoved] = useState(false);
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const { guardianName, guardianId, locale } = useGuardian();
  const es = locale.startsWith("es");
  const learnerName = guardianName || "Guardian";
  const currentGuardian = CLASS_GUARDIANS.find((g) => g.id === guardianId) ?? CLASS_GUARDIANS[0]!;
  const teacher = CLASS_GUARDIANS.find((g) => g.id === ROOM_TEACHERS[room]) ?? CLASS_GUARDIANS[0]!;
  const activeLesson =
    missions.find((mission) => mission.id === selectedMissionId()) ?? missions[0]!;
  const missionData = progress?.missions[activeLesson.id];
  const isLessonDone = Boolean(missionData?.completedAt);
  const isQuizDone = (missionData?.bestScore ?? 0) >= 75;
  const isPassed = isQuizDone;
  const isCertEarned = Boolean(
    progress?.certificates.some((certificate) => certificate.course === FOUNDATION_CERTIFICATE.id),
  );
  const completedStepsCount =
    (isLessonDone ? 1 : 0) + (isQuizDone ? 1 : 0) + (isPassed ? 1 : 0) + (isCertEarned ? 1 : 0);

  useEffect(() => {
    getProgression()
      .then(setProgress)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (controls.keys.size > 0 || Math.hypot(controls.joystick.x, controls.joystick.y) > 0.1)
        setHasMoved(true);
    }, 200);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="class-hud pointer-events-none fixed inset-0 z-20 font-sans">
      {/* Top Left Course Overview - Scaled for small/mobile viewports */}
      <div className="pointer-events-auto absolute left-3 top-3 w-52 space-y-1.5 sm:left-5 sm:top-5 sm:w-64 sm:space-y-2">
        <div className="rounded-xl border border-slate-700/60 bg-slate-950/85 px-2.5 py-1.5 shadow-xl backdrop-blur-md sm:rounded-2xl sm:px-3 sm:py-2">
          <h1 className="text-[10px] font-black uppercase tracking-wider text-white sm:text-xs">
            {es ? "AULA DE LA ACADEMIA" : "ACADEMY CLASSROOM"}
          </h1>
          <p className="text-[8px] font-bold tracking-[0.12em] text-slate-400 sm:text-[9px] sm:tracking-[0.15em]">
            {teacher.name} · {teacher.role}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 p-2.5 text-white shadow-xl backdrop-blur-xl sm:rounded-2xl sm:p-3">
          <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 sm:text-[9px] sm:tracking-[0.18em]">
            {es ? "CLASE ACTUAL" : "CURRENT CLASS"}
          </p>
          <h3 className="mt-0.5 text-xs font-black tracking-tight text-white sm:text-sm">
            {es ? activeLesson.title.es : activeLesson.title.en}
          </h3>
          <div className="mt-2 flex items-center justify-between text-xs font-black">
            <span className="text-[10px] text-amber-400 sm:text-[11px]">
              ★ {es ? "Progreso" : "Progress"}
            </span>
            <span className="text-[10px] text-cyan-300 sm:text-[11px]">
              {completedStepsCount} / 4
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800 sm:h-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-400"
              style={{ width: `${(completedStepsCount / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Right User Profile Badge */}
      <div className="pointer-events-auto absolute right-3 top-3 flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/90 p-1.5 pr-3 shadow-2xl backdrop-blur-md sm:right-5 sm:top-5 sm:gap-3 sm:rounded-2xl sm:p-2 sm:pr-4">
        <div
          className="grid size-9 place-items-center rounded-lg text-sm font-black text-slate-950 shadow-md sm:size-11 sm:rounded-xl sm:text-base"
          style={{ background: currentGuardian.color }}
        >
          {learnerName.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className="text-xs font-black text-white sm:text-sm">{learnerName}</span>
          <p className="text-[9px] font-bold text-cyan-300 sm:text-[11px]">
            {es ? "Guardián" : "Guardian"} · {progress ? `Lvl ${levelFor(progress.xp)}` : "…"}
          </p>
          <p className="text-[9px] font-black text-amber-400 sm:text-[10px]">
            ★ {progress?.xp ?? 0} XP
          </p>
        </div>
      </div>

      {/* Interactive Action Prompt (Center-Bottom) */}
      {activeInteraction && (
        <div className="pointer-events-auto absolute left-1/2 bottom-20 z-30 -translate-x-1/2 sm:bottom-28">
          <button
            type="button"
            onClick={activeInteraction.action}
            className="rounded-full border border-cyan-400/60 bg-slate-950/95 px-5 py-2 text-[11px] font-black uppercase tracking-wider text-cyan-200 shadow-2xl backdrop-blur-xl hover:bg-cyan-950 sm:px-6 sm:py-2.5 sm:text-xs"
          >
            {es ? activeInteraction.label.es : activeInteraction.label.en}
          </button>
        </div>
      )}

      {/* Keyboard Helper (Desktop Only - Hidden on Touch/Mobile Viewports) */}
      {!hasMoved && !activeSeatId && (
        <div className="pointer-events-auto absolute bottom-6 left-6 hidden rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-md md:block">
          <div className="flex items-center gap-5 text-center">
            <div>
              <div className="grid grid-cols-3 gap-1 font-mono text-xs font-bold text-white">
                <div />
                <span className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700">W</span>
                <div />
                <span className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700">A</span>
                <span className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700">S</span>
                <span className="rounded-md bg-slate-800 px-2 py-1 border border-slate-700">D</span>
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {es ? "Mover" : "Move"}
              </p>
            </div>
            <div className="h-12 w-px bg-slate-800" />
            <div>
              <div className="grid h-12 w-9 place-items-center rounded-md border border-slate-700 bg-slate-800 text-sm text-white">
                🖱️
              </div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {es ? "Mirar" : "Look"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right Guardian Dialogue Card */}
      <div className="pointer-events-auto absolute bottom-4 right-3 flex w-[calc(100vw-1.5rem)] max-w-xs flex-col gap-2 rounded-2xl border border-slate-700/60 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:right-6 sm:w-[min(92vw,24rem)] sm:gap-3 sm:rounded-3xl sm:p-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className="grid size-7 place-items-center rounded-lg text-xs font-black text-slate-950 sm:size-9 sm:rounded-xl sm:text-sm"
            style={{ background: teacher.color }}
          >
            {teacher.name.charAt(0)}
          </div>
          <div>
            <span className="block text-xs font-extrabold text-white">{teacher.name}</span>
            <span className="block text-[9px] font-bold text-cyan-300 sm:text-[10px]">
              {es ? "Guía Guardián" : "Guardian Guide"}
            </span>
          </div>
        </div>
        <div className="max-h-32 space-y-1.5 overflow-y-auto pr-1 text-[11px] sm:max-h-40 sm:space-y-2 sm:text-xs">
          {messages.length === 0 && (
            <p className="rounded-xl bg-slate-900/90 p-2.5 text-slate-200 leading-relaxed border border-slate-800 sm:rounded-2xl sm:p-3">
              {es
                ? "Acércate a Sarah y presiona E cuando estés listo."
                : "Walk up to Sarah and press E when you are ready to start."}
            </p>
          )}
          {messages.map((message) => (
            <p
              key={message.id}
              className={
                message.from === "you" ? "text-right text-cyan-300 font-semibold" : "text-slate-300"
              }
            >
              <span className="font-bold text-white">{message.name}: </span>
              {message.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
