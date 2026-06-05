const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BASE_SEED = 2020;
const FAN_STEP_X = 370;
const FAN_STEP_Y = 252;
const FAN_RADIUS = 205;
const HOVER_RADIUS = 245;

let canvas;
let fans = [];
let grainLayer;
let pointer = {
  x: CANVAS_W * 0.5,
  y: CANVAS_H * 0.5,
  inside: false,
  amount: 0,
};

const palette = {
  ink: [0, 4, 36],
  inkSoft: [2, 10, 50],
  white: [239, 245, 252],
  ice: [197, 212, 219],
  sage: [126, 164, 134],
  moss: [92, 139, 111],
};

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);

  document.body.style.margin = "0";
  document.body.style.background = "#000424";
  document.body.style.overflow = "hidden";
  canvas.style("display", "block");
  canvas.style("cursor", "crosshair");

  canvas.elt.addEventListener("pointerenter", (event) => {
    updatePointer(event);
    pointer.inside = true;
  });

  canvas.elt.addEventListener("pointerleave", () => {
    pointer.inside = false;
  });

  canvas.elt.addEventListener("pointermove", updatePointer);
  canvas.elt.addEventListener("pointerdown", updatePointer);

  randomSeed(BASE_SEED);
  noiseSeed(BASE_SEED);
  buildFans();
  buildGrain();
  fitCanvasToWindow();
}

function draw() {
  const t = millis() * 0.001;
  pointer.amount = lerp(pointer.amount, pointer.inside ? 1 : 0, 0.1);

  drawBackground(t);
  drawFans(t);
  drawHoverField(t);
  image(grainLayer, 0, 0);
}

function windowResized() {
  fitCanvasToWindow();
}

function fitCanvasToWindow() {
  const fit = min(windowWidth / CANVAS_W, windowHeight / CANVAS_H);
  canvas.style("width", floor(CANVAS_W * fit) + "px");
  canvas.style("height", floor(CANVAS_H * fit) + "px");
}

function updatePointer(event) {
  const bounds = canvas.elt.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * CANVAS_W;
  pointer.y = ((event.clientY - bounds.top) / bounds.height) * CANVAS_H;
}

function buildFans() {
  fans = [];

  for (let row = -2; row <= ceil(CANVAS_H / FAN_STEP_Y) + 3; row++) {
    const offsetX = row % 2 === 0 ? 0 : FAN_STEP_X * 0.5;
    const y = row * FAN_STEP_Y + 104;

    for (let x = -FAN_STEP_X * 1.5; x <= CANVAS_W + FAN_STEP_X * 1.5; x += FAN_STEP_X) {
      const cx = x + offsetX;
      const dominant = positiveMod(row + floor(x / FAN_STEP_X), 6);

      fans.push({
        x: cx,
        y,
        radius: FAN_RADIUS,
        phase: random(TWO_PI),
        tone: dominant,
        row,
      });
    }
  }
}

