import { useState } from "react";
import { KeyRound, ShieldCheck, ShieldAlert, Award, Lock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PasswordLabModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [inputPassword, setInputPassword] = useState("");
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  // Simple password strength calculation
  const hasLength = inputPassword.length >= 12;
  const hasUpper = /[A-Z]/.test(inputPassword);
  const hasLower = /[a-z]/.test(inputPassword);
  const hasNumber = /[0-9]/.test(inputPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(inputPassword);

  const criteriaMetCount = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  let strengthLabel = "Weak";
  let strengthColor = "text-rose-400 border-rose-500/40 bg-rose-950/40";
  let crackTime = "Instant";
  let score = 20;

  if (inputPassword.length === 0) {
    strengthLabel = "Empty";
    strengthColor = "text-slate-500 border-slate-800 bg-slate-900";
    crackTime = "0 seconds";
    score = 0;
  } else if (criteriaMetCount >= 5 && inputPassword.length >= 14) {
    strengthLabel = "Guardian Shield Level (Uncrackable)";
    strengthColor = "text-emerald-300 border-emerald-500/40 bg-emerald-950/60";
    crackTime = "4,000,000 Years";
    score = 100;
  } else if (criteriaMetCount >= 4) {
    strengthLabel = "Strong";
    strengthColor = "text-cyan-300 border-cyan-500/40 bg-cyan-950/60";
    crackTime = "850 Years";
    score = 85;
  } else if (criteriaMetCount >= 3) {
    strengthLabel = "Moderate";
    strengthColor = "text-amber-300 border-amber-500/40 bg-amber-950/60";
    crackTime = "3 Hours";
    score = 50;
  }

  const passed = score >= 85;

  const handleTestSubmit = () => {
    if (passed) {
      setCompleted(true);
      onComplete(score, true);
    }
  };

  const handleFinish = () => {
    onClose();
    setInputPassword("");
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KeyRound className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Password Power Lab</h2>
              <p className="text-xs text-slate-400">Academy District • Vault Defense</p>
            </div>
          </div>
        </div>

        {!completed ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
              <label className="block text-xs font-extrabold text-slate-300">
                Craft a Super-Passphrase to Defend the Vault:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="e.g. BlueDragon#Fly2026!"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-mono text-cyan-300 placeholder:text-slate-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Live Strength Feedback */}
              <div className={`rounded-xl border p-3 flex items-center justify-between text-xs font-bold ${strengthColor}`}>
                <span>Strength: {strengthLabel}</span>
                <span className="font-mono">Est. Crack Time: {crackTime}</span>
              </div>
            </div>

            {/* Checklist */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-2 text-xs">
              <p className="font-black text-slate-400">Vault Security Checklist:</p>
              <div className="grid grid-cols-2 gap-2 font-medium">
                <div className={`flex items-center gap-2 ${hasLength ? "text-emerald-400" : "text-slate-500"}`}>
                  {hasLength ? <Check className="size-4" /> : <Lock className="size-4" />} 12+ Characters
                </div>
                <div className={`flex items-center gap-2 ${hasUpper ? "text-emerald-400" : "text-slate-500"}`}>
                  {hasUpper ? <Check className="size-4" /> : <Lock className="size-4" />} Uppercase Letter (A-Z)
                </div>
                <div className={`flex items-center gap-2 ${hasLower ? "text-emerald-400" : "text-slate-500"}`}>
                  {hasLower ? <Check className="size-4" /> : <Lock className="size-4" />} Lowercase Letter (a-z)
                </div>
                <div className={`flex items-center gap-2 ${hasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                  {hasNumber ? <Check className="size-4" /> : <Lock className="size-4" />} Number (0-9)
                </div>
                <div className={`flex items-center justify-between col-span-2 ${hasSpecial ? "text-emerald-400" : "text-slate-500"}`}>
                  <span className="flex items-center gap-2">
                    {hasSpecial ? <Check className="size-4" /> : <Lock className="size-4" />} Special Symbol (!@#$)
                  </span>
                  <span className="text-[10px] text-slate-400">Tip: Combine 3 random words!</span>
                </div>
              </div>
            </div>

            <Button
              onClick={handleTestSubmit}
              disabled={!passed}
              className={`w-full font-black ${passed ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-500"}`}
            >
              {passed ? "Lock Vault with Password" : "Create Stronger Password"}
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Vault Shield Activated!</h3>
            <p className="text-sm text-slate-300">
              Your passphrase will take over <strong>4 Million Years</strong> to break!
            </p>
            <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
              +100 XP • +25 Nyrava AI Builder Points Awarded
            </div>
            <Button onClick={handleFinish} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
              Return to Central City
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Lab
        </Button>
      </div>
    </div>
  );
}
