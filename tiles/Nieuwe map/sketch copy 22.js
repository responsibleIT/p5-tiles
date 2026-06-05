const CANVAS_W = 1920;
const CANVAS_H = 1080;
const CENTER_X = CANVAS_W * 0.63;
const CENTER_Y = CANVAS_H * 0.51;
const RING_COUNT = 28;
const LOOP_SECONDS = 5.2;
const POINT_DETAIL = 84;

let canvas;
let grainLayer;
let loopPhase = 0;
let hoverReverse = false;

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(60);
  colorMode(RGB, 255, 255, 255, 255);

  document.body.style.margin = "0";
  document.body.style.background = "#020202";
  document.body.style.overflow = "hidden";
  canvas.style("display", "block");
  canvas.style("position", "fixed");
  canvas.style("left", "50%");
  canvas.style("top", "50%");
  canvas.style("transform", "translate(-50%, -50%)");
  canvas.elt.addEventListener("pointerenter", () => {
    hoverReverse = true;
  });
  canvas.elt.addEventListener("pointerleave", () => {
    hoverReverse = false;
  });

  noiseSeed(22022);
  randomSeed(22022);
  buildGrain();
  fitCanvasToWindow();
}

function draw() {
  const direction = hoverReverse ? -1 : 1;
  loopPhase = (loopPhase + (deltaTime / 1000 / LOOP_SECONDS) * direction + 1) % 1;
  const pulse = TWO_PI * loopPhase;

  drawTunnelBackground(pulse);
  drawSpiralTunnel(pulse);
  drawVignette();
  image(grainLayer, 0, 0);
}

function windowResized() {
  fitCanvasToWindow();
}

function fitCanvasToWindow() {
  const scale = max(windowWidth / CANVAS_W, windowHeight / CANVAS_H);
  canvas.style("width", floor(CANVAS_W * scale) + "px");
  canvas.style("height", floor(CANVAS_H * scale) + "px");
}

function drawTunnelBackground(pulse) {
  background(1, 2, 3);

  const ctx = drawingContext;
  ctx.save();
  const glow = ctx.createRadialGradient(
    CENTER_X,
    CENTER_Y,
    20,
    CENTER_X,
    CENTER_Y,
    CANVAS_W * 0.88
  );
  glow.addColorStop(0, "rgba(35, 0, 0, 0.95)");
  glow.addColorStop(0.32, "rgba(15, 2, 4, 1)");
  glow.addColorStop(0.72, "rgba(2, 7, 9, 1)");
  glow.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noStroke();
  for (let i = 0; i < 22; i++) {
    const x = (i * 167 + pulse * 34) % (CANVAS_W + 220) - 110;
    const y = (i * 71 + sin(pulse + i) * 38) % (CANVAS_H + 160) - 80;
    fill(235, 10, 8, 18);
    circle(x, y, 3 + (i % 5) * 1.6);
  }
}

function drawSpiralTunnel(pulse) {
  push();
  translate(CENTER_X, CENTER_Y);
  rotate(radians(-9) + sin(pulse) * 0.018);

  drawingContext.shadowColor = "rgba(255, 0, 0, 0.38)";
  drawingContext.shadowBlur = 18;

  for (let i = RING_COUNT; i >= 0; i--) {
    const depth = i / RING_COUNT;
    const travel = (depth + pulse / TWO_PI) % 1;
    const perspective = pow(travel, 2.18);
    const radius = lerp(32, 2600, perspective);
    const band = lerp(12, 74, perspective);
    const skew = lerp(0.48, 0.88, perspective);
    const twist = travel * TWO_PI * 2.9 + pulse * 1.35;
    const cornerWave = sin(twist * 1.8 + i * 0.31) * lerp(5, 27, perspective);
    const offsetX = cos(twist) * lerp(2, 88, perspective);
    const offsetY = sin(twist * 0.78) * lerp(2, 54, perspective);
    const redAlpha = lerp(235, 255, perspective);
    const darkAlpha = lerp(210, 250, perspective);

    push();
    translate(offsetX, offsetY);
    rotate(twist * 0.135);

    drawRoundedSquareStripe(radius, band + 42, skew, color(1, 2, 3, darkAlpha), cornerWave);
    drawRoundedSquareStripe(radius, band, skew, color(238, 0, 0, redAlpha), cornerWave);
    pop();
  }

  drawingContext.shadowBlur = 0;
  drawCenterPull(pulse);
  pop();
}

