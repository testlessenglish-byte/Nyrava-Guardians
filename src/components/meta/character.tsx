import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

export type CharacterClip = "idle" | "walk" | "run" | "talk" | "wave" | "swim";

/** Old kid-style KayKit guardian models — stylized kid proportions, baked textures. */
const GUARDIAN_MODELS: Record<string, string> = {
  lex: "/models/kay_Knight.glb",
  nova: "/models/kay_Mage.glb",
  zoey: "/models/kay_Rogue.glb",
  zoe: "/models/kay_Rogue.glb",
  jacob: "/models/kay_Barbarian.glb",
  dayana: "/models/kay_Rogue_Hooded.glb",
  sarah: "/models/kay_Knight.glb",
  // legacy aliases
  tess: "/models/kay_Mage.glb",
  byte: "/models/kay_Rogue.glb",
  echo: "/models/kay_Rogue_Hooded.glb",
};

const CLIP_PATTERNS: Record<CharacterClip, RegExp> = {
  idle: /idle/i,
  walk: /walk/i,
  run: /run|jog|sprint/i,
  talk: /talk|interact|idle/i,
  wave: /wave|cheer|idle/i,
  swim: /swim|walk|idle/i,
};

function pickClip(actions: Record<string, THREE.AnimationAction>, clip: CharacterClip) {
  const names = Object.keys(actions);
  const match = names.find((n) => CLIP_PATTERNS[clip].test(n));
  return match ? actions[match] : actions[names[0]!];
}

export function Character({
  color,
  clip,
  guardianId = "lex",
  height = 1.5,
}: {
  color: string;
  clip: CharacterClip;
  guardianId?: string;
  height?: number;
}) {
  const url =
    GUARDIAN_MODELS[guardianId] ??
    GUARDIAN_MODELS[guardianId.toLowerCase()] ??
    GUARDIAN_MODELS["lex"]!;
  const { scene, animations } = useGLTF(url);

  const rig = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        mesh.castShadow = true;
        mesh.frustumCulled = false;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const ownedMaterials = mats.map((source) => source.clone());
        mesh.material = Array.isArray(mesh.material) ? ownedMaterials : ownedMaterials[0]!;
        ownedMaterials.forEach((m) => {
          const mat = m as THREE.MeshStandardMaterial;
          // Keep baked kid-armor texture dominant; gentle guardian tint only.
          mat.color = new THREE.Color("#ffffff").lerp(new THREE.Color(color), 0.12);
          if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
          mat.emissive = new THREE.Color(color);
          mat.emissiveMap = (mat.map as THREE.Texture | null) ?? null;
          mat.emissiveIntensity = 0.18;
          mat.roughness = 0.75;
          mat.metalness = 0.05;
        });
      }
    });
    return clone;
  }, [scene, color]);

  const { actions, mixer } = useMemo(() => {
    const mixer = new THREE.AnimationMixer(rig);
    const actions: Record<string, THREE.AnimationAction> = {};
    animations.forEach((c) => {
      actions[c.name] = mixer.clipAction(c);
    });
    return { actions, mixer };
  }, [rig, animations]);

  const current = useRef<THREE.AnimationAction | null>(null);

  useEffect(() => {
    const next = pickClip(actions, clip);
    if (!next || next === current.current) return;
    next.reset().fadeIn(0.2).play();
    if (current.current) current.current.fadeOut(0.2);
    current.current = next;
    return () => {
      next.fadeOut(0.2);
    };
  }, [actions, clip]);

  useEffect(
    () => () => {
      mixer.stopAllAction();
      // React may replay effects with the same memoized actions. Uncaching their
      // bindings here invalidates those actions; the owned mixer is GC'd on unmount.
      current.current = null;
      rig.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh)
          (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((m) =>
            m.dispose(),
          );
      });
    },
    [mixer, rig],
  );

  useFrame((_, delta) => mixer.update(Math.min(delta, 0.05)));

  const swimming = clip === "swim";

  // Normalize scale so every rig stands at requested height.
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(rig);
    const size = box.getSize(new THREE.Vector3());
    return size.y > 0 ? height / size.y : 1;
  }, [rig, height]);

  return (
    <group>
      <group rotation-x={swimming ? Math.PI / 2.35 : 0} position-y={swimming ? 0.5 : 0}>
        <primitive object={rig} scale={scale} />

        {/* Guardian Energy Core */}
        <mesh position={[0, height * 0.55, height * 0.12]}>
          <icosahedronGeometry args={[height * 0.04, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>

        {/* Aura ring + soft shadow */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <ringGeometry args={[height * 0.22, height * 0.32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} toneMapped={false} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
          <circleGeometry args={[height * 0.32, 32]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.4} />
        </mesh>

        <pointLight
          position={[0, height * 0.8, 0]}
          color={color}
          intensity={1.2}
          distance={height * 3}
        />
      </group>
    </group>
  );
}

// useGLTF caches on demand; avoid downloading every Guardian before it is visible.
