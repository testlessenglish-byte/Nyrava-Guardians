import { Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  LockKeyhole,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  FOUNDATION_CERTIFICATE,
  FOUNDATION_MISSIONS,
  missions,
} from "@/domain/progression/catalog";
import { certificateProgress, missionUnlocked } from "@/domain/progression/engine";
import type { PlayerProgress } from "@/domain/progression/types";
import { getProgression } from "@/lib/progression.functions";
import { useGuardian } from "@/lib/guardian-context";
import { CLASSROOM_ROOMS, selectClassroom, type ClassroomRoomId } from "@/lib/classroom-selection";

const localized = (value: { en: string; es: string }, es: boolean) => (es ? value.es : value.en);

export function AcademyCourseDashboard() {
  const { locale } = useGuardian();
  const es = locale.startsWith("es");
  const [progress, setProgress] = useState<PlayerProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProgression()
      .then((value) => {
        if (!cancelled) setProgress(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const completed = useMemo(
    () => FOUNDATION_MISSIONS.filter((id) => progress?.missions[id]?.completedAt).length,
    [progress],
  );
  const percent = progress ? certificateProgress(progress) : 0;
  const earned = Boolean(
    progress?.certificates.some((item) => item.course === FOUNDATION_CERTIFICATE.id),
  );

  const enterClass = (missionId?: string, room: ClassroomRoomId = "security") => {
    if (typeof window === "undefined") return;
    const selected =
      missionId ??
      missions.find((mission) =>
        progress
          ? missionUnlocked(progress, mission.id) && !progress.missions[mission.id]?.completedAt
          : mission.id === missions[0]!.id,
      )?.id ??
      missions[0]!.id;
    selectClassroom(room);
    window.sessionStorage.setItem("nyrava-selected-mission", selected);
  };

  return (
    <div className="space-y-7 pb-10 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/25 bg-[#061120] p-6 shadow-[0_28px_100px_rgba(6,182,212,0.15)] sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,.18),transparent_28%),radial-gradient(circle_at_85%_30%,rgba(139,92,246,.17),transparent_30%)]" />
        <div className="relative grid gap-7 lg:grid-cols-[1.25fr_.75fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-950/40 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" /> {es ? "Academia Guardián" : "Guardian Academy"}
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              {es ? "Elige tu salón. Entra. Aprende." : "Choose your classroom. Enter. Learn."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {es
                ? "Selecciona el salón antes de entrar. Dentro del salón no hay menús flotantes para cambiar de laboratorio: exploras el espacio que elegiste."
                : "Choose your room before you enter. Inside the classroom there is no floating room-switch menu; you explore the room you selected."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-300" /> {completed}/3{" "}
                {es ? "clases de seguridad aprobadas" : "safety classes passed"}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
              {es ? "Certificado de ruta" : "Path certificate"}
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {localized(FOUNDATION_CERTIFICATE.name, es)}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {es ? "Phishing · Contraseñas · Privacidad" : "Phishing · Passwords · Privacy"}
            </p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs font-bold text-slate-300">
              <span>{percent}%</span>
              <span>
                {earned ? (es ? "OBTENIDO" : "EARNED") : es ? "EN PROGRESO" : "IN PROGRESS"}
              </span>
            </div>
            {earned && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 text-sm font-black text-amber-200">
                <Award className="h-5 w-5" />{" "}
                {es
                  ? "Certificado disponible en tu Viaje Guardián"
                  : "Certificate available in Guardian Journey"}
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
          {es ? "Salones" : "Classrooms"}
        </p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl">
          {es ? "¿Dónde quieres entrenar?" : "Where do you want to train?"}
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {CLASSROOM_ROOMS.map((room) => (
            <article
              key={room.id}
              className="rounded-3xl border border-white/10 bg-[#091426] p-5 shadow-xl"
            >
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">
                {room.guardian}
              </p>
              <h3 className="mt-1 text-xl font-black">{room.title}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{room.description}</p>
              <Link
                to="/classroom"
                onClick={() => enterClass(undefined, room.id)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-xs font-black text-slate-950 hover:bg-white"
              >
                <Play className="h-4 w-4 fill-current" /> {es ? "ENTRAR" : "ENTER ROOM"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
          {es ? "Ruta 01" : "Path 01"}
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-black sm:text-3xl">
            {localized(FOUNDATION_CERTIFICATE.name, es)}
          </h2>
          <span className="text-xs font-bold text-slate-400">
            {es ? "75% mínimo para aprobar cada evaluación" : "75% minimum on each assessment"}
          </span>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {missions.map((mission, index) => {
            const unlocked = progress ? missionUnlocked(progress, mission.id) : index === 0;
            const state = progress?.missions[mission.id];
            const done = Boolean(state?.completedAt);
            const accent = index === 0 ? "#22d3ee" : index === 1 ? "#8b5cf6" : "#10b981";
            return (
              <article
                key={mission.id}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#091426] p-5 shadow-xl"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: `linear-gradient(90deg,transparent,${accent},transparent)` }}
                />
                <div className="flex items-start justify-between">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-2xl border text-lg font-black"
                    style={{ borderColor: `${accent}66`, background: `${accent}18`, color: accent }}
                  >
                    {index + 1}
                  </div>
                  {done ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                  ) : unlocked ? (
                    <Play className="h-6 w-6" style={{ color: accent }} />
                  ) : (
                    <LockKeyhole className="h-6 w-6 text-slate-600" />
                  )}
                </div>
                <p
                  className="mt-5 text-xs font-black uppercase tracking-[0.2em]"
                  style={{ color: accent }}
                >
                  {es ? "Clase" : "Class"} {index + 1}
                </p>
                <h3 className="mt-1 text-xl font-black">{localized(mission.title, es)}</h3>
                <p className="mt-2 min-h-14 text-sm leading-6 text-slate-400">
                  {localized(mission.summary, es)}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-300">
                  <span className="rounded-xl bg-white/5 p-2">
                    4 {es ? "lecciones" : "lessons"}
                  </span>
                  <span className="rounded-xl bg-white/5 p-2">
                    4 {es ? "preguntas" : "questions"}
                  </span>
                  <span className="rounded-xl bg-white/5 p-2">+{mission.xp} XP</span>
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-400">
                    {done
                      ? `${es ? "Mejor" : "Best"}: ${state?.bestScore ?? 0}%`
                      : unlocked
                        ? es
                          ? "Disponible"
                          : "Available"
                        : es
                          ? "Bloqueada"
                          : "Locked"}
                  </span>
                  {unlocked && (
                    <Link
                      to="/classroom"
                      onClick={() => enterClass(mission.id, "security")}
                      className="inline-flex items-center gap-1 text-xs font-black"
                      style={{ color: accent }}
                    >
                      {done ? (es ? "REPETIR" : "REPLAY") : es ? "EMPEZAR" : "START"}{" "}
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
