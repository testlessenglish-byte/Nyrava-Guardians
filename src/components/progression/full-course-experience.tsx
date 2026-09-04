import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Award, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FOUNDATION_CERTIFICATE, missions } from "@/domain/progression/catalog";
import { getGuardianCourse } from "@/domain/progression/courses";
import { CourseEngine } from "./course-engine";
import { beginProgressionMission, submitProgressionAssessment } from "@/lib/progression.functions";
import { useGuardian } from "@/lib/guardian-context";
import { advancePhishingStory } from "@/lib/phishing-story-state";

export function FullViewportCourseExperience({
  missionId,
  onExit,
  onComplete,
}: {
  missionId: string;
  onExit: () => void;
  onComplete: (score: number) => void;
}) {
  const { locale } = useGuardian();
  const es = locale.startsWith("es");
  const [currentMissionId, setCurrentMissionId] = useState(missionId);

  useEffect(() => {
    setCurrentMissionId(missionId);
  }, [missionId]);

  const activeMission = useMemo(
    () => missions.find((mission) => mission.id === currentMissionId) ?? missions[0]!,
    [currentMissionId],
  );
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [certificateEarned, setCertificateEarned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setAttemptId(null);
    setStartError(null);
    beginProgressionMission({ data: { missionId: activeMission.id } })
      .then((result) => {
        if (!cancelled) setAttemptId(result.attemptId);
      })
      .catch((error) => {
        if (!cancelled)
          setStartError(error instanceof Error ? error.message : "Unable to start this class.");
      });
    return () => {
      cancelled = true;
    };
  }, [activeMission.id]);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [stepIndex]);

  const lessonSteps = activeMission.lesson;
  const questions = activeMission.questions;
  const isQuizStep = stepIndex >= lessonSteps.length + 1;
  const totalSteps = lessonSteps.length + 2;
  const text = (value: { en: string; es: string }) => (es ? value.es : value.en);

  const activeCourse = getGuardianCourse(activeMission.id);

  if (activeCourse) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col font-sans select-none overflow-y-auto p-4 md:p-8"
        style={{
          background: "linear-gradient(180deg, #07111f 0%, #0b1728 100%)",
          width: "100vw",
          height: "100vh",
        }}
      >
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white font-bold"
          >
            <ArrowLeft className="size-4" />
            <span>{es ? "Volver al aula" : "Return to Classroom"}</span>
          </Button>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              Nyrava Guardian Classroom
            </p>
            <h1 className="text-sm font-black text-white">{text(activeCourse.title)}</h1>
          </div>
        </div>

        <CourseEngine
          key={activeCourse.id}
          course={activeCourse}
          locale={locale}
          onCourseComplete={async (completion) => {
            const finalScore = completion?.mastery_score ?? 100;
            if (attemptId) {
              try {
                const answersArray = activeCourse.assessment.questions.map(
                  (q) => q.correctIndex
                );
                await submitProgressionAssessment({ data: { attemptId, answers: answersArray } });
              } catch (e) {
                console.error("Failed to submit assessment to backend:", e);
              }
            }
            if (finalScore >= 75 && activeMission.id === "phishing-defense") {
              advancePhishingStory("COMPLETE_ACADEMY_LESSON", "SOLVE_INCIDENT");
            }
            onComplete(finalScore);
          }}
          onNextMission={(nextId) => {
            setCurrentMissionId(nextId);
          }}
          onExit={onExit}
        />
      </div>
    );
  }

  const handleQuizSubmit = async () => {
    if (!attemptId || submitting) return;
    setSubmitting(true);
    try {
      const answers = questions.map((q) => selectedOptions[q.id] ?? -1);
      const result = await submitProgressionAssessment({ data: { attemptId, answers } });
      const finalScore = result.score ?? 0;
      setScore(finalScore);
      setCertificateEarned(
        result.certificates.some((certificate) => certificate.course === FOUNDATION_CERTIFICATE.id),
      );
      setSubmitted(true);
      if (finalScore >= 75 && activeMission.id === "phishing-defense") {
        advancePhishingStory("COMPLETE_ACADEMY_LESSON", "SOLVE_INCIDENT");
      }
      onComplete(finalScore);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col font-sans select-none"
      style={{
        background: "linear-gradient(180deg, #07111f 0%, #0b1728 100%)",
        width: "100vw",
        height: "100vh",
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            className="flex items-center gap-2 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            <span className="font-bold">{es ? "Volver al aula" : "Return to Classroom"}</span>
          </Button>
          <div className="h-6 w-px bg-slate-800" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
              {es ? "Fundamentos de Seguridad Digital" : "Digital Safety Foundations"}
            </p>
            <h1 className="text-sm font-black text-white">{text(activeMission.title)}</h1>
          </div>
        </div>
        <div className="w-48">
          <div className="mb-1 flex justify-between text-[11px] font-extrabold text-slate-400">
            <span>{es ? "Progreso" : "Progress"}</span>
            <span className="text-cyan-300">
              {Math.round(((stepIndex + 1) / totalSteps) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
              style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col items-center justify-start"
      >
        <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
          {startError && (
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-5 text-sm font-bold text-rose-200">
              {startError}
            </div>
          )}

          {!startError && stepIndex === 0 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-cyan-950 border border-cyan-400/40 text-4xl">
                🛡️
              </div>
              <div>
                <h2 className="text-3xl font-black text-white">{text(activeMission.title)}</h2>
                <p className="mt-2 text-base text-slate-300 max-w-xl mx-auto">
                  {text(activeMission.summary)}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left space-y-2 text-sm text-slate-200">
                <p className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  {es ? "Cómo aprobar" : "How to pass"}
                </p>
                <p>
                  {es
                    ? "Estudia los conceptos y obtén al menos 75% en la evaluación."
                    : "Study the concepts and score at least 75% on the assessment."}
                </p>
                <p>
                  {es
                    ? "El certificado de Fundamentos se entrega solamente después de aprobar las tres clases requeridas."
                    : "The Foundations certificate is issued only after all three required classes are passed."}
                </p>
              </div>
            </div>
          )}

          {!startError && stepIndex > 0 && stepIndex <= lessonSteps.length && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  {es ? "Concepto" : "Concept"} {stepIndex} / {lessonSteps.length}
                </span>
              </div>
              <p className="py-4 text-2xl font-bold leading-relaxed text-slate-100">
                {text(lessonSteps[stepIndex - 1]!)}
              </p>
            </div>
          )}

          {!startError && isQuizStep && (
            <div className="space-y-6">
              {!submitted ? (
                <>
                  <div className="border-b border-slate-800 pb-4">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                      {es ? "Evaluación final" : "Final Knowledge Assessment"}
                    </span>
                    <h3 className="mt-1 text-2xl font-black text-white">
                      {es ? "Demuestra lo que aprendiste" : "Show What You Learned"}
                    </h3>
                  </div>
                  <div className="space-y-6">
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id}
                        className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                      >
                        <p className="text-sm font-black text-white">
                          {qIdx + 1}. {text(q.prompt)}
                        </p>
                        <div className="grid gap-2">
                          {q.options.map((opt, optIdx) => (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                              className={
                                "w-full rounded-xl border p-3 text-left text-xs font-semibold transition " +
                                (selectedOptions[q.id] === optIdx
                                  ? "border-cyan-400 bg-cyan-950/80 text-cyan-200"
                                  : "border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800")
                              }
                            >
                              {text(opt)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleQuizSubmit}
                    disabled={
                      !attemptId ||
                      submitting ||
                      Object.keys(selectedOptions).length < questions.length
                    }
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl"
                  >
                    {submitting
                      ? es
                        ? "Calificando…"
                        : "Scoring…"
                      : es
                        ? "Enviar evaluación"
                        : "Submit Assessment"}
                  </Button>
                </>
              ) : score >= 75 ? (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-emerald-950 border border-emerald-400/50 text-4xl">
                    🏆
                  </div>
                  <div>
                    <span className="rounded-full bg-emerald-950 px-4 py-1 text-xs font-black uppercase tracking-widest text-emerald-400 border border-emerald-500/30">
                      {es ? "APROBADO" : "PASSED"} — {score}%
                    </span>
                    <h2 className="mt-3 text-3xl font-black text-white">
                      {text(activeMission.title)} {es ? "completado" : "Complete"}
                    </h2>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-5 flex items-center justify-center gap-3 text-emerald-300">
                    <Award className="size-6" />
                    <span className="text-sm font-black">
                      {certificateEarned
                        ? es
                          ? "¡Certificado de Fundamentos de Seguridad Digital obtenido!"
                          : "Digital Safety Foundations Certificate Earned!"
                        : es
                          ? "Dominio de esta clase guardado. Continúa la ruta para obtener el certificado."
                          : "Class mastery saved. Continue the path to earn the certificate."}
                    </span>
                  </div>
                  <Button
                    onClick={onExit}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6"
                  >
                    {es ? "Volver al aula" : "Return to Classroom"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 text-center py-4">
                  <div className="mx-auto grid size-20 place-items-center rounded-2xl bg-rose-950 border border-rose-400/50 text-rose-400">
                    <XCircle className="size-12" />
                  </div>
                  <div>
                    <span className="rounded-full bg-rose-950 px-4 py-1 text-xs font-black uppercase tracking-widest text-rose-400 border border-rose-500/30">
                      {score}% · 75% {es ? "requerido" : "required"}
                    </span>
                    <h2 className="mt-3 text-3xl font-black text-white">
                      {es ? "Repasa e inténtalo de nuevo" : "Review & Try Again"}
                    </h2>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSubmitted(false);
                      setSelectedOptions({});
                      setStepIndex(1);
                      setAttemptId(null);
                      beginProgressionMission({ data: { missionId: activeMission.id } }).then(
                        (result) => setAttemptId(result.attemptId),
                      );
                    }}
                    className="bg-slate-800 text-white font-bold"
                  >
                    {es ? "Repasar lección" : "Review Lesson"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!isQuizStep && !startError && (
        <div className="flex h-20 shrink-0 items-center justify-between border-t border-slate-800 bg-slate-950 px-8">
          <Button
            variant="outline"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            className="border-slate-700 bg-slate-900 text-slate-200 font-bold"
          >
            <ArrowLeft className="size-4 mr-2" /> {es ? "Anterior" : "Previous"}
          </Button>
          <span className="text-xs font-bold text-slate-400">
            {stepIndex + 1} / {totalSteps}
          </span>
          <Button
            disabled={!attemptId}
            onClick={() => setStepIndex((prev) => prev + 1)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
          >
            {stepIndex === lessonSteps.length
              ? es
                ? "Tomar evaluación"
                : "Take Quiz"
              : es
                ? "Continuar"
                : "Continue"}{" "}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
