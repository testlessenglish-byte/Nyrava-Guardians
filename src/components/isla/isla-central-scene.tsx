import { Suspense, useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Text } from "@react-three/drei";
import worldFont from "@fontsource/nunito/files/nunito-latin-400-normal.woff?url";
import * as THREE from "three";
import { Character } from "@/components/meta/character";
import { PlayerController } from "@/components/game/core/player-controller";
import { updateThirdPersonCamera } from "@/components/game/core/camera-follower";
import { type InputManager } from "@/components/game/core/input-manager";
import { type PlayerMode } from "@/components/game/core/player-state-machine";
import { WORLD_REGISTRY } from "@/domain/world/registry";

const playerController = new PlayerController();

export function IslaCentralScene({
  playerColor = "#38bdf8",
  playerLabel = "Alex",
  guardianId = "lex",
  inputManager,
  blocked = false,
  onNavigateWorld,
  teleportTarget = null,
}: {
  playerColor?: string;
  playerLabel?: string;
  guardianId?: string;
  inputManager: InputManager;
  blocked?: boolean;
  onNavigateWorld?: (targetRoute: string) => void;
  teleportTarget?: [number, number, number] | null;
}) {
  const group = useRef<THREE.Group>(null);
  const [moving, setMoving] = useState(false);
  const [activeInteract, setActiveInteract] = useState<{ id: string; label: string; route?: string } | null>(null);

  useEffect(() => {
    if (teleportTarget && group.current) {
      group.current.position.set(teleportTarget[0], teleportTarget[1], teleportTarget[2]);
    }
  }, [teleportTarget]);

  const portals = WORLD_REGISTRY["isla-central"]?.portals || [];

  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const player = group.current;
    if (!player) return;

    const input = inputManager.getSnapshot();
    const mode: PlayerMode = blocked
      ? "interacting"
      : input.moveX !== 0 || input.moveY !== 0
        ? input.run
          ? "running"
          : "walking"
        : "idle";

    const getSurfaceHeight = (pos: THREE.Vector3) => {
      // Sweeping central stair elevate
      if (pos.z > -10 && pos.z < 6 && Math.abs(pos.x) < 4) {
        return Math.max(0, (6 - pos.z) * 0.35);
      }
      if (Math.hypot(pos.x, pos.z + 10) < 12) return 4.5;
      return 0;
    };

    playerController.update(
      player.position,
      camera,
      input,
      mode,
      delta,
      { minX: -45, maxX: 45, minZ: -45, maxZ: 45 },
      undefined,
      getSurfaceHeight,
    );

    player.rotation.y = playerController.rotationY;
    if (playerController.isMoving !== moving) setMoving(playerController.isMoving);

    if (camera instanceof THREE.PerspectiveCamera) {
      updateThirdPersonCamera(
        camera,
        player.position,
        inputManager.cameraYaw,
        inputManager.cameraPitch,
        delta,
        5.5,
        1.6,
      );
    }

    // Distance-clamped interaction check: max 1 prompt active within 3.5m radius
    let foundInteract: { id: string; label: string; route?: string } | null = null;

    // Check portals
    for (const portal of portals) {
      const pX = portal.pos[0]!;
      const pZ = portal.pos[2]!;
      if (Math.hypot(player.position.x - pX, player.position.z - pZ) < 3.5) {
        foundInteract = { id: portal.id, label: portal.label, route: portal.targetRoute };
        if (!blocked && input.interactPressed) {
          onNavigateWorld?.(portal.targetRoute);
        }
        break;
      }
    }

    // Check foreground interactive stations if no portal nearby
    if (!foundInteract) {
      // Bottom-Left Hologram Table [-14, 0, 14]
      if (Math.hypot(player.position.x - (-14), player.position.z - 14) < 3.5) {
        foundInteract = { id: "hologram-table", label: "Holographic Display Table" };
      }
      // Bottom-Right Water Lab [14, 0, 14]
      else if (Math.hypot(player.position.x - 14, player.position.z - 14) < 3.5) {
        foundInteract = { id: "water-lab", label: "Interactive Water Station" };
      }
    }

    if (foundInteract?.id !== activeInteract?.id) setActiveInteract(foundInteract);
  });

  return (
    <>
      {/* Daylight Atmosphere matching media_1788489263906.jpg */}
      <color attach="background" args={["#2fb5f6"]} />
      <fog attach="fog" args={["#bae6fd", 40, 130]} />

      <ambientLight intensity={1.3} color="#f0f9ff" />
      <directionalLight position={[50, 70, 40]} intensity={2.8} color="#ffffff" castShadow />
      <pointLight position={[0, 25, -10]} color="#00f0ff" intensity={25} distance={75} />

      {/* Clear Turquoise Ocean Plane */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.2, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#06b6d4" roughness={0.1} metalness={0.3} emissive="#0284c7" emissiveIntensity={0.35} />
      </mesh>

      {/* Main White Marble & Metallic Island Plateau */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[48, 64]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.5} />
      </mesh>

      {/* Lawn & Hedge Greenery Accents */}
      <mesh rotation-x={-Math.PI / 2} position={[-16, 0.02, 8]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[16, 0.02, 8]}>
        <circleGeometry args={[8, 32]} />
        <meshStandardMaterial color="#16a34a" roughness={0.7} />
      </mesh>

      {/* Radial Pathways with Cyan LED Edges */}
      {Array.from({ length: 8 }, (_, index) => {
        const angle = (index / 8) * Math.PI * 2;
        return (
          <group key={angle} rotation-y={angle} position-y={0.03}>
            <mesh position={[0, 0, 22]} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[3.6, 40]} />
              <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.6} />
            </mesh>
            <mesh position={[-1.75, 0.02, 22]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.15, 40]} />
              <meshBasicMaterial color="#00f0ff" toneMapped={false} />
            </mesh>
            <mesh position={[1.75, 0.02, 22]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.15, 40]} />
              <meshBasicMaterial color="#00f0ff" toneMapped={false} />
            </mesh>
          </group>
        );
      })}

      {/* GRAND CENTRAL GUARDIAN PALACE & "N" EMBLEM SPIRE [0, 0, -10] */}
      <group position={[0, 0, -10]}>
        {/* Main Palace Body */}
        <mesh position={[0, 8, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 16, 12]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.7} />
        </mesh>
        {/* Side Towers */}
        {[-8, 8].map((offX) => (
          <mesh key={offX} position={[offX, 10, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[2.5, 3.5, 20, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.8} />
          </mesh>
        ))}

        {/* Gold Roof Spire Elements */}
        <mesh position={[0, 18, 0]}>
          <coneGeometry args={[4, 10, 8]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* GIANT GLOWING "N" SHIELD EMBLEM [0, 16, -4] */}
        <group position={[0, 16, 4.2]}>
          <mesh>
            <cylinderGeometry args={[3.2, 3.2, 0.4, 6]} rotation-x={Math.PI / 2} />
            <meshStandardMaterial color="#0284c7" emissive="#00f0ff" emissiveIntensity={2.5} toneMapped={false} />
          </mesh>
          <Text position={[0, 0, 0.3]} fontSize={2.8} font={worldFont} color="#ffffff" anchorX="center" anchorY="middle">
            N
          </Text>
        </group>

        {/* VERTICAL SKY LIGHT BEAM shooting into atmosphere */}
        <mesh position={[0, 45, 0]}>
          <cylinderGeometry args={[1.2, 2.5, 60, 16, 1, true]} />
          <meshStandardMaterial
            color="#00f0ff"
            emissive="#00f0ff"
            emissiveIntensity={4}
            transparent
            opacity={0.75}
            toneMapped={false}
          />
        </mesh>

        {/* Cascading Waterfalls beneath castle */}
        <mesh position={[0, 2, 6.2]}>
          <planeGeometry args={[10, 6]} />
          <meshStandardMaterial color="#00f0ff" emissive="#38bdf8" emissiveIntensity={1.8} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      </group>

      {/* SWEEPING CENTRAL STAIRCASE connecting Palace to Arrival Plaza */}
      <group position={[0, 0, 0]}>
        {[0, 1, 2, 3, 4, 5].map((step) => (
          <mesh key={step} position={[0, 0.4 * step, 4 - step * 2.2]} receiveShadow>
            <boxGeometry args={[8 - step * 0.4, 0.4, 2.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.3} metalness={0.6} />
          </mesh>
        ))}
      </group>

      {/* LEFT PLATEAU GLASS BOTANICAL DOME [-22, 0, 5] */}
      <group position={[-22, 0, 5]}>
        <mesh position={[0, 4, 0]}>
          <sphereGeometry args={[5.5, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.35} metalness={0.7} roughness={0.1} />
        </mesh>
        {/* Gold Frame Ribs */}
        <mesh position={[0, 4, 0]} rotation-x={Math.PI / 4}>
          <torusGeometry args={[5.6, 0.15, 12, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        <Text position={[0, 10, 0]} fontSize={0.9} font={worldFont} color="#0284c7" anchorX="center">
          Botanical Conservatory
        </Text>
      </group>

      {/* FOREGROUND STATION 1: BOTTOM-LEFT HOLOGRAPHIC DISPLAY TABLE [-14, 0, 14] */}
      <group position={[-14, 0, 14]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[2.5, 3, 1.2, 32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
        </mesh>
        {/* Holographic Cyan Blueprint Ring */}
        <mesh position={[0, 1.25, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.5, 2.2, 32]} />
          <meshBasicMaterial color="#00f0ff" toneMapped={false} transparent opacity={0.85} />
        </mesh>
        <Text position={[0, 2.8, 0]} fontSize={0.8} font={worldFont} color="#0284c7" anchorX="center">
          Holographic Display Table
        </Text>
        {activeInteract?.id === "hologram-table" && (
          <Html position={[0, 4.0, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-cyan-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-xl">
              [E] Holographic Map Overview
            </span>
          </Html>
        )}
      </group>

      {/* FOREGROUND STATION 2: BOTTOM-RIGHT INTERACTIVE WATER & BALANCE STATION [14, 0, 14] */}
      <group position={[14, 0, 14]}>
        <mesh position={[0, 0.1, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[4.5, 32]} />
          <meshStandardMaterial color="#06b6d4" emissive="#00f0ff" emissiveIntensity={0.6} />
        </mesh>
        {/* Golden Handrail Posts */}
        <mesh position={[0, 1.5, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[4.4, 0.15, 12, 32]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.9} />
        </mesh>
        <Text position={[0, 3.2, 0]} fontSize={0.8} font={worldFont} color="#0284c7" anchorX="center">
          Water & Balance Station
        </Text>
        {activeInteract?.id === "water-lab" && (
          <Html position={[0, 4.4, 0]} center distanceFactor={14}>
            <span className="animate-bounce rounded-full border border-cyan-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-xl">
              [E] Interactive Water Play
            </span>
          </Html>
        )}
      </group>

      {/* CENTRAL ARRIVAL PLAZA EMBLEM [0, 0, 18] */}
      <group position={[0, 0, 18]}>
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[5, 32]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.2} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.06, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[4.2, 4.6, 32]} />
          <meshBasicMaterial color="#00f0ff" toneMapped={false} />
        </mesh>
      </group>

      {/* 6 ELEMENTAL INTER-WORLD PORTALS ON BRIDGE OUTCROPPINGS */}
      {portals.map((portal) => {
        const isTargetActive = activeInteract?.id === portal.id;
        let color = "#38bdf8";
        if (portal.targetWorldId === "wisdom-forest") color = "#34d399";
        if (portal.targetWorldId === "history-valley") color = "#f59e0b";
        if (portal.targetWorldId === "knowledge-mountains") color = "#60a5fa";
        if (portal.targetWorldId === "infinite-ocean") color = "#06b6d4";
        if (portal.targetWorldId === "space-zone") color = "#c084fc";

        return (
          <group key={portal.id} position={portal.pos}>
            <mesh position={[0, 3.5, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[3, 0.4, 16, 32]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
              <ringGeometry args={[2.5, 3.5, 32]} />
              <meshBasicMaterial color={color} toneMapped={false} />
            </mesh>
            <Text position={[0, 5.5, 0]} fontSize={0.9} font={worldFont} color="#0284c7" anchorX="center">
              {portal.label}
            </Text>
            {isTargetActive && (
              <Html position={[0, 6.8, 0]} center distanceFactor={14}>
                <span className="animate-bounce rounded-full border border-cyan-400 bg-slate-950/90 px-4 py-1.5 text-xs font-black text-cyan-300 shadow-xl">
                  [E] Enter {portal.label}
                </span>
              </Html>
            )}
          </group>
        );
      })}

      {/* RIGHT HORIZON DISTANT SNOWY MOUNTAINS */}
      <group position={[50, 0, -45]}>
        <mesh position={[0, 14, 0]}>
          <coneGeometry args={[14, 28, 6]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        <mesh position={[0, 22, 0]}>
          <coneGeometry args={[7, 12, 6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} />
        </mesh>
      </group>

      {/* LEFT HORIZON DISTANT ROCKY WATERFALL ISLANDS */}
      <group position={[-50, 0, -45]}>
        <mesh position={[0, 7, 0]}>
          <cylinderGeometry args={[14, 16, 14, 12]} />
          <meshStandardMaterial color="#15803d" roughness={0.7} />
        </mesh>
        <mesh position={[0, 7, 14.1]}>
          <planeGeometry args={[10, 14]} />
          <meshStandardMaterial color="#00f0ff" emissive="#38bdf8" emissiveIntensity={1.8} transparent opacity={0.75} toneMapped={false} />
        </mesh>
      </group>

      {/* PLAYER AVATAR */}
      <Suspense fallback={null}>
        <group ref={group} position={[0, 0, 18]}>
          <Character color={playerColor} clip={moving ? "walk" : "idle"} guardianId={guardianId} />
          <Html position={[0, 2.35, 0]} center distanceFactor={14}>
            <span className="pointer-events-none select-none rounded-full border border-cyan-400/30 bg-slate-950/80 px-3 py-1 text-xs font-black uppercase tracking-widest text-cyan-300 backdrop-blur">
              {playerLabel}
            </span>
          </Html>
        </group>
      </Suspense>
    </>
  );
}
