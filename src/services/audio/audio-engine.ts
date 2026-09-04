/**
 * Nyrava Guardians Web Audio Engine & Dynamic Audio Ducking System
 * Plays an optional original exploration theme and ducks music when Guardians speak.
 */

import { readLocal, writeLocal } from "@/services/platform/storage";
import { quietStartup } from "./audio-policy";
import { AdventureMusic } from "./adventure-music";

export type WorldZoneId =
  | "hq"
  | "digital-city"
  | "academy"
  | "cyber-defense"
  | "mystery-network"
  | "data-arena"
  | "builder-district"
  | "communication-realm"
  | "future-lab"
  | "boss";

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number; // 0.0 - 1.0
  voiceVolume: number; // 0.0 - 1.0
  sfxVolume: number; // 0.0 - 1.0
  subtitles: boolean;
  voiceConversations: boolean;
  automaticConversations: boolean;
  backgroundMusic: boolean;
  soundEffects: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  musicVolume: 0.25,
  voiceVolume: 0.9,
  sfxVolume: 0.7,
  subtitles: true,
  voiceConversations: true,
  automaticConversations: false,
  backgroundMusic: false,
  soundEffects: true,
};

class AudioEngine {
  private unlocked = false;
  private paused = false;
  private speechAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private soundtrack: AdventureMusic | null = null;
  private currentZone: WorldZoneId = "hq";
  private isDucked = false;
  private settings: AudioSettings = { ...DEFAULT_SETTINGS };

  constructor() {
    this.loadSettings();
  }

  public loadSettings() {
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      const saved = readLocal("nyrava_audio_settings");
      if (saved) {
        this.settings = quietStartup({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  public saveSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (typeof window === "undefined" || typeof localStorage === "undefined") return;
    try {
      writeLocal("nyrava_audio_settings", JSON.stringify(this.settings));
    } catch {
      // localStorage fallback
    }
    this.updateGains();
    if (!this.settings.backgroundMusic) this.stopAmbientLoop();
    else if (newSettings.backgroundMusic === true) this.resumeFromGesture();
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private initCtx() {
    if (typeof window === "undefined") return;
    if (this.ctx) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.updateGains();
    } catch {
      // Web Audio API unsupported
    }
  }

  private updateGains() {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    this.masterGain.gain.setValueAtTime(this.settings.masterVolume, now);

    const targetMusicVolume = this.settings.backgroundMusic
      ? this.isDucked
        ? this.settings.musicVolume * 0.25
        : this.settings.musicVolume
      : 0;

    this.musicGain.gain.setTargetAtTime(targetMusicVolume, now, 0.3);
    this.sfxGain.gain.setValueAtTime(this.settings.soundEffects ? this.settings.sfxVolume : 0, now);
  }

  /** One original melodic loop, shared across worlds without stacking players. */
  public setWorldZone(zone: WorldZoneId) {
    this.currentZone = zone;
    if (!this.unlocked || this.paused || !this.settings.backgroundMusic) return;
    this.initCtx();
    if (!this.ctx || !this.musicGain) return;
    this.soundtrack ??= new AdventureMusic(this.ctx, this.musicGain);
    this.soundtrack.start();
  }

  private stopAmbientLoop() {
    this.soundtrack?.stop();
  }

  public startDucking() {
    this.isDucked = true;
    this.updateGains();
  }

  public stopDucking() {
    this.isDucked = false;
    this.updateGains();
  }

  public playSfx(type: "greet" | "click" | "success" | "walk-away") {
    if (typeof window === "undefined") return;
    if (!this.unlocked || this.paused) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.settings.soundEffects) return;

    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (type === "greet") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    } else if (type === "success") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(350, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    }

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public pause() {
    this.paused = true;
    this.stopSpeech();
    this.stopAmbientLoop();
    if (this.ctx?.state === "running") void this.ctx.suspend().catch(() => undefined);
  }

  public resumeFromGesture() {
    if (document.visibilityState === "hidden") return;
    this.unlocked = true;
    this.paused = false;
    this.initCtx();
    if (this.ctx?.state === "suspended") void this.ctx.resume().catch(() => undefined);
    this.setWorldZone(this.currentZone);
  }

  public async playSpeech(base64: string, onEnded: () => void, mimeType = "audio/mpeg") {
    if (this.paused) return;
    this.stopSpeech();
    const player = new Audio(`data:${mimeType};base64,${base64}`);
    this.speechAudio = player;
    player.volume = this.settings.masterVolume * this.settings.voiceVolume;
    this.startDucking();
    player.onended = () => {
      this.stopDucking();
      onEnded();
    };
    player.onerror = () => {
      this.stopDucking();
      onEnded();
    };
    try {
      await player.play();
    } catch {
      this.stopSpeech();
      onEnded();
    }
  }

  public stopSpeech() {
    if (this.speechAudio) {
      this.speechAudio.pause();
      this.speechAudio.onended = null;
      this.speechAudio.onerror = null;
      this.speechAudio = null;
    }
    this.stopDucking();
  }
}

export const audioEngine = new AudioEngine();
if (import.meta.hot) import.meta.hot.dispose(() => audioEngine.pause());
