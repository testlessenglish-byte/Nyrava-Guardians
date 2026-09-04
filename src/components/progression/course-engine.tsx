import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { BookOpen, Search, ShieldAlert, Gamepad2, HelpCircle, Trophy, CheckCircle, Lock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse } from "@/domain/progression/guardian-course-schema";
import { useGuardian } from "@/lib/guardian-context";
import {
  saveAuthoritativeCourseCompletion,
  getAuthoritativeCourseCompletion,
  type GuardianCourseCompletion,
} from "@/lib/guardian-completions";
import { StoryStageView } from "./stages/story-stage-view";
import { InvestigationStageView } from "./stages/investigation-stage-view";
import { SkillStageView } from "./stages/skill-stage-view";
import { SimulationStageView } from "./stages/simulation-stage-view";
import { AssessmentStageView, type AssessmentResult } from "./stages/assessment-stage-view";
import { MasteryStageView } from "./stages/mastery-stage-view";
import { MyCertificatesDrawer } from "./my-certificates-drawer";

export type StageNumber = 1 | 2 | 3 | 4 | 5 | 6;

const STAGES: { stage: StageNumber; key: string; labelEn: string; labelEs: string; icon: typeof BookOpen }[] = [
  { stage: 1, key: "story", labelEn: "1. Story", labelEs: "1. Historia", icon: BookOpen },
  { stage: 2, key: "investigation", labelEn: "2. Investigation", labelEs: "2. Investigación", icon: Search },
  { stage: 3, key: "skill", labelEn: "3. Rule", labelEs: "3. Regla", icon: ShieldAlert },
  { stage: 4, key: "simulation", labelEn: "4. Simulation", labelEs: "4. Simulación", icon: Gamepad2 },
  { stage: 5, key: "assessment", labelEn: "5. Test", labelEs: "5. Examen", icon: HelpCircle },
  { stage: 6, key: "mastery", labelEn: "6. Mastery", labelEs: "6. Dominio", icon: Trophy },
];

