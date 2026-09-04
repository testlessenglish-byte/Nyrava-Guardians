import { Link } from "@tanstack/react-router";
import { ArrowLeft, Lock, Sparkles, Shield, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WORLD_REGISTRY, type WorldSpec } from "@/domain/world/registry";

export function LockedWorldScreen({ worldId }: { worldId: string }) {
  const worldSpec = WORLD_REGISTRY[worldId] || {
    id: worldId,
    displayName: "Uncharted Realm",
    status: "coming_soon",
    requiredLevel: 2,
    requiredClasses: [],
    leadGuardian: "nova",
    description: "This ancient realm is currently hidden within the Nyrava mist.",
  };

  const isComingSoon = worldSpec.status === "coming_soon";

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="w-full max-w-xl rounded-3xl border border-cyan-500/30 bg-slate-900/90 p-8 text-center space-y-6 shadow-2xl backdrop-blur-md">
        {/* Status Badge Icon */}
        <div className="inline-flex size-20 items-center justify-center rounded-3xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-xl">
          {isComingSoon ? <Sparkles className="size-10 text-amber-400" /> : <Lock className="size-10 text-cyan-400" />}
        </div>

        <div className="space-y-2">
          <span className="rounded-full bg-cyan-950 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 border border-cyan-500/30">
            {isComingSoon ? "✨ World Coming Soon" : "🔒 World Locked"}
          </span>
          <h1 className="text-3xl font-black text-white pt-2">{worldSpec.displayName}</h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">{worldSpec.description}</p>
        </div>

        {/* Requirements Box */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-xs text-left">
          <p className="font-extrabold text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="size-4" /> Explorer Requirements:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-bold block">Guardian Level</span>
              <strong className="text-sm font-black text-cyan-300">Level {worldSpec.requiredLevel}+ Required</strong>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3">
              <span className="text-[10px] text-slate-400 font-bold block">Lead Guide</span>
              <strong className="text-sm font-black text-amber-300 uppercase">{worldSpec.leadGuardian}</strong>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Link to="/world">
            <Button size="lg" className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm py-6">
              <ArrowLeft className="size-5 mr-2" /> Return to Guardian World Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
