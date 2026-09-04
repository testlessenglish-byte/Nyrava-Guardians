import { useState } from "react";
import { ShieldCheck, ArrowRight, HelpCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse } from "@/domain/progression/guardian-course-schema";

export function SkillStageView({
  course,
  locale = "en-US",
  onComplete,
}: {
  course: GuardianCourse;
  locale?: string;
  onComplete: () => void;
}) {
  const es = locale.startsWith("es");
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const steps = course.skill.ruleSteps;
  const currentStep = steps[activeStepIdx] ?? steps[0]!;

  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-cyan-400">
          <ShieldCheck className="size-4" /> 🔎 Stage 3: Learn the Skill
        </span>
        <span className="rounded-full bg-cyan-950 px-3 py-1 text-[10px] font-black text-cyan-300 border border-cyan-500/30">
          {text(course.skill.ruleName)}
        </span>
      </div>

      {/* 3-Step Guardian Rule Cards Nav */}
      <div className="grid grid-cols-3 gap-3">
        {steps.map((s, idx) => (
          <button
            key={s.step}
            type="button"
            onClick={() => setActiveStepIdx(idx)}
            className={`flex flex-col items-center justify-center rounded-2xl p-4 transition border ${
              activeStepIdx === idx
                ? "border-cyan-400 bg-cyan-950/80 text-cyan-200 shadow-xl"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest">{s.step}</span>
            <span className="mt-1 text-[10px] font-bold text-slate-400">Step {idx + 1}</span>
          </button>
        ))}
      </div>

      {/* Active Rule Step Detail */}
      <div className="rounded-3xl border border-cyan-500/40 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-black text-white">{text(currentStep.title)}</h2>
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-black text-cyan-300 border border-cyan-500/30">
            Rule Step {activeStepIdx + 1} of {steps.length}
          </span>
        </div>

        {/* Action Description */}
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
            {es ? "Qué hacer" : "What To Do"}
          </p>
          <p className="text-base font-bold text-slate-100">{text(currentStep.action)}</p>
        </div>

        {/* Questions to Ask */}
        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <p className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <HelpCircle className="size-4" />
            {es ? "Preguntas Clave para Hacerte" : "Key Questions To Ask Yourself"}
          </p>
          <div className="space-y-2">
            {currentStep.questionsToAsk.map((q, qIdx) => (
              <div key={qIdx} className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <CheckCircle2 className="size-4 text-cyan-400 shrink-0" />
                <span>{text(q)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safe Example */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
            {es ? "Por qué esto te protege" : "Why This Keeps You Safe"}
          </p>
          <p className="mt-1 text-xs font-bold text-emerald-200">
            {text(currentStep.safeExample)}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          disabled={activeStepIdx === 0}
          onClick={() => setActiveStepIdx((prev) => Math.max(0, prev - 1))}
          className="border-slate-700 bg-slate-900 text-slate-300 font-bold"
        >
          {es ? "Anterior" : "Previous Step"}
        </Button>
        {activeStepIdx < steps.length - 1 ? (
          <Button
            onClick={() => setActiveStepIdx((prev) => prev + 1)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
          >
            {es ? "Siguiente Paso" : "Next Step"} <ArrowRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
          >
            {es ? "Entrar a la Simulación" : "Enter Simulation"} →
          </Button>
        )}
      </div>
    </div>
  );
}
