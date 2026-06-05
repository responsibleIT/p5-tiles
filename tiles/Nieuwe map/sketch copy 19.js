const CANVAS_W = 1920;
const CANVAS_H = 1080;
const TILE = 84;
const HOVER_RADIUS = 260;

let canvas;
let pointer = {
  x: CANVAS_W * 0.5,
  y: CANVAS_H * 0.5,
  inside: false,
  amount: 0,
};

let mutedGreen;
let mutedPurple;
let softGreen;
let softPurple;
let ink;
let paper;
let grainLayer;

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);

  mutedGreen = color(116, 199, 137);
  mutedPurple = color(164, 148, 195);
  softGreen = color(143, 216, 158);
  softPurple = color(187, 174, 211);
  ink = color(31, 29, 35);
  paper = color(238, 237, 232);

  document.body.style.margin = "0";
  document.body.style.background = "#d9d5dc";
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

  buildGrain();
  fitCanvasToWindow();
}

function draw() {
  const t = millis() * 0.001;
  pointer.amount = lerp(pointer.amount, pointer.inside ? 1 : 0, 0.12);

  background(216, 212, 220);
  drawTiles(t);
  drawCrosses(t);
  drawHover(t);
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

function drawTiles(t) {
  noStroke();

  const startCol = -2;
  const endCol = ceil(CANVAS_W / TILE) + 2;
  const startRow = -2;
  const endRow = ceil(CANVAS_H / TILE) + 2;

  for (let row = startRow; row < endRow; row++) {
    for (let col = startCol; col < endCol; col++) {
      const centerX = (col + 0.5) * TILE;
      const centerY = (row + 0.5) * TILE;
      const influence = hoverInfluence(centerX, centerY, HOVER_RADIUS);
      const wave = sin(col * 0.65 + row * 0.38 + t * 1.7) * 0.5 + 0.5;
      const baseColor = (col + row) % 2 === 0 ? mutedGreen : mutedPurple;
      const hoverColor = (col + row) % 2 === 0 ? softGreen : softPurple;
      const tileColor = lerpColor(baseColor, hoverColor, influence * 0.85);

      fill(red(tileColor), green(tileColor), blue(tileColor), 248);

      const p1 = wavePoint(col, row, t);
      const p2 = wavePoint(col + 1, row, t);
      const p3 = wavePoint(col + 1, row + 1, t);
      const p4 = wavePoint(col, row + 1, t);
      const inset = 0.6 + influence * 1.4 + wave * 0.35;

      beginShape();
      vertex(lerp(p1.x, centerX, inset / TILE), lerp(p1.y, centerY, inset / TILE));
      vertex(lerp(p2.x, centerX, inset / TILE), lerp(p2.y, centerY, inset / TILE));
      vertex(lerp(p3.x, centerX, inset / TILE), lerp(p3.y, centerY, inset / TILE));
      vertex(lerp(p4.x, centerX, inset / TILE), lerp(p4.y, centerY, inset / TILE));
      endShape(CLOSE);
    }
  }
}

function drawCrosses(t) {
  const startCol = -1;
  const endCol = ceil(CANVAS_W / TILE) + 1;
  const startRow = -1;
  const endRow = ceil(CANVAS_H / TILE) + 1;

  rectMode(CENTER);
  noStroke();

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      const p = wavePoint(col, row, t);
      const influence = hoverInfluence(p.x, p.y, HOVER_RADIUS * 1.05);
      const parity = abs(col + row) % 2;
      const crossColor = parity === 0 ? ink : paper;
      const wavePulse = sin(t * 2.6 + col * 0.55 + row * 0.4) * 0.5 + 0.5;
      const size = 26 + wavePulse * 3 + influence * 13;
      const weight = 8.5 + influence * 2.5;

      push();
      translate(p.x, p.y);
      rotate(sin(t * 1.5 + col * 0.42 + row * 0.3) * 0.05 + influence * 0.32);
      fill(red(crossColor), green(crossColor), blue(crossColor), 235);
      rect(0, 0, size, weight, 1.5);
      rect(0, 0, weight, size, 1.5);
      pop();
    }
  }

  rectMode(CORNER);
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
    HOVER_RADIUS * 1.25
  );
  glow.addColorStop(0, `rgba(246, 245, 235, ${0.2 * pointer.amount})`);
  glow.addColorStop(0.42, `rgba(177, 206, 178, ${0.11 * pointer.amount})`);
  glow.addColorStop(1, "rgba(177, 206, 178, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noFill();
  stroke(245, 244, 238, 75 * pointer.amount);
  strokeWeight(2);
  circle(pointer.x, pointer.y, 38 + sin(t * 5) * 5);

  stroke(36, 33, 42, 42 * pointer.amount);
  strokeWeight(1.4);
  circle(pointer.x, pointer.y, HOVER_RADIUS * 2 + sin(t * 2.3) * 18);
}

function wavePoint(col, row, t) {
  const x = col * TILE;
  const y = row * TILE;
  const wideWave = sin(y * 0.018 + t * 1.45) * 15;
  const crossWave = sin((x + y) * 0.009 - t * 1.15) * 8;
  const verticalWave = cos(x * 0.014 - t * 1.35) * 13;
  const slowSwell = sin((x - y) * 0.006 + t * 0.72) * 6;
  const hover = hoverRipple(x, y, t);

  return {
    x: x + wideWave + crossWave + hover.x,
    y: y + verticalWave + slowSwell + hover.y,
  };
}

function hoverRipple(x, y, t) {
  if (pointer.amount < 0.01) {
    return { x: 0, y: 0 };
  }

  const dx = x - pointer.x;
  const dy = y - pointer.y;
  const d = sqrt(dx * dx + dy * dy);
  const influence = pow(constrain(1 - d / HOVER_RADIUS, 0, 1), 2) * pointer.amount;

  if (influence <= 0) {
    return { x: 0, y: 0 };
  }

  const angle = atan2(dy, dx);
  const ripple = sin(d * 0.055 - t * 7.5) * 18 * influence;
  const push = 22 * influence;

  return {
    x: cos(angle) * (push + ripple),
    y: sin(angle) * (push + ripple),
  };
}

function hoverInfluence(x, y, radius) {
  if (pointer.amount < 0.01) return 0;

  const d = dist(pointer.x, pointer.y, x, y);
  return pow(constrain(1 - d / radius, 0, 1), 2) * pointer.amount;
}

function buildGrain() {
  grainLayer = createGraphics(CANVAS_W, CANVAS_H);
  grainLayer.pixelDensity(1);
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i = 0; i < 28000; i++) {
    const shade = random() > 0.55 ? 255 : 24;
    grainLayer.fill(shade, shade, shade, random(3, 12));
    grainLayer.rect(random(CANVAS_W), random(CANVAS_H), random(0.8, 1.8), random(0.8, 1.8));
  }
}
