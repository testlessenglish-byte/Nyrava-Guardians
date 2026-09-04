import { useState } from "react";
import { Sparkles, CheckCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KnowledgeSeedRescueModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const question = "Why do Knowledge Seeds need to be placed in the Tree of Wisdom's core?";
  const options = [
    "To lock the forest away from everyone",
    "To stabilize the knowledge network with verified facts and clean energy",
    "Because they look shiny on the branches",
    "To delete all records in the Waterfall Archives",
  ];
  const correctIndex = 1;
  const isCorrect = selectedAnswer === correctIndex;

  const handleSelect = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
  };

  const handleClaimSeed = () => {
    if (isCorrect) {
      setCompleted(true);
      onComplete(100, true);
    }
  };

  const handleFinish = () => {
    onClose();
    setSelectedAnswer(null);
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-400/40 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
              <Sparkles className="size-6 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Knowledge Seed Rescue</h2>
              <p className="text-xs text-slate-400">Arrival Grove • Reasoned Rescue</p>
            </div>
          </div>
        </div>

        {!completed ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
              <p className="text-sm font-bold text-slate-100">{question}</p>
            </div>

            <div className="space-y-2">
              {options.map((optText, idx) => {
                let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                if (selectedAnswer !== null) {
                  if (idx === correctIndex) {
                    btnStyle = "border-emerald-500/60 bg-emerald-950/70 text-emerald-300 font-bold";
                  } else if (idx === selectedAnswer) {
                    btnStyle = "border-rose-500/60 bg-rose-950/70 text-rose-300 font-bold";
                  }
                }
                return (
                  <Button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    variant="outline"
                    className={`w-full justify-start text-left text-xs py-4 h-auto whitespace-normal ${btnStyle}`}
                  >
                    {optText}
                  </Button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <p className="text-xs text-slate-200">
                    {isCorrect
                      ? "Correct! Knowledge Seeds carry verified facts that stabilize the cyan energy core."
                      : "Not quite. Think about how verified knowledge brings clarity and balance to the forest."}
                  </p>
                </div>

                <Button
                  onClick={handleClaimSeed}
                  disabled={!isCorrect}
                  className={`w-full font-black ${isCorrect ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950" : "bg-slate-800 text-slate-500"}`}
                >
                  Rescue & Claim Knowledge Seed
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Knowledge Seed Rescued!</h3>
            <p className="text-sm text-slate-300">
              You earned a Knowledge Seed! It now orbits the Tree of Wisdom energy core.
            </p>
            <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
              +100 XP • +25 Nyrava AI Builder Points
            </div>
            <Button onClick={handleFinish} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
              Return to Wisdom Forest
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Challenge
        </Button>
      </div>
    </div>
  );
}
