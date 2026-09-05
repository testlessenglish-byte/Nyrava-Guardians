import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { VALE_WATER_LEVEL, VALE_WORLD_SIZE, valeTerrainHeight, valeTerrainNormal } from "@/lib/vale-terrain";
import { ValeAuroraHud } from "./vale-aurora-hud";
import { buildValeWildlife } from "./vale-aurora-wildlife";

function makeWaterNormals(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const h = (x: number, y: number) => {
    const t = (n: number) => Math.sin(n) * 0.5 + 0.5;
    const u = (x / size) * Math.PI * 2;
    const v = (y / size) * Math.PI * 2;
    return (
      t(u * 3 + Math.sin(v * 2) * 1.4) * 0.5 +
      t(v * 5 - Math.cos(u * 3) * 1.1) * 0.3 +
      t(u * 9 + v * 7) * 0.2
    );
  };
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = h((x + 1) % size, y) - h((x - 1 + size) % size, y);
      const dy = h(x, (y + 1) % size) - h(x, (y - 1 + size) % size);
      const n = new THREE.Vector3(-dx * 4, -dy * 4, 1).normalize();
      const i = (y * size + x) * 4;
      img.data[i] = (n.x * 0.5 + 0.5) * 255;
      img.data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      img.data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function buildTerrain() {
  const seg = 320;
  const geo = new THREE.PlaneGeometry(VALE_WORLD_SIZE, VALE_WORLD_SIZE, seg, seg);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);

  const sand = new THREE.Color("#ddcaa2");
  const grass = new THREE.Color("#6f9459");
  const grassDark = new THREE.Color("#4a7346");
  const rock = new THREE.Color("#8e8c8f");
  const snow = new THREE.Color("#f6f9fc");

  const c = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = valeTerrainHeight(x, z);
    pos.setY(i, y);

    const n = valeTerrainNormal(x, z, 2.5);
    const slope = 1 - n.y;

    if (y < VALE_WATER_LEVEL + 1.6) c.copy(sand);
    else if (y < 34) c.copy(grass).lerp(grassDark, Math.min(1, y / 40));
    else if (y < 78) c.copy(grassDark).lerp(rock, (y - 34) / 44);
    else c.copy(rock).lerp(snow, Math.min(1, (y - 78) / 45));

    if (y > VALE_WATER_LEVEL + 2) c.lerp(rock, Math.min(1, slope * 2.4));
    if (y > 96 && slope < 0.35) c.lerp(snow, Math.min(1, (y - 96) / 30));

    const v = 0.95 + ((Math.sin(x * 7.3) + Math.cos(z * 5.1)) * 0.5 + 0.5) * 0.12;
    colors[i * 3] = c.r * v;
    colors[i * 3 + 1] = c.g * v;
    colors[i * 3 + 2] = c.b * v;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.97,
    metalness: 0,
    flatShading: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  return mesh;
}

function buildTrees(scene: THREE.Scene) {
  const trunkGeo = new THREE.CylinderGeometry(0.28, 0.45, 4.2, 6);
  trunkGeo.translate(0, 2.1, 0);
  const leafGeo = new THREE.ConeGeometry(2.1, 8.5, 8);
  leafGeo.translate(0, 7.6, 0);

  const trunkMat = new THREE.MeshStandardMaterial({ color: "#6b5138", roughness: 0.95 });
  const leafMat = new THREE.MeshStandardMaterial({ color: "#4c7a48", roughness: 0.9 });

  const max = 5200;
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, max);
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, max);
  trunks.castShadow = leaves.castShadow = true;
  leaves.receiveShadow = true;
  const colorAttr = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);

  const dummy = new THREE.Object3D();
  const col = new THREE.Color();
  let count = 0;
  let tries = 0;
  const half = VALE_WORLD_SIZE / 2 - 20;

  while (count < max && tries < max * 30) {
    tries++;
    const x = (Math.random() * 2 - 1) * half;
    const z = (Math.random() * 2 - 1) * half;
    const y = valeTerrainHeight(x, z);
    if (y < VALE_WATER_LEVEL + 1.4 || y > 74) continue;
    const n = valeTerrainNormal(x, z, 2);
    if (n.y < 0.82) continue;
    if (Math.random() > 1 - (y / 90) * 0.5) continue;

    const s = 0.7 + Math.random() * 0.9;
    dummy.position.set(x, y - 0.3, z);
    dummy.rotation.set(0, Math.random() * Math.PI * 2, 0);
    dummy.scale.set(s, s * (0.85 + Math.random() * 0.5), s);
    dummy.updateMatrix();
    trunks.setMatrixAt(count, dummy.matrix);
    leaves.setMatrixAt(count, dummy.matrix);
    col.setHSL(0.26 + Math.random() * 0.07, 0.3 + Math.random() * 0.16, 0.3 + Math.random() * 0.16);
    colorAttr.setXYZ(count, col.r, col.g, col.b);
    count++;
  }
  trunks.count = leaves.count = count;
  leaves.instanceColor = colorAttr;
  leaves.instanceColor.needsUpdate = true;
  scene.add(trunks, leaves);

  // Scattered boulders
  const rockGeo = new THREE.DodecahedronGeometry(1, 0);
  const rockMat = new THREE.MeshStandardMaterial({ color: "#9b999d", roughness: 0.95, flatShading: true });
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 900);
  rocks.castShadow = rocks.receiveShadow = true;
  let rc = 0;
  for (let i = 0; i < 6000 && rc < 900; i++) {
    const x = (Math.random() * 2 - 1) * half;
    const z = (Math.random() * 2 - 1) * half;
    const y = valeTerrainHeight(x, z);
    if (y < VALE_WATER_LEVEL - 2) continue;
    const s = 0.6 + Math.random() * 2.6;
    dummy.position.set(x, y + s * 0.3, z);
    dummy.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    dummy.scale.set(s, s * 0.8, s * (0.8 + Math.random() * 0.5));
    dummy.updateMatrix();
    rocks.setMatrixAt(rc++, dummy.matrix);
  }
  rocks.count = rc;
  scene.add(rocks);
}

