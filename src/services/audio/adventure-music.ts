// Original Nyrava exploration motif. No remote audio or third-party recordings.
const melody: readonly (number | null)[] = [
  72,
  null,
  76,
  79,
  76,
  null,
  74,
  null,
  72,
  69,
  67,
  null,
  69,
  72,
  74,
  null,
  72,
  null,
  76,
  79,
  81,
  79,
  76,
  null,
  74,
  null,
  71,
  67,
  72,
  null,
  null,
  null,
  76,
  null,
  79,
  84,
  81,
  null,
  79,
  76,
  74,
  72,
  69,
  null,
  72,
  76,
  74,
  null,
  72,
  null,
  69,
  65,
  67,
  69,
  72,
  null,
  74,
  null,
  71,
  67,
  72,
  null,
  null,
  null,
];
export const MUSIC_STEP_SECONDS = 60 / 92 / 2;
export function notesForStep(step: number) {
  const position = step % melody.length;
  const notes: { midi: number; length: number; volume: number; type: OscillatorType }[] = [];
  const note = melody[position];
  if (note != null) notes.push({ midi: note, length: 0.42, volume: 0.12, type: "sine" });
  // A soft plucked bass marks the rhythm; no sustained drone.
  if (position % 4 === 0) {
    const root = [48, 45, 41, 43][Math.floor(position / 8) % 4]!;
    notes.push({
      midi: root + (position % 8 === 4 ? 7 : 0),
      length: 0.24,
      volume: 0.055,
      type: "triangle",
    });
  }
  return notes;
}
export class AdventureMusic {
  private timer: ReturnType<typeof setInterval> | undefined;
  private step = 0;
  private nextAt = 0;
  private voices = new Set<{ oscillator: OscillatorNode; gain: GainNode }>();
  private context: AudioContext;
  private destination: AudioNode;
  constructor(context: AudioContext, destination: AudioNode) {
    this.context = context;
    this.destination = destination;
  }
  start() {
    if (this.timer !== undefined) return;
    this.step = 0;
    this.nextAt = this.context.currentTime + 0.04;
    this.schedule();
    this.timer = setInterval(() => this.schedule(), 100);
  }
  private schedule() {
    if (this.context.state !== "running") return;
    if (this.nextAt < this.context.currentTime) this.nextAt = this.context.currentTime + 0.02;
    while (this.nextAt < this.context.currentTime + 0.18) {
      for (const note of notesForStep(this.step)) {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const voice = { oscillator, gain };
        oscillator.type = note.type;
        oscillator.frequency.value = 440 * 2 ** ((note.midi - 69) / 12);
        gain.gain.setValueAtTime(0, this.nextAt);
        gain.gain.linearRampToValueAtTime(note.volume, this.nextAt + 0.014);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.nextAt + note.length);
        oscillator.connect(gain);
        gain.connect(this.destination);
        this.voices.add(voice);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          this.voices.delete(voice);
        };
        oscillator.start(this.nextAt);
        oscillator.stop(this.nextAt + note.length + 0.03);
      }
      this.step++;
      this.nextAt += MUSIC_STEP_SECONDS;
    }
  }
  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    for (const { oscillator, gain } of this.voices) {
      oscillator.onended = null;
      try {
        oscillator.stop();
      } catch {
        /* already ended */
      }
      oscillator.disconnect();
      gain.disconnect();
    }
    this.voices.clear();
  }
}