function drawRoundedSquareStripe(radius, band, skew, stripeColor, cornerWave) {
  const pointsOuter = roundedSquarePoints(radius + band, skew, cornerWave, POINT_DETAIL);
  const pointsInner = roundedSquarePoints(max(1, radius - band), skew, cornerWave * 0.68, POINT_DETAIL);

  noStroke();
  fill(stripeColor);
  beginShape();
  for (const p of pointsOuter) {
    vertex(p.x, p.y);
  }
  beginContour();
  for (let i = pointsInner.length - 1; i >= 0; i--) {
    vertex(pointsInner[i].x, pointsInner[i].y);
  }
  endContour();
  endShape(CLOSE);
}

function roundedSquarePoints(radius, skew, cornerWave, detail) {
  const points = [];
  const side = radius * 1.22;
  const cornerRadius = radius * (0.28 + 0.04 * sin(radius * 0.01));
  const straight = max(2, side - cornerRadius * 2);

  for (let i = 0; i < detail; i++) {
    const a = (i / detail) * TWO_PI;
    const sx = cos(a);
    const sy = sin(a);
    const squareScale = max(abs(sx), abs(sy));
    let x = (sx / squareScale) * (straight * 0.5);
    let y = (sy / squareScale) * (straight * 0.5);

    x += sx * cornerRadius;
    y += sy * cornerRadius;

    const wave = sin(a * 4 + radius * 0.018) * cornerWave;
    const tunnelWarp = sin(a * 2 - radius * 0.006) * radius * 0.035;
    x += sx * wave + sy * tunnelWarp;
    y = y * skew + sy * wave * 0.65 - sx * tunnelWarp * 0.32;

    points.push({ x, y });
  }

  return points;
}

function drawCenterPull(pulse) {
  noStroke();
  for (let i = 8; i >= 0; i--) {
    const r = i * 11 + 18 + sin(pulse * 1.6 + i) * 4;
    fill(0, 0, 0, 36);
    circle(0, 0, r * 2.4);
  }

  const ctx = drawingContext;
  ctx.save();
  const hole = ctx.createRadialGradient(0, 0, 0, 0, 0, 180);
  hole.addColorStop(0, "rgba(0, 0, 0, 1)");
  hole.addColorStop(0.52, "rgba(0, 0, 0, 0.86)");
  hole.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = hole;
  ctx.beginPath();
  ctx.arc(0, 0, 190, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawVignette() {
  const ctx = drawingContext;
  ctx.save();
  const vignette = ctx.createRadialGradient(
    CENTER_X,
    CENTER_Y,
    160,
    CENTER_X,
    CENTER_Y,
    CANVAS_W * 0.78
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(0.62, "rgba(0, 0, 0, 0.14)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.76)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();
}

function buildGrain() {
  grainLayer = createGraphics(CANVAS_W, CANVAS_H);
  grainLayer.pixelDensity(1);
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i = 0; i < 42000; i++) {
    const bright = random() > 0.62;
    const shade = bright ? random(140, 255) : random(0, 30);
    grainLayer.fill(shade, shade, shade, random(4, 18));
    grainLayer.rect(random(CANVAS_W), random(CANVAS_H), random(0.6, 2.3), random(0.6, 2.3));
  }

  for (let i = 0; i < 260; i++) {
    const red = random() > 0.36;
    grainLayer.fill(red ? 255 : 0, red ? random(0, 40) : random(30, 90), red ? 0 : 80, random(18, 60));
    grainLayer.circle(random(CANVAS_W), random(CANVAS_H), random(1.5, 5.5));
  }
}
