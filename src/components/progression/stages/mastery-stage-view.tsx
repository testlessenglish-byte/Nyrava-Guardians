import { useState, useEffect } from "react";
import {
  Trophy,
  ShieldCheck,
  RefreshCw,
  Zap,
  Coins,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Download,
  Eye,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse } from "@/domain/progression/guardian-course-schema";
import { type AssessmentResult } from "./assessment-stage-view";
import { type GuardianCourseCompletion } from "@/lib/guardian-completions";
import { generateCertificatePdf } from "@/lib/certificate-pdf";
import { CertificateModal } from "../certificate-modal";
import { walletService } from "@/services/wallet-service";

const NEXT_COURSE_MAP: Record<string, { id: string; title: { en: string; es: string } }> = {
  "phishing-defense": {
    id: "password-safety",
    title: { en: "Password Protection", es: "Protección de Contraseñas" },
  },
  "password-safety": {
    id: "personal-information",
    title: { en: "Personal Information Safety", es: "Seguridad de Información Personal" },
  },
  "personal-information": {
    id: "builder-lab",
    title: { en: "Robotics & AI Workflows", es: "Robótica y Flujos de IA" },
  },
  "builder-lab": {
    id: "communication-studio",
    title: { en: "Digital Civility & Media", es: "Civismo Digital y Medios" },
  },
  "communication-studio": {
    id: "truth-lab",
    title: { en: "Fact Verification & Deepfakes", es: "Verificación de Hechos y Deepfakes" },
  },
  "truth-lab": {
    id: "phishing-defense",
    title: { en: "Phishing Defense", es: "Defensa contra Phishing" },
  },
};

