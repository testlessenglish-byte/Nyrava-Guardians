import { Text } from "@react-three/drei";
import { InteractiveSeat, type SeatData } from "@/components/game/interactive-seat";
import { InteractivePortal } from "@/components/game/interactive-portal";
import { type DoorData } from "@/components/game/interactive-door";
import { WorldLogoMark } from "@/components/brand/world-logo-mark";

export const STUDENT_SEATS: SeatData[] = [
  {
    id: "seat-left-1",
    position: [-6.5, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [-6.5, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [-5.0, 0, 3.9],
  },
  {
    id: "seat-left-2",
    position: [-5.3, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [-5.3, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [-3.8, 0, 3.9],
  },
  {
    id: "seat-left-3",
    position: [-6.5, 0.05, 7.4],
    rotation: Math.PI,
    seatPosition: [-6.5, 0.45, 7.2],
    seatRotation: Math.PI,
    standPosition: [-5.0, 0, 7.4],
  },
  {
    id: "seat-left-4",
    position: [-5.3, 0.05, 7.4],
    rotation: Math.PI,
    seatPosition: [-5.3, 0.45, 7.2],
    seatRotation: Math.PI,
    standPosition: [-3.8, 0, 7.4],
  },
  {
    id: "seat-right-1",
    position: [5.3, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [5.3, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [3.8, 0, 3.9],
  },
  {
    id: "seat-right-2",
    position: [6.5, 0.05, 3.9],
    rotation: Math.PI,
    seatPosition: [6.5, 0.45, 3.7],
    seatRotation: Math.PI,
    standPosition: [5.0, 0, 3.9],
  },
];

export const CLASSROOM_DOORS: DoorData[] = [];

function Desk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.78, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.15, 1.15]} />
        <meshStandardMaterial color="#87522d" roughness={0.45} />
      </mesh>
      {[-0.95, 0.95].map((x) => (
        <mesh key={x} position={[x, 0.39, 0]} castShadow>
          <boxGeometry args={[0.12, 0.78, 0.9]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      <mesh position={[0, 0.92, -0.12]} castShadow>
        <boxGeometry args={[0.9, 0.08, 0.58]} />
        <meshStandardMaterial color="#0f172a" emissive="#0ea5e9" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function TeacherPodium({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Platform Stage */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[2.0, 2.2, 0.2, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.4} />
      </mesh>
      <mesh position={[0, 0.205, 0]}>
        <ringGeometry args={[1.9, 2.05, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
      </mesh>
      {/* Curved Desk */}
      <mesh position={[0, 0.65, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Hologram Display */}
      <mesh position={[0, 1.25, -0.8]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.32, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.28, 0.64, 18]} />
        <meshStandardMaterial color="#1e293b" roughness={0.45} />
      </mesh>
      <mesh position={[0, 1.0, 0]} castShadow>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshStandardMaterial color="#22c55e" roughness={0.72} />
      </mesh>
    </group>
  );
}

export function AcademyClassroomSet({
  activeSeatId,
}: {
  activeSeatId?: string | null;
  openDoorIds?: Set<string>;
}) {
  return (
    <group>
      {/* Main Floor */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#4a2818" roughness={0.48} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4.8, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[26, 20]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
      </mesh>

      {/* Solid Front Wall */}
      <mesh position={[0, 2.4, -9.72]} receiveShadow>
        <boxGeometry args={[26, 4.8, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Solid Rear Wall (No door cutouts) */}
      <mesh position={[0, 2.4, 9.72]} receiveShadow>
        <boxGeometry args={[26, 4.8, 0.28]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Solid Left Wall */}
      <mesh position={[-12.72, 2.4, 0]} receiveShadow>
        <boxGeometry args={[0.28, 4.8, 20]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Solid Right Wall */}
      <mesh position={[12.72, 2.4, 0]} receiveShadow>
        <boxGeometry args={[0.28, 4.8, 20]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
      </mesh>

      {/* Integrated Official Floor Seal */}
      <WorldLogoMark position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} size={2.0} />

      {/* Teacher Podium & Stage */}
      <TeacherPodium position={[-4.0, 0, -6.2]} />

      {/* Student Desks */}
      <Desk position={[-6.5, 0, 2.5]} />
      <Desk position={[-6.5, 0, 6.0]} />
      <Desk position={[6.5, 0, 2.5]} />
      <Desk position={[6.5, 0, 6.0]} />

      {/* Decorative Plants */}
      <Plant position={[-10.8, 0, -7.8]} />
      <Plant position={[10.8, 0, -7.8]} />

      {/* Student Seats */}
      {STUDENT_SEATS.map((seat) => (
        <InteractiveSeat key={seat.id} seat={seat} occupied={activeSeatId === seat.id} />
      ))}

      {/* Achievements Plaque on Right Wall */}
      <group position={[12.48, 2.9, -4.0]} rotation-y={-Math.PI / 2}>
        <mesh>
          <boxGeometry args={[4.4, 2.3, 0.12]} />
          <meshStandardMaterial color="#11283f" />
        </mesh>
        <Text position={[0, 0.65, 0.08]} fontSize={0.18} color="#fbbf24" anchorX="center">
          ACHIEVEMENTS
        </Text>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((x, index) => (
          <mesh key={x} position={[x, -0.15, 0.09]}>
            <circleGeometry args={[0.23, 24]} />
            <meshStandardMaterial
              color={index === 0 ? "#fbbf24" : "#334155"}
              emissive={index === 0 ? "#d97706" : "#0f172a"}
              emissiveIntensity={0.5}
            />
          </mesh>
        ))}
      </group>

      {/* Mission Hub Portal */}
      <InteractivePortal position={[11.45, 0, 2.0]} />

      {/* Lighting */}
      <ambientLight intensity={0.95} color="#fff7ed" />
      <hemisphereLight args={["#e0f2fe", "#451a03", 0.9]} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={1.8}
        color="#fff7d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-4.0, 3.8, -6.2]} color="#38bdf8" intensity={6} distance={10} />
      <pointLight position={[0, 4.2, 4.5]} color="#fbbf24" intensity={4} distance={11} />
    </group>
  );
}
