import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type DoorData = {
  id: string;
  label: { en: string; es: string };
  position: [number, number, number];
  rotation: number;
  width: number;
  height: number;
};

export function InteractiveDoor({ door, isOpen = false }: { door: DoorData; isOpen?: boolean }) {
  const hingeRef = useRef<THREE.Group>(null);
  const targetRotY = isOpen ? Math.PI / 2 : 0;

  useFrame((_, delta) => {
    if (hingeRef.current) {
      hingeRef.current.rotation.y = THREE.MathUtils.damp(
        hingeRef.current.rotation.y,
        targetRotY,
        10,
        delta,
      );
    }
  });

  return (
    <group position={door.position} rotation={[0, door.rotation, 0]}>
      <mesh position={[0, door.height / 2, 0]}>
        <boxGeometry args={[door.width + 0.25, door.height + 0.25, 0.25]} />
        <meshStandardMaterial color="#2d170b" roughness={0.4} />
      </mesh>
      <group ref={hingeRef} position={[-door.width / 2, 0, 0]}>
        <mesh position={[door.width / 2, door.height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[door.width - 0.05, door.height - 0.05, 0.12]} />
          <meshStandardMaterial color="#422517" roughness={0.3} metalness={0.1} />
        </mesh>
        <mesh position={[door.width - 0.15, door.height / 2, 0.08]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}
