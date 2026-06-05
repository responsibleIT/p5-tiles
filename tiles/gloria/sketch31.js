const canvasSize = 400;
const ringSpacing = 5.2;
const ringCount = 115;
const easing = 0.07;
const hoverRadius = 125;

let bgColor;
let deepBlue;
let cyanBlue;
let paleCyan;
let peach;
let coral;
let gold;

let time = 0;
let focusX = 285;
let focusY = 232;
let targetX = 285;
let targetY = 232;
let hoverAmount = 0;
let targetHoverAmount = 0;

function setup() {
  // setup
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  colorMode(RGB, 255, 255, 255, 255);
  noFill();

  bgColor = color("#203B55");
  deepBlue = color("#0B1B34");
  cyanBlue = color("#00B8E8");
  paleCyan = color("#9AF3FF");
  peach = color("#F4A06F");
  coral = color("#F05A55");
  gold = color("#FFD56B");
}

function draw() {
  updateAnimation();
  drawSoftColorField();
  drawOpticalRings();
  drawFineTexture();
}

function updateAnimation() {
  // animation update and hover interaction logic
  time = frameCount * 0.018;

  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (isHovering) {
    targetX = mouseX;
    targetY = mouseY;
    targetHoverAmount = 1;
  } else {
    targetX = 285 + sin(time * 0.55) * 18;
    targetY = 232 + cos(time * 0.43) * 16;
    targetHoverAmount = 0;
  }

  focusX = lerp(focusX, targetX, easing);
  focusY = lerp(focusY, targetY, easing);
  hoverAmount = lerp(hoverAmount, targetHoverAmount, easing);
}

function drawSoftColorField() {
  // soft blended background colors matching the reference image
  background(bgColor);
  noStroke();

  for (let i = 0; i < 16; i++) {
    const a = 16 - i * 0.7;
    const grow = i * 28;

    fill(0, 170, 225, a);
    ellipse(205, 300, 330 + grow, 220 + grow * 0.45);

    fill(245, 122, 94, a * 0.85);
    ellipse(100, 175, 240 + grow, 180 + grow * 0.35);

    fill(255, 205, 92, a * 0.55);
    ellipse(320, 170, 190 + grow * 0.6, 240 + grow * 0.45);

    fill(22, 35, 70, a * 1.1);
    ellipse(258, 225, 280 + grow, 250 + grow * 0.55);
  }
}

function drawOpticalRings() {
  // drawing dense concentric rings with alternating warm and cool strokes
  push();
  translate(focusX, focusY);

  for (let i = ringCount; i > 0; i--) {
    const r = i * ringSpacing;
    const pulse = sin(time * 2.6 - i * 0.18) * 1.2;
    const wobble = sin(time * 0.8 + i * 0.12) * 0.018;
    const hoverPulse = hoverAmount * sin(i * 0.22 - time * 5.0) * 2.4;

    const ringColor = ringPalette(i);
    const alpha = map(i, 1, ringCount, 240, 92);

    stroke(red(ringColor), green(ringColor), blue(ringColor), alpha);
    strokeWeight(i % 3 === 0 ? 1.35 : 0.95);

    beginShape();
    for (let a = 0; a <= TWO_PI + 0.05; a += 0.035) {
      const wave =
        sin(a * 3.0 + time * 0.9) * 0.9 +
        sin(a * 7.0 - time * 1.3 + i * 0.08) * 0.45;

      const mouseDist = dist(
        focusX + cos(a) * r,
        focusY + sin(a) * r,
        mouseX,
        mouseY
      );
      const localHover = constrain(1 - mouseDist / hoverRadius, 0, 1) * hoverAmount;

      const rr = r + pulse + wave + hoverPulse * localHover;
      const stretchX = 1.0 + sin(time * 0.35) * 0.025 + wobble;
      const stretchY = 1.0 + cos(time * 0.31) * 0.018 - wobble;

      vertex(cos(a) * rr * stretchX, sin(a) * rr * stretchY);
    }
    endShape(CLOSE);

    if (i % 2 === 0) {
      stroke(7, 16, 35, alpha * 0.58);
      strokeWeight(0.65);
      ellipse(0.9, 0.9, (r + pulse) * 2, (r + pulse) * 2);
    }
  }

  pop();
}

function ringPalette(i) {
  // color bands arranged to feel like cyan, dark blue, peach, and gold print lines
  const band = i % 8;

  if (band === 0) return paleCyan;
  if (band === 1) return deepBlue;
  if (band === 2) return cyanBlue;
  if (band === 3) return coral;
  if (band === 4) return gold;
  if (band === 5) return deepBlue;
  if (band === 6) return peach;
  return cyanBlue;
}

function drawFineTexture() {
  // subtle grain and extra line sparkle for a printed optical texture
  noStroke();

  for (let i = 0; i < 600; i++) {
    const x = random(width);
    const y = random(height);
    const grainColor = random([paleCyan, peach, gold, coral, deepBlue]);
    fill(red(grainColor), green(grainColor), blue(grainColor), random(12, 38));
    circle(x, y, random(0.35, 1.1));
  }
}