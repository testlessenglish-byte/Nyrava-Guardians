import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Brain, Code, Heart, Search, Shield, Sparkles } from "lucide-react";
import { Suspense } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { MasteryService } from "@/services/mock";

export const Route = createFileRoute("/core")({
  head: () => ({
    meta: [
      { title: "Intelligence Core — Nyrava Guardians" },
      {
        name: "description",
        content:
          "See your Guardian skill mastery grow: critical thinking, privacy, AI literacy, scam detection and cyber safety.",
      },
      { property: "og:title", content: "Intelligence Core — Nyrava Guardians" },
      {
        property: "og:description",
        content:
          "Track Guardian skill mastery across critical thinking, privacy, AI literacy and more.",
      },
    ],
  }),
  component: CorePage,
});

const VALUES = [
  { id: "protect", label: "Protect", icon: Shield, blurb: "Safety first, always." },
  { id: "think", label: "Think", icon: Brain, blurb: "Evidence before belief." },
  { id: "respect", label: "Respect", icon: Heart, blurb: "Kindness in every message." },
  { id: "create", label: "Create", icon: Code, blurb: "Build things that help people." },
  { id: "verify", label: "Verify", icon: Search, blurb: "Check it before you share it." },
  { id: "shine", label: "Shine", icon: Sparkles, blurb: "Your curiosity is a superpower." },
];

function CorePage() {
  return (
    <Suspense fallback={<div className="panel h-64 animate-pulse" />}>
      <CoreContent />
    </Suspense>
  );
}

function CoreContent() {
  const { data: masteries } = useSuspenseQuery({
    queryKey: ["masteries"],
    queryFn: () => MasteryService.listMasteries(),
  });
  const { data: achievements } = useSuspenseQuery({
    queryKey: ["achievements"],
    queryFn: () => MasteryService.listAchievements(),
  });

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-extrabold md:text-3xl">Intelligence Core</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The living record of your Guardian skills and values.
        </p>
      </header>

      {/* Masteries */}
      <section className="panel p-5">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
          Skill mastery
        </h2>
        <ul className="mt-4 space-y-4">
          {masteries.map((m) => (
            <li key={m.skillId}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-extrabold">{m.skillName}</p>
                <p className="text-xs font-bold text-muted-foreground">
                  {m.progress}% · {m.evidenceCount} proofs
                </p>
              </div>
              <ProgressBar value={m.progress} className="mt-2" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Last demonstrated {m.lastDemonstratedAt}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Guardian values */}
      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
          Guardian values
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {VALUES.map(({ id, label, icon: Icon, blurb }) => (
            <div key={id} className="panel p-4 text-center">
              <Icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-2 text-xs font-extrabold uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section>
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-muted-foreground">
          Achievements
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {achievements.map((a) => (
            <div key={a.id} className="panel p-4">
              <p className="text-sm font-extrabold text-primary">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
