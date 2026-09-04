import { useState } from "react";
import { Bot, Sparkles, AlertCircle, CheckCircle, Coins } from "lucide-react";
import { BUILDABLE_ZONES, type BuildableZoneId, GUARDIAN_TIERS, type GuardianTier } from "@/domain/realm/realm-types";
import { Button } from "@/components/ui/button";

export function RealmAiBuilderDrawer({
  open,
  onClose,
  selectedZoneId,
  userPoints,
  userTier,
  onConfirmBuild,
}: {
  open: boolean;
  onClose: () => void;
  selectedZoneId: BuildableZoneId | null;
  userPoints: number;
  userTier: GuardianTier;
  onConfirmBuild: (data: { kind: string; name: string; zoneId: BuildableZoneId; cost: number }) => Promise<void>;
}) {
  const [prompt, setPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [proposedBuild, setProposedBuild] = useState<{
    kind: string;
    name: string;
    zoneId: BuildableZoneId;
    cost: number;
    description: string;
  } | null>(null);

  if (!open) return null;

  const targetZone = BUILDABLE_ZONES.find((z) => z.id === (selectedZoneId || "waterfall-clearing")) || BUILDABLE_ZONES[0]!;
  const isUnlocked = targetZone.requiredTier <= userTier;

  const handleAnalyzePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !isUnlocked) return;

    setAnalyzing(true);
    setTimeout(() => {
      let cost = 100;
      let kind = "tree-house";
      let name = "Tree House Haven";

      const lower = prompt.toLowerCase();
      if (lower.includes("workshop") || lower.includes("taller")) {
        kind = "guardian-workshop";
        name = "Guardian Tech Workshop";
        cost = 150;
      } else if (lower.includes("scanner") || lower.includes("shield") || lower.includes("escudo")) {
        kind = "privacy-scanner";
        name = "Privacy Shield Scanner";
        cost = 120;
      } else if (lower.includes("lab") || lower.includes("ai")) {
        kind = "ai-lab";
        name = "AI Learning Station";
        cost = 200;
      } else if (lower.includes("tower") || lower.includes("torre")) {
        kind = "security-tower";
        name = "Guardian Security Tower";
        cost = 180;
      } else if (lower.includes("bridge") || lower.includes("puente")) {
        kind = "wooden-bridge";
        name = "Wooden Eco Bridge";
        cost = 80;
      }

      setProposedBuild({
        kind,
        name,
        zoneId: targetZone.id,
        cost,
        description: `Your custom ${name} in ${targetZone.name}.`,
      });
      setAnalyzing(false);
    }, 600);
  };

  const handleExecuteBuild = async () => {
    if (!proposedBuild) return;
    try {
      await onConfirmBuild({
        kind: proposedBuild.kind,
        name: proposedBuild.name,
        zoneId: proposedBuild.zoneId,
        cost: proposedBuild.cost,
      });
      setProposedBuild(null);
      setPrompt("");
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-900/95 p-6 text-slate-100 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-cyan-400/40 bg-cyan-950/80">
              <Bot className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-xl font-black text-cyan-400">AI Realm Builder</h2>
              <p className="text-xs text-cyan-200/70">Target: {targetZone.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-950/60 px-3 py-1 text-xs font-black text-amber-300">
              <Coins className="h-3.5 w-3.5" />
              <span>{userPoints} pts</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700"
            >
              ✕
            </button>
          </div>
        </div>

        {!isUnlocked ? (
          <div className="my-6 rounded-2xl border border-amber-500/30 bg-amber-950/40 p-4 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">Zone Locked</h3>
            <p className="mt-1 text-xs text-amber-200/80">
              This zone requires {GUARDIAN_TIERS[targetZone.requiredTier].title} (Tier {targetZone.requiredTier}). Keep learning to earn XP and level up!
            </p>
          </div>
        ) : (
          <>
            <form onSubmit={handleAnalyzePrompt} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-300">
                  What would you like to build in your Realm?
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Build me a tree house near the waterfall"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={analyzing || !prompt.trim()}
                  className="gap-2 rounded-xl bg-cyan-400 text-xs font-black text-slate-950 hover:bg-cyan-300"
                >
                  <Sparkles className="h-4 w-4" />
                  {analyzing ? "Analyzing..." : "Propose Structure"}
                </Button>
              </div>
            </form>

            {proposedBuild && (
              <div className="mt-6 rounded-2xl border border-cyan-400/40 bg-slate-950/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-black text-cyan-300">{proposedBuild.name}</span>
                  </div>
                  <span className="text-xs font-black text-amber-300">{proposedBuild.cost} Guardian Points</span>
                </div>

                <p className="text-xs text-slate-300">{proposedBuild.description}</p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400">
                    Remaining after build: {userPoints - proposedBuild.cost} pts
                  </span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setProposedBuild(null)}
                      variant="ghost"
                      className="text-xs text-slate-400"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleExecuteBuild}
                      disabled={userPoints < proposedBuild.cost}
                      className="rounded-xl bg-emerald-400 text-xs font-black text-slate-950 hover:bg-emerald-300"
                    >
                      Confirm & Place ({proposedBuild.cost} pts)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
