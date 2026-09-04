import { useState } from "react";
import { HelpCircle, CheckCircle2, AlertTriangle, ArrowRight, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse, type AssessmentQuestion } from "@/domain/progression/guardian-course-schema";

export interface AssessmentResult {
  score: number;
  answers: Record<string, number>;
  skillScores: Record<string, { correct: number; total: number }>;
  passed: boolean;
}

export function AssessmentStageView({
  course,
  locale = "en-US",
  onComplete,
}: {
  course: GuardianCourse;
  locale?: string;
  onComplete: (results: AssessmentResult) => void;
}) {
  const es = locale.startsWith("es");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);

  const questions = course.assessment.questions;
  const currentQuestion: AssessmentQuestion = questions[questionIdx] ?? questions[0]!;

  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIdx !== null) return; // Answer locked once selected for this question
    setSelectedOptionIdx(idx);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: idx,
    }));
  };

  const handleNextQuestion = () => {
    setSelectedOptionIdx(null);
    if (questionIdx < questions.length - 1) {
      setQuestionIdx((prev) => prev + 1);
    } else {
      // Calculate final results across all questions
      let correctCount = 0;
      const skillScores: Record<string, { correct: number; total: number }> = {};

      // Initialize skill scores map
      course.skills.forEach((s) => {
        skillScores[s.id] = { correct: 0, total: 0 };
      });

      questions.forEach((q) => {
        const userChoice = userAnswers[q.id] ?? selectedOptionIdx;
        const isCorrect = userChoice === q.correctIndex;
        if (isCorrect) correctCount++;

        if (!skillScores[q.skillId]) {
          skillScores[q.skillId] = { correct: 0, total: 0 };
        }
        skillScores[q.skillId]!.total += 1;
        if (isCorrect) {
          skillScores[q.skillId]!.correct += 1;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= course.assessment.passingScore;

      onComplete({
        score,
        answers: userAnswers,
        skillScores,
        passed,
      });
    }
  };

  const isSelected = selectedOptionIdx !== null;
  const isCorrect = selectedOptionIdx === currentQuestion.correctIndex;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400">
          <HelpCircle className="size-4" /> 🧪 Stage 5: Knowledge Test ({questionIdx + 1} / {questions.length})
        </span>
        <span className="text-xs font-extrabold text-slate-400">
          {text(course.assessment.title)}
        </span>
      </div>

      {/* Question Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-300">
            {currentQuestion.type} Question
          </span>
          <span className="text-xs font-bold text-slate-400">
            Skill: {currentQuestion.skillId.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Question Prompt */}
        <h2 className="text-base md:text-lg font-black text-white leading-relaxed">
          {text(currentQuestion.prompt)}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((opt, idx) => {
            const isOptionChosen = selectedOptionIdx === idx;
            const isTargetCorrect = idx === currentQuestion.correctIndex;

            let buttonClass = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-700";
            if (isSelected) {
              if (isOptionChosen) {
                buttonClass = isCorrect
                  ? "border-emerald-400 bg-emerald-950/80 text-emerald-200"
                  : "border-amber-400 bg-amber-950/80 text-amber-200";
              } else if (isTargetCorrect) {
                buttonClass = "border-emerald-500/50 bg-emerald-950/40 text-emerald-300";
              } else {
                buttonClass = "border-slate-900 bg-slate-950/40 text-slate-500 opacity-60";
              }
            }

            return (
              <button
                key={idx}
                type="button"
                disabled={isSelected}
                onClick={() => handleSelectOption(idx)}
                className={`w-full rounded-2xl border p-4 text-left text-xs font-bold transition flex items-center justify-between ${buttonClass}`}
              >
                <span>
                  <span className="inline-block w-6 text-slate-400 font-mono">{String.fromCharCode(65 + idx)}.</span>
                  {text(opt)}
                </span>
                {isSelected && isOptionChosen && (
                  isCorrect ? (
                    <CheckCircle2 className="size-5 text-emerald-400 shrink-0 ml-2" />
                  ) : (
                    <AlertTriangle className="size-5 text-amber-400 shrink-0 ml-2" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback / Explanation Box */}
        {isSelected && (
          <div
            className={`rounded-2xl border p-5 space-y-2 animate-in fade-in duration-200 ${
              isCorrect
                ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
                : "border-amber-500/40 bg-amber-950/60 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider">
                {isCorrect ? (es ? "🟢 Correct Answer!" : "🟢 Correct Answer!") : (es ? "🟡 Incorrect" : "🟡 Incorrect")}
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {text(currentQuestion.explanation)}
            </p>
          </div>
        )}
      </div>

      {/* Question Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className="text-xs font-extrabold text-slate-400">
          {es ? `Passing Score: ${course.assessment.passingScore}%` : `Passing Score: ${course.assessment.passingScore}%`}
        </span>
        <Button
          disabled={!isSelected}
          onClick={handleNextQuestion}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
        >
          {questionIdx === questions.length - 1
            ? es
              ? "Ver Reporte de Dominio"
              : "View Mastery Report"
            : es
              ? "Siguiente Pregunta"
              : "Next Question"}{" "}
          {questionIdx === questions.length - 1 ? (
            <Award className="size-4 ml-1" />
          ) : (
            <ArrowRight className="size-4 ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
}
