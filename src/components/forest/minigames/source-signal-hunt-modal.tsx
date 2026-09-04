import { useState } from "react";
import { Search, ShieldAlert, CheckCircle, XCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SignalSource {
  id: string;
  title: string;
  author: string;
  date: string;
  claim: string;
  evidence: string;
  isTrustworthy: boolean;
  explanation: string;
  redFlags: string[];
}

const SOURCES: SignalSource[] = [
  {
    id: "src-1",
    title: "Nyrava Forest Ecosystem Study 2026",
    author: "Dr. Lex & Nyrava Botanical Research Institute",
    date: "August 2026",
    claim: "Cyan energy flow increases plant photosynthesis by 45%.",
    evidence: "Peer-reviewed lab trials across 12 botanical domes with controlled light data.",
    isTrustworthy: true,
    explanation: "Trustworthy source! Verified research institute, clear methodology, and recent published evidence.",
    redFlags: [],
  },
  {
    id: "src-2",
    title: "Anonymous Blog Post",
    author: "Unknown User @super_nature_guru",
    date: "No Date Listed",
    claim: "Drinking glowing blue river water turns your skin into pure gold!",
    evidence: "None. Author states 'Trust me, I tried it once!'",
    isTrustworthy: false,
    explanation: "Untrustworthy! Anonymous author, no date, zero scientific evidence, and absurd claims.",
    redFlags: ["Anonymous author", "No publication date", "Zero evidence", "Sensationalized claim"],
  },
  {
    id: "src-3",
    title: "Ancient Wisdom Forest Tree Logs",
    author: "Guardian Archival Records",
    date: "May 2026",
    claim: "Knowledge Seeds stabilize the central energy core during seasonal changes.",
    evidence: "Historical logs recorded over 50 solar cycles with sensor measurements.",
    isTrustworthy: true,
    explanation: "Reliable archive! Documented historical observations backed by multi-year sensor logs.",
    redFlags: [],
  },
];

export function SourceSignalHuntModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentSource = SOURCES[currentIndex]!;
  const hasAnswered = answers[currentSource.id] !== undefined;
  const userAnswer = answers[currentSource.id];
  const isCorrect = userAnswer === currentSource.isTrustworthy;

  const handleSelect = (userThinksTrustworthy: boolean) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [currentSource.id]: userThinksTrustworthy }));
  };

  const handleNext = () => {
    if (currentIndex < SOURCES.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    SOURCES.forEach((s) => {
      if (answers[s.id] === s.isTrustworthy) correct++;
    });
    return Math.round((correct / SOURCES.length) * 100);
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
      <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Search className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-300">Source Signal Hunt</h2>
              <p className="text-xs text-slate-400">Waterfall Archives • Source Verification</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Source {currentIndex + 1} of {SOURCES.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 font-mono text-[11px]">
                <span className="text-slate-400">Author: <strong className="text-slate-200">{currentSource.author}</strong></span>
                <span className="text-emerald-400 font-bold">{currentSource.date}</span>
              </div>
              <p className="font-bold text-sm text-slate-100">{currentSource.title}</p>
              <div className="rounded-xl bg-slate-950 p-3 space-y-1">
                <p className="text-cyan-300 font-bold">Claim: <span className="text-slate-200 font-normal">{currentSource.claim}</span></p>
                <p className="text-amber-300 font-bold">Evidence: <span className="text-slate-200 font-normal">{currentSource.evidence}</span></p>
              </div>
            </div>

            {!hasAnswered ? (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400 text-center">Is this source reliable and trustworthy?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSelect(true)}
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 font-bold text-xs py-5"
                  >
                    <CheckCircle className="size-4 mr-2" /> Reliable & Verified
                  </Button>
                  <Button
                    onClick={() => handleSelect(false)}
                    variant="outline"
                    className="border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 font-bold text-xs py-5"
                  >
                    <ShieldAlert className="size-4 mr-2" /> Untrustworthy / Red Flag
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{isCorrect ? "Correct Evaluation!" : "Evaluation Error"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{currentSource.explanation}</p>
                  {currentSource.redFlags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 pt-1">
                      {currentSource.redFlags.map((flag, idx) => (
                        <span key={idx} className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-500/30">
                          🚩 {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleNext} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
                  Next Source <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Source Analyst Verified!" : "Review Verification Steps"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-emerald-300">{score}%</strong> on source evaluation.
            </p>
            {passed && (
              <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
                +100 XP • +25 Nyrava AI Builder Points • Lex Friendship Up!
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
              Return to Wisdom Forest
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Hunt
        </Button>
      </div>
    </div>
  );
}
