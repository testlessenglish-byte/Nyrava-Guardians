import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Brain, Heart, Shield } from "lucide-react";
import { useState } from "react";
import {
  COSMETIC_SLOTS,
  GUARDIANS,
  GUARDIAN_IMAGES,
  resolveGuardian,
  resolveGuardianId,
} from "@/data/guardians";
import { GUARDIAN_STYLES } from "@/lib/guardian-colors";
import { useGuardian } from "@/lib/guardian-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/personalize")({
  head: () => ({
    meta: [
      { title: "Personalize Your Guardian — Nyrava Guardians" },
      {
        name: "description",
        content:
          "Name your Guardian, pick a look, and choose the core value that guides you: Protect, Think or Respect.",
      },
      { property: "og:title", content: "Personalize Your Guardian — Nyrava Guardians" },
      {
        property: "og:description",
        content: "Name your Guardian, pick a look, and choose the core value that guides you.",
      },
    ],
  }),
  component: PersonalizePage,
});

const VALUES = [
  { id: "protect", label: "Protect", icon: Shield, blurb: "Keep yourself and your friends safe." },
  { id: "think", label: "Think", icon: Brain, blurb: "Question everything. Find the truth." },
  { id: "respect", label: "Respect", icon: Heart, blurb: "Be kind in every signal you send." },
];

function PersonalizePage() {
  const { guardianId, guardianName, setGuardianName, cosmetics, setCosmetic } = useGuardian();
  const [value, setValue] = useState("protect");
  const navigate = useNavigate();

  if (!guardianId) {
    return (
      <div className="panel p-8 text-center">
        <h1 className="text-xl font-extrabold">No Guardian selected yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pick your Guardian first to start personalizing.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-xl bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
        >
          Choose a Guardian
        </Link>
      </div>
    );
  }

  const activeGuardianId = resolveGuardianId(guardianId);
  const guardian = resolveGuardian(activeGuardianId);
  const styles = GUARDIAN_STYLES[activeGuardianId];
  const visibleSlots = COSMETIC_SLOTS.filter((s) =>
    ["hair", "hair-color", "hoodie", "face-accessory"].includes(s.id),
  );

  return (
    <div className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-extrabold md:text-3xl">
          Make <span className={styles.text}>{guardian.name}</span> yours
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Step 2 of 2 — set your name, your look and your Guardian value.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Preview */}
        <div className="panel flex flex-col items-center p-5">
          <div
            className={cn(
              "flex h-48 w-full items-end justify-center overflow-hidden rounded-2xl border",
              styles.bg,
              styles.border,
            )}
          >
            <img
              src={GUARDIAN_IMAGES[activeGuardianId]}
              alt={`${guardian.name} preview`}
              className="h-full object-contain object-bottom"
            />
          </div>
          <p className={cn("mt-3 text-lg font-extrabold", styles.text)}>
            {guardianName || guardian.name}
          </p>
          <p className="text-xs font-bold text-muted-foreground">{guardian.role}</p>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className="panel p-5">
            <label
              htmlFor="guardian-name"
              className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground"
            >
              Guardian name
            </label>
            <input
              id="guardian-name"
              value={guardianName}
              maxLength={16}
              onChange={(e) => setGuardianName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-input bg-background/60 px-4 py-2.5 text-sm font-bold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder="Enter your Guardian name"
            />
          </div>

          <div className="panel space-y-4 p-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Your look
            </p>
            {visibleSlots.map((slot) => (
              <div key={slot.id}>
                <p className="mb-2 text-xs font-bold">{slot.label}</p>
                <div className="flex flex-wrap gap-2">
                  {slot.options.map((opt) => {
                    const active = cosmetics[slot.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setCosmetic(slot.id, opt.id)}
                        aria-pressed={active}
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold transition",
                          active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: opt.swatch }}
                        />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="panel p-5">
            <p className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Choose your Guardian value
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {VALUES.map(({ id, label, icon: Icon, blurb }) => (
                <button
                  key={id}
                  onClick={() => setValue(id)}
                  aria-pressed={value === id}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    value === id
                      ? "border-primary bg-primary/10 glow-primary"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5",
                      value === id ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <p className="mt-2 text-sm font-extrabold">{label}</p>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{blurb}</p>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => void navigate({ to: "/home" })}
            className="glow-primary flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-extrabold uppercase tracking-wider text-primary-foreground transition hover:brightness-110"
          >
            Enter Nyrava
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
