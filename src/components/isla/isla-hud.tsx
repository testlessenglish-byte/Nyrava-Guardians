import { useEffect, useMemo, useRef, useState } from "react";
import { CRYSTALS, REGIONS, SECRETS, type Challenge } from "@/data/isla";
import { islaService } from "@/services/mock/isla";
import {
  activeCrystal,
  clearToast,
  collectCrystal,
  completeClass,
  islaControls,
  patchIsla,
  requestHint,
  useIsla,
  toggleIslaView,
} from "@/lib/isla-store";
import { ISLAND_RADIUS } from "@/lib/isla-terrain";
import { useGuardian } from "@/lib/guardian-context";
import {
  conversationalVoiceEngine,
  type ConversationState,
} from "@/services/ai/conversational-voice-engine";
import { CLASS_GUARDIANS } from "@/lib/class-guardians";
import { MessageCircle, Shield } from "lucide-react";
import { UI_STRINGS } from "@/data/bilingual-dictionary";
import { Globe, Mic, MicOff, Volume2, Sparkles, X } from "lucide-react";
import { recognitionConstructor } from "@/services/platform/device";
import { toast } from "sonner";
import { toggleGamePanel } from "@/services/game/panels";

const MAP = 200;

function MiniMap() {
  const state = useIsla();
  const pos = islaControls.player;

  function toMap(val: number) {
    return ((val + ISLAND_RADIUS) / (ISLAND_RADIUS * 2)) * MAP;
  }

  return (
    <svg
      viewBox={`0 0 ${MAP} ${MAP}`}
      aria-label="Island map"
      className="h-44 w-44 max-w-full rounded-3xl border border-white/20 bg-background/80 p-2 shadow-2xl backdrop-blur"
    >
      <circle
        cx={MAP / 2}
        cy={MAP / 2}
        r={MAP / 2 - 8}
        fill="#090d16"
        stroke="#38bdf8"
        strokeWidth={1}
      />
      {REGIONS.map((r) => {
        const discovered = state.visited.includes(r.id);
        const locked = (r.lock?.requires ?? 0) > state.crystals.length;
        return (
          <g key={r.id}>
            <circle
              cx={toMap(r.center[0])}
              cy={toMap(r.center[1])}
              r={(r.radius / ISLAND_RADIUS) * (MAP / 2 - 8)}
              fill={discovered ? r.accent : "#1e293b"}
              opacity={discovered ? 0.4 : 0.55}
              stroke={locked ? "#f87171" : r.accent}
              strokeWidth={1}
            />
            <text
              x={toMap(r.center[0])}
              y={toMap(r.center[1])}
              textAnchor="middle"
              fontSize="7"
              fill={discovered ? "#e2e8f0" : "#64748b"}
            >
              {locked ? "🔒" : discovered ? r.name.split(" ")[0] : "?"}
            </text>
          </g>
        );
      })}
      <circle
        cx={toMap(pos.x)}
        cy={toMap(pos.z)}
        r={4}
        fill="#f8fafc"
        stroke="#38bdf8"
        strokeWidth={2}
      />
    </svg>
  );
}