export function CourseEngine({
  course,
  locale = "en-US",
  onCourseComplete,
  onExit,
  onNextMission,
}: {
  course: GuardianCourse;
  locale?: string;
  onCourseComplete?: (completion: GuardianCourseCompletion | null) => void;
  onExit?: () => void;
  onNextMission?: (nextCourseId: string) => void;
}) {
  const es = locale.startsWith("es");
  const navigate = useNavigate();
  const { guardianId, guardianName } = useGuardian();

  const [currentStage, setCurrentStage] = useState<StageNumber>(1);
  const [maxStageUnlocked, setMaxStageUnlocked] = useState<StageNumber>(1);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [completionRecord, setCompletionRecord] = useState<GuardianCourseCompletion | null>(null);
  const [showCertificatesDrawer, setShowCertificatesDrawer] = useState(false);

  const unlockStage = (next: StageNumber) => {
    setCurrentStage(next);
    if (next > maxStageUnlocked) {
      setMaxStageUnlocked(next);
    }
  };

  const handleAssessmentComplete = async (result: AssessmentResult) => {
    setAssessmentResult(result);

    // Evaluate dual threshold: overall score >= passingScore AND all critical skills passed
    const skillBreakdown = course.skills.map((skill) => {
      const stat = result.skillScores[skill.id] ?? { correct: 1, total: 1 };
      const scorePct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 100;
      const isMastered = scorePct >= skill.criticalThreshold;
      return {
        skillId: skill.id,
        name: skill.name,
        scorePct,
        threshold: skill.criticalThreshold,
        isMastered,
      };
    });

    const allCriticalPassed = skillBreakdown.every((s) => s.isMastered);
    const passed = result.score >= course.assessment.passingScore && allCriticalPassed;
    const status = passed ? "COMPLETED" : "NEEDS_REMEDIATION";

    // Strengths summary & recommended practice text
    const weakSkills = skillBreakdown.filter((s) => !s.isMastered);
    const strengths = {
      en: passed
        ? "Strong ability to recognize pressure tactics, fake countdowns, and unsolicited reward traps."
        : "Good progress on core safety concepts.",
      es: passed
        ? "Gran capacidad para reconocer tácticas de presión, conteos falsos y trampas de premios no solicitados."
        : "Buen progreso en los conceptos básicos de ciberseguridad.",
    };
    const recommended_practice = {
      en: weakSkills.length > 0
        ? `Focus practice on ${weakSkills.map((w) => w.name.en).join(", ")}.`
        : "Continue practicing verification-code and impersonation scenarios.",
      es: weakSkills.length > 0
        ? `Enfocar práctica en ${weakSkills.map((w) => w.name.es).join(", ")}.`
        : "Continuar practicando escenarios de verificación e suplantación de identidad.",
    };

    // Save authoritatively (IDEMPOTENT)
    const saved = await saveAuthoritativeCourseCompletion({
      guardian_id: guardianId || "guest_guardian",
      guardian_name: guardianName || "Guardian",
      course_id: course.id,
      course_title: course.title,
      subject: course.subject,
      status,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      mastery_score: result.score,
      critical_skills_passed: allCriticalPassed,
      xp_awarded: course.xpReward,
      credit_awarded: course.creditReward,
      badge_id: course.badgeId,
      badge_name: { en: "Scam Spotter", es: "Detector de Estafas" },
      certificate_language: es ? "es" : "en",
      skill_breakdown: skillBreakdown,
      strengths,
      recommended_practice,
      remediation_attempts: passed ? 0 : 1,
    });

    setCompletionRecord(saved);
    unlockStage(6);
  };

  const handleFinishCourse = async () => {
    if (onCourseComplete) {
      onCourseComplete(completionRecord);
    }
    if (onExit) {
      onExit();
    } else {
      await navigate({ to: "/classroom" });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 6-Stage Top Progress Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-3 shadow-xl backdrop-blur-md flex items-center justify-between gap-2">
        <div className="grid grid-cols-6 gap-1 md:gap-2 flex-1">
          {STAGES.map((s) => {
            const Icon = s.icon;
            const isCurrent = currentStage === s.stage;
            const isUnlocked = s.stage <= maxStageUnlocked;
            const isCompleted = s.stage < maxStageUnlocked;

            return (
              <button
                key={s.stage}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && setCurrentStage(s.stage)}
                className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all ${
                  isCurrent
                    ? "bg-slate-800 border border-cyan-500/60 text-cyan-300 shadow-md scale-[1.02]"
                    : isCompleted
                      ? "bg-slate-900/80 border border-emerald-500/30 text-emerald-300 hover:bg-slate-850 cursor-pointer"
                      : isUnlocked
                        ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-850 cursor-pointer"
                        : "bg-slate-950 border border-slate-900 text-slate-600 opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex items-center justify-center mb-1">
                  {isCompleted ? (
                    <CheckCircle className="size-4 text-emerald-400" />
                  ) : isUnlocked ? (
                    <Icon className={`size-4 ${isCurrent ? "text-cyan-400" : "text-slate-400"}`} />
                  ) : (
                    <Lock className="size-4 text-slate-600" />
                  )}
                </div>
                <span className="text-[10px] md:text-xs font-black truncate w-full">
                  {es ? s.labelEs : s.labelEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Portfolio Button */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCertificatesDrawer(true)}
          className="border-slate-800 bg-slate-900 text-amber-400 font-bold text-xs shrink-0"
        >
          <Award className="size-3.5 mr-1" />
          {es ? "Mis Certificados" : "My Certificates"}
        </Button>
      </div>

      {/* Active Stage Renderer */}
      <div className="min-h-[500px]">
        {currentStage === 1 && (
          <StoryStageView
            course={course}
            locale={locale}
            onComplete={() => unlockStage(2)}
          />
        )}

        {currentStage === 2 && (
          <InvestigationStageView
            course={course}
            locale={locale}
            onComplete={() => unlockStage(3)}
          />
        )}

        {currentStage === 3 && (
          <SkillStageView
            course={course}
            locale={locale}
            onComplete={() => unlockStage(4)}
          />
        )}

        {currentStage === 4 && (
          <SimulationStageView
            course={course}
            locale={locale}
            onComplete={() => unlockStage(5)}
          />
        )}

        {currentStage === 5 && (
          <AssessmentStageView
            course={course}
            locale={locale}
            onComplete={handleAssessmentComplete}
          />
        )}

        {currentStage === 6 && (
          <MasteryStageView
            course={course}
            result={assessmentResult}
            completion={completionRecord}
            locale={locale}
            onFinish={handleFinishCourse}
            onRetry={() => setCurrentStage(5)}
            onRemediate={() => setCurrentStage(4)}
            onNextCourse={(nextCourseId) => {
              if (onNextMission) {
                onNextMission(nextCourseId);
              } else {
                handleFinishCourse();
              }
            }}
          />
        )}
      </div>

      {/* Certificates Drawer Portfolio */}
      <MyCertificatesDrawer
        completions={completionRecord ? [completionRecord] : []}
        locale={locale}
        open={showCertificatesDrawer}
        onClose={() => setShowCertificatesDrawer(false)}
      />
    </div>
  );
}
