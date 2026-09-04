import { useState } from "react";
import { Puzzle, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PatternItem {
  id: string;
  sequence: string[];
  options: string[];
  correctIndex: number;
  explanation: string;
}

const PATTERNS: PatternItem[] = [
  {
    id: "pat-1",
    sequence: ["🌱 Seed", "🪴 Sprout", "🌿 Plant", "🌳 Tree", "❓ Next Stage"],
    options: ["🍂 Fallen Leaf", "🍎 Fruit / Seed Drop", "🪨 Rock", "🌊 River"],
    correctIndex: 1,
    explanation: "The plant growth cycle moves from Seed -> Sprout -> Plant -> Mature Tree -> Fruit / Seeds to restart the cycle!",
  },
  {
    id: "pat-2",
    sequence: ["🔵 2 Core Beams", "🔵 4 Core Beams", "🔵 8 Core Beams", "❓ Next Level"],
    options: ["🔵 10 Core Beams", "🔵 12 Core Beams", "🔵 16 Core Beams", "🔵 20 Core Beams"],
    correctIndex: 2,
    explanation: "Each energy level doubles: 2 -> 4 -> 8 -> 16 core beams!",
  },
  {
    id: "pat-3",
    sequence: ["💧 Water", "☀️ Light", "🌱 Soil", "💧 Water", "☀️ Light", "❓ Next Element"],
    options: ["💧 Water", "🌱 Soil", "🔥 Fire", "🌬️ Wind"],
    correctIndex: 1,
    explanation: "The repeating sequence pattern is Water -> Light -> Soil -> Water -> Light -> Soil!",
  },
];

export function PatternGroveModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentPattern = PATTERNS[currentIndex]!;
  const selectedIndex = answers[currentPattern.id];
  const hasAnswered = selectedIndex !== undefined;
  const isCorrect = selectedIndex === currentPattern.correctIndex;

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentPattern.id]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < PATTERNS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    PATTERNS.forEach((p) => {
      if (answers[p.id] === p.correctIndex) correct++;
    });
    return Math.round((correct / PATTERNS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 66;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Puzzle className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Pattern Grove</h2>
              <p className="text-xs text-slate-400">Pattern Canopy • Logic Sequences</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Pattern {currentIndex + 1} of {PATTERNS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-3">
              <p className="text-xs font-extrabold text-cyan-400 uppercase tracking-widest text-center">Complete the Sequence:</p>
              <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-sm font-bold text-slate-100">
                {currentPattern.sequence.map((item, idx) => (
                  <span key={idx} className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 text-center">Select the missing element:</p>
              <div className="grid grid-cols-2 gap-3">
                {currentPattern.options.map((optText, idx) => {
                  let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                  if (hasAnswered) {
                    if (idx === currentPattern.correctIndex) {
                      btnStyle = "border-emerald-500/60 bg-emerald-950/70 text-emerald-300 font-bold";
                    } else if (idx === selectedIndex) {
                      btnStyle = "border-rose-500/60 bg-rose-950/70 text-rose-300 font-bold";
                    }
                  }
                  return (
                    <Button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      variant="outline"
                      className={`text-xs py-4 h-auto whitespace-normal ${btnStyle}`}
                    >
                      {optText}
                    </Button>
                  );
                })}
              </div>
            </div>

            {hasAnswered && (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{isCorrect ? "Pattern Identified!" : "Incorrect Element"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{currentPattern.explanation}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  Next Pattern <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Pattern Logic Mastered!" : "Review Logic Sequences"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> on pattern recognition.
            </p>
            {passed && (
              <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
                +100 XP • +25 Nyrava AI Builder Points
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
              Return to Wisdom Forest
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Pattern Grove
        </Button>
      </div>
    </div>
  );
}