export function ValeAuroraWorld() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [touch, setTouch] = useState(false);
  const startRef = useRef<() => void>(() => {});
  const joyRef = useRef({ x: 0, y: 0, active: false, id: -1, ox: 0, oy: 0 });

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const mount = mountRef.current!;
    if (!mount) return;

    while (mount.firstChild) {
      mount.removeChild(mount.firstChild);
    }

    const getW = () => mount.clientWidth || window.innerWidth;
    const getH = () => mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(getW(), getH());
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(68, getW() / getH(), 0.1, 4000);
    camera.position.set(0, valeTerrainHeight(60, 190) + 1.75, 190);

    // Sky + sun
    const sky = new Sky();
    sky.scale.setScalar(6000);
    const sunUniforms = sky.material.uniforms as Record<string, { value: any }>;
    sunUniforms["turbidity"]!.value = 2.6;
    sunUniforms["rayleigh"]!.value = 1.1;
    sunUniforms["mieCoefficient"]!.value = 0.004;
    sunUniforms["mieDirectionalG"]!.value = 0.8;
    scene.add(sky);

    const sunPos = new THREE.Vector3();
    const phi = THREE.MathUtils.degToRad(90 - 34);
    const theta = THREE.MathUtils.degToRad(45);
    sunPos.setFromSphericalCoords(1, phi, theta);
    sunUniforms["sunPosition"]!.value.copy(sunPos);

    scene.fog = new THREE.FogExp2(new THREE.Color("#cbdcea"), 0.0011);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const skyScene = new THREE.Scene();
    skyScene.add(sky.clone());
    scene.environment = pmrem.fromScene(skyScene).texture;
    scene.environmentIntensity = 0.85;
    pmrem.dispose();

    const sun = new THREE.DirectionalLight("#fff4e0", 3.4);
    sun.position.copy(sunPos).multiplyScalar(300);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 700;
    const d = 140;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.bias = -0.0006;
    scene.add(sun, sun.target);

    scene.add(new THREE.HemisphereLight("#dceaff", "#7d7259", 1.4));

    const terrain = buildTerrain();
    scene.add(terrain);
    buildTrees(scene);

    // Lake
    const water = new Water(new THREE.PlaneGeometry(VALE_WORLD_SIZE * 1.6, VALE_WORLD_SIZE * 1.6), {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: makeWaterNormals(),
      sunDirection: sunPos.clone().normalize(),
      sunColor: 0xfff3dd,
      waterColor: 0x2b6070,
      distortionScale: 2.2,
      fog: true,
    });
    water.rotation.x = -Math.PI / 2;
    water.position.y = VALE_WATER_LEVEL;
    ((water.material as THREE.ShaderMaterial).uniforms["size"] as any).value = 6;
    scene.add(water);

    // Motes
    const moteCount = 900;
    const motePos = new Float32Array(moteCount * 3);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = (Math.random() * 2 - 1) * 160;
      motePos[i * 3 + 1] = Math.random() * 40;
      motePos[i * 3 + 2] = (Math.random() * 2 - 1) * 160;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
    const motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({
        color: 0xfff2d0,
        size: 0.35,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    scene.add(motes);

    const wildlife = buildValeWildlife(scene);

    const controls = new PointerLockControls(camera, renderer.domElement);
    scene.add(controls.object);
    controls.addEventListener("lock", () => setLocked(true));
    controls.addEventListener("unlock", () => setLocked(false));
    startRef.current = () => {
      setStarted(true);
      if (!window.matchMedia("(pointer: coarse)").matches) {
        try {
          controls.lock();
        } catch {
          // ignore pointer lock errors
        }
      }
    };

    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === "Space") e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => (keys[e.code] = false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let lookId = -1;
    let lastX = 0;
    let lastY = 0;
    const euler = new THREE.Euler(0, 0, 0, "YXZ");
    const onTouchStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < window.innerWidth * 0.4 && !joyRef.current.active) {
          joyRef.current = { x: 0, y: 0, active: true, id: t.identifier, ox: t.clientX, oy: t.clientY };
        } else if (lookId === -1) {
          lookId = t.identifier;
          lastX = t.clientX;
          lastY = t.clientY;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyRef.current.id) {
          joyRef.current.x = THREE.MathUtils.clamp((t.clientX - joyRef.current.ox) / 60, -1, 1);
          joyRef.current.y = THREE.MathUtils.clamp((t.clientY - joyRef.current.oy) / 60, -1, 1);
        } else if (t.identifier === lookId) {
          euler.setFromQuaternion(camera.quaternion);
          euler.y -= (t.clientX - lastX) * 0.004;
          euler.x = THREE.MathUtils.clamp(euler.x - (t.clientY - lastY) * 0.004, -1.5, 1.5);
          camera.quaternion.setFromEuler(euler);
          lastX = t.clientX;
          lastY = t.clientY;
        }
      }
      e.preventDefault();
    };
    const onTouchEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyRef.current.id) joyRef.current = { x: 0, y: 0, active: false, id: -1, ox: 0, oy: 0 };
        if (t.identifier === lookId) lookId = -1;
      }
    };
    renderer.domElement.addEventListener("touchstart", onTouchStart, { passive: false });
    renderer.domElement.addEventListener("touchmove", onTouchMove, { passive: false });
    renderer.domElement.addEventListener("touchend", onTouchEnd);

    const velocity = new THREE.Vector3();
    let vy = 0;
    let grounded = true;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const clock = new THREE.Clock();
    const half = VALE_WORLD_SIZE / 2 - 25;

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      let fw = (keys["KeyW"] || keys["ArrowUp"] ? 1 : 0) - (keys["KeyS"] || keys["ArrowDown"] ? 1 : 0);
      let sd = (keys["KeyD"] || keys["ArrowRight"] ? 1 : 0) - (keys["KeyA"] || keys["ArrowLeft"] ? 1 : 0);
      if (joyRef.current.active) {
        fw += -joyRef.current.y;
        sd += joyRef.current.x;
      }

      const speed = (keys["ShiftLeft"] || keys["ShiftRight"] ? 26 : 11) * dt * 6;
      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, camera.up).normalize();

      velocity.multiplyScalar(Math.max(0, 1 - 9 * dt));
      velocity.addScaledVector(forward, fw * speed * dt);
      velocity.addScaledVector(right, sd * speed * dt);

      const p: THREE.Vector3 = camera.position;
      p.x = THREE.MathUtils.clamp(p.x + velocity.x, -half, half);
      p.z = THREE.MathUtils.clamp(p.z + velocity.z, -half, half);

      const ground = Math.max(valeTerrainHeight(p.x, p.z), VALE_WATER_LEVEL - 0.9) + 1.75;
      if (grounded && keys["Space"]) {
        vy = 7.5;
        grounded = false;
      }
      vy -= 22 * dt;
      p.y += vy * dt;
      if (p.y <= ground) {
        p.y = ground;
        vy = 0;
        grounded = true;
      }
      const moving = Math.hypot(velocity.x, velocity.z) > 0.01 && grounded;
      if (moving) p.y += Math.sin(t * 11) * 0.045;

      sun.position.copy(sunPos).multiplyScalar(300).add(new THREE.Vector3(p.x, 0, p.z));
      sun.target.position.set(p.x, 0, p.z);

      ((water.material as THREE.ShaderMaterial).uniforms["time"] as any).value += dt * 0.35;
      wildlife.update(dt, t, p);
      motes.position.set(Math.round(p.x / 160) * 160, 0, Math.round(p.z / 160) * 160);
      motes.rotation.y = t * 0.01;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = getW();
      const h = getH();
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      renderer.domElement.removeEventListener("touchstart", onTouchStart);
      renderer.domElement.removeEventListener("touchmove", onTouchMove);
      renderer.domElement.removeEventListener("touchend", onTouchEnd);
      controls.dispose();
      renderer.dispose();
      if (mount && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <div ref={mountRef} className="absolute inset-0 h-full w-full" />
      <ValeAuroraHud locked={locked} started={started} touch={touch} onStart={() => startRef.current()} />
    </div>
  );
}
