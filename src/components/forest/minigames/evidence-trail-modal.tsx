import { useState } from "react";
import { Compass, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface StatementItem {
  id: string;
  statement: string;
  correctCategory: "Fact" | "Observation" | "Opinion" | "Assumption";
  explanation: string;
}

const STATEMENTS: StatementItem[] = [
  {
    id: "stmt-1",
    statement: "“I saw blue light shining from the Tree of Wisdom trunk at 8:00 PM.”",
    correctCategory: "Observation",
    explanation: "This is a direct observation—a statement based on what someone directly witnessed with their senses.",
  },
  {
    id: "stmt-2",
    statement: "“Water freezes into solid ice at 0°C (32°F).”",
    correctCategory: "Fact",
    explanation: "This is a proven scientific fact verified by repeated measurement.",
  },
  {
    id: "stmt-3",
    statement: "“Wisdom Forest is the most beautiful world in the entire Nyrava universe.”",
    correctCategory: "Opinion",
    explanation: "This is an opinion—a personal judgment or feeling that varies from person to person.",
  },
  {
    id: "stmt-4",
    statement: "“The energy core must be broken because the river level dropped today.”",
    correctCategory: "Assumption",
    explanation: "This is an assumption—guessing a cause without measuring or proving the connection.",
  },
];

export function EvidenceTrailModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentItem = STATEMENTS[currentIndex]!;
  const selectedCat = answers[currentItem.id];
  const hasAnswered = selectedCat !== undefined;
  const isCorrect = selectedCat === currentItem.correctCategory;

  const categories: ("Fact" | "Observation" | "Opinion" | "Assumption")[] = ["Fact", "Observation", "Opinion", "Assumption"];

  const handleSelect = (cat: string) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentItem.id]: cat }));
  };

  const handleNext = () => {
    if (currentIndex < STATEMENTS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    STATEMENTS.forEach((item) => {
      if (answers[item.id] === item.correctCategory) correct++;
    });
    return Math.round((correct / STATEMENTS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 75;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Compass className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-300">Evidence Trail Classifier</h2>
              <p className="text-xs text-slate-400">Evidence Trail • Information Analysis</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Statement {currentIndex + 1} of {STATEMENTS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center">
              <p className="text-sm font-bold text-slate-100">{currentItem.statement}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 text-center">Classify this statement:</p>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => {
                  let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                  if (hasAnswered) {
                    if (cat === currentItem.correctCategory) {
                      btnStyle = "border-emerald-500/60 bg-emerald-950/70 text-emerald-300 font-bold";
                    } else if (cat === selectedCat) {
                      btnStyle = "border-rose-500/60 bg-rose-950/70 text-rose-300 font-bold";
                    }
                  }
                  return (
                    <Button
                      key={cat}
                      onClick={() => handleSelect(cat)}
                      variant="outline"
                      className={`text-xs py-4 h-auto font-bold ${btnStyle}`}
                    >
                      {cat}
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
                    <span>{isCorrect ? "Correct Classification!" : "Classification Error"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{currentItem.explanation}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
                  Next Statement <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Evidence Trail Solved!" : "Review Evidence Types"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-emerald-300">{score}%</strong> on statement classification.
            </p>
            {passed && (
              <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
                +100 XP • +25 Nyrava AI Builder Points
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
              Return to Wisdom Forest
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Evidence Trail
        </Button>
      </div>
    </div>
  );
}