export function MasteryStageView({
  course,
  result,
  completion,
  locale = "en-US",
  onFinish,
  onRetry,
  onRemediate,
  onNextCourse,
}: {
  course: GuardianCourse;
  result: AssessmentResult | null;
  completion: GuardianCourseCompletion | null;
  locale?: string;
  onFinish: () => void;
  onRetry: () => void;
  onRemediate?: () => void;
  onNextCourse?: (nextCourseId: string) => void;
}) {
  const es = locale.startsWith("es");
  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);
  const [showCertModal, setShowCertModal] = useState(false);

  const score = completion?.mastery_score ?? result?.score ?? 0;
  const nextCourse = NEXT_COURSE_MAP[course.id];

  // Dual threshold calculation: Overall >= 75% AND every critical skill >= threshold
  const skillBreakdown = course.skills.map((skill) => {
    const stat = result?.skillScores?.[skill.id] ?? { correct: 1, total: 1 };
    const skillPct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100;
    const isMastered = skillPct >= skill.criticalThreshold;
    return {
      ...skill,
      scorePct: skillPct,
      isMastered,
    };
  });

  const allCriticalPassed = skillBreakdown.every((s) => s.isMastered);
  const passed = score >= course.assessment.passingScore && allCriticalPassed;
  const weakSkills = skillBreakdown.filter((s) => !s.isMastered);

  useEffect(() => {
    if (passed) {
      void walletService.awardCourseReward(course.id, score, score === 100);
    }
  }, [passed, course.id, score]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
          <Trophy className="size-4" /> 🏆 Stage 6: Mastery & Certificate Evaluation
        </span>
        <span className="text-xs font-extrabold text-slate-400">
          {text(course.title)}
        </span>
      </div>

      {/* Main Celebration or Remediation Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6 text-center">
        {passed ? (
          <div className="space-y-5">
            <div className="inline-flex items-center justify-center rounded-full bg-emerald-950/80 border-2 border-emerald-400 p-4 shadow-emerald-500/20 shadow-lg">
              <ShieldCheck className="size-12 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300 border border-emerald-500/30">
                {es ? "🏆 COMPETENCIA ALCANZADA" : "🏆 COMPETENCY ACHIEVED"}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white pt-1">
                {es ? "¡CERTIFICADO OTORGADO!" : "CERTIFICATE OF COMPETENCY"}
              </h2>
              <p className="text-sm font-bold text-amber-400">
                {completion?.guardian_name || "Guardian"}
              </p>
              <p className="text-xs font-semibold text-slate-300 max-w-md mx-auto">
                {es
                  ? `Has demostrado un dominio del ${score}% y cumpliste con todos los umbrales críticos de seguridad.`
                  : `You demonstrated ${score}% mastery and satisfied all critical security safety thresholds.`}
              </p>
            </div>

            {/* Rewards & Badge Banner */}
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <div className="flex items-center gap-2 rounded-2xl border border-amber-500/40 bg-amber-950/50 px-4 py-2 text-xs font-extrabold text-amber-300">
                <Zap className="size-4 text-amber-400" />
                +{course.xpReward} XP
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-950/50 px-4 py-2 text-xs font-extrabold text-yellow-300">
                <Coins className="size-4 text-yellow-400" />
                ⭐ +100 Nyrava Points
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/40 bg-cyan-950/50 px-4 py-2 text-xs font-extrabold text-cyan-300">
                <Coins className="size-4 text-cyan-400" />
                +{course.creditReward} Credits
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-950/50 px-4 py-2 text-xs font-extrabold text-purple-300">
                <Sparkles className="size-4 text-purple-400" />
                Badge: {course.badgeId.toUpperCase()}
              </div>
            </div>

            {/* Certificate Quick Actions */}
            {completion && (
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-4 max-w-lg mx-auto flex items-center justify-between gap-4">
                <div className="text-left space-y-0.5">
                  <p className="text-[10px] font-mono font-bold text-amber-300">
                    ID: {completion.certificate_id}
                  </p>
                  <p className="text-xs font-black text-white">
                    {text(completion.course_title)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCertModal(true)}
                    className="border-slate-700 bg-slate-900 text-slate-200 font-bold text-xs"
                  >
                    <Eye className="size-3.5 mr-1" />
                    {es ? "Ver" : "View"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => generateCertificatePdf(completion, es ? "es" : "en")}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs"
                  >
                    <Download className="size-3.5 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center rounded-full bg-amber-950/80 border-2 border-amber-400 p-4">
              <AlertCircle className="size-12 text-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              {es ? "🟡 MÁS ENTRENAMIENTO REQUERIDO" : "🟡 MORE TRAINING NEEDED"}
            </h2>
            <p className="text-sm font-semibold text-slate-300 max-w-md mx-auto leading-relaxed">
              {es
                ? `Obtuviste ${score}%. Nyrava encontró habilidades que requieren práctica antes de poder otorgar el Certificado de Competencia.`
                : `You scored ${score}%. Nyrava flagged specific safety skills below critical thresholds. Practice these skills to unlock your certificate.`}
            </p>
          </div>
        )}
      </div>

      {/* Detailed Skill Diagnostic Report */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 border-b border-slate-800 pb-2">
          {es ? "Reporte Diagnóstico de Habilidades" : "Skill Diagnostic Report"}
        </h3>
        <div className="grid gap-3">
          {skillBreakdown.map((s) => (
            <div
              key={s.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white">{text(s.name)}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (Threshold: {s.criticalThreshold}%)
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-400">{text(s.description)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-black text-white font-mono">{s.scorePct}%</span>
                {s.isMastered ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 border border-emerald-500/40 px-3 py-1 text-[10px] font-black text-emerald-300">
                    <CheckCircle className="size-3" /> {es ? "DOMINADO" : "MASTERED"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-950 border border-amber-500/40 px-3 py-1 text-[10px] font-black text-amber-300">
                    <AlertCircle className="size-3" /> {es ? "REFORZAR" : "REMEDIATION"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Skills Remediation Callout */}
      {weakSkills.length > 0 && (
        <div className="rounded-3xl border border-amber-500/40 bg-amber-950/30 p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <span className="flex items-center gap-2 text-amber-300 font-black text-xs uppercase tracking-wider">
              <RotateCcw className="size-4 text-amber-400" />
              {es ? "Entrenamiento de Refuerzo Guardado" : "Targeted Remediation Saved"}
            </span>
          </div>
          <p className="text-xs font-semibold text-amber-200/90 leading-relaxed">
            {es
              ? "Nyrava recordará exactamente las habilidades en las que fallaste para tus próximos intentos."
              : "Nyrava saved diagnostic data for your weak skills. Launch targeted practice to achieve 100% competency."}
          </p>
          {onRemediate && (
            <Button
              onClick={onRemediate}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs"
            >
              <RefreshCw className="size-3.5 mr-1.5" />
              {es ? "🔄 Practicar Estas Habilidades" : "🔄 Practice These Skills"}
            </Button>
          )}
        </div>
      )}

      {/* Stage Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onFinish}
            className="border-slate-700 bg-slate-900 text-slate-200 font-bold"
          >
            <ArrowLeft className="size-4 mr-2" />
            {es ? "← Volver al Aula" : "← Return to Classroom"}
          </Button>

          <Button
            variant="outline"
            onClick={onRetry}
            className="border-slate-800 bg-slate-950 text-slate-400 font-bold text-xs"
          >
            {es ? "Reintentar Examen" : "Retry Assessment"}
          </Button>
        </div>

        {passed && nextCourse && (
          <Button
            onClick={() => {
              if (onNextCourse && nextCourse) {
                onNextCourse(nextCourse.id);
              } else {
                onFinish();
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
          >
            {es ? `Siguiente Misión: ${nextCourse.title.es}` : `Next Mission: ${nextCourse.title.en}`}{" "}
            <ArrowRight className="size-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Modal View for Certificate */}
      {completion && (
        <CertificateModal
          completion={completion}
          locale={locale}
          open={showCertModal}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
