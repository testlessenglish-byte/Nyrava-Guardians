import { useState } from "react";
import { ShieldCheck, Lock, Globe, Award, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DataItem {
  id: string;
  label: string;
  isPrivate: boolean;
  category: string;
  explanation: string;
}

const DATA_ITEMS: DataItem[] = [
  {
    id: "item-1",
    label: "Home Address & Phone Number",
    isPrivate: true,
    category: "Personal Identity",
    explanation: "Never post your home address or phone number online. Strangers can locate you or contact you without your permission.",
  },
  {
    id: "item-2",
    label: "Favorite Video Game & Character",
    isPrivate: false,
    category: "Interests & Hobbies",
    explanation: "Sharing your favorite games, movies, or hobbies is safe and fun to talk about with online friends!",
  },
  {
    id: "item-[#",
    label: "Account Password & Passcodes",
    isPrivate: true,
    category: "Security Credentials",
    explanation: "Keep all passwords 100% secret! Not even best friends should know your passwords.",
  },
  {
    id: "item-4",
    label: "Guardian Superhero Nickname",
    isPrivate: false,
    category: "Avatar Info",
    explanation: "Using an avatar nickname instead of your real full legal name is a great way to stay safe online.",
  },
  {
    id: "item-5",
    label: "School Name & Classroom Number",
    isPrivate: true,
    category: "Location Info",
    explanation: "Your school and daily schedule are private location data. Keep them off public social profiles.",
  },
];

export function PrivacySortModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sorts, setSorts] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentItem = DATA_ITEMS[currentIndex]!;
  const hasSorted = sorts[currentItem.id] !== undefined;
  const userChoice = sorts[currentItem.id];
  const isCorrect = userChoice === currentItem.isPrivate;

  const handleSort = (userThinksPrivate: boolean) => {
    if (hasSorted) return;
    setSorts((prev) => ({ ...prev, [currentItem.id]: userThinksPrivate }));
  };

  const handleNext = () => {
    if (currentIndex < DATA_ITEMS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    DATA_ITEMS.forEach((item) => {
      if (sorts[item.id] === item.isPrivate) correct++;
    });
    return Math.round((correct / DATA_ITEMS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 80;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    setCurrentIndex(0);
    setSorts({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Privacy Sort Station</h2>
              <p className="text-xs text-slate-400">Builder Lab District • Data Shielding</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Item {currentIndex + 1} of {DATA_ITEMS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-6 text-center space-y-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase text-cyan-400 border border-cyan-500/30">
                {currentItem.category}
              </span>
              <h3 className="text-lg font-black text-white pt-2">{currentItem.label}</h3>
            </div>

            {!hasSorted ? (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-400 text-center">Where does this information belong?</p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSort(false)}
                    variant="outline"
                    className="border-emerald-500/40 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/50 font-bold text-xs py-5"
                  >
                    <Globe className="size-4 mr-2" /> Public (Okay to Share)
                  </Button>
                  <Button
                    onClick={() => handleSort(true)}
                    variant="outline"
                    className="border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 font-bold text-xs py-5"
                  >
                    <Lock className="size-4 mr-2" /> Private (Keep Secret)
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${isCorrect ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {isCorrect ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{isCorrect ? "Correct Classification!" : "Incorrect Sorting"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{currentItem.explanation}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  Next Item <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Privacy Master!" : "Review Privacy Basics"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> on data classification.
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
          Close Station
        </Button>
      </div>
    </div>
  );
}
