import { useState } from "react";
import { MessageSquare, Heart, Shield, Award, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface MessageChoice {
  id: string;
  text: string;
  isBest: boolean;
  feedback: string;
}

export interface MessagingScenario {
  id: string;
  sender: string;
  incomingText: string;
  choices: MessageChoice[];
}

const MESSAGING_SCENARIOS: MessagingScenario[] = [
  {
    id: "msg-1",
    sender: "Online Game Teammate",
    incomingText: "You made us lose that round! You're terrible at this game!",
    choices: [
      {
        id: "c1",
        text: "Insult them back: 'You're the worst player ever!'",
        isBest: false,
        feedback: "Escalating insults creates more negativity. Take a breath and focus on sportsmanship or mute rude players.",
      },
      {
        id: "c2",
        text: "Respond calmly: 'It's just a game. Let's try again or I'll mute the chat.'",
        isBest: true,
        feedback: "Great job! Staying calm and setting boundaries keeps online gaming friendly and safe.",
      },
      {
        id: "c3",
        text: "Give them your real address to fight in person",
        isBest: false,
        feedback: "Never share private real-world location information over a game conflict!",
      },
    ],
  },
  {
    id: "msg-2",
    sender: "Unknown Gamer in DMs",
    incomingText: "Hey! I can give you free rare skins if you tell me your full name and mom's email!",
    choices: [
      {
        id: "c1",
        text: "Send them your mom's email immediately",
        isBest: false,
        feedback: "Strangers offering free gifts in exchange for private info are running scams!",
      },
      {
        id: "c2",
        text: "Ignore, block the user, and inform a parent or guardian",
        isBest: true,
        feedback: "Perfect response! Blocking strangers asking for parent info protects your family.",
      },
    ],
  },
];

export function SafeMessagingModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentScenario = MESSAGING_SCENARIOS[currentIndex]!;
  const selectedId = selectedChoices[currentScenario.id];
  const chosenOption = currentScenario.choices.find((c) => c.id === selectedId);

  const handleSelect = (choiceId: string) => {
    if (selectedId) return;
    setSelectedChoices((prev) => ({ ...prev, [currentScenario.id]: choiceId }));
  };

  const handleNext = () => {
    if (currentIndex < MESSAGING_SCENARIOS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    MESSAGING_SCENARIOS.forEach((scenario) => {
      const userChoiceId = selectedChoices[scenario.id];
      const opt = scenario.choices.find((c) => c.id === userChoiceId);
      if (opt?.isBest) correct++;
    });
    return Math.round((correct / MESSAGING_SCENARIOS.length) * 100);
  };

  const score = showResult ? calculateScore() : 0;
  const passed = score >= 50;

  const handleFinish = () => {
    onComplete(score, passed);
    onClose();
    setCurrentIndex(0);
    setSelectedChoices({});
    setShowResult(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-300">Safe Messaging Dialogue</h2>
              <p className="text-xs text-slate-400">Guardian Gardens • Kindness & Respect</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-slate-300 border border-slate-800">
            Scenario {currentIndex + 1} of {MESSAGING_SCENARIOS.length}
          </span>
        </div>

        {!showResult ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-2 text-xs">
              <span className="text-slate-400 font-mono">Incoming DM from: <strong className="text-cyan-300">{currentScenario.sender}</strong></span>
              <p className="rounded-xl bg-slate-950 p-3 text-slate-200 font-bold">{currentScenario.incomingText}</p>
            </div>

            {!chosenOption ? (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400">How should a Guardian respond?</p>
                <div className="space-y-2">
                  {currentScenario.choices.map((choice) => (
                    <Button
                      key={choice.id}
                      onClick={() => handleSelect(choice.id)}
                      variant="outline"
                      className="w-full justify-start text-left border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs py-4 h-auto whitespace-normal"
                    >
                      {choice.text}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className={`rounded-2xl p-4 border ${chosenOption.isBest ? "border-emerald-500/40 bg-emerald-950/50 text-emerald-300" : "border-rose-500/40 bg-rose-950/50 text-rose-300"}`}>
                  <div className="flex items-center gap-2 font-black text-sm">
                    {chosenOption.isBest ? <CheckCircle className="size-5" /> : <XCircle className="size-5" />}
                    <span>{chosenOption.isBest ? "Wise Guardian Choice!" : "Needs Improvement"}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-200">{chosenOption.feedback}</p>
                </div>

                <Button onClick={handleNext} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black">
                  Next Scenario <ArrowRight className="size-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">{passed ? "Digital Ambassador!" : "Practice Kindness"}</h3>
            <p className="text-sm text-slate-300">
              You scored <strong className="text-cyan-300">{score}%</strong> on message choices.
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
          Close Dialogue
        </Button>
      </div>
    </div>
  );
}
