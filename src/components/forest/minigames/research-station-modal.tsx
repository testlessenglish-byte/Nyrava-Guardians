import { useState } from "react";
import { FlaskConical, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HypothesisCase {
  id: string;
  question: string;
  sourceA: string;
  sourceB: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const CASES: HypothesisCase[] = [
  {
    id: "case-1",
    question: "Which conclusion is best supported by comparing both research labs?",
    sourceA: "Lab A measured soil moisture: 78% near stream, 32% away from stream.",
    sourceB: "Lab B measured tree height: Trees near stream are 12m tall, away from stream are 6m tall.",
    options: [
      "Trees grow taller in higher soil moisture environments near streams",
      "Trees near streams grow smaller than dry trees",
      "Soil moisture has zero effect on tree growth",
      "Water turns trees into glowing metal towers",
    ],
    correctIndex: 0,
    explanation: "Synthesizing Lab A (higher moisture near streams) and Lab B (taller trees near streams) directly supports the conclusion that higher soil moisture correlates with taller tree growth!",
  },
  {
    id: "case-2",
    question: "How should Lex handle conflicting data between Sensor 1 and Sensor 2?",
    sourceA: "Sensor 1 records energy temperature at 22°C.",
    sourceB: "Sensor 2 records energy temperature at 85°C.",
    options: [
      "Pick Sensor 1 because 22°C sounds nicer",
      "Calibrate both sensors with a third reference thermometer to identify the faulty device",
      "Throw both sensors into the river and guess",
      "Publish both without checking which one is accurate",
    ],
    correctIndex: 1,
    explanation: "When data conflicts, scientific methodology requires calibrating instruments against a known control or third measurement to find the accurate reading.",
  },
];

export function ResearchStationModal({
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

  const currentCase = CASES[currentIndex]!;
  const selectedIdx = answers[currentCase.id];
  const hasAnswered = selectedIdx !== undefined;
  const isCorrect = selectedIdx === currentCase.correctIndex;

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentCase.id]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < CASES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    CASES.forEach((c) => {
      if (answers[c.id] === c.correctIndex) correct++;
    });
    return Math.round((correct / CASES.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 50;

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
              <FlaskConical className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Research Station Comparison</h2>
              <p className="text-xs text-slate-400">Research Treehouses • Hypothesis Testing</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Case {currentIndex + 1} of {CASES.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 text-xs">
              <p className="font-bold text-slate-100 text-sm">{currentCase.question}</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-cyan-400">Source A</span>
                  <p className="text-slate-300 font-medium">{currentCase.sourceA}</p>
                </div>
                <div className="rounded-xl border border-amber-500/30 bg-slate-950 p-3 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400">Source B</span>
                  <p className="text-slate-300 font-medium">{currentCase.sourceB}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 text-center">Select the best conclusion:</p>
              <div className="space-y-2">
                {currentCase.options.map((optText, idx) => {
                  let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                  if (hasAnswered) {
                    if (idx === currentCase.correctIndex) {
                      btnStyle = "border-emerald-500/60 bg-emerald-950/70 text-emerald-300 font-bold";
                    } else if (idx === selectedIdx) {
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
            </div>

            {hasAnswered && (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{isCorrect ? "Supported Conclusion!" : "Unsupported Claim"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{currentCase.explanation}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  Next Case <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Research Synthesized!" : "Review Source Comparison"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> on multi-source synthesis.
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
          Close Research Station
        </Button>
      </div>
    </div>
  );
}
