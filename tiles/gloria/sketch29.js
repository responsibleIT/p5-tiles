const canvasSize = 400;
const tileSize = 22;
const cols = 21;
const rows = 21;
const hoverRadius = 105;
const easing = 0.075;

let bgColor;
let heatColors = [];
let coolColors = [];
let acidColors = [];
let triangles = [];

let time = 0;
let highlightX = 200;
let highlightY = 200;
let targetX = 200;
let targetY = 200;
let hoverAmount = 0;
let targetHoverAmount = 0;

function setup() {
  // setup and grid creation
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  rectMode(CENTER);
  noStroke();

  bgColor = color("#06144A");

  heatColors = [
    color("#FF1B00"),
    color("#FF3F8E"),
    color("#FF7A00"),
    color("#FFD21A")
  ];

  coolColors = [
    color("#0099FF"),
    color("#00D8FF"),
    color("#245CFF"),
    color("#8EEBFF")
  ];

  acidColors = [
    color("#20E23A"),
    color("#9CFF1A"),
    color("#F7FF32"),
    color("#FF2AEF")
  ];

  createTriangleGrid();
}

function draw() {
  updateAnimation();
  drawBackgroundField();
  drawTriangles();
}

function createTriangleGrid() {
  triangles = [];

  for (let y = -1; y < rows; y++) {
    for (let x = -1; x < cols; x++) {
      const px = x * tileSize + tileSize / 2;
      const py = y * tileSize + tileSize / 2;

      const hotRiver = softBlob(px, py, 112, 92, 135, 52);
      const blueRiver = softBlob(px, py, 246, 150, 150, 70);
      const yellowField = softBlob(px, py, 170, 258, 170, 100);
      const greenPocket = softBlob(px, py, 300, 285, 78, 118);
      const pinkSpark = softBlob(px, py, 160, 342, 92, 62);
      const cyanSide = softBlob(px, py, 330, 92, 80, 122);

      let palette = coolColors;
      let intensity = blueRiver + cyanSide * 0.7;

      if (hotRiver + pinkSpark > intensity && hotRiver + pinkSpark > yellowField) {
        palette = heatColors;
        intensity = hotRiver + pinkSpark * 0.9;
      }

      if (yellowField + greenPocket > intensity) {
        palette = acidColors;
        intensity = yellowField * 0.8 + greenPocket;
      }

      triangles.push({
        x: px,
        y: py,
        size: tileSize * random(0.9, 1.7),
        color: random(palette),
        secondaryColor: random(random([heatColors, coolColors, acidColors])),
        intensity: constrain(intensity + random(0.05, 0.35), 0, 1),
        phase: random(TWO_PI),
        angle: random(TWO_PI),
        driftX: random(-2.8, 2.8),
        driftY: random(-2.8, 2.8),
        layers: floor(random(2, 5))
      });
    }
  }
}

function updateAnimation() {
  // animation update: time and easing toward mouse
  time = frameCount * 0.022;

  // hover interaction logic
  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (isHovering) {
    targetX = mouseX;
    targetY = mouseY;
    targetHoverAmount = 1;
  } else {
    targetX = width / 2 + sin(time * 0.48) * 42;
    targetY = height / 2 + cos(time * 0.38) * 52;
    targetHoverAmount = 0;
  }

  highlightX = lerp(highlightX, targetX, easing);
  highlightY = lerp(highlightY, targetY, easing);
  hoverAmount = lerp(hoverAmount, targetHoverAmount, easing);
}

function drawBackgroundField() {
  background(bgColor);

  // glowing liquid color fields behind the triangle mosaic
  noStroke();

  for (let i = 0; i < 10; i++) {
    const pulse = sin(time * 1.1 + i) * 14;
    const alpha = 14 - i;

    fill(0, 150, 255, alpha);
    ellipse(250, 145, 250 + i * 24 + pulse, 105 + i * 14);

    fill(255, 35, 0, alpha * 0.9);
    ellipse(120, 90, 255 + i * 20 - pulse, 75 + i * 12);

    fill(255, 230, 20, alpha * 0.85);
    ellipse(185, 260, 310 + i * 18, 155 + i * 12);

    fill(50, 235, 50, alpha * 0.8);
    ellipse(302, 286, 140 + i * 17, 230 + i * 14);
  }
}

function drawTriangles() {
  // drawing layered transparent triangles with glow-like effects
  blendMode(ADD);

  for (let i = 0; i < triangles.length; i++) {
    const tri = triangles[i];

    const wave = sin(time * 1.7 + tri.phase + tri.x * 0.03 + tri.y * 0.02);
    const flow = sin(tri.x * 0.017 - tri.y * 0.026 + time * 1.2);
    const d = dist(tri.x, tri.y, highlightX, highlightY);
    const hover = constrain(1 - d / hoverRadius, 0, 1) * hoverAmount;

    const wobbleX = sin(time * 1.1 + tri.phase) * tri.driftX + flow * 3.2;
    const wobbleY = cos(time * 0.95 + tri.phase) * tri.driftY + wave * 2.4;

    const brightness = tri.intensity + 0.28 + wave * 0.18 + hover * 0.85;
    const alpha = constrain(32 + brightness * 120, 30, 210);
    const scale = 0.72 + tri.intensity * 0.5 + wave * 0.08 + hover * 0.45;
    const rotation = tri.angle + sin(time * 0.55 + tri.phase) * 0.38 + hover * 0.65;

    for (let layer = tri.layers; layer >= 1; layer--) {
      const layerRatio = layer / tri.layers;
      const layerSize = tri.size * scale * (0.65 + layerRatio * 0.58);
      const offset = (layer - 1) * 2.8;

      const mixedColor = lerpColor(tri.color, tri.secondaryColor, 0.25 + wave * 0.2);

      fill(
        red(mixedColor),
        green(mixedColor),
        blue(mixedColor),
        alpha * (0.18 + layerRatio * 0.32)
      );

      push();
      translate(
        tri.x + wobbleX + offset * cos(tri.phase + time),
        tri.y + wobbleY + offset * sin(tri.phase - time)
      );
      rotate(rotation + layer * 0.17);
      drawEquilateralTriangle(0, 0, layerSize);
      pop();
    }

    fill(255, 255, 255, 16 + hover * 55);
    push();
    translate(tri.x + wobbleX - tri.size * 0.08, tri.y + wobbleY - tri.size * 0.08);
    rotate(rotation);
    drawEquilateralTriangle(0, 0, tri.size * scale * 0.38);
    pop();
  }

  blendMode(BLEND);
}

function drawEquilateralTriangle(x, y, size) {
  const r = size * 0.58;
  beginShape();
  vertex(x + cos(-HALF_PI) * r, y + sin(-HALF_PI) * r);
  vertex(x + cos(-HALF_PI + TWO_PI / 3) * r, y + sin(-HALF_PI + TWO_PI / 3) * r);
  vertex(x + cos(-HALF_PI + TWO_PI * 2 / 3) * r, y + sin(-HALF_PI + TWO_PI * 2 / 3) * r);
  endShape(CLOSE);
}

function softBlob(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  const value = 1 - sqrt(dx * dx + dy * dy);
  return constrain(value, 0, 1);
}