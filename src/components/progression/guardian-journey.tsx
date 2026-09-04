import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { X, Shield, LockKeyhole, Trophy, Backpack, Hammer, Map, CheckCircle2 } from "lucide-react";
import { missions, paths, shields, type PublicMission } from "@/domain/progression/catalog";
import {
  certificateProgress,
  levelFor,
  missionUnlocked,
  shieldOwned,
  shieldRequirement,
} from "@/domain/progression/engine";
import type { PlayerProgress, ProgressionResult } from "@/domain/progression/types";
import {
  beginProgressionMission,
  buildHomeObject,
  equipProgressionShield,
  getProgression,
  submitProgressionAssessment,
} from "@/lib/progression.functions";
import { useGuardian } from "@/lib/guardian-context";

type Tab = "journey" | "shields" | "inventory" | "certificates" | "home";
const text = (value: { en: string; es: string }, es: boolean) => (es ? value.es : value.en);

export function GuardianJourney() {
  const { locale } = useGuardian();
  const es = locale.startsWith("es");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("journey");
  const [progress, setProgress] = useState<PlayerProgress | null>(null);
  const [selected, setSelected] = useState("phishing-defense");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProgressionResult | null>(null);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("nyrava-open-journey", show);
    return () => window.removeEventListener("nyrava-open-journey", show);
  }, []);
  useEffect(() => {
    if (!open || progress) return;
    setBusy(true);
    getProgression()
      .then(setProgress)
      .catch(() =>
        setError(
          es ? "El servicio de progreso no está disponible." : "Progress service is unavailable.",
        ),
      )
      .finally(() => setBusy(false));
  }, [open, progress, es]);
  const mission = missions.find((item) => item.id === selected)!;
  const equipped = progress?.inventory.items.find(
    (item) => item.equipped && item.id.endsWith("-shield"),
  )?.id;
  const completed = progress
    ? Object.values(progress.missions).filter((item) => item.completedAt).length
    : 0;
  const level = levelFor(progress?.xp ?? 0);
  const title = es ? "Viaje Guardián" : "Guardian Journey";
  async function start() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const next = await beginProgressionMission({ data: { missionId: mission.id } });
      setProgress(next.progress);
      setAttemptId(next.attemptId);
      setAnswers([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to start");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!attemptId || answers.length !== mission.questions.length) return;
    setBusy(true);
    setError(null);
    try {
      const next = await submitProgressionAssessment({ data: { attemptId, answers } });
      setProgress(next.progress);
      setResult(next);
      setAttemptId(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to submit");
    } finally {
      setBusy(false);
    }
  }
  if (!open) return null;
  const nav: Array<[Tab, string, React.ReactNode]> = [
    ["journey", es ? "Ruta" : "Journey", <Map />],
    ["shields", es ? "Escudos" : "Shields", <Shield />],
    ["inventory", es ? "Inventario" : "Inventory", <Backpack />],
    ["certificates", es ? "Certificados" : "Certificates", <Trophy />],
    ["home", es ? "Crear" : "Create", <Hammer />],
  ];
  return (
    <div className="pointer-events-auto fixed inset-0 z-[200] bg-slate-950/90 p-2 backdrop-blur-md sm:p-5">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-cyan-400/40 bg-[#071426] shadow-[0_0_50px_#0891b244]"
      >
        <header className="flex items-center gap-3 border-b border-cyan-400/20 px-4 py-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-700 text-2xl font-black text-amber-300">
            N
          </div>
          <div>
            <h2 className="text-lg font-black text-white sm:text-2xl">{title}</h2>
            <p className="text-xs text-cyan-200">
              {es
                ? `Nivel ${level} · ${progress?.xp ?? 0} XP · ${progress?.credits ?? 0} créditos`
                : `Level ${level} · ${progress?.xp ?? 0} XP · ${progress?.credits ?? 0} credits`}
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="ml-auto rounded-full border border-white/20 p-2 text-white"
          >
            <X />
          </button>
        </header>
        <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex min-w-fit items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold ${tab === id ? "bg-cyan-500 text-slate-950" : "bg-white/5 text-slate-200"}`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 text-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:p-5">
          {busy && !progress ? (
            <p>{es ? "Cargando…" : "Loading…"}</p>
          ) : error && !progress ? (
            <p className="rounded-xl bg-red-950 p-4 text-red-200">{error}</p>
          ) : (
            progress && (
              <>
                {tab === "journey" && (
                  <div className="grid gap-4 lg:grid-cols-[1fr_1.15fr]">
                    <section>
                      <h3 className="mb-3 text-xl font-black">{text(paths[0]!.name, es)}</h3>
                      <div className="space-y-2">
                        {missions.map((item) => {
                          const unlocked = missionUnlocked(progress, item.id);
                          const done = !!progress.missions[item.id]?.completedAt;
                          return (
                            <button
                              key={item.id}
                              onClick={() => setSelected(item.id)}
                              className={`w-full rounded-2xl border p-4 text-left ${selected === item.id ? "border-cyan-400 bg-cyan-950/70" : "border-white/10 bg-white/5"}`}
                            >
                              <div className="flex items-center gap-2 font-black">
                                {done ? (
                                  <CheckCircle2 className="text-emerald-400" />
                                ) : unlocked ? (
                                  <Shield className="text-cyan-300" />
                                ) : (
                                  <LockKeyhole />
                                )}{" "}
                                {text(item.title, es)}
                              </div>
                              <p className="mt-1 text-xs text-slate-300">
                                {done
                                  ? es
                                    ? "Completado"
                                    : "Completed"
                                  : unlocked
                                    ? item.playable
                                      ? es
                                        ? "Disponible"
                                        : "Available"
                                      : es
                                        ? "Se desbloquea después · próximamente"
                                        : "Unlocks next · coming soon"
                                    : es
                                      ? "Bloqueado"
                                      : "Locked"}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                    <MissionPanel
                      es={es}
                      mission={mission}
                      progress={progress}
                      attemptId={attemptId}
                      answers={answers}
                      setAnswers={setAnswers}
                      start={start}
                      submit={submit}
                      busy={busy}
                      result={result}
                      error={error}
                    />
                  </div>
                )}
                {tab === "shields" && (
                  <div>
                    <h3 className="mb-1 text-xl font-black">
                      {es ? "Los 7 escudos" : "All 7 shields"}
                    </h3>
                    <p className="mb-4 text-sm text-cyan-200">
                      {es
                        ? "Mira exactamente lo que debes lograr antes de empezar."
                        : "See exactly what you must achieve before you start."}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {shields.map((item) => {
                        const owned = shieldOwned(progress, item.id);
                        const req = shieldRequirement(progress, item.id);
                        return (
                          <article
                            key={item.id}
                            className={`rounded-2xl border p-4 ${owned ? "border-amber-400/60 bg-amber-950/20" : "border-white/10 bg-white/5"}`}
                          >
                            <div className="mb-3 grid h-24 place-items-center rounded-xl bg-gradient-to-b from-blue-950 to-slate-950 text-5xl font-black text-amber-300">
                              N
                            </div>
                            <p className="text-xs font-bold text-cyan-300">
                              {es ? "NIVEL" : "TIER"} {item.tier}
                            </p>
                            <h4 className="font-black">{text(item.name, es)}</h4>
                            <p className="my-2 text-xs text-slate-300">
                              {text(item.requirement, es)}
                            </p>
                            <p className="text-xs font-bold">
                              {req.current}/{req.target} ·{" "}
                              {owned ? (es ? "Obtenido" : "Owned") : es ? "Bloqueado" : "Locked"}
                            </p>
                            {owned && equipped !== item.id && (
                              <button
                                onClick={async () => {
                                  setBusy(true);
                                  try {
                                    setProgress(
                                      await equipProgressionShield({ data: { shieldId: item.id } }),
                                    );
                                  } finally {
                                    setBusy(false);
                                  }
                                }}
                                className="mt-3 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-black text-slate-950"
                              >
                                {es ? "Equipar" : "Equip"}
                              </button>
                            )}
                            {equipped === item.id && (
                              <p className="mt-3 text-xs text-emerald-300">
                                ✓ {es ? "Equipado" : "Equipped"}
                              </p>
                            )}
                          </article>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-xs text-slate-400">
                      {es
                        ? "Visuales temporales con marca N; los modelos 3D finales están pendientes."
                        : "Temporary N-mark visuals; final optimized 3D models are pending."}
                    </p>
                  </div>
                )}
                {tab === "inventory" && (
                  <div>
                    <h3 className="text-xl font-black">
                      {es ? "Inventario de logros" : "Achievement inventory"}
                    </h3>
                    <p className="mb-4 text-sm text-slate-300">
                      {es
                        ? "Sin comercio, cajas de botín ni moneda pagada."
                        : "No trading, loot boxes, or paid currency."}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {progress.inventory.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <b>{item.id.replaceAll("-", " ")}</b>
                          <p className="text-xs text-slate-400">
                            {item.equipped
                              ? es
                                ? "Equipado"
                                : "Equipped"
                              : es
                                ? "Obtenido por progreso"
                                : "Earned through progress"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "certificates" && (
                  <div>
                    <h3 className="text-xl font-black">
                      {es ? "Certificado de Seguridad en Internet" : "Internet Safety Certificate"}
                    </h3>
                    <div className="mt-4 rounded-2xl border border-purple-400/30 bg-purple-950/20 p-5">
                      <p className="text-3xl font-black">{certificateProgress(progress)}%</p>
                      <p className="mt-2 text-sm">
                        {es
                          ? "Requiere las misiones fundamentales, dominio y un reto final. No se emite antes de cumplirlos."
                          : "Requires the foundation missions, mastery, and a capstone. It is not issued early."}
                      </p>
                      <p className="mt-4 text-xs text-slate-400">
                        {es
                          ? "Credencial educativa de Nyrava Guardians; no es acreditación gubernamental."
                          : "Nyrava Guardians educational credential; not government accreditation."}
                      </p>
                    </div>
                  </div>
                )}
                {tab === "home" && (
                  <HomePrototype es={es} progress={progress} setProgress={setProgress} />
                )}
              </>
            )
          )}
        </main>
      </section>
    </div>
  );
}

function MissionPanel({
  es,
  mission,
  progress,
  attemptId,
  answers,
  setAnswers,
  start,
  submit,
  busy,
  result,
  error,
}: {
  es: boolean;
  mission: PublicMission;
  progress: PlayerProgress;
  attemptId: string | null;
  answers: number[];
  setAnswers: Dispatch<SetStateAction<number[]>>;
  start: () => Promise<void>;
  submit: () => Promise<void>;
  busy: boolean;
  result: ProgressionResult | null;
  error: string | null;
}) {
  const done = !!progress.missions[mission.id]?.completedAt;
  const unlocked = missionUnlocked(progress, mission.id);
  return (
    <section className="rounded-3xl border border-cyan-400/30 bg-slate-950/60 p-4">
      <p className="text-xs font-black uppercase tracking-widest text-cyan-300">
        Sarah · {es ? "Especialista en seguridad" : "Security Specialist"}
      </p>
      <h3 className="mt-1 text-2xl font-black">{text(mission.title, es)}</h3>
      <p className="mt-2 text-sm text-slate-300">{text(mission.summary, es)}</p>
      <div className="my-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-cyan-950/50 p-3">
          <b>{es ? "Aprenderás" : "You will learn"}</b>
          <ul className="mt-2 list-disc pl-4 text-xs">
            {mission.lesson.map((line) => (
              <li key={line.en}>{text(line, es)}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-amber-950/40 p-3">
          <b>{es ? "Puedes ganar" : "You can earn"}</b>
          <p className="mt-2 text-xs">
            +500 XP · +150 {es ? "Créditos Guardián" : "Guardian Credits"}
            <br />
            {es
              ? "Insignia Cazador de Phishing · +15% certificado"
              : "Phishing Hunter badge · +15% certificate"}
          </p>
        </div>
      </div>
      {result && (
        <div
          className={`mb-4 rounded-xl p-4 ${result.score! >= 75 ? "bg-emerald-950 text-emerald-200" : "bg-amber-950 text-amber-200"}`}
        >
          <b>{result.score}%</b>
          <p>
            {result.grants.length
              ? es
                ? "¡Recompensa obtenida una sola vez!"
                : "One-time reward earned!"
              : result.score! >= 75
                ? es
                  ? "Práctica guardada; sin recompensas duplicadas."
                  : "Practice saved; no duplicate rewards."
                : es
                  ? "Repasa y vuelve a intentarlo."
                  : "Review and try again."}
          </p>
        </div>
      )}
      {!attemptId ? (
        <button
          disabled={busy || !unlocked || !mission.playable}
          onClick={start}
          className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-black text-slate-950 disabled:bg-slate-700 disabled:text-slate-400"
        >
          {done
            ? es
              ? "Practicar otra vez"
              : "Practice again"
            : mission.playable
              ? es
                ? "Iniciar misión"
                : "Start mission"
              : es
                ? "Próximamente"
                : "Coming soon"}
        </button>
      ) : (
        <div>
          <div className="mb-4 rounded-xl bg-blue-950/50 p-3 text-sm">
            <b>Sarah:</b>{" "}
            {es
              ? "Un buen Guardián pausa antes de hacer clic. Busca presión, revisa el remitente y protege tus secretos."
              : "A good Guardian pauses before clicking. Look for pressure, inspect the sender, and protect your secrets."}
          </div>
          {mission.questions.map((q, qi) => (
            <fieldset key={q.id} className="mb-4 rounded-xl border border-white/10 p-3">
              <legend className="px-1 text-sm font-bold">
                {qi + 1}. {text(q.prompt, es)}
              </legend>
              {q.options.map((option, oi) => (
                <label
                  key={option.en}
                  className="mt-2 flex cursor-pointer gap-2 rounded-lg bg-white/5 p-2 text-xs"
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[qi] === oi}
                    onChange={() => {
                      const next = [...answers];
                      next[qi] = oi;
                      setAnswers(next);
                    }}
                  />
                  {text(option, es)}
                </label>
              ))}
            </fieldset>
          ))}
          <button
            disabled={
              busy ||
              answers.filter((x: unknown) => x !== undefined).length !== mission.questions.length
            }
            onClick={submit}
            className="w-full rounded-xl bg-amber-400 px-4 py-3 font-black text-slate-950 disabled:opacity-40"
          >
            {es ? "Comprobar respuestas" : "Check answers"}
          </button>
        </div>
      )}
      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
    </section>
  );
}

function HomePrototype({
  es,
  progress,
  setProgress,
}: {
  es: boolean;
  progress: PlayerProgress;
  setProgress: (p: PlayerProgress) => void;
}) {
  const [object, setObject] = useState<"desk" | "lamp" | "plant">("desk");
  const [scale, setScale] = useState(1);
  return (
    <div>
      <h3 className="text-xl font-black">
        {es ? "Hogar Constructor · PROTOTIPO" : "Builder Home · PROTOTYPE"}
      </h3>
      <p className="my-3 text-sm text-slate-300">
        {es
          ? "Jacob te enseña colocación, tamaño y material con objetos aprobados. No es IA en vivo ni publicación pública."
          : "Jacob teaches placement, size, and material with approved objects. This is not live AI or public publishing."}
      </p>
      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:grid-cols-3">
        <select
          value={object}
          onChange={(e) => setObject(e.target.value as typeof object)}
          className="rounded-lg bg-slate-900 p-2"
        >
          <option value="desk">{es ? "Escritorio" : "Desk"}</option>
          <option value="lamp">{es ? "Lámpara" : "Lamp"}</option>
          <option value="plant">{es ? "Planta" : "Plant"}</option>
        </select>
        <label className="text-xs">
          {es ? "Tamaño" : "Size"}: {scale.toFixed(1)}
          <input
            className="w-full"
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
          />
        </label>
        <button
          onClick={async () =>
            setProgress(
              await buildHomeObject({
                data: {
                  object,
                  x: 0,
                  z: 0,
                  scale,
                  material: object === "plant" ? "green" : "wood",
                },
              }),
            )
          }
          className="rounded-lg bg-cyan-400 font-black text-slate-950"
        >
          {es ? "Colocar" : "Place"}
        </button>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {progress.home.objects.map((item) => (
          <div
            key={item.id}
            className="grid aspect-square place-items-center rounded-xl border border-cyan-400/20 bg-cyan-950 text-center text-sm"
          >
            {item.object}
            <br />×{item.scale}
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-amber-200">
        {es
          ? "La publicación pública permanece desactivada y requiere moderación y aprobación parental."
          : "Public publishing remains disabled and requires moderation and parental approval."}
      </p>
    </div>
  );
}
