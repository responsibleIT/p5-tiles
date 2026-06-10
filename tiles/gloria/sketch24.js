const CANVAS_SIZE = { width: 1920, height: 1080 };
const COLS = 8;
const ROWS = 10;
const HOVER_RADIUS = 95;

let boxes = [];
let cream;
let navy;
let ink;
let cursorHasVisited = false;

function setup() {
  createCanvas(CANVAS_SIZE.width, CANVAS_SIZE.height);
  pixelDensity(2);
  frameRate(30);
  noStroke();

  cream = color("#F4EAD7");
  navy = color("#14213D");
  ink = color("#07101F");

  buildCheckerboard();
}

function draw() {
  background(cream);
  drawSoftShadow();

  const hovering = cursorHasVisited && mouseInsideCanvas();

  for (const box of boxes) {
    box.update(hovering);
    box.show();
  }

  drawPaperTexture();
  drawFrame();
}

function buildCheckerboard() {
  boxes = [];
  const w = width / COLS;
  const h = height / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      boxes.push(new WavyBox(col, row, w, h));
    }
  }
}

class WavyBox {
  constructor(col, row, w, h) {
    this.col = col;
    this.row = row;
    this.x = col * w;
    this.y = row * h;
    this.w = w;
    this.h = h;
    this.dark = (col + row) % 2 === 0;
    this.phase = random(TWO_PI);
    this.hover = 0;
    this.restWarp = random(-10, 10);
    this.edgeNoise = random(1000);
  }

  update(hovering) {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const distanceToMouse = hovering ? dist(mouseX, mouseY, cx, cy) : 999;
    const target = constrain(1 - distanceToMouse / HOVER_RADIUS, 0, 1);
    this.hover = lerp(this.hover, target, 0.11);
  }

  show() {
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const pushAngle = atan2(cy - mouseY, cx - mouseX);
    const lift = this.hover * 10;
    const scaleAmount = 1 + this.hover * 0.055;
    const twist = sin(frameCount * 0.05 + this.phase) * this.hover * 8;
    const fillColor = this.dark ? navy : cream;

    push();
    translate(cos(pushAngle) * lift, sin(pushAngle) * lift);
    translate(cx, cy);
    scale(scaleAmount);
    translate(-cx, -cy);

    fill(fillColor);
    drawWarpedTile(
      this.x,
      this.y,
      this.w,
      this.h,
      this.row,
      this.col,
      this.restWarp + twist,
      this.edgeNoise
    );
    if (this.hover > 0.02) {
      fill(this.dark ? color(244, 234, 215, 34) : color(20, 33, 61, 32));
      drawWarpedTile(
        this.x + 2,
        this.y + 2,
        this.w - 4,
        this.h - 4,
        this.row,
        this.col,
        this.restWarp + twist * 1.35,
        this.edgeNoise + 50
      );
    }

    pop();
  }
}

function drawWarpedTile(x, y, w, h, row, col, warp, seed) {
  const steps = 7;
  const top = [];
  const right = [];
  const bottom = [];
  const left = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const topWave = sin(t * PI + row * 0.8) * warp;
    const bottomWave = sin(t * PI + row * 0.8 + 1.4) * warp;
    const leftWave = sin(t * PI + col * 0.85 + 0.7) * warp;
    const rightWave = sin(t * PI + col * 0.85 + 2.1) * warp;
    const rough = map(noise(seed + t * 2.5), 0, 1, -1.4, 1.4);

    top.push(createVector(x + t * w, y + topWave + rough));
    right.push(createVector(x + w + rightWave + rough, y + t * h));
    bottom.push(createVector(x + (1 - t) * w, y + h + bottomWave - rough));
    left.push(createVector(x + leftWave - rough, y + (1 - t) * h));
  }

  beginShape();
  for (const p of top) curveVertex(p.x, p.y);
  for (const p of right) curveVertex(p.x, p.y);
  for (const p of bottom) curveVertex(p.x, p.y);
  for (const p of left) curveVertex(p.x, p.y);
  for (let i = 0; i < 3; i++) curveVertex(top[i].x, top[i].y);
  endShape(CLOSE);
}

function drawSoftShadow() {
  fill(7, 16, 31, 28);
  rect(10, 12, width - 20, height - 18, 8);
}

function drawPaperTexture() {
  randomSeed(12);
  for (let i = 0; i < 900; i++) {
    const x = random(width);
    const y = random(height);
    const onDark = getCheckerDark(x, y);
    fill(onDark ? color(244, 234, 215, 15) : color(20, 33, 61, 12));
    rect(x, y, random(0.4, 1.2), random(0.4, 1.2));
  }
}

function getCheckerDark(x, y) {
  const col = floor(constrain(x / (width / COLS), 0, COLS - 1));
  const row = floor(constrain(y / (height / ROWS), 0, ROWS - 1));
  return (col + row) % 2 === 0;
}

function drawFrame() {
  noFill();
  stroke(ink);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);
  stroke(cream);
  strokeWeight(1);
  rect(5, 5, width - 10, height - 10);
  noStroke();
}

function mouseInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function mouseMoved() {
  cursorHasVisited = true;
}

function mouseDragged() {
  cursorHasVisited = true;
}