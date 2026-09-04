import { useSyncExternalStore } from "react";
import { App } from "@capacitor/app";
import { Network } from "@capacitor/network";
import { isNative } from "./device";

let active = true;
let connected = true;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const useAppActive = () =>
  useSyncExternalStore(
    subscribe,
    () => active,
    () => true,
  );
export const useNetworkAvailable = () =>
  useSyncExternalStore(
    subscribe,
    () => connected,
    () => true,
  );

export function watchLifecycle(onActive: (value: boolean) => void) {
  let disposed = false;
  let nativeActive = true;
  const removers: (() => void | Promise<void>)[] = [];
  const update = () => {
    const next = nativeActive && document.visibilityState !== "hidden";
    if (next !== active) {
      active = next;
      onActive(next);
      notify();
    }
  };
  const network = () => {
    connected = navigator.onLine;
    notify();
  };
  document.addEventListener("visibilitychange", update);
  window.addEventListener("online", network);
  window.addEventListener("offline", network);
  update();
  network();
  if (isNative()) {
    void (async () => {
      const app = await App.addListener("appStateChange", (state) => {
        nativeActive = state.isActive;
        update();
      });
      if (disposed) {
        await app.remove();
        return;
      }
      removers.push(() => app.remove());
      const net = await Network.addListener("networkStatusChange", (state) => {
        connected = state.connected;
        notify();
      });
      if (disposed) {
        await net.remove();
        return;
      }
      removers.push(() => net.remove());
      nativeActive = (await App.getState()).isActive;
      connected = (await Network.getStatus()).connected;
      if (!disposed) {
        update();
        notify();
      }
    })().catch(() => console.warn("Native lifecycle service unavailable."));
  }
  return () => {
    disposed = true;
    document.removeEventListener("visibilitychange", update);
    window.removeEventListener("online", network);
    window.removeEventListener("offline", network);
    removers.forEach((remove) => {
      void remove();
    });
  };
}
