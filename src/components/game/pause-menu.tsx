import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Volume2, VolumeX, Shield, Globe, Play, LogOut } from "lucide-react";
import { audioEngine } from "@/services/audio/audio-engine";
import { setQuality, useQuality, type Quality } from "@/services/game/quality";
import { useGuardian } from "@/lib/guardian-context";
import { Button } from "@/components/ui/button";
import { setGameInputPaused } from "@/components/game/core/input-manager";

export function PauseMenu({ onPauseChange }: { onPauseChange?: (paused: boolean) => void }) {
  const [open, setOpen] = useState(false);
  const quality = useQuality();
  const { locale, toggleLocale } = useGuardian();
  const es = locale.startsWith("es");
  const [audio, setAudio] = useState(() => audioEngine.getSettings());

  const setPaused = (paused: boolean) => {
    setGameInputPaused(paused);
    setOpen(paused);
    onPauseChange?.(paused);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen((previous) => {
          const next = !previous;
          setGameInputPaused(next);
          onPauseChange?.(next);
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      setGameInputPaused(false);
      onPauseChange?.(false);
    };
  }, [onPauseChange]);

  if (!open) return null;

  const updateAudio = (patch: Partial<typeof audio>) => {
    audioEngine.saveSettings(patch);
    setAudio(audioEngine.getSettings());
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-md text-white font-sans"
      role="dialog"
      aria-modal="true"
      aria-label={es ? "Menú de pausa" : "Pause menu"}
    >
      <div className="w-full max-w-md rounded-3xl border border-cyan-500/40 bg-slate-950 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-black text-sm uppercase tracking-widest">
            <Shield className="size-5" />
            <span>{es ? "PAUSA" : "PAUSE MENU"}</span>
          </div>
          <span className="text-xs font-extrabold text-slate-400">ESC</span>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-300">
            {es ? "Calidad gráfica" : "Graphics Quality"}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["LOW", "MEDIUM", "HIGH"] as Quality[]).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuality(q)}
                className={
                  "rounded-xl py-2 text-xs font-black transition " +
                  (quality === q
                    ? "bg-cyan-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800")
                }
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-300">
            {es ? "Audio" : "Audio Volume"}
          </p>
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
            <span className="text-xs font-bold text-slate-200">
              {es ? "Efectos y música" : "Sound Effects & Music"}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                updateAudio({
                  soundEffects: !audio.soundEffects,
                  backgroundMusic: !audio.backgroundMusic,
                })
              }
              className="border-slate-700 bg-slate-950 text-white font-bold text-xs"
            >
              {audio.soundEffects ? (
                <Volume2 className="size-4 text-emerald-400 mr-1" />
              ) : (
                <VolumeX className="size-4 text-rose-400 mr-1" />
              )}
              {audio.soundEffects ? (es ? "Activo" : "Enabled") : es ? "Silencio" : "Muted"}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-slate-300">
            Language / Idioma
          </p>
          <Button
            onClick={toggleLocale}
            variant="outline"
            className="w-full justify-between border-slate-800 bg-slate-900/80 text-white font-bold text-xs"
          >
            <span className="flex items-center gap-2">
              <Globe className="size-4 text-cyan-400" />
              <span>{es ? "Idioma actual" : "Current Language"}</span>
            </span>
            <span className="rounded-full bg-cyan-950 px-3 py-0.5 text-cyan-300 border border-cyan-500/30">
              {es ? "Español (MX)" : "English (US)"}
            </span>
          </Button>
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <Button
            onClick={() => setPaused(false)}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl"
          >
            <Play className="size-4 mr-2" /> {es ? "Continuar" : "Resume Game"}
          </Button>
          <Link to="/" className="block">
            <Button
              variant="outline"
              className="w-full border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900 font-bold rounded-xl text-xs"
            >
              <LogOut className="size-4 mr-2" /> {es ? "Salir al menú" : "Exit to Main Menu"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
