const intro = document.getElementById("intro");
const stage = document.getElementById("stage");
const loaderPercent = document.getElementById("loaderPercent");
const loaderBar = document.querySelector(".loader-bar");
const globeCanvas = document.getElementById("globe");
const globeWrap = document.getElementById("globeWrap");
const snowCanvas = document.getElementById("snow");
const music = document.getElementById("bgMusic");
const musicToggle = document.getElementById("musicToggle");
const storyPanel = document.getElementById("storyPanel");
const storyKicker = document.getElementById("storyKicker");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const easterEgg = document.getElementById("easterEgg");

const cities = [
  {
    name: "Nanjing",
    cn: "南京",
    lat: 32.06,
    lon: 118.79,
    tone: "#fff0a8",
    text:
      "城墙像一行慢慢展开的旧句子，秦淮河把灯影揉进水里。文学里的南京常有雨、有梧桐，也有一种温柔的迟疑，仿佛历史走到这里，会先放轻脚步。",
  },
  {
    name: "Tokyo",
    cn: "东京",
    lat: 35.68,
    lon: 139.76,
    tone: "#ffc1d5",
    text:
      "东京的清晨像刚拆开的信封，电车、便利店、窄巷里的小酒馆都醒得很轻。故事在霓虹和榻榻米之间移动，把孤独写成一盏还亮着的窗。",
  },
  {
    name: "Paris",
    cn: "巴黎",
    lat: 48.86,
    lon: 2.35,
    tone: "#ffe7a6",
    text:
      "巴黎总把日常写得像散文：面包裂开的声音，塞纳河边的风，旧书摊上微微发潮的纸。人在街角停一下，就像停在一段句子的逗号里。",
  },
  {
    name: "London",
    cn: "伦敦",
    lat: 51.51,
    lon: -0.13,
    tone: "#c8e9ff",
    text:
      "伦敦的雾不是遮挡，而是一种叙述方式。钟声、雨伞、河岸和地下铁把城市分成许多章节，每个人都像抱着一封没有寄出的长信。",
  },
  {
    name: "Cairo",
    cn: "开罗",
    lat: 30.04,
    lon: 31.24,
    tone: "#ffd6a3",
    text:
      "开罗在沙色和金色之间呼吸。尼罗河带来夜晚的凉，市场把香料、铜器和笑声堆成迷宫，古老的时间却一直站在远处，安静地发光。",
  },
  {
    name: "New York",
    cn: "纽约",
    lat: 40.71,
    lon: -74.01,
    tone: "#d5f2ff",
    text:
      "纽约像一页永远写不满的稿纸。街灯、消防梯、咖啡杯和凌晨的出租车挤在一起，让野心和疲惫都变得明亮，像玻璃幕墙上的月亮。",
  },
  {
    name: "Istanbul",
    cn: "伊斯坦布尔",
    lat: 41.01,
    lon: 28.98,
    tone: "#d9c1ff",
    text:
      "伊斯坦布尔把海峡当作书脊，一边翻向东方，一边翻向西方。渡轮的汽笛、清真寺的圆顶和茶杯里的红色，都让怀旧有了潮汐。",
  },
  {
    name: "Buenos Aires",
    cn: "布宜诺斯艾利斯",
    lat: -34.6,
    lon: -58.38,
    tone: "#bdf0d0",
    text:
      "布宜诺斯艾利斯的街道适合迷路。探戈从门缝里流出来，书店像剧场，黄昏把广场染成蜂蜜色，现实和梦在同一张地图上互相寻找。",
  },
  {
    name: "Shanghai",
    cn: "上海",
    lat: 31.23,
    lon: 121.47,
    tone: "#f8b8bd",
    text:
      "上海的故事常从一扇窗、一件旗袍或一阵江风开始。外滩的灯把往昔照得很近，弄堂里却仍有热汤、闲话和潮湿的烟火气。",
  },
];

const visited = new Set();
let selectedCity = null;
let projectedCities = [];
let globeRotation = -1.95;
let targetRotation = globeRotation;
let pointerDown = false;
let lastPointerX = 0;
let lastFrame = performance.now();
let readyAt = performance.now() + 2800;

function resizeCanvas(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return dpr;
}

function resizeAll() {
  const globeSize = Math.round(globeWrap.getBoundingClientRect().width);
  resizeCanvas(globeCanvas, globeSize, globeSize);
  resizeCanvas(snowCanvas, window.innerWidth, window.innerHeight);
}

