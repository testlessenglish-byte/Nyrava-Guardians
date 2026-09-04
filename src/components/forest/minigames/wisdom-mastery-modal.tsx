import { useState } from "react";
import { TreePine, Award, CheckCircle, XCircle, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MasteryQuestion {
  id: string;
  stageTitle: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const MASTERY_QUESTIONS: MasteryQuestion[] = [
  {
    id: "wm-1",
    stageTitle: "Stage 1: Source & Evidence Analysis",
    question: "When Lex encounters two conflicting reports about energy core drops, what is the best scientific approach?",
    options: [
      "Trust the report with the loudest title",
      "Compare original sensor measurements, publication dates, and author credentials",
      "Ignore both reports completely",
      "Assume the newer report is always wrong",
    ],
    correctIndex: 1,
    explanation: "Evaluating objective measurements, publication dates, and author methodology provides verified evidence.",
  },
  {
    id: "wm-2",
    stageTitle: "Stage 2: Pattern & Logic Synthesis",
    question: "The central energy core pulses in the sequence: 2 -> 4 -> 8 -> 16. What is the next energy level required for full restoration?",
    options: ["20", "24", "32", "64"],
    correctIndex: 2,
    explanation: "The exponential pattern doubles at each stage: 16 x 2 = 32!",
  },
  {
    id: "wm-3",
    stageTitle: "Stage 3: Ecosystem & Cause/Effect",
    question: "Why did restoring water channels in the Botanical Domes increase bird populations?",
    options: [
      "Birds prefer dry soil",
      "Water allowed plants to bloom, providing food and shelter for insects and birds",
      "Water has no connection to bird habitats",
      "The robots carried the birds into the domes",
    ],
    correctIndex: 1,
    explanation: "Ecosystems are interconnected: water supports plant life, which sustains insects, birds, and larger wildlife.",
  },
  {
    id: "wm-4",
    stageTitle: "Stage 4: Reasoning & Truth Core",
    question: "What is the key difference between a scientific observation and an assumption?",
    options: [
      "Observations are direct sensory measurements; assumptions are unproven guesses",
      "Observations are always opinions; assumptions are facts",
      "There is no difference",
      "Assumptions are verified by lab tools",
    ],
    correctIndex: 0,
    explanation: "Observations rely on direct empirical evidence, whereas assumptions jump to conclusions without testing.",
  },
];

export function WisdomMasteryModal({
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

  const currentQ = MASTERY_QUESTIONS[currentIndex]!;
  const selectedIdx = answers[currentQ.id];
  const hasAnswered = selectedIdx !== undefined;
  const isCorrect = selectedIdx === currentQ.correctIndex;

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
  };

  const handleNext = () => {
    if (currentIndex < MASTERY_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    MASTERY_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / MASTERY_QUESTIONS.length) * 100);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-400/40 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
              <Trophy className="size-6 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-300">Tree of Wisdom Mastery</h2>
              <p className="text-xs text-slate-400">Tree of Wisdom Sanctuary • Multi-Stage Climax</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-black text-emerald-300 border border-emerald-500/40">
            {currentQ.stageTitle.split(":")[0]}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-400">{currentQ.stageTitle}</span>
              <p className="text-sm font-bold text-slate-100">{currentQ.question}</p>
            </div>

            <div className="space-y-2">
              {currentQ.options.map((optText, idx) => {
                let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                if (hasAnswered) {
                  if (idx === currentQ.correctIndex) {
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
                    <span className="mr-2 font-mono font-black text-emerald-400">{String.fromCharCode(65 + idx)}.</span>
                    {optText}
                  </Button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <p className="text-xs text-slate-200">{currentQ.explanation}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black">
                  Next Mastery Stage <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Trophy className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Wisdom Forest Restored!" : "Mastery Review Required"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-emerald-300">{score}%</strong> on the Tree of Wisdom Mastery Challenge.
            </p>
            {passed && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/50 p-4 space-y-2 text-center">
                <p className="text-xs font-black uppercase text-emerald-300">🌳 Tree of Wisdom Energy Core Restored!</p>
                <p className="text-xs text-slate-200">+300 XP • +50 AI Builder Points • Wisdom Shield Badge Unlocked!</p>
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black">
              Complete World 2
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Exit Challenge
        </Button>
      </div>
    </div>
  );
}
