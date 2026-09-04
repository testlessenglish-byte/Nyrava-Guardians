import React, { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { NyravaShieldSvg } from "@/components/badges/NyravaShieldSvg";
import {
  DEFAULT_SHIELD_DEFINITIONS,
  evalLearnerShieldProgression,
  type ShieldDefinition,
  type ShieldProgressionSummary,
} from "@/domain/progression/badge-evaluator";
import { getLearnerBadgeJourneyService } from "@/lib/badge-progression.functions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, CheckCircle2, Lock, Shield, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/badges")({
  head: () => ({
    meta: [
      { title: "Shield Journey — Nyrava Guardians" },
      { name: "description", content: "Explore your 7-level shield progression journey and unlocked guardian perks." },
    ],
  }),
  component: ShieldJourneyPage,
});

function ShieldJourneyPage() {
  const fetchJourney = useServerFn(getLearnerBadgeJourneyService);
  const [summary, setSummary] = useState<ShieldProgressionSummary | null>(null);
  const [selectedShield, setSelectedShield] = useState<ShieldDefinition | null>(null);
  const [loading, setLoading] = useState(true);

  const learnerUserId = "usr_child_1";

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchJourney({ learnerUserId });
        if (res.summary) {
          setSummary(res.summary);
        }
      } catch {
        // Fallback default eval if server call unavailable
        setSummary(evalLearnerShieldProgression(0, false, [], DEFAULT_SHIELD_DEFINITIONS));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  if (loading) {
    return (
      <div className="panel mx-auto max-w-4xl p-8 text-center" aria-live="polite">
        Loading Shield Journey…
      </div>
    );
  }

  const currentLevel = summary?.currentLevel ?? 0;

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      {/* Header Banner */}
      <header className="overflow-hidden rounded-3xl border border-cyan-400/30 bg-gradient-to-r from-cyan-950/40 via-background to-violet-950/30 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 text-xs font-bold text-muted-foreground">
              <Link to="/classroom"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Return to Classroom</Link>
            </Button>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
              <Shield className="h-7 w-7 text-cyan-300" /> Nyrava Shield Journey
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Your shield evolves as you learn, complete classes, and demonstrate digital safety mastery.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">Active Shield</span>
            <div className="text-lg font-black text-amber-200">
              {currentLevel > 0 ? `Level ${currentLevel}: ${summary?.currentShield?.name.en}` : "No Shield Earned"}
            </div>
          </div>
        </div>

        {/* Dynamic Progress Callout */}
        {summary && (
          <div className="mt-6 rounded-2xl border border-cyan-400/25 bg-cyan-950/30 p-4 text-xs font-bold text-cyan-200 flex items-center gap-3">
            <Sparkles className="h-5 w-5 shrink-0 text-cyan-300" />
            <div>
              <div>{summary.calloutMessage.en}</div>
              <div className="mt-1 text-[11px] font-normal text-muted-foreground">
                Total Classes Completed: <span className="font-bold text-foreground">{summary.totalCompletedClasses}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 7-Level Shield Progression Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-foreground flex items-center gap-2">
          <Award className="h-5 w-5 text-violet-400" /> 7 Evolution Shield Levels
        </h2>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {DEFAULT_SHIELD_DEFINITIONS.map((def) => {
            const activeRecord = summary?.activeBadges.find((b) => b.badgeId === def.id);
            const isEarned = Boolean(activeRecord);
            const isCurrent = summary?.currentShield?.id === def.id;
            const isNext = summary?.nextShield?.id === def.id;

            let statusLabel = "Locked";
            let statusBadgeClass = "border-muted bg-muted/40 text-muted-foreground";

            if (isCurrent) {
              statusLabel = "Current Shield";
              statusBadgeClass = "border-cyan-400/50 bg-cyan-400/20 text-cyan-200 font-black";
            } else if (isEarned) {
              statusLabel = "Earned";
              statusBadgeClass = "border-emerald-400/40 bg-emerald-400/10 text-emerald-300 font-bold";
            } else if (isNext) {
              statusLabel = "In Progress";
              statusBadgeClass = "border-amber-400/40 bg-amber-400/10 text-amber-300 font-bold";
            }

            return (
              <Card
                key={def.id}
                onClick={() => setSelectedShield(def)}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  isCurrent
                    ? "border-cyan-400/50 bg-gradient-to-b from-cyan-950/30 to-card shadow-xl"
                    : isEarned
                    ? "border-emerald-400/30 bg-card/90"
                    : "border-border/60 bg-card/40 opacity-80 hover:opacity-100"
                }`}
              >
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Level {def.level}
                  </span>
                  <Badge variant="outline" className={statusBadgeClass}>
                    {isEarned ? <CheckCircle2 className="mr-1 h-3 w-3" /> : <Lock className="mr-1 h-3 w-3" />}
                    {statusLabel}
                  </Badge>
                </CardHeader>

                <CardContent className="p-4 pt-0 text-center space-y-3">
                  {/* Standalone Canvas (object-fit: contain) */}
                  <div className="mx-auto flex h-36 w-36 items-center justify-center p-2">
                    <NyravaShieldSvg level={def.level} size={140} />
                  </div>

                  <div>
                    <CardTitle className="text-base font-black text-foreground">{def.name.en}</CardTitle>
                    <CardDescription className="mt-1 text-xs line-clamp-2">{def.description.en}</CardDescription>
                  </div>

                  <div className="rounded-xl border border-border/50 bg-muted/20 p-2 text-[11px] font-medium text-muted-foreground">
                    Requirement: <span className="font-bold text-foreground">{def.requiredCompletedClasses} Class{def.requiredCompletedClasses > 1 ? "es" : ""}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Selected Shield Detail Modal */}
      {selectedShield && (
        <Dialog open={true} onOpenChange={() => setSelectedShield(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-foreground flex items-center gap-2">
                Level {selectedShield.level}: {selectedShield.name.en}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedShield.description.en}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="mx-auto flex h-44 w-44 items-center justify-center p-2">
                <NyravaShieldSvg level={selectedShield.level} size={180} />
              </div>

              {/* Stats Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <div className="rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-2.5 text-cyan-200">
                  🛡️ Defense: <span className="float-right font-black">{selectedShield.stats.defense}</span>
                </div>
                <div className="rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-2.5 text-emerald-200">
                  👁️ Safety: <span className="float-right font-black">{selectedShield.stats.safety}</span>
                </div>
                <div className="rounded-xl border border-amber-400/30 bg-amber-950/20 p-2.5 text-amber-200">
                  ⚡ Threat: <span className="float-right font-black">{selectedShield.stats.threat}</span>
                </div>
                <div className="rounded-xl border border-violet-400/30 bg-violet-950/20 p-2.5 text-violet-200">
                  ❤️ Courage: <span className="float-right font-black">{selectedShield.stats.courage}</span>
                </div>
              </div>

              {/* Perk Description */}
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-xs">
                <div className="font-bold text-foreground">Unlocked Perk</div>
                <div className="mt-1 font-semibold text-muted-foreground">{selectedShield.perkLabel.en}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
