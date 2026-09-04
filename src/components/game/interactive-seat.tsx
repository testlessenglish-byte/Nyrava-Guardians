import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export type SeatData = {
  id: string;
  position: [number, number, number];
  rotation: number;
  seatPosition: [number, number, number];
  seatRotation: number;
  standPosition: [number, number, number];
};

export function InteractiveSeat({
  seat,
  occupied = false,
}: {
  seat: SeatData;
  occupied?: boolean;
}) {
  const model = useGLTF("/models/chairDesk.glb");

  return (
    <group position={seat.position} rotation={[0, seat.rotation, 0]}>
      <primitive object={model.scene.clone()} position={[0, 0, 0]} scale={1.05} />
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.45, 0.55, 32]} />
        <meshStandardMaterial
          color={occupied ? "#f59e0b" : "#38bdf8"}
          emissive={occupied ? "#d97706" : "#0284c7"}
          emissiveIntensity={occupied ? 1.8 : 0.8}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}
