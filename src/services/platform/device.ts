import { Capacitor } from "@capacitor/core";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

export const isNative = () => Capacitor.isNativePlatform();
let orientationWork = Promise.resolve();
export function preferGameplayOrientation(gameplay: boolean) {
  if (!isNative()) return;
  orientationWork = orientationWork.then(async () => {
    try {
      if (gameplay) await ScreenOrientation.lock({ orientation: "landscape" });
      else await ScreenOrientation.unlock();
    } catch {
      /* iPad multitasking/device policy can reject orientation lock. */
    }
  });
}
export function actionHaptic() {
  if (isNative()) void Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
}

export type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; [index: number]: { transcript: string } }>;
};
export type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort?(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};
export function recognitionConstructor(): (new () => Recognition) | undefined {
  // Native speech needs a reviewed native/offline provider and consent flow.
  if (isNative() || typeof window === "undefined") return undefined;
  const speechWindow = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
}
export function confirmVoicePurpose(): boolean {
  if (!recognitionConstructor()) return false;
  return window.confirm(
    "Microphone is optional. Ask your guardian first. Speech recognition may send audio to your browser or operating system's speech service. Nyrava does not save recordings. Enable microphone now?",
  );
}
