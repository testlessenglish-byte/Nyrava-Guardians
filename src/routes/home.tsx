import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, GraduationCap, Map, Play, ShieldCheck, Swords } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { GUARDIAN_IMAGES, resolveGuardian, resolveGuardianId } from "@/data/guardians";
import { missions, FOUNDATION_CERTIFICATE } from "@/domain/progression/catalog";
import { certificateProgress, missionUnlocked } from "@/domain/progression/engine";
import type { PlayerProgress } from "@/domain/progression/types";
import { useGuardian } from "@/lib/guardian-context";
import { GUARDIAN_STYLES } from "@/lib/guardian-colors";
import { getProgression } from "@/lib/progression.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Guardian Home — Nyrava Guardians" },
      {
        name: "description",
        content:
          "Continue your real Nyrava learning path, enter the Academy, explore Isla Central, or deploy to missions.",
      },
    ],
  }),
  component: HomePage,
});

const QUICK_LINKS = [
  { to: "/isla", label: "Enter Isla Central", icon: Map, blurb: "Explore the 3D world" },
  {
    to: "/academy",
    label: "Choose a Classroom",
    icon: GraduationCap,
    blurb: "Pick your room before entering",
  },
  { to: "/missions", label: "Mission Hub", icon: Swords, blurb: "Apply what you learned" },
  { to: "/builder", label: "AI Builder", icon: Bot, blurb: "Create and experiment" },
] as const;

function levelFromXp(xp: number) {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

function HomePage() {
  const { guardianId, guardianName, xp, locale } = useGuardian();
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const es = locale.startsWith("es");

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

  const activeId = resolveGuardianId(guardianId);
  const guardian = resolveGuardian(activeId);
  const styles = GUARDIAN_STYLES[activeId];
  const level = levelFromXp(xp);
  const intoLevel = xp % 250;
  const certificatePercent = progress ? certificateProgress(progress) : 0;
  const earned = Boolean(
    progress?.certificates.some((item) => item.course === FOUNDATION_CERTIFICATE.id),
  );
  const completedClasses = useMemo(
    () => missions.filter((mission) => Boolean(progress?.missions[mission.id]?.completedAt)).length,
    [progress],
  );
  const nextMission = useMemo(() => {
    if (!progress) return missions[0]!;
    return (
      missions.find(
        (mission) =>
          missionUnlocked(progress, mission.id) && !progress.missions[mission.id]?.completedAt,
      ) ?? missions[missions.length - 1]!
    );
  }, [progress]);

  const prepareNextClass = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("nyrava-selected-classroom", "security");
    window.sessionStorage.setItem("nyrava-selected-mission", nextMission.id);
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="panel overflow-hidden p-5 sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div
            className={cn("h-28 w-28 overflow-hidden rounded-3xl border", styles.bg, styles.border)}
          >
            <img
              src={GUARDIAN_IMAGES[activeId]}
              alt={guardian.name}
              className="h-full w-full object-cover object-top"
            />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
              {es ? "Tu Guardián" : "Your Guardian"}
            </p>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">
              {guardianName || (es ? "Guardián" : "Guardian")}
            </h1>
            <p className={cn("mt-1 text-sm font-bold", styles.text)}>
              {guardian.name} · {guardian.role}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
              <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-primary">
                {es ? "Nivel" : "Level"} {level}
              </span>
              <span>{xp.toLocaleString()} XP</span>
              <span>
                {completedClasses}/{missions.length} {es ? "clases aprobadas" : "classes passed"}
              </span>
            </div>
            <div className="mt-3 max-w-xl">
              <ProgressBar value={(intoLevel / 250) * 100} />
              <p className="mt-1.5 text-[11px] font-bold text-muted-foreground">
                {250 - intoLevel} XP {es ? "para el siguiente nivel" : "to the next level"}
              </p>
            </div>
          </div>
          <Link
            to="/isla"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-lg transition hover:brightness-110"
          >
            <Play className="h-4 w-4 fill-current" />{" "}
            {es ? "CONTINUAR AVENTURA" : "CONTINUE ADVENTURE"}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="panel p-5 sm:p-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-primary">
            {es ? "Siguiente clase real" : "Next real class"}
          </p>
          <h2 className="mt-2 text-2xl font-black">
            {es ? nextMission.title.es : nextMission.title.en}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {es ? nextMission.summary.es : nextMission.summary.en}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/classroom"
              onClick={prepareNextClass}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-white"
            >
              <GraduationCap className="h-4 w-4" /> {es ? "ENTRAR A LA CLASE" : "ENTER CLASS"}
            </Link>
            <Link
              to="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-black hover:border-primary"
            >
              {es ? "ELEGIR OTRO SALÓN" : "CHOOSE ANOTHER ROOM"}
            </Link>
          </div>
        </div>

        <div className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">
              {es ? "Certificado" : "Certificate"}
            </span>
          </div>
          <h2 className="mt-2 text-lg font-black">
            {es ? FOUNDATION_CERTIFICATE.name.es : FOUNDATION_CERTIFICATE.name.en}
          </h2>
          <div className="mt-4">
            <ProgressBar value={certificatePercent} />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-muted-foreground">
            <span>{certificatePercent}%</span>
            <span>
              {earned ? (es ? "OBTENIDO" : "EARNED") : es ? "EN PROGRESO" : "IN PROGRESS"}
            </span>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            {es
              ? "El certificado solo se obtiene al aprobar las tres evaluaciones de seguridad digital."
              : "The certificate is earned only after passing all three digital-safety assessments."}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
          {es ? "¿Qué quieres hacer?" : "What do you want to do?"}
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {QUICK_LINKS.map(({ to, label, icon: Icon, blurb }) => (
            <Link
              key={to}
              to={to}
              className="panel group p-4 transition hover:-translate-y-1 hover:border-primary/60"
            >
              <Icon className="h-6 w-6 text-primary transition group-hover:scale-110" />
              <p className="mt-3 text-sm font-extrabold">{label}</p>
              <p className="text-[11px] leading-5 text-muted-foreground">{blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
