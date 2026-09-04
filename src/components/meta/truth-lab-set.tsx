import { Text } from "@react-three/drei";
import { InteractivePortal } from "@/components/game/interactive-portal";
import { InteractiveSeat, type SeatData } from "@/components/game/interactive-seat";
import { InteractiveDoor, type DoorData } from "@/components/game/interactive-door";

export const TRUTH_SEATS: SeatData[] = [
  {
    id: "t-seat-1",
    position: [-6.5, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [-6.5, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [-5.0, 0, 3.9],
  },
  {
    id: "t-seat-2",
    position: [-5.3, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [-5.3, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [-3.8, 0, 3.9],
  },
  {
    id: "t-seat-3",
    position: [5.3, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [5.3, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [3.8, 0, 3.9],
  },
  {
    id: "t-seat-4",
    position: [6.5, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [6.5, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [5.0, 0, 3.9],
  },
];

export const TRUTH_DOORS: DoorData[] = [
  {
    id: "t-door-main",
    position: [0, 0, 9.4],
    rotation: 0,
    label: { en: "Main Entrance", es: "Entrada Principal" },
    width: 2.2,
    height: 3.2,
  },
];

export function TruthLabSet({
  activeSeatId,
  openDoorIds,
}: {
  activeSeatId?: string | null;
  openDoorIds?: Set<string>;
}) {
  return (
    <group>
      <mesh position={[0, 2.4, -9.8]}>
        <boxGeometry args={[26, 4.8, 0.2]} />
        <meshStandardMaterial color="#0c1a2b" roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, 9.8]}>
        <boxGeometry args={[26, 4.8, 0.2]} />
        <meshStandardMaterial color="#0c1a2b" roughness={0.5} />
      </mesh>
      <mesh position={[-12.8, 2.4, 0]}>
        <boxGeometry args={[0.2, 4.8, 20]} />
        <meshStandardMaterial color="#0c1a2b" roughness={0.5} />
      </mesh>
      <mesh position={[12.8, 2.4, 0]}>
        <boxGeometry args={[0.2, 4.8, 20]} />
        <meshStandardMaterial color="#0c1a2b" roughness={0.5} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]}>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#162b42" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position={[0, 4.8, 0]}>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#060e17" roughness={0.9} />
      </mesh>

      <mesh position={[0, 0.15, -8.8]}>
        <boxGeometry args={[14, 0.3, 2.4]} />
        <meshStandardMaterial color="#0284c7" roughness={0.4} />
      </mesh>
      <group position={[0, 2.8, -9.4]}>
        <mesh>
          <boxGeometry args={[11.5, 3.1, 0.15]} />
          <meshStandardMaterial color="#0f4c75" roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0.8, 0.1]}
          fontSize={0.24}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          NOVA & LEX'S TRUTH LAB
        </Text>
        <Text
          position={[0, 0.3, 0.1]}
          fontSize={0.14}
          color="#bae6fd"
          anchorX="center"
          anchorY="middle"
        >
          Critical Thinking · Evidence Analysis · Research
        </Text>
        <Text
          position={[-2.2, -0.4, 0.1]}
          fontSize={0.13}
          color="#0ea5e9"
          anchorX="center"
          anchorY="middle"
        >
          🔍 Source Check
        </Text>
        <Text
          position={[0, -0.4, 0.1]}
          fontSize={0.13}
          color="#a855f7"
          anchorX="center"
          anchorY="middle"
        >
          🧩 Logic Puzzles
        </Text>
        <Text
          position={[2.2, -0.4, 0.1]}
          fontSize={0.13}
          color="#6366f1"
          anchorX="center"
          anchorY="middle"
        >
          📊 Data Proof
        </Text>
      </group>

      {TRUTH_DOORS.map((door) => (
        <InteractiveDoor key={door.id} door={door} isOpen={Boolean(openDoorIds?.has(door.id))} />
      ))}
      {TRUTH_SEATS.map((seat) => (
        <InteractiveSeat key={seat.id} seat={seat} occupied={activeSeatId === seat.id} />
      ))}

      <InteractivePortal position={[11.45, 0, 2.0]} />

      <ambientLight intensity={0.7} color="#e0f2fe" />
      <pointLight position={[0, 4.2, 0]} color="#38bdf8" intensity={12} distance={15} />
    </group>
  );
}
