const canvas = document.querySelector("#stardust");
const ctx = canvas.getContext("2d");
const scene = document.querySelector(".scene");
const reveal = document.querySelector("#reveal");
const secret = document.querySelector("#secret");
const closeSecret = document.querySelector("#closeSecret");
const phraseText = document.querySelector("#phraseText");
const liveSignal = document.querySelector("#liveSignal");
const signalCount = document.querySelector("#signalCount");

const MEMORY_KEY = "love-memory-count-v2";

const phrases = [
  "ты появляешься — и мир становится тише",
  "в тебе есть свет, который не хочется объяснять",
  "иногда одного человека достаточно, чтобы день стал другим",
  "ты не случайность. ты редкое совпадение",
  "мне нравится, что этот момент теперь принадлежит тебе",
  "пусть эта маленькая вселенная хранит твою улыбку",
];

let width = 0;
let height = 0;
let particles = [];
let pointer = { x: 0.5, y: 0.46 };
let phraseIndex = 0;
let opened = false;
let backendLive = false;
let memoryCount = Number.parseInt(window.localStorage.getItem(MEMORY_KEY) || "1", 10);

function formatCount(value) {
  return String(Math.max(1, value)).padStart(2, "0");
}

function apiUrl(path) {
  const base = window.LOVE_API_BASE || "";
  return `${base}${path}`;
}

function setMemoryCount(value) {
  memoryCount = Math.max(1, value || 1);
  window.localStorage.setItem(MEMORY_KEY, String(memoryCount));
  if (signalCount) signalCount.textContent = formatCount(memoryCount);
}

async function pingBackend() {
  if (!liveSignal || !signalCount) return;

  setMemoryCount(memoryCount);

  try {
    const response = await window.fetch(apiUrl("/api/health"), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error("backend is offline");
    const data = await response.json();
    backendLive = true;
    liveSignal.classList.remove("is-offline");
    setMemoryCount(data.opens || memoryCount);
  } catch {
    backendLive = false;
    liveSignal.classList.add("is-offline");
  }
}

async function recordMemory(eventName) {
  if (!backendLive) {
    setMemoryCount(memoryCount + 1);
    return;
  }

  try {
    const response = await window.fetch(apiUrl("/api/heartbeat"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        event: eventName,
        at: new Date().toISOString(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }),
    });
    if (!response.ok) throw new Error("heartbeat failed");
    const data = await response.json();
    setMemoryCount(data.opens || memoryCount + 1);
  } catch {
    backendLive = false;
    liveSignal?.classList.add("is-offline");
    setMemoryCount(memoryCount + 1);
  }
}

document.body.classList.add("is-loading");

window.setTimeout(() => {
  document.body.classList.remove("is-loading");
  document.body.classList.add("is-ready");
}, 1400);

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.round(Math.min(118, Math.max(58, width / 13)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.8 + 0.45,
    a: Math.random() * 0.55 + 0.22,
    vx: (Math.random() - 0.5) * 0.18,
    vy: Math.random() * -0.24 - 0.05,
    hue: Math.random() > 0.55 ? "247, 213, 141" : "112, 216, 197",
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);

  for (const p of particles) {
    const dx = p.x - pointer.x * width;
    const dy = p.y - pointer.y * height;
    const pull = Math.max(0, 1 - Math.hypot(dx, dy) / 260);

    p.x += p.vx + dx * pull * 0.002;
    p.y += p.vy + dy * pull * 0.002;

    if (p.y < -20) p.y = height + 20;
    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + pull * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue}, ${p.a + pull * 0.35})`;
    ctx.shadowColor = `rgba(${p.hue}, 0.9)`;
    ctx.shadowBlur = 16 + pull * 26;
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

function moveLight(clientX, clientY) {
  pointer = {
    x: clientX / Math.max(width, 1),
    y: clientY / Math.max(height, 1),
  };
  scene.style.setProperty("--x", `${pointer.x * 100}%`);
  scene.style.setProperty("--y", `${pointer.y * 100}%`);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => moveLight(event.clientX, event.clientY));
window.addEventListener("pointerdown", (event) => moveLight(event.clientX, event.clientY));

function openSecret() {
  if (opened) return;
  opened = true;
  secret.hidden = false;
  document.body.classList.add("is-open");
  reveal.querySelector(".message__button-text").textContent = "еще";
  recordMemory("open-secret");
  burst();
}

function closeSecretPanel() {
  opened = false;
  secret.hidden = true;
  document.body.classList.remove("is-open");
  reveal.querySelector(".message__button-text").textContent = "открыть";
}

reveal.addEventListener("pointerup", openSecret);
closeSecret.addEventListener("pointerup", closeSecretPanel);

function rotatePhrase() {
  phraseText.classList.add("is-changing");

  window.setTimeout(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    phraseText.textContent = phrases[phraseIndex];
    phraseText.classList.remove("is-changing");
  }, 360);
}

window.setInterval(rotatePhrase, 15000);

function burst() {
  for (let i = 0; i < 28; i += 1) {
    particles.push({
      x: pointer.x * width + (Math.random() - 0.5) * 90,
      y: pointer.y * height + (Math.random() - 0.5) * 90,
      r: Math.random() * 2.2 + 0.8,
      a: Math.random() * 0.35 + 0.55,
      vx: (Math.random() - 0.5) * 2.2,
      vy: (Math.random() - 0.5) * 2.2,
      hue: Math.random() > 0.5 ? "240, 167, 164" : "247, 213, 141",
    });
  }
}

resize();
draw();
pingBackend();
