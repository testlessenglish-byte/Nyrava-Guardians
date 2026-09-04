import { useState } from "react";
import { AlertTriangle, Search, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type GuardianCourse } from "@/domain/progression/guardian-course-schema";

export function InvestigationStageView({
  course,
  locale = "en-US",
  onComplete,
}: {
  course: GuardianCourse;
  locale?: string;
  onComplete: () => void;
}) {
  const es = locale.startsWith("es");
  const [activeDiscoveryIdx, setActiveDiscoveryIdx] = useState(0);
  const discoveries = course.investigation.discoveries;
  const currentDiscovery = discoveries[activeDiscoveryIdx] ?? discoveries[0]!;

  const text = (val: { en: string; es: string }) => (es ? val.es : val.en);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stage Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-amber-400">
          <Search className="size-4" /> 🧠 Stage 2: The Investigation (Clue {activeDiscoveryIdx + 1} / {discoveries.length})
        </span>
        <span className="text-xs font-extrabold text-slate-400">
          {text(course.investigation.title)}
        </span>
      </div>

      {/* Warning Signs Selector Tabs */}
      <div className="grid grid-cols-3 gap-2">
        {discoveries.map((disc, idx) => (
          <button
            key={disc.id}
            type="button"
            onClick={() => setActiveDiscoveryIdx(idx)}
            className={`flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-black transition border ${
              activeDiscoveryIdx === idx
                ? "border-amber-400 bg-amber-950/80 text-amber-300 shadow-lg"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200"
            }`}
          >
            <AlertTriangle className="size-4 text-amber-400" />
            <span>Sign #{disc.number}</span>
          </button>
        ))}
      </div>

      {/* Discovery Detail Card */}
      <div className="rounded-3xl border border-amber-500/40 bg-slate-950 p-6 md:p-8 shadow-2xl space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <span className="flex size-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 font-black text-sm border border-amber-500/30">
            #{currentDiscovery.number}
          </span>
          <h2 className="text-lg md:text-xl font-black text-white">
            {text(currentDiscovery.title)}
          </h2>
        </div>

        {/* Highlighted Concept Quote */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4">
          <p className="text-xs font-black uppercase tracking-wider text-amber-400">
            {es ? "Texto Sospechoso Encontrado" : "Suspicious Text Found"}
          </p>
          <p className="mt-1 text-base font-extrabold text-amber-200">
            "{text(currentDiscovery.concept)}"
          </p>
        </div>

        {/* AI Breakdown Explanation */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-cyan-400">
            {es ? "Análisis de Nyrava" : "Nyrava's Analysis"}
          </p>
          <p className="text-sm leading-relaxed text-slate-200">
            {text(currentDiscovery.explanation)}
          </p>
        </div>

        {/* Key Takeaway */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-4 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <p className="text-xs font-bold text-emerald-200">
            {text(currentDiscovery.keyTakeaway)}
          </p>
        </div>
      </div>

      {/* Stage Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          variant="outline"
          disabled={activeDiscoveryIdx === 0}
          onClick={() => setActiveDiscoveryIdx((prev) => Math.max(0, prev - 1))}
          className="border-slate-700 bg-slate-900 text-slate-300 font-bold"
        >
          {es ? "Anterior" : "Previous Sign"}
        </Button>
        {activeDiscoveryIdx < discoveries.length - 1 ? (
          <Button
            onClick={() => setActiveDiscoveryIdx((prev) => prev + 1)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black"
          >
            {es ? "Siguiente Señal" : "Next Warning Sign"} <ChevronRight className="size-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={onComplete}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
          >
            {es ? "Aprender la Regla Guardian" : "Proceed to Guardian Rule"} →
          </Button>
        )}
      </div>
    </div>
  );
}
