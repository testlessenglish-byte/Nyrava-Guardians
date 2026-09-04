import { Component, useState, type ReactNode } from "react";
import { useProgress } from "@react-three/drei";
import { QUALITY, setQuality, useQuality, type Quality } from "@/services/game/quality";
import { audioEngine } from "@/services/audio/audio-engine";
import { Settings2 } from "lucide-react";
import { toggleGamePanel } from "@/services/game/panels";

export function WorldLoading() {
  const { active, progress } = useProgress();
  return active ? (
    <div role="status" className="world-loading">
      Loading world assets · {Math.round(progress)}%<progress value={progress} max={100} />
    </div>
  ) : null;
}

export class GameErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean; attempt: number }
> {
  override state = { failed: false, attempt: 0 };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override componentDidCatch() {
    console.warn("World rendering failed. Retry or select a lower graphics quality.");
  }
  override render() {
    if (this.state.failed)
      return (
        <div className="world-error" role="alert">
          <h2>The world could not load.</h2>
          <p>Your progress is kept. Check available memory and try again with lower graphics.</p>
          <button
            className="game-action"
            onClick={() => {
              setQuality("LOW");
              this.setState((s) => ({ failed: false, attempt: s.attempt + 1 }));
            }}
          >
            Retry in LOW quality
          </button>
        </div>
      );
    return (
      <div key={this.state.attempt} className="absolute inset-0">
        {this.props.children}
      </div>
    );
  }
}

export function GameSettings() {
  const quality = useQuality();
  const [audio, setAudio] = useState(audioEngine.getSettings());
  const update = (patch: Partial<typeof audio>) => {
    audioEngine.saveSettings(patch);
    setAudio(audioEngine.getSettings());
  };
  return (
    <details
      className="game-settings game-panel pointer-events-auto"
      name="game-panels"
      onToggle={(e) => toggleGamePanel(e.currentTarget)}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <summary aria-label="Game settings">
        <Settings2 size={18} />
        <span>Settings</span>
      </summary>
      <div className="game-panel-content">
        <label>
          Graphics{" "}
          <select
            aria-label="Graphics quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value as Quality)}
          >
            {Object.keys(QUALITY).map((q) => (
              <option key={q}>{q}</option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={audio.backgroundMusic}
            onChange={(e) => update({ backgroundMusic: e.target.checked })}
          />{" "}
          Background music
        </label>
        <label>
          <input
            type="checkbox"
            checked={audio.soundEffects}
            onChange={(e) => update({ soundEffects: e.target.checked })}
          />{" "}
          Effects
        </label>
        <label>
          Master volume{" "}
          <input
            aria-label="Master volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audio.masterVolume}
            onChange={(e) => update({ masterVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          Music volume{" "}
          <input
            aria-label="Music volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audio.musicVolume}
            onChange={(e) => update({ musicVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          Effects volume{" "}
          <input
            aria-label="Effects volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audio.sfxVolume}
            onChange={(e) => update({ sfxVolume: Number(e.target.value) })}
          />
        </label>
        <label>
          Voice volume{" "}
          <input
            aria-label="Voice volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audio.voiceVolume}
            onChange={(e) => update({ voiceVolume: Number(e.target.value) })}
          />
        </label>
        <p>
          Music starts off each launch. Effects and voices have separate controls. Microphone stays
          off until enabled.
        </p>
      </div>
    </details>
  );
}
