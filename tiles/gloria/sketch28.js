const canvasSize = 400;
const gridStep = 15;
const maxInfluenceRadius = 115;
const hoverEase = 0.08;

let bgColor;
let cCyan;
let cMagenta;
let cYellow;
let cBlack;

let time = 0;
let easedMouseX = 200;
let easedMouseY = 200;
let hoverStrength = 0;
let targetHoverStrength = 0;

function setup() {
  // setup
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  noStroke();

  bgColor = color("#FFFDF7");
  cCyan = color(0, 176, 224, 190);
  cMagenta = color(226, 0, 124, 190);
  cYellow = color(245, 215, 0, 180);
  cBlack = color(10, 12, 18, 225);
}

function draw() {
  updateAnimation();
  background(bgColor);
  drawDotField();
}

function updateAnimation() {
  // animation update
  time = frameCount * 0.025;

  // hover interaction and easing logic
  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (isHovering) {
    easedMouseX = lerp(easedMouseX, mouseX, hoverEase);
    easedMouseY = lerp(easedMouseY, mouseY, hoverEase);
    targetHoverStrength = 1;
  } else {
    easedMouseX = lerp(easedMouseX, width / 2, hoverEase * 0.45);
    easedMouseY = lerp(easedMouseY, height / 2, hoverEase * 0.45);
    targetHoverStrength = 0;
  }

  hoverStrength = lerp(hoverStrength, targetHoverStrength, hoverEase);
}

function drawDotField() {
  // drawing grid of dots
  push();
  translate(width / 2, height / 2);
  rotate(sin(time * 0.18) * 0.025);
  translate(-width / 2, -height / 2);

  for (let y = -gridStep; y <= height + gridStep; y += gridStep) {
    for (let x = -gridStep; x <= width + gridStep; x += gridStep) {
      const waveX = sin(y * 0.045 + time * 1.5) * 4.2;
      const waveY = cos(x * 0.04 - time * 1.25) * 4.2;
      const px = x + waveX;
      const py = y + waveY;

      const hiddenShape = shapeMask(px, py);
      const shimmer = sin(time * 2.4 + x * 0.075 + y * 0.052) * 0.5 + 0.5;
      const breath = 0.78 + hiddenShape * 1.25 + shimmer * 0.38;

      const d = dist(px, py, easedMouseX, easedMouseY);
      const hover = constrain(1 - d / maxInfluenceRadius, 0, 1) * hoverStrength;
      const ripple = sin(d * 0.13 - time * 5.0) * hover;

      const baseSize = gridStep * (0.36 + breath * 0.48 + hover * 0.5 + ripple * 0.22);
      const offsetPulse = 2.0 + sin(time * 2.0 + x * 0.05 - y * 0.04) * 1.3;
      const magneticAngle = atan2(py - easedMouseY, px - easedMouseX);
      const magneticPull = hover * 7.5;

      drawPrintDotLayer(
        px + cos(magneticAngle) * magneticPull,
        py + sin(magneticAngle) * magneticPull,
        baseSize,
        offsetPulse,
        shimmer,
        hover
      );
    }
  }

  pop();
}

function drawPrintDotLayer(x, y, baseSize, offsetPulse, shimmer, hover) {
  const cyanOffset = offsetPulse * (1.15 + hover);
  const magentaOffset = offsetPulse * (1.35 + hover * 0.7);
  const yellowOffset = offsetPulse * (0.9 + hover * 0.5);
  const blackOffset = offsetPulse * 0.45;

  fill(cYellow);
  ellipse(
    x - yellowOffset,
    y + yellowOffset * 0.35,
    baseSize * (1.12 + shimmer * 0.16),
    baseSize * (1.12 + shimmer * 0.16)
  );

  fill(cCyan);
  ellipse(
    x + cyanOffset,
    y - cyanOffset * 0.45,
    baseSize * (0.95 + hover * 0.2),
    baseSize * (0.95 + hover * 0.2)
  );

  fill(cMagenta);
  ellipse(
    x - magentaOffset * 0.55,
    y - magentaOffset,
    baseSize * (1.0 + shimmer * 0.22),
    baseSize * (1.0 + shimmer * 0.22)
  );

  fill(cBlack);
  ellipse(
    x + blackOffset,
    y + blackOffset,
    baseSize * (0.48 + hover * 0.24),
    baseSize * (0.48 + hover * 0.24)
  );
}

function shapeMask(x, y) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;

  const spiralAngle = atan2(dy, dx);
  const radius = sqrt(dx * dx + dy * dy);
  const spiral = sin(spiralAngle * 4.0 + radius * 0.045 - time * 1.8) * 0.5 + 0.5;

  const bloomA = softCircle(x, y, 122, 118, 92);
  const bloomB = softCircle(x, y, 280, 260, 112);
  const bloomC = softCircle(x, y, 240, 145, 72);
  const tunnel = softCircle(x, y, cx, cy, 150) * spiral;

  return constrain(bloomA * 0.9 + bloomB * 0.85 + bloomC * 0.7 + tunnel * 0.95, 0, 1);
}

function softCircle(x, y, cx, cy, radius) {
  const d = dist(x, y, cx, cy);
  return constrain(1 - d / radius, 0, 1);
}