function drawBackground(t) {
  background(palette.ink);

  const ctx = drawingContext;
  ctx.save();
  const grad = ctx.createRadialGradient(
    CANVAS_W * 0.5,
    CANVAS_H * 0.46,
    80,
    CANVAS_W * 0.5,
    CANVAS_H * 0.5,
    CANVAS_W * 0.78
  );
  grad.addColorStop(0, "rgba(8, 18, 62, 0.86)");
  grad.addColorStop(0.55, "rgba(0, 7, 42, 0.94)");
  grad.addColorStop(1, "rgba(0, 3, 28, 1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

function drawFans(t) {
  const sortedFans = [...fans].sort((a, b) => a.y - b.y);

  for (const fan of sortedFans) {
    drawFan(fan, t);
  }
}

function drawFan(fan, t) {
  const influence = hoverInfluence(fan.x, fan.y - fan.radius * 0.42, HOVER_RADIUS + fan.radius * 0.14);
  const drift = hoverPush(fan.x, fan.y - fan.radius * 0.42, HOVER_RADIUS + fan.radius * 0.18, 12);
  const radius = fan.radius + influence * 19;
  const lineGap = 18 + influence * 2.1;
  const lineWeight = 8.2 + influence * 2.2;
  const ringCount = 10;
  const angleOpen = 0.025 + influence * 0.035;
  const fanColor = fanPalette(fan.tone, influence);

  push();
  translate(fan.x + drift.x, fan.y + drift.y);
  rotate(influence * 0.018 * sin(fan.phase));

  drawingContext.shadowBlur = influence * 24;
  drawingContext.shadowColor = `rgba(236, 245, 250, ${0.28 * influence})`;

  noFill();
  strokeCap(SQUARE);

  for (let i = 0; i < ringCount; i++) {
    const p = i / max(1, ringCount - 1);
    const r = radius - i * lineGap;
    const wobble = sin(t * 2.4 + fan.phase + i * 0.36) * influence * 1.5;
    const alpha = 178 + p * 58 + influence * 45;
    const col = tintFanColor(fanColor, p, influence);

    stroke(col[0], col[1], col[2], alpha);
    strokeWeight(max(4, lineWeight - i * 0.22));
    arc(0, 0, r * 2 + wobble, r * 2 + wobble, PI + angleOpen, TWO_PI - angleOpen);
  }

  drawFanBase(radius, ringCount, lineGap, fanColor, influence, t + fan.phase);
  drawingContext.shadowBlur = 0;
  pop();
}

function drawFanBase(radius, ringCount, lineGap, col, influence, t) {
  const inner = radius - (ringCount - 1) * lineGap;
  const y = sin(t * 2.4) * influence * 2;

  noStroke();
  fill(col[0], col[1], col[2], 185 + influence * 45);
  beginShape();
  vertex(-inner * 0.46, y);
  bezierVertex(-inner * 0.34, -inner * 0.22, inner * 0.34, -inner * 0.22, inner * 0.46, y);
  vertex(inner * 0.28, inner * 0.19);
  vertex(-inner * 0.28, inner * 0.19);
  endShape(CLOSE);
}

function drawHoverField(t) {
  if (pointer.amount < 0.01) return;

  const ctx = drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const glow = ctx.createRadialGradient(
    pointer.x,
    pointer.y,
    0,
    pointer.x,
    pointer.y,
    HOVER_RADIUS * 1.25
  );
  glow.addColorStop(0, `rgba(242, 248, 250, ${0.18 * pointer.amount})`);
  glow.addColorStop(0.38, `rgba(130, 168, 138, ${0.12 * pointer.amount})`);
  glow.addColorStop(1, "rgba(130, 168, 138, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noFill();
  strokeCap(ROUND);
  stroke(240, 247, 251, 72 * pointer.amount);
  strokeWeight(2);
  circle(pointer.x, pointer.y, 42 + sin(t * 5.2) * 5);

  stroke(126, 164, 134, 54 * pointer.amount);
  strokeWeight(1.5);
  circle(pointer.x, pointer.y, HOVER_RADIUS * 2 + sin(t * 2.1) * 18);
}

function fanPalette(tone, influence) {
  if (tone === 0 || tone === 4) return lerpPalette(palette.white, palette.ice, influence * 0.22);
  if (tone === 1 || tone === 5) return lerpPalette(palette.sage, palette.white, influence * 0.5);
  if (tone === 2) return lerpPalette(palette.moss, palette.sage, 0.42 + influence * 0.3);
  return lerpPalette(palette.ice, palette.white, influence * 0.36);
}

function tintFanColor(col, ringProgress, influence) {
  const shade = 1 - ringProgress * 0.14 + influence * 0.12;
  return [
    constrain(col[0] * shade + influence * 18, 0, 255),
    constrain(col[1] * shade + influence * 20, 0, 255),
    constrain(col[2] * shade + influence * 16, 0, 255),
  ];
}

function lerpPalette(a, b, amount) {
  return [
    lerp(a[0], b[0], amount),
    lerp(a[1], b[1], amount),
    lerp(a[2], b[2], amount),
  ];
}

function hoverInfluence(x, y, radius) {
  if (pointer.amount < 0.01) return 0;

  const d = dist(pointer.x, pointer.y, x, y);
  return pow(constrain(1 - d / radius, 0, 1), 2) * pointer.amount;
}

function hoverPush(x, y, radius, strength) {
  const amount = hoverInfluence(x, y, radius);
  if (amount <= 0) {
    return { x: 0, y: 0 };
  }

  const angle = atan2(y - pointer.y, x - pointer.x);
  const ripple = sin(dist(pointer.x, pointer.y, x, y) * 0.04 - millis() * 0.006) * amount * 9;

  return {
    x: cos(angle) * (strength * amount + ripple),
    y: sin(angle) * (strength * amount + ripple),
  };
}

function buildGrain() {
  grainLayer = createGraphics(CANVAS_W, CANVAS_H);
  grainLayer.pixelDensity(1);
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i = 0; i < 34000; i++) {
    const shade = random() > 0.58 ? 255 : 0;
    grainLayer.fill(shade, shade, shade, random(3, 12));
    grainLayer.rect(random(CANVAS_W), random(CANVAS_H), random(0.7, 1.8), random(0.7, 1.8));
  }
}

function positiveMod(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}
