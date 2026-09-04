import { AnalogJoystick } from "@/components/game/touch-controls";
import { controls } from "@/lib/class-store";

export function Joystick() {
  return <AnalogJoystick target={controls.joystick} />;
}