function latLonToVector(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180) + globeRotation;
  return {
    x: -radius * Math.sin(phi) * Math.cos(theta),
    y: radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

function drawGlobe(now) {
  const ctx = globeCanvas.getContext("2d");
  const w = globeCanvas.width;
  const h = globeCanvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.38;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.clearRect(0, 0, w, h);

  if (!pointerDown) {
    targetRotation += 0.00042 * (now - lastFrame);
  }
  globeRotation += (targetRotation - globeRotation) * 0.055;

  const atmosphere = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.42, r * 0.08, cx, cy, r * 1.42);
  atmosphere.addColorStop(0, "rgba(255,255,255,0.88)");
  atmosphere.addColorStop(0.45, "rgba(135,188,214,0.2)");
  atmosphere.addColorStop(1, "rgba(103,139,175,0)");
  ctx.fillStyle = atmosphere;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.22, 0, Math.PI * 2);
  ctx.fill();

  const ocean = ctx.createRadialGradient(cx - r * 0.36, cy - r * 0.42, r * 0.12, cx, cy, r);
  ocean.addColorStop(0, "#8fc4df");
  ocean.addColorStop(0.5, "#4779a8");
  ocean.addColorStop(1, "#1f3d5e");
  ctx.fillStyle = ocean;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  drawContinents(ctx, cx, cy, r, now);
  drawClouds(ctx, cx, cy, r, now);
  const shade = ctx.createRadialGradient(cx - r * 0.42, cy - r * 0.45, r * 0.1, cx, cy, r);
  shade.addColorStop(0, "rgba(255,255,230,0.25)");
  shade.addColorStop(0.62, "rgba(44,74,59,0.05)");
  shade.addColorStop(1, "rgba(4,18,28,0.58)");
  ctx.fillStyle = shade;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.strokeStyle = "rgba(236, 252, 255, 0.52)";
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  projectedCities = [];
  cities.forEach((city, index) => {
    const lightProgress = Math.min(1, Math.max(0, (now - readyAt - index * 220) / 700));
    const v = latLonToVector(city.lat, city.lon, r);
    const visible = v.z > -r * 0.18;
    const scale = 0.74 + (v.z + r) / (r * 2) * 0.42;
    const x = cx + v.x;
    const y = cy - v.y;
    projectedCities.push({ city, x: x / dpr, y: y / dpr, visible, radius: 16 * scale });

    if (!visible || lightProgress <= 0) return;
    const isSelected = selectedCity === city.name;
    const pulse = 0.65 + Math.sin(now * 0.006 + index) * 0.35;
    const glowSize = (18 + pulse * 8 + (isSelected ? 16 : 0)) * dpr * scale * lightProgress;
    const dotSize = (4.5 + (isSelected ? 2.5 : 0)) * dpr * scale;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    glow.addColorStop(0, city.tone);
    glow.addColorStop(0.36, `${city.tone}aa`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff8cf";
    ctx.beginPath();
    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
    ctx.fill();

    if (isSelected || scale > 1.03) {
      drawCityLabel(ctx, city, x, y - 22 * dpr * scale, dpr, isSelected);
    }
  });
}

