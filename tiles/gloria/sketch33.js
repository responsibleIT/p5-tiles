const canvasSize = 400;
const gridStep = 13;
const defaultOriginX = 205;
const defaultOriginY = 198;
const easing = 0.075;
const hoverRadius = 120;

let bgColor;
let redColor;
let cyanColor;
let pinkColor;
let magentaColor;
let blackColor;

let time = 0;
let originX = defaultOriginX;
let originY = defaultOriginY;
let targetOriginX = defaultOriginX;
let targetOriginY = defaultOriginY;
let hoverAmount = 0;
let targetHoverAmount = 0;

function setup() {
  // setup: canvas, color palette, and drawing modes
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  noStroke();

  bgColor = color("#020103");
  redColor = color("#FF0712");
  cyanColor = color("#22F3F0");
  pinkColor = color("#FF58E8");
  magentaColor = color("#C03BFF");
  blackColor = color("#000000");
}

function draw() {
  updateAnimation();
  background(bgColor);
  drawHeartField();
  drawCenterVoid();
}

function updateAnimation() {
  // animation update: time and easing toward mouse
  time = frameCount * 0.024;

  // hover interaction logic
  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (isHovering) {
    targetOriginX = lerp(defaultOriginX, mouseX, 0.42);
    targetOriginY = lerp(defaultOriginY, mouseY, 0.42);
    targetHoverAmount = 1;
  } else {
    targetOriginX = defaultOriginX + sin(time * 0.55) * 15;
    targetOriginY = defaultOriginY + cos(time * 0.43) * 12;
    targetHoverAmount = 0;
  }

  originX = lerp(originX, targetOriginX, easing);
  originY = lerp(originY, targetOriginY, easing);
  hoverAmount = lerp(hoverAmount, targetHoverAmount, easing);
}

function drawHeartField() {
  // dense grid of hearts shaped into a rotating tunnel
  for (let y = -gridStep; y <= height + gridStep; y += gridStep) {
    for (let x = -gridStep; x <= width + gridStep; x += gridStep) {
      const dx = x - originX;
      const dy = y - originY;
      const radius = sqrt(dx * dx + dy * dy);
      const angle = atan2(dy, dx);

      const spiral = sin(angle * 3.2 + radius * 0.045 - time * 2.2);
      const ringWave = sin(radius * 0.13 - time * 4.0);
      const sideWave = sin(x * 0.025 + y * 0.018 + time * 1.4);

      const tunnelMask = constrain(map(radius, 42, 182, 0, 1), 0, 1);
      const edgeBoost = constrain(map(radius, 70, 245, 0.4, 1.25), 0.4, 1.25);

      const dMouse = dist(x, y, originX, originY);
      const hover = constrain(1 - dMouse / hoverRadius, 0, 1) * hoverAmount;

      const wobbleX = cos(angle * 2.0 + time) * 2.1 + spiral * 1.6;
      const wobbleY = sin(angle * 2.3 - time) * 2.1 + ringWave * 1.3;

      const sizePulse = 0.82 + ringWave * 0.18 + sideWave * 0.1 + hover * 0.45;
      const heartSize = gridStep * edgeBoost * tunnelMask * sizePulse;

      if (heartSize < 1.2) continue;

      const selectedColor = pickHeartColor(angle, radius, spiral, sideWave);
      const alpha = constrain(80 + tunnelMask * 175 + hover * 60, 0, 255);

      push();
      translate(x + wobbleX, y + wobbleY);
      rotate(spiral * 0.18 + sin(time + radius * 0.02) * 0.08);
      scale(1, 0.92 + sin(time * 1.7 + radius * 0.04) * 0.06);

      // black shadow heart gives the bright colors crisp contrast
      fill(0, 0, 0, 170);
      drawHeart(1.2, 1.2, heartSize * 1.08);

      fill(red(selectedColor), green(selectedColor), blue(selectedColor), alpha);
      drawHeart(0, 0, heartSize);

      // small highlight makes the hearts feel like glowing pixels
      fill(255, 255, 255, 34 + hover * 55);
      drawHeart(-heartSize * 0.12, -heartSize * 0.14, heartSize * 0.33);
      pop();
    }
  }
}

function pickHeartColor(angle, radius, spiral, sideWave) {
  // color bands: red, cyan, pink, and violet swirl around the center
  const band = sin(angle * 2.4 + radius * 0.028 - time * 0.9 + spiral * 1.4);

  if (band > 0.48) return cyanColor;
  if (band > 0.08) return pinkColor;
  if (sideWave > 0.48) return magentaColor;
  return redColor;
}

function drawCenterVoid() {
  // blank black center
  noStroke();

  for (let i = 0; i < 10; i++) {
    fill(0, 0, 0, 26);
    ellipse(originX, originY, 118 + i * 12, 82 + i * 9);
  }

  fill(blackColor);
  ellipse(originX, originY, 132, 88);
}

function drawHeart(x, y, size) {
  // heart shape helper
  const s = size / 18;

  beginShape();
  vertex(x, y + 5 * s);
  bezierVertex(x - 13 * s, y - 3 * s, x - 8 * s, y - 14 * s, x, y - 8 * s);
  bezierVertex(x + 8 * s, y - 14 * s, x + 13 * s, y - 3 * s, x, y + 5 * s);
  endShape(CLOSE);
}