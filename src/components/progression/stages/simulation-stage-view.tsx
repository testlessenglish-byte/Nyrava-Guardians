import { useState } from "react";
import { Gamepad2, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse, type SimulationOption } from "@/domain/progression/guardian-course-schema";

export function SimulationStageView({
  course,
  locale = "en-US",
  onComplete,
}: {
  course: GuardianCourse;
  locale?: string;
  onComplete: () => void;
}) {
  const es = locale.startsWith("es");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<SimulationOption | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<number>>(new Set());

  const scenarios = course.simulations.scenarios;
  const currentScenario = scenarios[scenarioIdx] ?? scenarios[0]!;

  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  const handleSelectOption = (opt: SimulationOption) => {
    setSelectedOption(opt);
    setCompletedScenarios((prev) => new Set([...prev, scenarioIdx]));
  };

  const handleNextScenario = () => {
    setSelectedOption(null);
    if (scenarioIdx < scenarios.length - 1) {
      setScenarioIdx((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
          <Gamepad2 className="size-4" /> 🎮 Stage 4: Training Simulation ({scenarioIdx + 1} / {scenarios.length})
        </span>
        <span className="text-xs font-extrabold text-slate-400">
          {text(course.simulations.title)}
        </span>
      </div>

      {/* Scenario Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-lg md:text-xl font-black text-white">
            {text(currentScenario.title)}
          </h2>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black text-slate-300 border border-slate-700">
            {currentScenario.skillId.toUpperCase().replace("_", " ")}
          </span>
        </div>

        {/* Situation Description */}
        <p className="text-sm font-semibold text-slate-200 leading-relaxed">
          {text(currentScenario.situation)}
        </p>

        {/* Incoming Message Box if provided */}
        {currentScenario.messageContent && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/30 p-4 font-mono text-xs text-amber-200">
            {text(currentScenario.messageContent)}
          </div>
        )}

        {/* Scenario Multiple Choice Options */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
            {es ? "¿Qué debes hacer como Guardian?" : "What Should You Do As A Guardian?"}
          </p>
          <div className="space-y-2">
            {currentScenario.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  className={`w-full rounded-2xl border p-4 text-left text-xs font-bold transition flex items-center justify-between ${
                    isSelected
                      ? opt.isCorrect
                        ? "border-emerald-400 bg-emerald-950/80 text-emerald-200"
                        : "border-amber-400 bg-amber-950/80 text-amber-200"
                      : "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  <span>{text(opt.text)}</span>
                  {isSelected && (
                    opt.isCorrect ? (
                      <CheckCircle2 className="size-5 text-emerald-400 shrink-0 ml-2" />
                    ) : (
                      <AlertTriangle className="size-5 text-amber-400 shrink-0 ml-2" />
                    )
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Immediate AI Feedback Card */}
        {selectedOption && (
          <div
            className={`rounded-2xl border p-5 space-y-2 animate-in fade-in duration-200 ${
              selectedOption.isCorrect
                ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
                : "border-amber-500/40 bg-amber-950/60 text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-wider">
                {text(selectedOption.feedbackTitle)}
              </span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {text(selectedOption.feedbackText)}
            </p>
          </div>
        )}
      </div>

      {/* Scenario Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          disabled={scenarioIdx === 0}
          onClick={() => {
            setSelectedOption(null);
            setScenarioIdx((prev) => Math.max(0, prev - 1));
          }}
          className="border-slate-700 bg-slate-900 text-slate-300 font-bold"
        >
          {es ? "Anterior" : "Previous Scenario"}
        </Button>
        <Button
          disabled={!selectedOption}
          onClick={handleNextScenario}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black"
        >
          {scenarioIdx === scenarios.length - 1
            ? es
              ? "Ir al Examen de Conocimientos"
              : "Proceed to Knowledge Test"
            : es
              ? "Siguiente Escenario"
              : "Next Scenario"}{" "}
          <ArrowRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
