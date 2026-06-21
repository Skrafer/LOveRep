const canvas = document.querySelector("#aura3d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function start() {
  let THREE;
  try {
    THREE = await import("https://unpkg.com/three@0.165.0/build/three.module.js");
  } catch {
    canvas.hidden = true;
    return;
  }

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.4);

  const atelier = new THREE.Group();
  scene.add(atelier);

  const relic = new THREE.Group();
  atelier.add(relic);

  const glass = new THREE.Group();
  relic.add(glass);

  const key = new THREE.PointLight(0xffe5ac, 2.8, 13);
  key.position.set(3.3, 2.4, 4.8);
  scene.add(key);

  const roseLight = new THREE.PointLight(0xf0a7a4, 1.9, 10);
  roseLight.position.set(-3.1, 0.4, 3.8);
  scene.add(roseLight);

  const tealLight = new THREE.PointLight(0x70d8c5, 1.55, 11);
  tealLight.position.set(-2.8, -2.2, 3.2);
  scene.add(tealLight);

  scene.add(new THREE.AmbientLight(0xfff2cb, 0.24));

  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf7d58d,
    roughness: 0.18,
    metalness: 0.42,
    clearcoat: 1,
    clearcoatRoughness: 0.1,
    emissive: 0x2c1c06,
    emissiveIntensity: 0.18,
  });

  const softGoldMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff2cb,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const roseGlass = new THREE.MeshPhysicalMaterial({
    color: 0xf4a6b0,
    roughness: 0.06,
    metalness: 0.02,
    transmission: 0.58,
    thickness: 1.1,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.9,
    emissive: 0x5e151b,
    emissiveIntensity: 0.34,
  });

  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0.55);
  heartShape.bezierCurveTo(-0.96, 1.22, -1.8, 0.42, -1.16, -0.52);
  heartShape.bezierCurveTo(-0.82, -1.0, -0.18, -1.28, 0, -1.48);
  heartShape.bezierCurveTo(0.18, -1.28, 0.82, -1.0, 1.16, -0.52);
  heartShape.bezierCurveTo(1.8, 0.42, 0.96, 1.22, 0, 0.55);

  const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelSegments: 18,
    bevelSize: 0.065,
    bevelThickness: 0.085,
    curveSegments: 52,
  });
  heartGeometry.center();

  const heart = new THREE.Mesh(heartGeometry, roseGlass);
  heart.position.set(0, 0.2, 0.42);
  heart.scale.setScalar(0.46);
  glass.add(heart);

  const innerGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 32, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffd8cc,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  innerGlow.position.set(0, 0.14, 0.55);
  glass.add(innerGlow);

  const locket = new THREE.Group();
  relic.add(locket);

  const mainRing = new THREE.Mesh(new THREE.TorusGeometry(1.36, 0.035, 16, 160), goldMaterial);
  mainRing.rotation.set(1.18, -0.18, 0.34);
  locket.add(mainRing);

  const sideRing = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.014, 12, 148), softGoldMaterial);
  sideRing.rotation.set(1.34, 0.62, 1.55);
  locket.add(sideRing);

  const backRing = new THREE.Mesh(new THREE.TorusGeometry(1.66, 0.01, 12, 180), softGoldMaterial.clone());
  backRing.material.opacity = 0.14;
  backRing.rotation.set(1.44, -0.48, -0.52);
  locket.add(backRing);

  const crownMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff2cb,
    roughness: 0.14,
    metalness: 0.5,
    clearcoat: 1,
    emissive: 0x3a2505,
    emissiveIntensity: 0.2,
  });
  const crownGeometry = new THREE.SphereGeometry(0.035, 16, 10);
  const crown = [];
  for (let i = 0; i < 18; i += 1) {
    const bead = new THREE.Mesh(crownGeometry, crownMaterial);
    const angle = (i / 18) * Math.PI * 2;
    bead.position.set(Math.cos(angle) * 1.36, Math.sin(angle) * 1.36, 0.02);
    bead.scale.setScalar(i % 3 === 0 ? 1.45 : 1);
    mainRing.add(bead);
    crown.push(bead);
  }

  const pedestal = new THREE.Group();
  relic.add(pedestal);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 1.14, 0.16, 96),
    new THREE.MeshPhysicalMaterial({
      color: 0x19302d,
      roughness: 0.28,
      metalness: 0.18,
      clearcoat: 0.8,
      emissive: 0x051514,
      emissiveIntensity: 0.22,
    }),
  );
  base.position.y = -1.26;
  base.rotation.x = 0.05;
  pedestal.add(base);

  const baseTrim = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.018, 12, 124), goldMaterial);
  baseTrim.position.y = -1.16;
  baseTrim.rotation.x = Math.PI / 2;
  pedestal.add(baseTrim);

  const datePlaqueTexture = makeDateTexture(THREE);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(1.42, 0.34),
    new THREE.MeshBasicMaterial({
      map: datePlaqueTexture,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  plaque.position.set(0, -0.94, 0.92);
  plaque.rotation.x = -0.12;
  relic.add(plaque);

  const ribbonMaterial = new THREE.MeshBasicMaterial({
    color: 0x70d8c5,
    transparent: true,
    opacity: 0.18,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const ribbons = [];
  const ribbonSpecs = [
    { color: 0x70d8c5, opacity: 0.16, phase: 0 },
    { color: 0xf7d58d, opacity: 0.16, phase: 1.6 },
    { color: 0xf0a7a4, opacity: 0.12, phase: 3.2 },
  ];

  for (const spec of ribbonSpecs) {
    const points = [];
    for (let i = 0; i < 80; i += 1) {
      const t = i / 79;
      const angle = t * Math.PI * 2 + spec.phase;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * (1.52 + Math.sin(t * Math.PI * 4) * 0.12),
          -0.25 + Math.sin(angle * 1.7) * 0.84,
          Math.sin(angle) * 0.48,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    const material = ribbonMaterial.clone();
    material.color.setHex(spec.color);
    material.opacity = spec.opacity;
    const ribbon = new THREE.Mesh(new THREE.TubeGeometry(curve, 150, 0.006, 8, true), material);
    ribbon.userData = { speed: 0.003 + spec.phase * 0.0006 };
    ribbons.push(ribbon);
    relic.add(ribbon);
  }

  const dustCount = window.innerWidth < 680 ? 90 : 160;
  const dustPositions = new Float32Array(dustCount * 3);
  const dustColors = new Float32Array(dustCount * 3);
  const colorOptions = [new THREE.Color(0xfff2cb), new THREE.Color(0x70d8c5), new THREE.Color(0xf0a7a4)];
  for (let i = 0; i < dustCount; i += 1) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.7 + Math.random() * 2.4;
    dustPositions[i3] = Math.cos(angle) * radius;
    dustPositions[i3 + 1] = (Math.random() - 0.5) * 3.2;
    dustPositions[i3 + 2] = Math.sin(angle) * 1.25 - 0.6;
    const color = colorOptions[i % colorOptions.length];
    dustColors[i3] = color.r;
    dustColors[i3 + 1] = color.g;
    dustColors[i3 + 2] = color.b;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  dustGeometry.setAttribute("color", new THREE.BufferAttribute(dustColors, 3));
  const dust = new THREE.Points(
    dustGeometry,
    new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  atelier.add(dust);

  let pointerX = 0;
  let pointerY = 0;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const compact = width < 680;
    atelier.position.x = compact ? 0 : 1.68;
    atelier.position.y = compact ? 1.64 : -0.03;
    atelier.scale.setScalar(compact ? 0.54 : 1.08);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  resize();

  const clock = new THREE.Clock();

  function animate() {
    const time = clock.getElapsedTime();
    const intro = Math.min(1, time / 1.7);
    const easeIntro = 1 - Math.pow(1 - intro, 3);

    atelier.rotation.y += (pointerX * 0.09 - atelier.rotation.y) * 0.035;
    atelier.rotation.x += (-pointerY * 0.05 - atelier.rotation.x) * 0.035;
    atelier.scale.multiplyScalar(1);

    if (!reducedMotion) {
      relic.rotation.y = Math.sin(time * 0.28) * 0.08;
      relic.rotation.x = Math.sin(time * 0.34) * 0.025;
      relic.position.y = Math.sin(time * 1.05) * 0.035;

      heart.rotation.y += 0.006;
      heart.rotation.z = Math.sin(time * 0.88) * 0.035;
      heart.scale.setScalar((0.46 + Math.sin(time * 1.8) * 0.018) * easeIntro);

      innerGlow.scale.setScalar((0.86 + Math.sin(time * 2.4) * 0.12) * easeIntro);
      innerGlow.material.opacity = (0.22 + Math.sin(time * 2.1) * 0.08) * easeIntro;

      mainRing.rotation.z += 0.0034;
      sideRing.rotation.z -= 0.0048;
      backRing.rotation.z += 0.0022;

      plaque.position.y = -0.94 + Math.sin(time * 1.2) * 0.018;
      plaque.material.opacity = (0.78 + Math.sin(time * 1.6) * 0.08) * easeIntro;

      base.rotation.y += 0.002;
      baseTrim.rotation.z += 0.003;

      for (const ribbon of ribbons) {
        ribbon.rotation.y += ribbon.userData.speed;
        ribbon.rotation.z += ribbon.userData.speed * 0.55;
      }

      for (let i = 0; i < crown.length; i += 1) {
        crown[i].scale.setScalar((i % 3 === 0 ? 1.45 : 1) + Math.sin(time * 2 + i) * 0.12);
      }

      dust.rotation.y -= 0.0009;
      dust.rotation.z += 0.0004;
      dust.material.opacity = (0.36 + Math.sin(time * 1.1) * 0.08) * easeIntro;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

function makeDateTexture(THREE) {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 1024;
  textureCanvas.height = 256;
  const ctx = textureCanvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, textureCanvas.width, textureCanvas.height);
  gradient.addColorStop(0, "rgba(255, 242, 203, 0.1)");
  gradient.addColorStop(0.44, "rgba(247, 213, 141, 0.26)");
  gradient.addColorStop(1, "rgba(112, 216, 197, 0.1)");
  ctx.fillStyle = gradient;
  roundRect(ctx, 44, 42, 936, 172, 42);
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 242, 203, 0.72)";
  ctx.lineWidth = 3;
  roundRect(ctx, 54, 52, 916, 152, 36);
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 250, 242, 0.64)";
  ctx.font = "700 38px Manrope, Arial, sans-serif";
  ctx.letterSpacing = "6px";
  ctx.textAlign = "center";
  ctx.fillText("ENGRAVED ON MY HEART", 512, 92);

  const textGradient = ctx.createLinearGradient(250, 110, 774, 174);
  textGradient.addColorStop(0, "#fff2cb");
  textGradient.addColorStop(0.48, "#f7d58d");
  textGradient.addColorStop(1, "#f0a7a4");
  ctx.fillStyle = textGradient;
  ctx.font = "700 76px Georgia, serif";
  ctx.shadowColor = "rgba(247, 213, 141, 0.42)";
  ctx.shadowBlur = 28;
  ctx.fillText("17.06.2026", 512, 168);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

start();
