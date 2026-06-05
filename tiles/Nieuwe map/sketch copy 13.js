const CANVAS_SIZE = 500;
const TRIANGLE_COUNT = 24;

let triangles = [];
let pointerInside = false;
let sceneHover = 0;

const hvaColors = [
  [210, 35, 42],
  [22, 42, 112],
  [235, 200, 22],
  [120, 44, 132],
  [230, 116, 124],
  [245, 245, 240],
  [18, 18, 18],
];

function setup() {
  const cnv = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  pixelDensity(1);
  noStroke();

  cnv.elt.addEventListener("mouseenter", () => {
    pointerInside = true;
  });

  cnv.elt.addEventListener("mouseleave", () => {
    pointerInside = false;
  });

  for (let i = 0; i < TRIANGLE_COUNT; i++) {
    triangles.push(new HvaTriangle(i));
  }
}

function draw() {
  sceneHover = lerp(sceneHover, pointerInside ? 1 : 0, 0.06);

  drawPs4Background();
  drawWaveLines();

  triangles.sort((a, b) => a.depth - b.depth);

  for (const triangleShape of triangles) {
    triangleShape.update();
    triangleShape.draw();
  }
}

class HvaTriangle {
  constructor(index) {
    this.index = index;
    this.reset(true);
  }

  reset(firstRun = false) {
    this.depth = random(0.25, 1);
    this.baseSize = random(30, 82) * (0.85 + this.depth * 0.45);
    this.x = firstRun ? random(-120, width + 100) : -this.baseSize - random(60, 160);
    this.y = random(42, height - 42);
    this.baseY = this.y;
    this.speed = random(0.16, 0.52) * (0.65 + this.depth);
    this.wave = random(18, 68);
    this.phase = random(TWO_PI);
    this.rotation = random(-0.42, 0.42);
    this.spin = random(-0.0035, 0.0035);
    this.color = random(hvaColors);
    this.scaleNow = 1;
    this.hovered = false;
  }

  update() {
    const t = frameCount * 0.016;
    this.x += this.speed + sceneHover * 0.1 * this.depth;
    this.y = this.baseY + sin(t + this.phase + this.x * 0.012) * this.wave;
    this.rotation += this.spin + sin(t * 1.4 + this.phase) * 0.0014;

    if (this.x > width + this.baseSize + 90) {
      this.reset(false);
    }

    this.hovered = pointerInside && this.mouseIsOver();
    const targetScale = this.hovered ? 1.42 : 1;
    this.scaleNow = lerp(this.scaleNow, targetScale, this.hovered ? 0.18 : 0.11);
  }

  mouseIsOver() {
    const hoverRadius = this.baseSize * 0.58 * this.scaleNow;
    return dist(mouseX, mouseY, this.x, this.y) < hoverRadius;
  }

  draw() {
    const s = this.baseSize;
    const alpha = 44 + this.depth * 86 + (this.scaleNow - 1) * 130;
    const glow = this.hovered ? 34 : 10 + this.depth * 8;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    scale(this.scaleNow);

    drawingContext.shadowColor = "rgba(255, 255, 255, 0.48)";
    drawingContext.shadowBlur = glow;

    fill(255, 255, 255, this.hovered ? 50 : 18);
    drawHvaTriangle(s * 1.16);

    drawingContext.shadowBlur = 0;
    drawGlassTriangle(s, this.color, alpha, this.index);
    drawTriangleEdge(s, this.hovered);

    pop();
  }
}

function drawHvaTriangle(s) {
  triangle(
    -s * 0.54, -s * 0.6,
    -s * 0.54, s * 0.6,
    s * 0.58, 0
  );
}

function drawGlassTriangle(s, tint, alpha, seed) {
  const ctx = drawingContext;
  ctx.save();
  makeTriangleClip(s);
  ctx.clip();

  for (let i = 0; i < 20; i++) {
    const amount = i / 19;
    const y = lerp(-s * 0.62, s * 0.62, amount);
    const shade = lerp(255, 170, amount);

    fill(
      lerp(tint[0], shade, 0.62),
      lerp(tint[1], shade, 0.62),
      lerp(tint[2], shade, 0.62),
      alpha * (0.72 - amount * 0.22)
    );
    rect(-s * 0.62, y, s * 1.24, s * 0.08);
  }

  fill(255, 255, 255, 44);
  triangle(-s * 0.5, -s * 0.56, -s * 0.22, -s * 0.56, -s * 0.5, -s * 0.16);

  fill(tint[0], tint[1], tint[2], 36);
  triangle(-s * 0.52, s * 0.56, s * 0.56, 0, s * 0.08, s * 0.2);

  for (let i = 0; i < 8; i++) {
    const nx = noise(seed * 9 + i * 1.7);
    const ny = noise(seed * 5 + i * 2.1);
    fill(255, 255, 255, 14 + noise(seed + i) * 18);
    circle(lerp(-s * 0.38, s * 0.3, nx), lerp(-s * 0.42, s * 0.42, ny), s * 0.025);
  }

  ctx.restore();
}

function makeTriangleClip(s) {
  drawingContext.beginPath();
  drawingContext.moveTo(-s * 0.54, -s * 0.6);
  drawingContext.lineTo(-s * 0.54, s * 0.6);
  drawingContext.lineTo(s * 0.58, 0);
  drawingContext.closePath();
}

function drawTriangleEdge(s, hovered) {
  noFill();
  strokeWeight(hovered ? 2.1 : 1.2);
  stroke(255, 255, 255, hovered ? 210 : 120);
  drawHvaTriangle(s);

  strokeWeight(1);
  stroke(255, 255, 255, hovered ? 86 : 42);
  drawHvaTriangle(s * 0.86);

  stroke(255, 255, 255, hovered ? 170 : 70);
  line(-s * 0.42, -s * 0.4, -s * 0.16, -s * 0.16);
  noStroke();
}

function drawPs4Background() {
  const top = color(12, 16, 34);
  const middle = color(30, 82, 122);
  const bottom = color(235, 239, 242);

  for (let y = 0; y < height; y++) {
    const amount = y / (height - 1);
    const c = amount < 0.64
      ? lerpColor(top, middle, amount / 0.64)
      : lerpColor(middle, bottom, (amount - 0.64) / 0.36);

    stroke(c);
    line(0, y, width, y);
  }

  noStroke();
  fill(255, 255, 255, 12);
  triangle(0, 0, width, 0, 0, height);
}

function drawWaveLines() {
  noFill();

  for (let layer = 0; layer < 8; layer++) {
    const yBase = 74 + layer * 48;
    const amplitude = 12 + layer * 2.4;
    const alpha = 14 + layer * 2 + sceneHover * 18;

    stroke(255, 255, 255, alpha);
    strokeWeight(layer % 3 === 0 ? 1.4 : 0.8);
    beginShape();

    for (let x = -60; x <= width + 60; x += 14) {
      const drift = frameCount * (0.01 + layer * 0.001);
      const y = yBase + sin(x * 0.018 + drift + layer) * amplitude;
      curveVertex(x, y);
    }

    endShape();
  }

  noStroke();
}
