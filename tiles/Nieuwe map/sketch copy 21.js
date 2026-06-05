const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BAND_COUNT = 16;
const HOVER_RADIUS = 280;
const BASE_SEED = 2107;

let canvas;
let textureLayer;
let bands = [];
let pointer = {
  x: CANVAS_W * 0.5,
  y: CANVAS_H * 0.5,
  inside: false,
  amount: 0,
};

const palette = {
  ink: [3, 14, 58],
  inkDeep: [0, 7, 34],
  pink: [244, 0, 117],
  pinkDark: [124, 0, 84],
  cyan: [24, 198, 235],
  cyanDark: [10, 91, 143],
};

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);

  document.body.style.margin = "0";
  document.body.style.background = "#020a24";
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
  buildBands();
  buildTexture();
  fitCanvasToWindow();
}

function draw() {
  const t = millis() * 0.001;
  pointer.amount = lerp(pointer.amount, pointer.inside ? 1 : 0, 0.12);

  drawBackground(t);
  drawBands(t);
  drawInkCuts(t);
  drawHover(t);
  image(textureLayer, 0, 0);
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

function buildBands() {
  bands = [];

  for (let i = 0; i < BAND_COUNT; i++) {
    const x = map(i, -1, BAND_COUNT, -340, CANVAS_W + 340);
    const cyanBand = i % 4 === 1 || i % 7 === 0;
    const width = random(116, 176);

    bands.push({
      x,
      width,
      colorA: cyanBand ? palette.cyan : palette.pink,
      colorB: cyanBand ? palette.cyanDark : palette.pinkDark,
      phase: random(TWO_PI),
      lean: random(-20, 20),
      notch: random(0.33, 0.67),
      speed: random(0.45, 0.9),
      speckles: buildBandSpeckles(240),
    });
  }
}

function buildBandSpeckles(count) {
  const speckles = [];

  for (let i = 0; i < count; i++) {
    speckles.push({
      x: random(-0.25, 1.18),
      y: random(-0.06, 1.06),
      size: random(1, 5.8),
      stretch: random(0.75, 1.9),
      alpha: random(10, 46),
      drift: random(TWO_PI),
      dark: random() < 0.58,
    });
  }

  return speckles;
}

function drawBackground(t) {
  background(palette.inkDeep);

  const ctx = drawingContext;
  ctx.save();
  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  grad.addColorStop(0, "rgba(4, 20, 74, 1)");
  grad.addColorStop(0.45, "rgba(2, 11, 48, 1)");
  grad.addColorStop(1, "rgba(0, 4, 28, 1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noStroke();
  for (let i = 0; i < 28; i++) {
    const y = i * 46 + sin(t * 0.7 + i) * 8;
    fill(0, 20, 75, 23);
    rect(0, y, CANVAS_W, 18);
  }
}

function drawBands(t) {
  push();
  translate(CANVAS_W * 0.5, CANVAS_H * 0.5);
  rotate(radians(-19));
  translate(-CANVAS_W * 0.5, -CANVAS_H * 0.5);

  for (const band of bands) {
    drawZigzagBand(band, t);
  }

  pop();
}

function drawZigzagBand(band, t) {
  const hover = tiltedHoverInfluence(band.x + band.width * 0.5, CANVAS_H * 0.5, HOVER_RADIUS * 1.8);
  const pulse = sin(t * band.speed + band.phase) * 10;
  const wobble = hover * sin(t * 4.2 + band.phase) * 36;
  const w = band.width + hover * 42;
  const notchDepth = 250 + hover * 82;
  const x = band.x + band.lean + pulse + wobble;
  const top = -320;
  const bottom = CANVAS_H + 330;
  const midA = lerp(top, bottom, band.notch);
  const midB = midA + 270 + sin(band.phase) * 70;
  const c = lerpPalette(band.colorA, [255, 64, 172], hover * 0.32);
  const shadow = lerpPalette(band.colorB, palette.ink, 0.12);

  drawingContext.shadowBlur = hover * 42;
  drawingContext.shadowColor = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${0.42 * hover})`;

  noStroke();
  fill(shadow[0], shadow[1], shadow[2], 118);
  lightningShape(x + 24, top, w * 1.04, bottom, midA + 30, midB + 30, notchDepth);

  fill(c[0], c[1], c[2], 238);
  lightningShape(x, top, w, bottom, midA, midB, notchDepth);

  drawBandGradient(x, top, w, bottom, midA, midB, notchDepth, hover);
  drawBandSpeckles(x, top, w, bottom, midA, midB, notchDepth, band, hover, t);

  drawingContext.shadowBlur = 0;
}

function lightningShape(x, top, w, bottom, midA, midB, notchDepth) {
  beginShape();
  vertex(x, top);
  vertex(x + w, top);
  vertex(x + w + notchDepth, midA);
  vertex(x + w * 0.58, midA - 34);
  vertex(x + w * 0.88, bottom);
  vertex(x - w * 0.12, bottom);
  vertex(x - notchDepth, midB);
  vertex(x + w * 0.34, midB + 40);
  endShape(CLOSE);
}

function drawBandGradient(x, top, w, bottom, midA, midB, notchDepth, hover) {
  const ctx = drawingContext;
  ctx.save();
  clipLightningPath(ctx, x, top, w, bottom, midA, midB, notchDepth);
  const grad = ctx.createLinearGradient(x, top, x + w, bottom);
  grad.addColorStop(0, `rgba(255, 255, 255, ${0.15 + hover * 0.08})`);
  grad.addColorStop(0.35, "rgba(255, 255, 255, 0)");
  grad.addColorStop(0.78, `rgba(0, 0, 0, ${0.34 - hover * 0.08})`);
  grad.addColorStop(1, "rgba(0, 0, 0, 0.44)");
  ctx.fillStyle = grad;
  ctx.fillRect(x - notchDepth - 20, top, w + notchDepth * 2 + 40, bottom - top);
  ctx.restore();
}

function drawBandSpeckles(x, top, w, bottom, midA, midB, notchDepth, band, hover, t) {
  const col = band.colorB;
  const ctx = drawingContext;

  ctx.save();
  clipLightningPath(ctx, x, top, w, bottom, midA, midB, notchDepth);
  noStroke();
  for (const speckle of band.speckles) {
    const py = lerp(top, bottom, speckle.y);
    const px = x + speckle.x * w + sin(t * 1.4 + speckle.drift) * (2 + hover * 8);
    const nearCursor = tiltedHoverInfluence(px, py, HOVER_RADIUS);
    const alpha = speckle.alpha + nearCursor * 65;
    const size = speckle.size + nearCursor * 6;

    if (speckle.dark) {
      fill(palette.ink[0], palette.ink[1], palette.ink[2], alpha);
    } else {
      fill(col[0], col[1], col[2], alpha * 0.65);
    }

    ellipse(px, py, size * speckle.stretch, size);
  }
  ctx.restore();
}

function clipLightningPath(ctx, x, top, w, bottom, midA, midB, notchDepth) {
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x + w, top);
  ctx.lineTo(x + w + notchDepth, midA);
  ctx.lineTo(x + w * 0.58, midA - 34);
  ctx.lineTo(x + w * 0.88, bottom);
  ctx.lineTo(x - w * 0.12, bottom);
  ctx.lineTo(x - notchDepth, midB);
  ctx.lineTo(x + w * 0.34, midB + 40);
  ctx.closePath();
  ctx.clip();
}

function drawInkCuts(t) {
  push();
  translate(CANVAS_W * 0.5, CANVAS_H * 0.5);
  rotate(radians(-19));
  translate(-CANVAS_W * 0.5, -CANVAS_H * 0.5);

  for (let i = -2; i < 9; i++) {
    const x = i * 285 + sin(t * 0.8 + i) * 9;
    const hover = tiltedHoverInfluence(x + 120, CANVAS_H * 0.5, HOVER_RADIUS * 1.6);
    const w = 100 + (i % 3) * 28 + hover * 30;

    fill(palette.ink[0], palette.ink[1], palette.ink[2], 224);
    noStroke();
    beginShape();
    vertex(x, -260);
    vertex(x + w, -260);
    vertex(x + w + 280, CANVAS_H * 0.46);
    vertex(x + w * 0.42, CANVAS_H * 0.42);
    vertex(x + w + 115, CANVAS_H + 280);
    vertex(x - w * 0.35, CANVAS_H + 280);
    vertex(x - 280, CANVAS_H * 0.62);
    vertex(x + w * 0.32, CANVAS_H * 0.66);
    endShape(CLOSE);
  }

  pop();
}

function drawHover(t) {
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
    HOVER_RADIUS * 1.22
  );
  glow.addColorStop(0, `rgba(255, 255, 255, ${0.16 * pointer.amount})`);
  glow.addColorStop(0.28, `rgba(28, 210, 245, ${0.18 * pointer.amount})`);
  glow.addColorStop(0.62, `rgba(244, 0, 117, ${0.08 * pointer.amount})`);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noFill();
  strokeCap(ROUND);
  stroke(29, 212, 246, 90 * pointer.amount);
  strokeWeight(2);
  circle(pointer.x, pointer.y, 44 + sin(t * 5.5) * 5);

  stroke(245, 0, 119, 64 * pointer.amount);
  strokeWeight(1.4);
  circle(pointer.x, pointer.y, HOVER_RADIUS * 2 + sin(t * 2.2) * 18);

  for (let i = 0; i < 34; i++) {
    const a = i * 0.9 + t * 1.5;
    const r = 42 + noise(i, t * 0.8) * HOVER_RADIUS * 0.9;
    const x = pointer.x + cos(a) * r;
    const y = pointer.y + sin(a) * r;
    const h = hoverInfluence(x, y, HOVER_RADIUS);
    fill(255, 255, 255, 80 * h);
    noStroke();
    circle(x, y, 2 + h * 6);
  }
}

function buildTexture() {
  textureLayer = createGraphics(CANVAS_W, CANVAS_H);
  textureLayer.pixelDensity(1);
  textureLayer.clear();
  textureLayer.noStroke();

  for (let i = 0; i < 68000; i++) {
    const light = random() > 0.52;
    const shade = light ? random(185, 255) : random(0, 38);
    textureLayer.fill(shade, shade, shade, random(3, 17));
    textureLayer.rect(random(CANVAS_W), random(CANVAS_H), random(0.7, 2.2), random(0.7, 2.2));
  }

  for (let i = 0; i < 1700; i++) {
    const x = random(CANVAS_W);
    const y = random(CANVAS_H);
    const size = random(2, 10);
    textureLayer.fill(0, 8, 34, random(14, 48));
    textureLayer.ellipse(x, y, size * random(1, 2.7), size);
  }
}

function hoverInfluence(x, y, radius) {
  if (pointer.amount < 0.01) return 0;

  const d = dist(pointer.x, pointer.y, x, y);
  return pow(constrain(1 - d / radius, 0, 1), 2) * pointer.amount;
}

function tiltedHoverInfluence(x, y, radius) {
  if (pointer.amount < 0.01) return 0;

  const local = tiltedPointer();
  const d = dist(local.x, local.y, x, y);
  return pow(constrain(1 - d / radius, 0, 1), 2) * pointer.amount;
}

function tiltedPointer() {
  const angle = radians(19);
  const dx = pointer.x - CANVAS_W * 0.5;
  const dy = pointer.y - CANVAS_H * 0.5;

  return {
    x: CANVAS_W * 0.5 + cos(angle) * dx - sin(angle) * dy,
    y: CANVAS_H * 0.5 + sin(angle) * dx + cos(angle) * dy,
  };
}

function lerpPalette(a, b, amount) {
  return [
    lerp(a[0], b[0], amount),
    lerp(a[1], b[1], amount),
    lerp(a[2], b[2], amount),
  ];
}
