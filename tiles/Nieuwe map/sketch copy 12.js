const CANVAS_SIZE = 500;
const TRIANGLE_COUNT = 22;

let triangles = [];
let hoverLevel = 0;

const hvaPalette = [
  [210, 35, 42],
  [22, 42, 112],
  [235, 200, 22],
  [120, 44, 132],
  [230, 116, 124],
  [245, 245, 240],
  [18, 18, 18],
];

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  pixelDensity(1);
  noStroke();

  for (let i = 0; i < TRIANGLE_COUNT; i++) {
    triangles.push(new GlassHvaTriangle(i));
  }
}

function draw() {
  hoverLevel = lerp(hoverLevel, isMouseOnCanvas() ? 1 : 0, 0.08);

  drawBackground();
  drawLightBeams();

  triangles.sort((a, b) => a.depth - b.depth);

  for (const shape of triangles) {
    shape.update();
    shape.draw();
  }

  drawMouseRipple();
}

class GlassHvaTriangle {
  constructor(index) {
    this.index = index;
    this.depth = random(0.2, 1);
    this.size = random(38, 96) * (0.74 + this.depth * 0.52);
    this.x = random(-90, width + 90);
    this.y = random(25, height - 25);
    this.baseY = this.y;
    this.speed = random(0.16, 0.48) * (0.7 + this.depth);
    this.phase = random(TWO_PI);
    this.wave = random(18, 58);
    this.rotation = random(-0.35, 0.35);
    this.spin = random(-0.003, 0.003);
    this.tint = random(hvaPalette);
    this.hover = 0;
    this.textureSeed = random(1000);
  }

  update() {
    const time = frameCount * 0.018;

    this.x += this.speed + hoverLevel * 0.16 * this.depth;
    this.y = this.baseY + sin(time + this.phase + this.x * 0.01) * this.wave;
    this.rotation += this.spin + sin(time + this.phase) * 0.001;

    if (this.x > width + this.size + 80) {
      this.x = -this.size - random(60, 140);
      this.baseY = random(20, height - 20);
      this.phase = random(TWO_PI);
      this.tint = random(hvaPalette);
      this.textureSeed = random(1000);
    }

    const d = dist(mouseX, mouseY, this.x, this.y);
    const close = isMouseOnCanvas() && d < this.size * 0.95;
    this.hover = lerp(this.hover, close ? 1 : 0, 0.18);

    if (close) {
      const pushX = (this.x - mouseX) * 0.018;
      const pushY = (this.y - mouseY) * 0.018;
      this.x += pushX;
      this.baseY += pushY;
      this.rotation += sin(frameCount * 0.18 + this.index) * 0.018;
    }
  }

  draw() {
    const pulse = 1 + this.hover * 0.22;
    const s = this.size * pulse;
    const alpha = 60 + this.depth * 72 + this.hover * 75;
    const glow = 10 + this.hover * 34 + hoverLevel * 6;

    push();
    translate(this.x, this.y);
    rotate(this.rotation + this.hover * sin(frameCount * 0.12 + this.index) * 0.22);
    scale(pulse);

    drawingContext.shadowColor = `rgba(255, 255, 255, ${0.18 + this.hover * 0.42})`;
    drawingContext.shadowBlur = glow;

    fill(255, 255, 255, 16 + this.hover * 36);
    drawHvaTriangle(s * 1.16);

    drawingContext.shadowBlur = 0;
    drawGlassBody(s, this.tint, alpha, this.textureSeed);
    drawGlassEdges(s, this.hover);
    drawGlassHighlights(s, this.hover, this.textureSeed);

    pop();
  }
}