function drawContinents(ctx, cx, cy, r, now) {
  const blobs = [
    [-118, 47, 0.4, 0.2], [-96, 34, 0.48, 0.27], [-62, -16, 0.3, 0.48],
    [18, 3, 0.45, 0.48], [76, 42, 0.6, 0.28], [108, 23, 0.48, 0.31],
    [133, -24, 0.31, 0.24], [16, 58, 0.34, 0.2], [-42, 72, 0.3, 0.16],
  ];
  blobs.forEach(([lon, lat, sx, sy], index) => {
    const v = latLonToVector(lat, lon, r);
    if (v.z < -r * 0.5) return;
    const depth = Math.max(0.35, (v.z + r) / (r * 2));
    ctx.save();
    ctx.translate(cx + v.x, cy - v.y);
    ctx.rotate(Math.sin(now * 0.00028 + index) * 0.18);
    ctx.scale(sx * depth, sy * depth);
    ctx.fillStyle = index % 3 === 0 ? "#5f984e" : index % 3 === 1 ? "#8cbe71" : "#b0d28a";
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawClouds(ctx, cx, cy, r, now) {
  ctx.fillStyle = "rgba(255,255,240,0.22)";
  for (let i = 0; i < 11; i += 1) {
    const lon = -180 + i * 38 + ((now * 0.006) % 38);
    const lat = Math.sin(i * 1.7) * 38;
    const v = latLonToVector(lat, lon, r);
    if (v.z < -r * 0.1) continue;
    const depth = (v.z + r) / (r * 2);
    ctx.beginPath();
    ctx.ellipse(cx + v.x, cy - v.y, r * 0.23 * depth, r * 0.065 * depth, Math.sin(i) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCityLabel(ctx, city, x, y, dpr, active) {
  const text = active ? `${city.name} / ${city.cn}` : city.name;
  ctx.font = `${(active ? 15 : 12) * dpr}px Trebuchet MS, Microsoft YaHei, sans-serif`;
  const metrics = ctx.measureText(text);
  const padX = 8 * dpr;
  const width = metrics.width + padX * 2;
  const height = (active ? 24 : 20) * dpr;
  ctx.fillStyle = active ? "rgba(255, 250, 235, 0.94)" : "rgba(255,255,255,0.78)";
  roundRect(ctx, x - width / 2, y - height / 2, width, height, 10 * dpr);
  ctx.fill();
  ctx.fillStyle = "#594b45";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y + 1 * dpr);
}

function roundRect(ctx, x, y, w, h, radius) {
  const rr = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

const snowflakes = Array.from({ length: 150 }, () => ({
  x: Math.random(),
  y: Math.random(),
  r: Math.random() * 2.8 + 0.8,
  speed: Math.random() * 0.34 + 0.18,
  drift: Math.random() * 0.5 + 0.15,
  phase: Math.random() * Math.PI * 2,
  square: Math.random() > 0.72,
}));

function drawSnow(now) {
  const ctx = snowCanvas.getContext("2d");
  const w = snowCanvas.width;
  const h = snowCanvas.height;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "rgba(255,255,255,0.86)";
  snowflakes.forEach((flake) => {
    flake.y += flake.speed / (h / dpr);
    if (flake.y > 1.05) {
      flake.y = -0.05;
      flake.x = Math.random();
    }
    const x = (flake.x + Math.sin(now * 0.001 + flake.phase) * flake.drift * 0.04) * w;
    const y = flake.y * h;
    const size = flake.r * dpr;
    ctx.globalAlpha = 0.34 + Math.sin(now * 0.002 + flake.phase) * 0.18 + size / 10;
    if (flake.square) {
      ctx.fillRect(x, y, size * 1.8, size * 1.8);
    } else {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

function tick(now) {
  drawGlobe(now);
  drawSnow(now);
  lastFrame = now;
  requestAnimationFrame(tick);
}

function chooseCity(city) {
  selectedCity = city.name;
  visited.add(city.name);
  storyPanel.classList.remove("is-visible");
  window.setTimeout(() => {
    storyKicker.textContent = `${city.name} / ${city.cn}`;
    storyTitle.textContent = city.cn;
    storyText.textContent = city.text;
    storyPanel.classList.add("is-visible");
  }, 170);
  if (visited.size === cities.length) {
    easterEgg.classList.add("is-visible");
  }
}

function nearestCity(event) {
  const rect = globeCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  let best = null;
  let bestDistance = Infinity;
  projectedCities.forEach((item) => {
    if (!item.visible) return;
    const distance = Math.hypot(x - item.x, y - item.y);
    if (distance < item.radius + 10 && distance < bestDistance) {
      best = item.city;
      bestDistance = distance;
    }
  });
  return best;
}

function tryPlayMusic() {
  music.volume = 0.42;
  const playPromise = music.play();
  if (playPromise) {
    playPromise
      .then(() => musicToggle.classList.add("is-playing"))
      .catch(() => musicToggle.classList.remove("is-playing"));
  }
}

function completeLoading() {
  intro.classList.add("is-hidden");
  stage.classList.add("is-ready");
  storyPanel.classList.add("is-visible");
  tryPlayMusic();
}

function runLoader() {
  const started = performance.now();
  const duration = 2800;
  function update(now) {
    const progress = Math.min(1, (now - started) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const percent = Math.round(eased * 100);
    loaderPercent.textContent = `${percent}%`;
    loaderBar.style.setProperty("--load", `${percent}%`);
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      window.setTimeout(completeLoading, 160);
    }
  }
  requestAnimationFrame(update);
}

musicToggle.addEventListener("click", () => {
  if (music.paused) {
    tryPlayMusic();
  } else {
    music.pause();
    musicToggle.classList.remove("is-playing");
  }
});

music.addEventListener("play", () => musicToggle.classList.add("is-playing"));
music.addEventListener("pause", () => musicToggle.classList.remove("is-playing"));

globeCanvas.addEventListener("pointerdown", (event) => {
  pointerDown = true;
  lastPointerX = event.clientX;
  globeCanvas.setPointerCapture(event.pointerId);
});

globeCanvas.addEventListener("pointermove", (event) => {
  if (!pointerDown) return;
  const dx = event.clientX - lastPointerX;
  targetRotation += dx * 0.006;
  lastPointerX = event.clientX;
});

globeCanvas.addEventListener("pointerup", (event) => {
  pointerDown = false;
  const city = nearestCity(event);
  if (city) {
    chooseCity(city);
    tryPlayMusic();
  }
});

globeCanvas.addEventListener("pointercancel", () => {
  pointerDown = false;
});

window.addEventListener("resize", resizeAll);
window.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "m") {
    musicToggle.click();
  }
});

resizeAll();
runLoader();
requestAnimationFrame(tick);
