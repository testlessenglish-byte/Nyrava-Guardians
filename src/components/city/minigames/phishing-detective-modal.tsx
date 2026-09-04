import { useState } from "react";
import { AlertTriangle, CheckCircle, ShieldAlert, XCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PhishingScenario {
  id: string;
  type: "email" | "sms" | "social";
  sender: string;
  subject?: string;
  message: string;
  linkText?: string;
  isPhishing: boolean;
  explanation: string;
  redFlags: string[];
}

const SCENARIOS: PhishingScenario[] = [
  {
    id: "phish-1",
    type: "email",
    sender: "security-alert@nyrava-login-verify.com",
    subject: "URGENT: Your Nyrava Guardian account is locked!",
    message: "We detected suspicious activity on your account. Click below to verify your password within 12 hours or your account will be deleted permanently!",
    linkText: "http://nyrava-login-verify.com/reset-pass",
    isPhishing: true,
    explanation: "This is a phishing attempt! Look at the fake domain 'nyrava-login-verify.com' and the urgent threat of account deletion.",
    redFlags: ["Fake domain name", "Urgent time pressure", "Asking for password"],
  },
  {
    id: "phish-2",
    type: "sms",
    sender: "+1 (555) 019-2834",
    message: "Congrats! You won 5,000 free Nyrava AI Builder Points! Click bit.ly/free-points-now to claim your reward!",
    linkText: "bit.ly/free-points-now",
    isPhishing: true,
    explanation: "Too good to be true! Official Nyrava points are earned through course progress, never awarded via random SMS shortlinks.",
    redFlags: ["Unknown SMS sender", "Unsolicited reward", "Shortened suspicious link"],
  },
  {
    id: "phish-3",
    type: "email",
    sender: "support@nyravaguardians.org",
    subject: "Weekly Guardian Learning Digest",
    message: "Hi Guardian! You completed 3 lessons this week and earned the Basic Shield. Keep up the great work in Central City!",
    isPhishing: false,
    explanation: "This is a legitimate email from the official support@nyravaguardians.org domain with no suspicious links or urgent demands.",
    redFlags: [],
  },
];

export function PhishingDetectiveModal({
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

  const scenario = SCENARIOS[currentIndex]!;
  const hasAnswered = answers[scenario.id] !== undefined;
  const userAnswer = answers[scenario.id];
  const isCorrect = userAnswer === scenario.isPhishing;

  const handleSelect = (userThinksPhishing: boolean) => {
    if (hasAnswered) return;
    setAnswers((prev) => ({ ...prev, [scenario.id]: userThinksPhishing }));
  };

  const handleNext = () => {
    if (currentIndex < SCENARIOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    SCENARIOS.forEach((s) => {
      if (answers[s.id] === s.isPhishing) correct++;
    });
    return Math.round((correct / SCENARIOS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 66;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    // Reset state
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Phishing Detective</h2>
              <p className="text-xs text-slate-400">Digital Safety Training District</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Case {currentIndex + 1} of {SCENARIOS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            {/* Message Box */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 font-mono text-[11px]">
                <span className="text-slate-400">From: <strong className="text-slate-200">{scenario.sender}</strong></span>
                <span className="text-cyan-400 uppercase font-black">{scenario.type}</span>
              </div>
              {scenario.subject && (
                <p className="font-bold text-sm text-slate-100">{scenario.subject}</p>
              )}
              <p className="text-slate-300 leading-relaxed font-medium">{scenario.message}</p>
              {scenario.linkText && (
                <div className="rounded-lg bg-slate-950 p-2 text-cyan-400 font-mono text-xs underline truncate">
                  🔗 {scenario.linkText}
                </div>
              )}
            </div>

            {/* Answer Controls */}
            {!hasAnswered ? (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400 text-center">Is this message safe or a phishing scam?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSelect(false)}
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 font-bold text-xs py-5"
                  >
                    <CheckCircle className="size-4 mr-2" /> Safe & Legitimate
                  </Button>
                  <Button
                    onClick={() => handleSelect(true)}
                    variant="outline"
                    className="border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 font-bold text-xs py-5"
                  >
                    <AlertTriangle className="size-4 mr-2" /> Phishing Scam!
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{isCorrect ? "Correct Identification!" : "Oops! Missed Red Flag"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{scenario.explanation}</p>
                  {scenario.redFlags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2 pt-1">
                      {scenario.redFlags.map((flag, idx) => (
                        <span key={idx} className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                          🚩 {flag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  Next Case <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Result Screen */
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Detective Case Solved!" : "Keep Training, Detective!"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> accuracy on phishing detection.
            </p>
            {passed && (
              <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
                +100 XP • +25 Nyrava AI Builder Points Awarded
              </div>
            )}
            <Button onClick={handleFinish} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
              Return to Central City
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Simulation
        </Button>
      </div>
    </div>
  );
}