function drawGlassBody(s, tint, alpha, seed) {
  const ctx = drawingContext;

  ctx.save();
  makeTrianglePath(s);
  ctx.clip();

  for (let i = 0; i < 18; i++) {
    const amount = i / 17;
    const y = lerp(-s * 0.62, s * 0.62, amount);
    const shade = lerp(255, 180, amount);

    fill(
      lerp(tint[0], shade, 0.68),
      lerp(tint[1], shade, 0.68),
      lerp(tint[2], shade, 0.68),
      alpha * (0.7 - amount * 0.22)
    );
    rect(-s * 0.62, y, s * 1.24, s * 0.08);
  }

  for (let i = 0; i < 28; i++) {
    const n = noise(seed + i * 0.31, frameCount * 0.006);
    const x = lerp(-s * 0.48, s * 0.36, n);
    const y = lerp(-s * 0.5, s * 0.5, noise(seed + i * 0.19));

    fill(255, 255, 255, 10 + n * 18);
    circle(x, y, random(1.2, 3.4));
  }

  fill(255, 255, 255, 42);
  triangle(-s * 0.52, -s * 0.58, -s * 0.2, -s * 0.58, -s * 0.52, -s * 0.18);

  fill(tint[0], tint[1], tint[2], 24);
  triangle(-s * 0.52, s * 0.58, s * 0.58, 0, s * 0.06, s * 0.24);

  ctx.restore();
}

function drawGlassEdges(s, hover) {
  noFill();
  strokeWeight(1.2 + hover * 1.1);
  stroke(255, 255, 255, 118 + hover * 90);
  drawHvaTriangle(s);

  stroke(255, 255, 255, 38 + hover * 58);
  drawHvaTriangle(s * 0.88);
  noStroke();
}

function drawGlassHighlights(s, hover, seed) {
  const shine = 50 + hover * 110;

  stroke(255, 255, 255, shine);
  strokeWeight(2);
  line(-s * 0.43, -s * 0.42, -s * 0.18, -s * 0.2);

  stroke(255, 255, 255, shine * 0.42);
  strokeWeight(1);
  line(-s * 0.34, s * 0.44, s * 0.34, 0.04 * s);

  noStroke();
  fill(255, 255, 255, 24 + hover * 40);
  circle(s * 0.07 + sin(seed) * s * 0.08, -s * 0.08, s * 0.12);
}

function drawHvaTriangle(s) {
  triangle(
    -s * 0.54, -s * 0.6,
    -s * 0.54, s * 0.6,
    s * 0.58, 0
  );
}

function makeTrianglePath(s) {
  drawingContext.beginPath();
  drawingContext.moveTo(-s * 0.54, -s * 0.6);
  drawingContext.lineTo(-s * 0.54, s * 0.6);
  drawingContext.lineTo(s * 0.58, 0);
  drawingContext.closePath();
}

function drawBackground() {
  const top = color(14, 18, 30);
  const mid = color(42, 82, 104);
  const bottom = color(238, 240, 235);

  for (let y = 0; y < height; y++) {
    const amount = y / (height - 1);
    const c = amount < 0.62
      ? lerpColor(top, mid, amount / 0.62)
      : lerpColor(mid, bottom, (amount - 0.62) / 0.38);

    stroke(c);
    line(0, y, width, y);
  }

  noStroke();
  fill(255, 255, 255, 18);
  triangle(0, 0, width, 0, 0, height);
}

function drawLightBeams() {
  noFill();

  for (let i = 0; i < 7; i++) {
    const y = 72 + i * 58;
    const alpha = 18 + hoverLevel * 22;

    stroke(255, 255, 255, alpha);
    strokeWeight(1);
    beginShape();

    for (let x = -40; x <= width + 40; x += 14) {
      const wave = sin(x * 0.015 + frameCount * 0.012 + i) * (14 + i * 2);
      curveVertex(x, y + wave);
    }

    endShape();
  }

  noStroke();
}

function drawMouseRipple() {
  if (!isMouseOnCanvas()) return;

  noFill();
  strokeWeight(1);

  for (let i = 0; i < 3; i++) {
    const r = 26 + i * 23 + sin(frameCount * 0.09 + i) * 6;
    stroke(255, 255, 255, (68 - i * 16) * hoverLevel);
    circle(mouseX, mouseY, r);
  }

  noStroke();
}

function isMouseOnCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}