export function IslaHud({ guardianName }: { guardianName: string }) {
  const state = useIsla();
  const { locale, toggleLocale } = useGuardian();
  const target = activeCrystal();
  const hintLevel = target ? (state.hints[target.id] ?? 0) : 0;
  const [mapOpen, setMapOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);

  // Conversational Voice State
  const [voiceState, setVoiceState] = useState<ConversationState>("IDLE");
  const [guardianMessage, setGuardianMessage] = useState<string | null>(null);
  const [childTranscript, setChildTranscript] = useState<string>("");
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const unsubscribe = conversationalVoiceEngine.subscribe({
      onStateChange: (s) => {
        setVoiceState(s);
        if (!conversationalVoiceEngine.isEnabled()) setIsMuted(true);
      },
      onTranscript: (text) => setChildTranscript(text),
      onGuardianResponse: (text) => setGuardianMessage(text),
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const ui = UI_STRINGS[locale] ?? UI_STRINGS["en-US"];

  const nearGuardian = state.nearGuardian
    ? CLASS_GUARDIANS.find((g) => g.id === state.nearGuardian)
    : null;

  // Clear the conversation bubble shortly after leaving the guardian.
  useEffect(() => {
    if (state.nearGuardian) return;
    const t = setTimeout(() => setGuardianMessage(null), 2600);
    return () => clearTimeout(t);
  }, [state.nearGuardian]);

  const mission = useMemo(
    () => ({
      crystals: state.crystals.length,
      challenges: CRYSTALS.filter((c) => c.challenge && state.solved.includes(c.id)).length,
    }),
    [state.crystals, state.solved],
  );

  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(clearToast, 5200);
    return () => clearTimeout(t);
  }, [state.toast]);

  const challengeCrystal = CRYSTALS.find((c) => c.id === state.challengeFor);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 select-none">
      {/* Top Header Bar: Language Switcher, Voice Status & Mute Control */}
      <details
        className="isla-voice-menu game-panel"
        name="game-panels"
        onToggle={(e) => toggleGamePanel(e.currentTarget)}
      >
        <summary aria-label="Voice and language settings">Voice</summary>
        <div className="isla-voice-bar game-panel-content flex items-center gap-3 rounded-2xl border border-cyan-500/40 bg-slate-950/95 px-4 py-2 shadow-2xl">
          {/* Voice State Badge */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-900/90 px-3 py-1 border border-cyan-400/30">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                voiceState === "SPEAKING"
                  ? "bg-cyan-400 animate-ping"
                  : voiceState === "LISTENING"
                    ? "bg-emerald-400 animate-pulse"
                    : voiceState === "THINKING"
                      ? "bg-amber-400 animate-bounce"
                      : "bg-slate-500"
              }`}
            />
            <span className="text-xs font-extrabold tracking-wider text-cyan-200">
              {ui[voiceState.toLowerCase() as keyof typeof ui] || voiceState}
            </span>
          </div>

          {/* Language Switcher Button (EN | ES) */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-950/60 px-3 py-1 text-xs font-black text-cyan-100 transition hover:bg-cyan-900"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>{locale === "en-US" ? "EN | ES" : "ES | EN"}</span>
          </button>

          {/* Guardian voice mute. Microphone support is optional. */}
          <button
            type="button"
            aria-label={isMuted ? "Turn Guardian voice on" : "Mute Guardian voice"}
            aria-pressed={isMuted}
            onClick={() => {
              const muted = conversationalVoiceEngine.toggleMute();
              setIsMuted(muted);
              if (!muted && !recognitionConstructor()) {
                toast.info(
                  "Guardian voice is on. Microphone input is unavailable on this device, so you can use captions and text.",
                );
              }
            }}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-extrabold transition ${
              isMuted
                ? "border-red-500/50 bg-red-950/70 text-red-200"
                : "border-emerald-500/40 bg-emerald-950/60 text-emerald-200"
            }`}
          >
            {isMuted ? (
              <MicOff className="h-3.5 w-3.5 text-red-400" />
            ) : (
              <Mic className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span>{isMuted ? "Voice on" : "Mute voice"}</span>
          </button>
        </div>
      </details>

      {/* Talk prompt — the class/conversation starts ONLY when the student clicks this box (or presses E) */}
      {state.near?.kind === "journey" && (
        <div className="isla-talk-prompt pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              islaControls.interact = true;
            }}
            className="flex items-center gap-2 rounded-2xl border-2 border-amber-400/70 bg-slate-950/95 px-5 py-3 text-sm font-extrabold text-amber-200 shadow-2xl backdrop-blur-xl"
          >
            <Shield className="h-4 w-4" />{" "}
            {locale.startsWith("es") ? "Abrir Viaje Guardián" : "Open Guardian Journey"}
            <span className="keyboard-hint rounded-md border border-amber-400/40 px-1.5 py-0.5 text-[10px]">
              E
            </span>
          </button>
        </div>
      )}
      {nearGuardian && !guardianMessage && (
        <div className="isla-talk-prompt pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2">
          <button
            onClick={() => {
              islaControls.interact = true;
            }}
            className="flex items-center gap-2 rounded-2xl border-2 border-cyan-400/60 bg-slate-950/90 px-5 py-3 text-sm font-extrabold text-cyan-200 shadow-2xl backdrop-blur-xl transition hover:bg-cyan-950"
          >
            <MessageCircle className="h-4 w-4 text-cyan-400" />
            Talk to {nearGuardian.name} · start class
            <span className="keyboard-hint rounded-md border border-cyan-400/40 px-1.5 py-0.5 text-[10px] text-cyan-300">
              E
            </span>
          </button>
        </div>
      )}

      {/* Ongoing Guardian Conversational Overlay */}
      {guardianMessage && (
        <div className="isla-conversation pointer-events-auto absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xl p-4">
          <div className="flex flex-col gap-2 rounded-3xl border-2 border-cyan-400/60 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300">
                <Sparkles className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-xs font-black uppercase tracking-widest">{guardianName}</span>
              </div>
              <button
                aria-label="Close Guardian conversation"
                onClick={() => {
                  conversationalVoiceEngine.handleWalkAway();
                  setGuardianMessage(null);
                }}
                className="rounded-full p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">{guardianMessage}</p>
            {childTranscript && (
              <p className="text-xs font-medium text-cyan-300/80 italic">“{childTranscript}”</p>
            )}
          </div>
        </div>
      )}

      {/* mission panel */}
      <details
        className="isla-mission game-panel pointer-events-auto absolute left-4 top-24 w-[19rem] rounded-2xl border border-white/12 bg-background/75 p-4"
        name="game-panels"
        onToggle={(e) => toggleGamePanel(e.currentTarget)}
      >
        <summary>Mission · {mission.crystals}/5</summary>
        <div className="game-panel-content space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">
            Class 1 · Discover Isla Central
          </p>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold text-foreground">Crystals {mission.crystals}/5</span>
            <span className="text-muted-foreground">Challenges {mission.challenges}/3</span>
          </div>
          {target ? (
            <>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground">{guardianName}:</span> “{target.clue}”
              </p>
              {hintLevel > 0 && (
                <ul className="space-y-1 text-xs text-primary">
                  {target.hints.slice(0, hintLevel).map((h, i) => (
                    <li key={h}>
                      Hint {i + 1}: {h}
                    </li>
                  ))}
                </ul>
              )}
              <button
                disabled={hintLevel >= 3}
                onClick={() => requestHint(target.id)}
                className="rounded-lg border border-white/15 px-3 py-1.5 text-xs hover:border-primary disabled:opacity-40"
              >
                {hintLevel >= 3
                  ? "No more hints — you've got this"
                  : `Ask ${guardianName} for a hint (${hintLevel}/3)`}
              </button>
            </>
          ) : (
            <p className="text-sm text-primary">
              All 5 crystals found. Walk back to the Nyrava Academy doors and report to{" "}
              {guardianName}.
            </p>
          )}
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setMapOpen((v) => !v)}
              className="rounded-lg border border-white/15 px-2 py-1"
            >
              Map
            </button>
            <button
              onClick={() => setLogOpen((v) => !v)}
              className="rounded-lg border border-white/15 px-2 py-1"
            >
              Discoveries ({state.crystals.length + state.secrets.length})
            </button>
            <span className="ml-auto self-center text-primary">{state.xp} XP</span>
          </div>
          {mapOpen && <MiniMap />}
          {logOpen && (
            <p className="text-sm">
              {state.crystals.length} crystals and {state.secrets.length} secrets discovered.
            </p>
          )}
        </div>
      </details>

      {/* crystal challenge */}
      {challengeCrystal?.challenge && (
        <ChallengePanel
          challenge={challengeCrystal.challenge}
          sourceId={challengeCrystal.id}
          onSolved={() => collectCrystal(challengeCrystal.id)}
          onClose={() => patchIsla({ challengeFor: null })}
        />
      )}

      {/* academy report */}
      {state.reporting && <ReportPanel guardianName={guardianName} />}
    </div>
  );
}

