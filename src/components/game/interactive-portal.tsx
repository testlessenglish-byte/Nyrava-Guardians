import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export function InteractivePortal({
  position = [11.45, 0, 2.0],
  onEnter = () => {
    if (typeof window !== "undefined") window.location.assign("/missions");
  },
}: {
  position?: [number, number, number];
  onEnter?: () => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const vortexRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * 1.2;
    if (vortexRef.current) vortexRef.current.rotation.z -= delta * 0.8;
  });

  return (
    <group position={position}>
      {/* Outer portal frame */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[0.35, 4.2, 3.4]} />
        <meshStandardMaterial color="#23364d" roughness={0.5} />
      </mesh>

      {/* Clickable / Touchable Spinning Outer Ring */}
      <mesh
        ref={ringRef}
        position={[-0.2, 2.15, 0]}
        rotation-y={Math.PI / 2}
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEnter();
        }}
      >
        <torusGeometry args={[1.28, 0.13, 18, 56]} />
        <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={2.5} />
      </mesh>

      {/* Clickable / Touchable Vortex Surface */}
      <mesh
        ref={vortexRef}
        position={[-0.16, 2.15, 0]}
        rotation-y={Math.PI / 2}
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          onEnter();
        }}
      >
        <circleGeometry args={[1.2, 40]} />
        <meshStandardMaterial
          color="#312e81"
          emissive="#6366f1"
          emissiveIntensity={1.8}
          transparent
          opacity={0.78}
        />
      </mesh>

      {/* Portal Title Signage */}
      <Text
        position={[-0.38, 3.8, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        fontSize={0.2}
        color="#bae6fd"
        anchorX="center"
        onClick={(e) => {
          e.stopPropagation();
          onEnter();
        }}
      >
        MISSION HUB
      </Text>
    </group>
  );
}
