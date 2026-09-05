import * as THREE from "three";
import { VALE_WATER_LEVEL, VALE_WORLD_SIZE, valeTerrainHeight } from "@/lib/vale-terrain";

export type ValeWildlife = { update: (dt: number, t: number, player: THREE.Vector3) => void };

/* ---------------- birds ---------------- */

function makeBird(color: THREE.ColorRepresentation, scale: number) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), bodyMat);
  body.scale.set(1, 0.7, 2.1);
  g.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bodyMat);
  head.position.set(0, 0.1, 0.62);
  g.add(head);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.24, 5),
    new THREE.MeshStandardMaterial({ color: "#d8a13f", roughness: 0.7 }),
  );
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, 0.08, 0.82);
  g.add(beak);

  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 4), bodyMat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.02, -0.75);
  g.add(tail);

  const wingGeo = new THREE.PlaneGeometry(1.5, 0.55);
  wingGeo.translate(0.75, 0, 0);
  const wingMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide });
  const wingL = new THREE.Mesh(wingGeo, wingMat);
  const wingR = new THREE.Mesh(wingGeo, wingMat);
  wingR.scale.x = -1;
  wingL.position.set(0.12, 0.08, 0);
  wingR.position.set(-0.12, 0.08, 0);
  g.add(wingL, wingR);

  g.scale.setScalar(scale);
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return { group: g, wingL, wingR };
}

function buildBirds(scene: THREE.Scene) {
  const flocks: {
    center: THREE.Vector3; radius: number; speed: number; phase: number; height: number;
    birds: { g: THREE.Group; wl: THREE.Mesh; wr: THREE.Mesh; off: number; r: number; flap: number }[];
  }[] = [];

  const palette = ["#2f2b2a", "#4a4340", "#55524f", "#3b3330"];
  const half = VALE_WORLD_SIZE / 2 - 120;

  for (let f = 0; f < 6; f++) {
    const center = f === 0
      ? new THREE.Vector3(60, 0, 190)
      : f === 1
        ? new THREE.Vector3(20, 0, 120)
        : new THREE.Vector3((Math.random() * 2 - 1) * half, 0, (Math.random() * 2 - 1) * half);
    const radius = f < 2 ? 35 + Math.random() * 20 : 60 + Math.random() * 90;
    const height = f < 2 ? 22 + Math.random() * 14 : 45 + Math.random() * 55;
    const birds: (typeof flocks)[number]["birds"] = [];
    const n = 6 + Math.floor(Math.random() * 7);
    for (let i = 0; i < n; i++) {
      const scale = 1.4 + Math.random() * 1.1;
      const { group, wingL, wingR } = makeBird(palette[i % palette.length]!, scale);
      scene.add(group);
      birds.push({ g: group, wl: wingL, wr: wingR, off: (i / n) * Math.PI * 2 + Math.random() * 0.3, r: radius + (Math.random() * 2 - 1) * 18, flap: 5 + Math.random() * 2.5 });
    }
    flocks.push({ center, radius, speed: 0.09 + Math.random() * 0.07, phase: Math.random() * 10, height, birds });
  }

  const tmp = new THREE.Vector3();
  return (_dt: number, t: number) => {
    for (const fl of flocks) {
      for (const b of fl.birds) {
        const a = t * fl.speed + b.off + fl.phase;
        tmp.set(fl.center.x + Math.cos(a) * b.r, fl.height + Math.sin(a * 2 + b.off) * 6, fl.center.z + Math.sin(a * 1.05) * b.r);
        b.g.position.lerp(tmp, 0.25);
        b.g.rotation.y = -a - Math.PI / 2;
        b.g.rotation.z = Math.sin(a * 1.05) * 0.25;
        const flap = Math.sin(t * b.flap + b.off);
        b.wl.rotation.z = flap * 0.9;
        b.wr.rotation.z = -flap * 0.9;
      }
    }
  };
}

/* ---------------- deer ---------------- */