function ChallengePanel({
  challenge,
  sourceId,
  onSolved,
  onClose,
}: {
  challenge: Challenge;
  sourceId: string;
  onSolved: () => void;
  onClose: () => void;
}) {
  const [picked, setPicked] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function submit(next: number[]) {
    if (next.length < challenge.answer.length) return;
    const result = await islaService.submitChallenge(sourceId, challenge, next);
    setFeedback(result.message);
    if (result.correct) setTimeout(onSolved, 1100);
    else setTimeout(() => setPicked([]), 900);
  }

  return (
    <div className="game-modal pointer-events-auto fixed inset-0 z-40 grid place-items-center bg-background/80 p-6 backdrop-blur">
      <div className="panel w-full max-w-lg space-y-4 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          {challenge.kind} challenge
        </p>
        <p className="text-base font-semibold">{challenge.prompt}</p>
        <div className="grid gap-2">
          {challenge.options.map((opt, i) => (
            <button
              key={opt}
              onClick={() => {
                const next = [...picked, i];
                setPicked(next);
                void submit(next);
              }}
              className="rounded-xl border border-white/15 p-3 text-left hover:border-primary"
            >
              {opt}
            </button>
          ))}
        </div>
        {feedback && <p className="text-sm font-semibold text-primary">{feedback}</p>}
        <button onClick={onClose} className="rounded-lg border px-4 py-1 text-xs">
          Close
        </button>
      </div>
    </div>
  );
}

function ReportPanel({ guardianName }: { guardianName: string }) {
  const state = useIsla();
  const ready = state.crystals.length === 5;

  return (
    <div className="game-modal pointer-events-auto fixed inset-0 z-40 grid place-items-center bg-background/80 p-6 backdrop-blur">
      <div className="panel w-full max-w-lg space-y-4 p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-primary">
          Nyrava Academy · Mission report
        </p>
        <p className="text-sm text-muted-foreground">
          {ready
            ? `${guardianName}: “You made it back. Excellent work exploring the island!”`
            : `${guardianName}: “You still have crystals out there. Come back when you've found all five.”`}
        </p>
        <div className="flex gap-3">
          <button
            disabled={!ready}
            onClick={completeClass}
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40"
          >
            Complete Class
          </button>
          <button
            onClick={() => patchIsla({ reporting: false })}
            className="rounded-xl border border-white/15 px-5 py-2 text-sm"
          >
            Keep exploring
          </button>
        </div>
      </div>
    </div>
  );
}
