import React, { useEffect, useRef } from "react";
import { NyravaShieldSvg } from "./NyravaShieldSvg";
import { type ShieldDefinition } from "@/domain/progression/badge-evaluator";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy, X } from "lucide-react";

export interface ShieldCelebrationModalProps {
  shield: ShieldDefinition | null;
  onClose: () => void;
}

export const ShieldCelebrationModal: React.FC<ShieldCelebrationModalProps> = ({ shield, onClose }) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mediaQuery.addEventListener("change", handler);

    // Focus close button for screen reader & keyboard accessibility
    closeButtonRef.current?.focus();

    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!shield) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-desc"
    >
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-b from-card via-card to-background p-6 text-center shadow-2xl transition-all ${
          reducedMotion ? "" : "animate-in fade-in zoom-in-90 duration-300"
        }`}
      >
        {/* Explicit Accessible Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close celebration modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Celebration Header */}
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-black uppercase text-amber-300">
          <Trophy className="h-4 w-4" /> New Shield Unlocked!
        </div>

        {/* Shield Visual Canvas Container (object-fit: contain) */}
        <div className="my-6 mx-auto flex h-48 w-48 items-center justify-center p-2">
          <NyravaShieldSvg level={shield.level} size={200} showAura={!reducedMotion} />
        </div>

        {/* Level & Name */}
        <h2 id="celebration-title" className="text-2xl font-black text-foreground">
          Level {shield.level}: {shield.name.en}
        </h2>

        {/* Description */}
        <p id="celebration-desc" className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {shield.description.en}
        </p>

        {/* Perk Label */}
        <div className="mt-4 rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-3 text-xs font-bold text-cyan-200">
          <Sparkles className="inline h-4 w-4 mr-1.5 text-cyan-300" />
          Unlocked Perk: {shield.perkLabel.en}
        </div>

        {/* Action Button */}
        <Button onClick={onClose} className="mt-6 h-11 w-full font-black text-sm shadow-lg">
          Equip & Continue Learning
        </Button>
      </div>
    </div>
  );
};
