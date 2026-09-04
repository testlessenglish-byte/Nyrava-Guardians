import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

// Progress/preferences only. Never use this boundary for passwords or auth tokens.
const keys = [
  "nyrava.isla.v1",
  "nyrava-guardian-state-v1",
  "nyrava_audio_settings",
  "nyrava-quality",
];
let writes = Promise.resolve();
let hydration: Promise<void> | undefined;
const updatedKeys = new Set<string>();
export function readLocal(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
export function writeLocal(key: string, value: string) {
  if (!keys.includes(key)) throw new Error("Unsupported progress key");
  updatedKeys.add(key);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* WebView storage may be unavailable. */
  }
  if (Capacitor.isNativePlatform()) {
    writes = writes
      .then(() => Preferences.set({ key, value }))
      .catch(() => {
        console.warn("Local progress could not be saved.");
      });
  }
}
export function hydrateNativeProgress() {
  return (hydration ??= restoreNativeProgress());
}
async function restoreNativeProgress() {
  if (!Capacitor.isNativePlatform()) return;
  await writes;
  for (const key of keys) {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && !updatedKeys.has(key)) window.localStorage.setItem(key, value);
    } catch {
      console.warn("Local progress could not be restored.");
    }
  }
}
export function flushProgress() {
  return writes;
}