function makeDeer(scale: number) {
  const g = new THREE.Group();
  const coat = new THREE.MeshStandardMaterial({ color: "#a1714a", roughness: 0.95 });
  const dark = new THREE.MeshStandardMaterial({ color: "#5c4029", roughness: 0.95 });
  const cream = new THREE.MeshStandardMaterial({ color: "#e7dac6", roughness: 0.95 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.05, 4, 10), coat);
  body.rotation.z = Math.PI / 2; body.position.y = 1.15; g.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 8), cream);
  belly.scale.set(1.5, 0.5, 0.8); belly.position.set(0, 0.86, 0); g.add(belly);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.26, 0.85, 8), coat);
  neck.position.set(0, 1.5, 0.72); neck.rotation.x = 0.55; g.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.86, 0.98);
  const head = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.3, 4, 8), coat);
  head.rotation.x = 1.25; headGroup.add(head);
  const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), dark);
  muzzle.position.set(0, -0.04, 0.3); headGroup.add(muzzle);
  for (const s of [-1, 1] as const) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 5), coat);
    ear.position.set(s * 0.16, 0.14, -0.02); ear.rotation.z = s * 0.7; headGroup.add(ear);
    const antler = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.5, 5), cream);
    antler.position.set(s * 0.1, 0.3, 0.02); antler.rotation.z = s * 0.35; headGroup.add(antler);
    const tine = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.3, 5), cream);
    tine.position.set(s * 0.24, 0.48, 0.04); tine.rotation.z = s * 0.9; headGroup.add(tine);
  }
  g.add(headGroup);

  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), cream);
  tail.position.set(0, 1.35, -0.78); g.add(tail);

  const legs: THREE.Mesh[] = [];
  const legGeo = new THREE.CylinderGeometry(0.07, 0.05, 1.05, 6);
  legGeo.translate(0, -0.52, 0);
  for (const [x, z] of [[0.24, 0.5], [-0.24, 0.5], [0.24, -0.5], [-0.24, -0.5]] as const) {
    const leg = new THREE.Mesh(legGeo, dark);
    leg.position.set(x, 1.05, z); g.add(leg); legs.push(leg);
  }

  g.scale.setScalar(scale);
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, legs, head: headGroup };
}

function makeRabbit(scale: number) {
  const g = new THREE.Group();
  const fur = new THREE.MeshStandardMaterial({ color: "#9c9086", roughness: 0.95 });
  const cream = new THREE.MeshStandardMaterial({ color: "#efe7dc", roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), fur);
  body.scale.set(0.9, 0.85, 1.3); body.position.y = 0.26; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), fur);
  head.position.set(0, 0.42, 0.26); g.add(head);
  for (const s of [-1, 1] as const) {
    const ear = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.22, 3, 6), fur);
    ear.position.set(s * 0.07, 0.62, 0.22); ear.rotation.z = s * 0.18; g.add(ear);
  }
  const tail = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 6), cream);
  tail.position.set(0, 0.28, -0.3); g.add(tail);
  g.scale.setScalar(scale);
  g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return g;
}

type Ground = { g: THREE.Group; legs: THREE.Mesh[]; head: THREE.Object3D | null; dir: number; speed: number; timer: number; state: "graze" | "walk"; hop: number; base: number; };

