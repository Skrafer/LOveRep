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

  const isCompact = window.innerWidth < 680;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0, 7.3);

  const group = new THREE.Group();
  scene.add(group);

  const portalGroup = new THREE.Group();
  scene.add(portalGroup);

  const key = new THREE.PointLight(0xf7d58d, 2.2, 12);
  key.position.set(3.2, 2.1, 4.8);
  scene.add(key);

  const fill = new THREE.PointLight(0x70d8c5, 1.8, 10);
  fill.position.set(-3.8, -1.2, 3.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xf0a7a4, 1.2);
  rim.position.set(0, 4, 2);
  scene.add(rim);

  const starCount = isCompact ? 140 : 240;
  const starPositions = new Float32Array(starCount * 3);
  const starColors = new Float32Array(starCount * 3);
  const gold = new THREE.Color(0xf7d58d);
  const teal = new THREE.Color(0x70d8c5);
  const rose = new THREE.Color(0xf0a7a4);

  for (let i = 0; i < starCount; i += 1) {
    const i3 = i * 3;
    const radius = 2.4 + Math.random() * 5.8;
    const angle = Math.random() * Math.PI * 2;
    starPositions[i3] = Math.cos(angle) * radius;
    starPositions[i3 + 1] = (Math.random() - 0.5) * 5.2;
    starPositions[i3 + 2] = -1.6 - Math.random() * 3.2 + Math.sin(angle) * 0.8;

    const color = Math.random() > 0.62 ? gold : Math.random() > 0.48 ? teal : rose;
    starColors[i3] = color.r;
    starColors[i3 + 1] = color.g;
    starColors[i3 + 2] = color.b;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

  const starfield = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      size: isCompact ? 0.028 : 0.022,
      vertexColors: true,
      transparent: true,
      opacity: 0.54,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  );
  portalGroup.add(starfield);

  const portalRings = [];
  const portalMaterials = [
    new THREE.MeshBasicMaterial({
      color: 0xf7d58d,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    new THREE.MeshBasicMaterial({
      color: 0x70d8c5,
      transparent: true,
      opacity: 0.11,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    new THREE.MeshBasicMaterial({
      color: 0xf0a7a4,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  ];

  for (let i = 0; i < 3; i += 1) {
    const portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.85 + i * 0.34, 0.006 + i * 0.002, 10, 132),
      portalMaterials[i],
    );
    portalRing.rotation.set(1.16 + i * 0.12, -0.28 + i * 0.18, i * 0.68);
    portalRing.userData = { speed: 0.0032 + i * 0.0016, pulse: 1 + i * 0.55 };
    portalRings.push(portalRing);
    portalGroup.add(portalRing);
  }

  const constellationGeometry = new THREE.BufferGeometry();
  const constellationPositions = [];
  const constellationCount = isCompact ? 18 : 28;
  for (let i = 0; i < constellationCount; i += 1) {
    const angle = (i / constellationCount) * Math.PI * 2;
    const next = angle + Math.PI * 2 / constellationCount;
    const r1 = 1.35 + Math.random() * 0.95;
    const r2 = 1.35 + Math.random() * 0.95;
    constellationPositions.push(
      Math.cos(angle) * r1,
      Math.sin(angle * 1.7) * 0.74,
      Math.sin(angle) * 0.62,
      Math.cos(next) * r2,
      Math.sin(next * 1.7) * 0.74,
      Math.sin(next) * 0.62,
    );
  }
  constellationGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(constellationPositions, 3),
  );
  const constellation = new THREE.LineSegments(
    constellationGeometry,
    new THREE.LineBasicMaterial({
      color: 0xfff2cb,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  portalGroup.add(constellation);

  const ringMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfff1d0,
    roughness: 0.18,
    metalness: 0.16,
    transmission: 0.35,
    thickness: 0.9,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    emissive: 0x2b1a12,
    emissiveIntensity: 0.12,
  });

  const ring = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.25, 0.08, 180, 14, 2, 5),
    ringMaterial,
  );
  ring.rotation.set(0.8, -0.25, 0.35);
  group.add(ring);

  const heartShape = new THREE.Shape();
  heartShape.moveTo(0, 0.52);
  heartShape.bezierCurveTo(-0.92, 1.18, -1.72, 0.42, -1.1, -0.48);
  heartShape.bezierCurveTo(-0.78, -0.94, -0.16, -1.22, 0, -1.42);
  heartShape.bezierCurveTo(0.16, -1.22, 0.78, -0.94, 1.1, -0.48);
  heartShape.bezierCurveTo(1.72, 0.42, 0.92, 1.18, 0, 0.52);

  const heartGeometry = new THREE.ExtrudeGeometry(heartShape, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: isCompact ? 8 : 14,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    curveSegments: isCompact ? 28 : 42,
  });
  heartGeometry.center();

  const heartMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf2a1aa,
    roughness: 0.09,
    metalness: 0.02,
    transmission: 0.62,
    thickness: 0.95,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    transparent: true,
    opacity: 0.88,
    emissive: 0x5e151b,
    emissiveIntensity: 0.28,
  });

  const heart = new THREE.Mesh(heartGeometry, heartMaterial);
  heart.position.set(-0.06, 0.02, 0.62);
  heart.rotation.set(0.08, -0.18, 0.04);
  heart.scale.setScalar(0.001);
  group.add(heart);

  const heartCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, isCompact ? 18 : 28, isCompact ? 12 : 18),
    new THREE.MeshBasicMaterial({
      color: 0xffd9c9,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    }),
  );
  heartCore.position.copy(heart.position);
  heartCore.position.z += 0.05;
  group.add(heartCore);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.012, 12, 96),
    new THREE.MeshBasicMaterial({
      color: 0xf7d58d,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.position.copy(heart.position);
  halo.rotation.set(1.2, -0.36, 0.24);
  group.add(halo);

  const satellites = [];
  const satelliteGeometry = new THREE.SphereGeometry(0.025, 12, 8);
  const satelliteMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff2cb,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
  });

  for (let i = 0; i < (isCompact ? 5 : 8); i += 1) {
    const satellite = new THREE.Mesh(satelliteGeometry, satelliteMaterial.clone());
    satellite.userData = {
      angle: (i / (isCompact ? 5 : 8)) * Math.PI * 2,
      radius: 0.48 + Math.random() * 0.22,
      speed: 0.42 + Math.random() * 0.18,
    };
    satellites.push(satellite);
    group.add(satellite);
  }

  const gemMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xf7d58d,
    roughness: 0.16,
    metalness: 0.18,
    transmission: 0.28,
    thickness: 0.7,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    transparent: true,
    opacity: 0.82,
    emissive: 0x3a2a08,
    emissiveIntensity: 0.18,
  });

  const gem = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 1), gemMaterial);
  gem.position.set(isCompact ? 1.42 : -1.42, isCompact ? -0.86 : -1.22, 0.18);
  gem.rotation.set(0.3, 0.7, 0.2);
  group.add(gem);

  const gemHalo = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.01, 12, 92),
    new THREE.MeshBasicMaterial({
      color: 0xf7d58d,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    }),
  );
  gemHalo.position.copy(gem.position);
  gemHalo.rotation.set(1.1, 0.2, -0.4);
  group.add(gemHalo);

  const shardMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x9deee1,
    roughness: 0.24,
    metalness: 0.05,
    transmission: 0.42,
    thickness: 0.6,
    clearcoat: 1,
    transparent: true,
    opacity: 0.82,
  });

  const shards = [];
  const shardGeometry = new THREE.OctahedronGeometry(0.13, 0);

  const shardCount = isCompact ? 24 : 38;

  for (let i = 0; i < shardCount; i += 1) {
    const shard = new THREE.Mesh(shardGeometry, shardMaterial.clone());
    const angle = (i / shardCount) * Math.PI * 2;
    const radius = 1.85 + Math.random() * 1.35;
    shard.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.7) * 0.62 + (Math.random() - 0.5) * 1.7,
      Math.sin(angle) * 0.65 + (Math.random() - 0.5) * 0.65,
    );
    shard.scale.setScalar(0.45 + Math.random() * 1.8);
    shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    shard.userData = {
      angle,
      radius,
      speed: 0.18 + Math.random() * 0.34,
      lift: Math.random() * Math.PI * 2,
    };
    shards.push(shard);
    group.add(shard);
  }

  let pointerX = 0;
  let pointerY = 0;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    group.position.x = width < 680 ? 0 : 1.8;
    group.position.y = width < 680 ? 1.72 : -0.05;
    group.scale.setScalar(width < 680 ? 0.46 : 1.05);

    portalGroup.position.x = width < 680 ? 0 : 1.55;
    portalGroup.position.y = width < 680 ? 1.7 : -0.03;
    portalGroup.position.z = -0.34;
    portalGroup.scale.setScalar(width < 680 ? 0.48 : 1.08);
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
    const intro = Math.min(1, time / 1.6);
    const easeIntro = 1 - Math.pow(1 - intro, 3);

    group.rotation.y += (pointerX * 0.18 - group.rotation.y) * 0.035;
    group.rotation.x += (-pointerY * 0.1 - group.rotation.x) * 0.035;
    portalGroup.rotation.y += (pointerX * 0.08 - portalGroup.rotation.y) * 0.025;
    portalGroup.rotation.x += (-pointerY * 0.04 - portalGroup.rotation.x) * 0.025;

    if (!reducedMotion) {
      starfield.rotation.y += 0.0008;
      starfield.rotation.z -= 0.00035;
      constellation.rotation.z -= 0.0018;
      constellation.material.opacity = (0.08 + Math.sin(time * 1.3) * 0.035) * easeIntro;

      for (const portalRing of portalRings) {
        portalRing.rotation.z += portalRing.userData.speed;
        portalRing.rotation.x += portalRing.userData.speed * 0.35;
        portalRing.material.opacity = (0.1 + Math.sin(time * portalRing.userData.pulse) * 0.035) * easeIntro;
      }

      ring.rotation.x += 0.0032;
      ring.rotation.z += 0.0025;
      heart.rotation.y += 0.0045;
      heart.scale.setScalar((0.38 + Math.sin(time * 1.8) * 0.02) * easeIntro);
      heartCore.scale.setScalar((0.85 + Math.sin(time * 2.4) * 0.1) * easeIntro);
      heartCore.material.opacity = (0.32 + Math.sin(time * 2.1) * 0.08) * easeIntro;
      halo.rotation.z -= 0.004;
      halo.scale.setScalar(0.7 + easeIntro * 0.3);
      halo.material.opacity = (0.22 + Math.sin(time * 1.6) * 0.08) * easeIntro;
      gem.rotation.x += 0.004;
      gem.rotation.y -= 0.006;
      gem.position.y += Math.sin(time * 1.4) * 0.0018;
      gemHalo.rotation.z += 0.005;
      gemHalo.material.opacity = (0.16 + Math.sin(time * 1.7) * 0.06) * easeIntro;
    }

    for (const satellite of satellites) {
      const data = satellite.userData;
      const orbit = data.angle + time * data.speed;
      satellite.position.set(
        heart.position.x + Math.cos(orbit) * data.radius,
        heart.position.y + Math.sin(orbit * 1.3) * 0.22,
        heart.position.z + Math.sin(orbit) * 0.32,
      );
      satellite.material.opacity = (0.45 + Math.sin(time * 2 + data.angle) * 0.22) * easeIntro;
    }

    for (const shard of shards) {
      const data = shard.userData;
      const orbit = data.angle + time * data.speed * 0.22;
      shard.position.x = Math.cos(orbit) * data.radius;
      shard.position.z = Math.sin(orbit) * 0.82;
      shard.position.y += Math.sin(time * data.speed + data.lift) * 0.0028;
      shard.rotation.x += 0.003 + data.speed * 0.001;
      shard.rotation.y += 0.004 + data.speed * 0.001;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
}

start();
