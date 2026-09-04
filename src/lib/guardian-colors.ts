import type { GuardianId } from "@/types";

/**
 * Static class maps per guardian — Tailwind can't generate dynamic class
 * names, so every variant is written out in full.
 */
export const GUARDIAN_STYLES: Record<
  GuardianId,
  { text: string; bg: string; border: string; ring: string; badge: string }
> = {
  lex: {
    text: "text-guardian-lex",
    bg: "bg-guardian-lex/15",
    border: "border-guardian-lex/50",
    ring: "hover:border-guardian-lex",
    badge: "bg-guardian-lex/20 text-guardian-lex border-guardian-lex/40",
  },
  nova: {
    text: "text-guardian-nova",
    bg: "bg-guardian-nova/15",
    border: "border-guardian-nova/50",
    ring: "hover:border-guardian-nova",
    badge: "bg-guardian-nova/20 text-guardian-nova border-guardian-nova/40",
  },
  zoey: {
    text: "text-guardian-tess",
    bg: "bg-guardian-tess/15",
    border: "border-guardian-tess/50",
    ring: "hover:border-guardian-tess",
    badge: "bg-guardian-tess/20 text-guardian-tess border-guardian-tess/40",
  },
  jacob: {
    text: "text-guardian-byte",
    bg: "bg-guardian-byte/15",
    border: "border-guardian-byte/50",
    ring: "hover:border-guardian-byte",
    badge: "bg-guardian-byte/20 text-guardian-byte border-guardian-byte/40",
  },
  dayana: {
    text: "text-guardian-echo",
    bg: "bg-guardian-echo/15",
    border: "border-guardian-echo/50",
    ring: "hover:border-guardian-echo",
    badge: "bg-guardian-echo/20 text-guardian-echo border-guardian-echo/40",
  },
  sarah: {
    text: "text-sky-400",
    bg: "bg-sky-400/15",
    border: "border-sky-400/50",
    ring: "hover:border-sky-400",
    badge: "bg-sky-400/20 text-sky-400 border-sky-400/40",
  },
  tess: {
    text: "text-guardian-tess",
    bg: "bg-guardian-tess/15",
    border: "border-guardian-tess/50",
    ring: "hover:border-guardian-tess",
    badge: "bg-guardian-tess/20 text-guardian-tess border-guardian-tess/40",
  },
  byte: {
    text: "text-guardian-byte",
    bg: "bg-guardian-byte/15",
    border: "border-guardian-byte/50",
    ring: "hover:border-guardian-byte",
    badge: "bg-guardian-byte/20 text-guardian-byte border-guardian-byte/40",
  },
  echo: {
    text: "text-guardian-echo",
    bg: "bg-guardian-echo/15",
    border: "border-guardian-echo/50",
    ring: "hover:border-guardian-echo",
    badge: "bg-guardian-echo/20 text-guardian-echo border-guardian-echo/40",
  },
};