function buildGroundAnimals(scene: THREE.Scene) {
  const animals: Ground[] = [];
  const half = VALE_WORLD_SIZE / 2 - 60;

  const place = () => {
    for (let i = 0; i < 60; i++) {
      const x = (Math.random() * 2 - 1) * half;
      const z = (Math.random() * 2 - 1) * half;
      const y = valeTerrainHeight(x, z);
      if (y > VALE_WATER_LEVEL + 2 && y < 60) return new THREE.Vector3(x, y, z);
    }
    return new THREE.Vector3(0, valeTerrainHeight(0, 0), 0);
  };

  const placeNearSpawn = () => {
    for (let i = 0; i < 80; i++) {
      const x = 60 + (Math.random() * 2 - 1) * 55;
      const z = 190 + (Math.random() * 2 - 1) * 55;
      const y = valeTerrainHeight(x, z);
      if (y > VALE_WATER_LEVEL + 2 && y < 60) return new THREE.Vector3(x, y, z);
    }
    return place();
  };

  for (let i = 0; i < 18; i++) {
    const { group, legs, head } = makeDeer(0.9 + Math.random() * 0.35);
    group.position.copy(i < 6 ? placeNearSpawn() : place());
    scene.add(group);
    animals.push({ g: group, legs, head, dir: Math.random() * Math.PI * 2, speed: 1.4 + Math.random() * 0.8, timer: Math.random() * 6, state: Math.random() > 0.5 ? "graze" : "walk", hop: 0, base: 0 });
  }

  for (let i = 0; i < 30; i++) {
    const g = makeRabbit(0.8 + Math.random() * 0.4);
    g.position.copy(i < 8 ? placeNearSpawn() : place());
    scene.add(g);
    animals.push({ g, legs: [], head: null, dir: Math.random() * Math.PI * 2, speed: 2.6 + Math.random() * 1.4, timer: Math.random() * 3, state: "graze", hop: Math.random() * 10, base: 0 });
  }

  const half2 = VALE_WORLD_SIZE / 2 - 40;
  return (dt: number, t: number, player: THREE.Vector3) => {
    for (const a of animals) {
      const isRabbit = a.legs.length === 0;
      a.timer -= dt;
      if (a.timer <= 0) {
        a.state = a.state === "graze" ? "walk" : "graze";
        a.timer = a.state === "graze" ? 3 + Math.random() * 6 : 2 + Math.random() * 5;
        a.dir += (Math.random() * 2 - 1) * 1.6;
      }
      const p = a.g.position;
      const dx = p.x - player.x; const dz = p.z - player.z;
      const dist = Math.hypot(dx, dz);
      let speed = a.state === "walk" ? a.speed : 0;
      if (dist < 22) { a.dir = Math.atan2(dx, dz); a.state = "walk"; speed = a.speed * (isRabbit ? 2.6 : 2.2); }

      if (speed > 0) {
        const nx = THREE.MathUtils.clamp(p.x + Math.sin(a.dir) * speed * dt, -half2, half2);
        const nz = THREE.MathUtils.clamp(p.z + Math.cos(a.dir) * speed * dt, -half2, half2);
        const ny = valeTerrainHeight(nx, nz);
        if (ny > VALE_WATER_LEVEL + 0.6 && ny < 78) { p.x = nx; p.z = nz; } else { a.dir += 1.9; }
      }
      p.y = valeTerrainHeight(p.x, p.z);
      a.g.rotation.y = THREE.MathUtils.lerp(a.g.rotation.y, a.dir, 0.08);

      if (isRabbit) {
        if (speed > 0) { a.hop += dt * 9; p.y += Math.abs(Math.sin(a.hop)) * 0.35; a.g.rotation.x = Math.sin(a.hop) * 0.15; }
        else { a.g.rotation.x = 0; }
      } else {
        const swing = speed > 0 ? Math.sin(t * 6 + p.x) : 0;
        a.legs.forEach((leg, i) => { leg.rotation.x = swing * 0.5 * (i % 2 === 0 ? 1 : -1) * (i < 2 ? 1 : -1); });
        if (a.head) {
          const grazing = speed === 0;
          a.head.rotation.x = THREE.MathUtils.lerp(a.head.rotation.x, grazing ? 0.95 : 0, 0.05);
          (a.head as any).position.y = THREE.MathUtils.lerp((a.head as any).position.y, grazing ? 1.15 : 1.86, 0.05);
        }
      }
    }
  };
}

/* ---------------- butterflies ---------------- */

function buildButterflies(scene: THREE.Scene) {
  const count = 70;
  const geo = new THREE.PlaneGeometry(0.3, 0.22);
  const mat = new THREE.MeshStandardMaterial({ color: "#f6d98a", emissive: "#c98b2a", emissiveIntensity: 0.25, side: THREE.DoubleSide, roughness: 0.6 });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.frustumCulled = false;
  scene.add(mesh);
  const seeds = Array.from({ length: count }, () => ({ a: Math.random() * Math.PI * 2, r: 4 + Math.random() * 26, h: 0.7 + Math.random() * 2.6, s: 0.25 + Math.random() * 0.5, p: Math.random() * 10 }));
  const dummy = new THREE.Object3D();
  return (_dt: number, t: number, player: THREE.Vector3) => {
    for (let i = 0; i < count; i++) {
      const s = seeds[i]!;
      const a = s.a + t * s.s;
      dummy.position.set(player.x + Math.cos(a) * s.r + Math.sin(t * 0.7 + s.p) * 2, Math.max(valeTerrainHeight(player.x + Math.cos(a) * s.r, player.z + Math.sin(a * 1.2) * s.r), VALE_WATER_LEVEL) + s.h + Math.sin(t * 2 + s.p) * 0.3, player.z + Math.sin(a * 1.2) * s.r + Math.cos(t * 0.6 + s.p) * 2);
      dummy.rotation.set(Math.sin(t * 12 + s.p) * 0.8, a, 0);
      dummy.scale.setScalar(0.9 + Math.sin(t + s.p) * 0.1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
}

export function buildValeWildlife(scene: THREE.Scene): ValeWildlife {
  const updaters = [buildBirds(scene), buildGroundAnimals(scene), buildButterflies(scene)];
  return { update: (dt, t, player) => { for (const u of updaters) u(dt, t, player); } };
}
