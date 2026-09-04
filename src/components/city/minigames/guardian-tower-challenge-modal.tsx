import { useState } from "react";
import { Shield, Award, CheckCircle, XCircle, ArrowRight, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TowerQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const TOWER_QUESTIONS: TowerQuestion[] = [
  {
    id: "tq-1",
    question: "What is the primary indicator of a phishing email scam?",
    options: [
      "A friendly greeting from your official teacher",
      "Urgent demands threatening account deletion with suspicious website links",
      "A notification showing your earned points",
      "A weekly summary sent from your school domain",
    ],
    correctIndex: 1,
    explanation: "Phishing scams use artificial urgency and fake link domains to pressure you into revealing passwords.",
  },
  {
    id: "tq-2",
    question: "Which of these passphrases provides the strongest vault protection?",
    options: [
      "password123",
      "alex2014",
      "Dragon#Rocket$Sunset99",
      "qwertyuiop",
    ],
    correctIndex: 2,
    explanation: "Combining multiple random words with numbers and special symbols creates a passphrase that takes millions of years to break.",
  },
  {
    id: "tq-3",
    question: "Which piece of information MUST be kept private and secret from online strangers?",
    options: [
      "Your favorite color",
      "Your home address and phone number",
      "Your avatar's superhero nickname",
      "Your favorite video game genre",
    ],
    correctIndex: 1,
    explanation: "Your home address and phone number are personal identifiers that could allow strangers to locate or contact you.",
  },
  {
    id: "tq-4",
    question: "What should you do if an unknown user messages you asking for your school location in exchange for free game currency?",
    options: [
      "Send them your school location right away",
      "Ask them for more currency first",
      "Block the user, refuse to share info, and notify a trusted parent or guardian",
      "Give them a fake school name and continue talking",
    ],
    correctIndex: 2,
    explanation: "Strangers offering gifts for personal info are untrustworthy. Blocking and telling an adult is the safest action.",
  },
  {
    id: "tq-5",
    question: "What is the core mission of a Nyrava Guardian?",
    options: [
      "To insult players who lose games",
      "To protect digital identity, build safely, and help others online",
      "To share all passwords with online friends",
      "To click on every free link on social media",
    ],
    correctIndex: 1,
    explanation: "Nyrava Guardians stand for critical thinking, digital privacy, kind communication, and safe creation.",
  },
];

export function GuardianTowerChallengeModal({
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

  const currentQ = TOWER_QUESTIONS[currentIndex]!;
  const selectedIndex = answers[currentQ.id];
  const hasAnswered = selectedIndex !== undefined;
  const isCorrect = selectedIndex === currentQ.correctIndex;

  const handleSelect = (optionIdx: number) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optionIdx }));
  };

  const handleNext = () => {
    if (currentIndex < TOWER_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    TOWER_QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    return Math.round((correct / TOWER_QUESTIONS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 80;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-400/40 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
              <Trophy className="size-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Guardian Tower Challenge</h2>
              <p className="text-xs text-slate-400">Central Nyrava Tower • Climax Assessment</p>
            </div>
          </div>
          <span className="rounded-full bg-cyan-950 px-3 py-1 text-xs font-black text-cyan-300 border border-cyan-500/40">
            Question {currentIndex + 1} of {TOWER_QUESTIONS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
              <p className="text-sm font-bold text-slate-100">{currentQ.question}</p>
            </div>

            <div className="space-y-2">
              {currentQ.options.map((optText, idx) => {
                let btnStyle = "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800";
                if (hasAnswered) {
                  if (idx === currentQ.correctIndex) {
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
                    className={`w-full justify-start text-left text-xs py-4 h-auto whitespace-normal ${btnStyle}`}
                  >
                    <span className="mr-2 font-mono font-black text-cyan-400">{String.fromCharCode(65 + idx)}.</span>
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

                <Button onClick={handleNext} className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black">
                  Next Challenge <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Trophy className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Central City Mastered!" : "Challenge Review Needed"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> on the Central Tower Challenge.
            </p>
            {passed && (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/50 p-4 space-y-2 text-center">
                <p className="text-xs font-black uppercase text-amber-300">🏆 Central City Mastered!</p>
                <p className="text-xs text-slate-200">+250 XP • +50 AI Builder Points • Central City Shield Badge Unlocked!</p>
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black">
              Complete World 1 Challenge
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
