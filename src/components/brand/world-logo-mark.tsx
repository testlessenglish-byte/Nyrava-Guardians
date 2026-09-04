import { useTexture } from "@react-three/drei";
import logoUrl from "@/assets/guardians/logo.png";

export function WorldLogoMark({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = 1,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
}) {
  const texture = useTexture(logoUrl);

  return (
    <mesh position={position} rotation={rotation} renderOrder={10}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        alphaTest={0.05}
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
