const canvasSize = 400;
const gridStep = 15;
const maxInfluenceRadius = 115;
const hoverEase = 0.08;

let bgColor;
let cLime;
let cPurple;
let cGold;
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

  bgColor = color("#07050F");
  cLime = color(174, 255, 0, 215);
  cPurple = color(111, 20, 215, 195);
  cGold = color(235, 220, 62, 150);
  cBlack = color(3, 2, 9, 235);
}

function draw() {
  updateAnimation();
  background(bgColor);
  drawDotField();
  drawGrain();
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
  const limeOffset = offsetPulse * (1.18 + hover);
  const purpleOffset = offsetPulse * (1.38 + hover * 0.7);
  const goldOffset = offsetPulse * (0.85 + hover * 0.5);
  const blackOffset = offsetPulse * 0.45;

  fill(cGold);
  ellipse(
    x - goldOffset,
    y + goldOffset * 0.35,
    baseSize * (1.08 + shimmer * 0.18),
    baseSize * (1.08 + shimmer * 0.18)
  );

  fill(cLime);
  ellipse(
    x + limeOffset,
    y - limeOffset * 0.45,
    baseSize * (1.05 + hover * 0.24),
    baseSize * (1.05 + hover * 0.24)
  );

  fill(cPurple);
  ellipse(
    x - purpleOffset * 0.55,
    y - purpleOffset,
    baseSize * (0.98 + shimmer * 0.24),
    baseSize * (0.98 + shimmer * 0.24)
  );

  fill(cBlack);
  ellipse(
    x + blackOffset,
    y + blackOffset,
    baseSize * (0.52 + hover * 0.25),
    baseSize * (0.52 + hover * 0.25)
  );
}

function drawGrain() {
  // speckled texture like noisy printed ink
  for (let i = 0; i < 650; i++) {
    const x = random(width);
    const y = random(height);
    const grainColor = random() > 0.5 ? cLime : cPurple;

    fill(
      red(grainColor),
      green(grainColor),
      blue(grainColor),
      random(18, 58)
    );

    circle(x, y, random(0.45, 1.35));
  }
}

function shapeMask(x, y) {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;

  const spiralAngle = atan2(dy, dx);
  const radius = sqrt(dx * dx + dy * dy);
  const spiral = sin(spiralAngle * 4.0 + radius * 0.045 - time * 1.8) * 0.5 + 0.5;

  const swirlA = softCircle(x, y, 110, 245, 122);
  const swirlB = softCircle(x, y, 292, 94, 118);
  const swirlC = softCircle(x, y, 275, 330, 125);
  const purpleBand = softCircle(x, y, 210, 190, 165);
  const tunnel = softCircle(x, y, cx, cy, 150) * spiral;

  return constrain(swirlA * 1.0 + swirlB * 0.86 + swirlC * 0.82 + purpleBand * 0.55 + tunnel * 0.95, 0, 1);
}

function softCircle(x, y, cx, cy, radius) {
  const d = dist(x, y, cx, cy);
  return constrain(1 - d / radius, 0, 1);
}