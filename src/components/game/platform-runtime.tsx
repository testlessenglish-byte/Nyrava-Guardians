import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { watchLifecycle, useNetworkAvailable } from "@/services/platform/lifecycle";
import { preferGameplayOrientation } from "@/services/platform/device";
import { flushProgress, hydrateNativeProgress } from "@/services/platform/storage";
import { initializeQuality } from "@/services/game/quality";
import { audioEngine } from "@/services/audio/audio-engine";
import { conversationalVoiceEngine } from "@/services/ai/conversational-voice-engine";
import { resetIslaControls } from "@/lib/isla-store";
import { controls } from "@/lib/class-store";
import { isImmersiveGameRoute } from "@/lib/game-route";

export function resetGameInput() {
  resetIslaControls();
  controls.keys.clear();
  controls.joystick.x = 0;
  controls.joystick.y = 0;
  window.dispatchEvent(new Event("nyrava-input-reset"));
}

export function PlatformRuntime() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const online = useNetworkAvailable();
  const gameplay = isImmersiveGameRoute(path);

  useEffect(() => {
    void hydrateNativeProgress().then(() => {
      initializeQuality();
      audioEngine.loadSettings();
    });
    const blur = () => {
      resetGameInput();
      conversationalVoiceEngine.disableVoice();
      audioEngine.pause();
    };
    window.addEventListener("blur", blur);
    const stop = watchLifecycle((active) => {
      if (!active) {
        blur();
        void flushProgress();
      }
      // Foreground never restarts the microphone. Audio resumes only on next gesture.
    });
    return () => {
      stop();
      window.removeEventListener("blur", blur);
      blur();
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("gameplay-active", gameplay);
    preferGameplayOrientation(gameplay);
    resetGameInput();
    const unlock = () => {
      if (gameplay) audioEngine.resumeFromGesture();
    };
    window.addEventListener("pointerdown", unlock, true);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock, true);
      window.removeEventListener("keydown", unlock);
      document.body.classList.remove("gameplay-active");
      preferGameplayOrientation(false);
      resetGameInput();
      conversationalVoiceEngine.disableVoice();
      audioEngine.pause();
    };
  }, [gameplay, path]);

  return !online ? (
    <div role="status" className="network-status">
      Offline · exploration remains available; cloud features need internet.
    </div>
  ) : null;
}
