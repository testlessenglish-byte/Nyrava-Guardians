import { useEffect, useRef, useState } from "react";
import { analogVector, cameraLook, PointerOwner, type Vector2 } from "@/services/game/input";

function useReset(reset: () => void) {
  const current = useRef(reset);
  current.current = reset;
  useEffect(() => {
    const clear = () => current.current();
    window.addEventListener("blur", clear);
    window.addEventListener("orientationchange", clear);
    window.addEventListener("nyrava-input-reset", clear);
    document.addEventListener("visibilitychange", clear);
    return () => {
      window.removeEventListener("blur", clear);
      window.removeEventListener("orientationchange", clear);
      window.removeEventListener("nyrava-input-reset", clear);
      document.removeEventListener("visibilitychange", clear);
      clear();
    };
  }, []);
}

export function AnalogJoystick({ target }: { target: Vector2 }) {
  const owner = useRef(new PointerOwner());
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const reset = () => {
    owner.current.release();
    target.x = 0;
    target.y = 0;
    setKnob({ x: 0, y: 0 });
  };
  useReset(reset);
  const update = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = analogVector(
      (e.clientX - rect.left - rect.width / 2) / (rect.width * 0.4),
      (e.clientY - rect.top - rect.height / 2) / (rect.height * 0.4),
    );
    Object.assign(target, v);
    setKnob({ x: v.x * rect.width * 0.28, y: v.y * rect.height * 0.28 });
  };
  const end = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (owner.current.owns(e.pointerId)) reset();
  };
  return (
    <div
      role="group"
      aria-label="Movement joystick"
      data-testid="movement-joystick"
      className="game-joystick"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!owner.current.claim(e.pointerId)) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e);
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (owner.current.owns(e.pointerId)) update(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <span
        className="game-stick"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
      <span className="game-control-label">MOVE</span>
    </div>
  );
}

export function LookPad({
  target,
  sensitivity = 0.005,
}: {
  target: { cameraYaw: number; cameraPitch: number };
  sensitivity?: number;
}) {
  const owner = useRef(new PointerOwner());
  const last = useRef({ x: 0, y: 0 });
  useReset(() => owner.current.release());
  const end = (e: React.PointerEvent) => {
    e.stopPropagation();
    owner.current.release(e.pointerId);
  };
  return (
    <div
      role="group"
      aria-label="Camera look pad"
      data-testid="camera-pad"
      className="game-look-pad"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!owner.current.claim(e.pointerId)) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        e.stopPropagation();
        if (!owner.current.owns(e.pointerId)) return;
        const next = cameraLook(
          target.cameraYaw,
          target.cameraPitch,
          e.clientX - last.current.x,
          e.clientY - last.current.y,
          sensitivity,
        );
        target.cameraYaw = next.yaw;
        target.cameraPitch = next.pitch;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <span aria-hidden="true">↔</span>
      <span className="game-control-label">LOOK</span>
    </div>
  );
}

export function HoldAction({
  label,
  onChange,
}: {
  label: string;
  onChange: (pressed: boolean) => void;
}) {
  const owner = useRef(new PointerOwner());
  useReset(() => {
    owner.current.release();
    onChange(false);
  });
  const end = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (owner.current.release(e.pointerId)) onChange(false);
  };
  return (
    <button
      className="game-action"
      aria-label={label}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!owner.current.claim(e.pointerId)) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        onChange(true);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") onChange(true);
      }}
      onKeyUp={() => onChange(false)}
      onBlur={() => onChange(false)}
    >
      {label}
    </button>
  );
}
