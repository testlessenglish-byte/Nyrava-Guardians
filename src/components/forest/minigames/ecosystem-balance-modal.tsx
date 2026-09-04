import { useState } from "react";
import { Leaf, Sun, Droplets, Bird, CheckCircle, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EcosystemBalanceModal({
  isOpen,
  onClose,
  onComplete,
}: {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (score: number, passed: boolean) => void;
}) {
  const [sunlight, setSunlight] = useState(50);
  const [water, setWater] = useState(50);
  const [plants, setPlants] = useState(50);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const isBalanced = sunlight >= 40 && sunlight <= 70 && water >= 40 && water <= 70 && plants >= 40 && plants <= 70;
  const score = isBalanced ? 100 : 40;

  const handleBalanceCheck = () => {
    if (isBalanced) {
      setCompleted(true);
      onComplete(100, true);
    }
  };

  const handleFinish = () => {
    onClose();
    setCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl border border-emerald-500/30 bg-slate-950 p-6 space-y-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-300">Ecosystem Balance Simulator</h2>
              <p className="text-xs text-slate-400">Ecosystem Gardens • Habitat Restoration</p>
            </div>
          </div>
        </div>

        {!completed ? (
          <div className="space-y-5">
            <p className="text-xs text-slate-300 text-center font-medium">
              Adjust the environmental resources so all parameters stay within the optimal green zone (40% - 70%) to restore the Botanical Dome!
            </p>

            <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              {/* Sunlight Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-amber-300"><Sun className="size-4" /> Sunlight Exposure</span>
                  <span className="font-mono text-cyan-300">{sunlight}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sunlight}
                  onChange={(e) => setSunlight(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Water Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-cyan-300"><Droplets className="size-4" /> Water Supply</span>
                  <span className="font-mono text-cyan-300">{water}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={water}
                  onChange={(e) => setWater(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Plants Density Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-300"><Leaf className="size-4" /> Plant Density</span>
                  <span className="font-mono text-cyan-300">{plants}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={plants}
                  onChange={(e) => setPlants(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            <div className={`rounded-2xl p-4 border text-center text-xs font-bold ${isBalanced ? "border-emerald-500/40 bg-emerald-950/60 text-emerald-300" : "border-amber-500/40 bg-amber-950/60 text-amber-300"}`}>
              {isBalanced ? "🌱 Ecosystem is Perfectly Balanced!" : "⚠️ Imbalance detected: Keep all levels between 40% and 70%!"}
            </div>

            <Button
              onClick={handleBalanceCheck}
              disabled={!isBalanced}
              className={`w-full font-black ${isBalanced ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950" : "bg-slate-800 text-slate-500"}`}
            >
              Restore Botanical Dome
            </Button>
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Award className="size-10" />
            </div>
            <h3 className="text-2xl font-black text-white">Botanical Habitat Restored!</h3>
            <p className="text-sm text-slate-300">
              The Ecosystem Dome is thriving with life, flowers, and wildlife!
            </p>
            <div className="inline-block rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300">
              +100 XP • +25 Nyrava AI Builder Points
            </div>
            <Button onClick={handleFinish} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black">
              Return to Wisdom Forest
            </Button>
          </div>
        )}

        <Button onClick={onClose} variant="ghost" className="w-full text-slate-400 text-xs">
          Close Simulator
        </Button>
      </div>
    </div>
  );
}
