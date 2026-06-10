const CANVAS_SIZE = 1920;
const CELL = 50;
const HOVER_RADIUS = 82;

let motifs = [];
let threads = [];
let cursorHasVisited = false;

const clothBlue = "#7198E8";
const lightBlue = "#9EB9FF";
const lineNavy = "#111B55";
const deepNavy = "#071039";
const glowBlue = "#D9E5FF";
const oliveGreen = "#8B8251";

function setup() {
  createCanvas(CANVAS_SIZE, 1080);
  pixelDensity(2);
  frameRate(30);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  buildMotifs();
  buildStaticThreads();
}

function draw() {
  background(oliveGreen);
  drawBlueWash();
  drawWovenTexture();

  const hovering = cursorHasVisited && mouseInsideCanvas();
  for (const motif of motifs) {
    motif.update(hovering);
    motif.show();
  }

  drawFrame();
}

function buildMotifs() {
  motifs = [];

  for (let y = -8; y < height + CELL; y += CELL) {
    for (let x = -8; x < width + CELL; x += CELL) {
      const col = floor((x + 8) / CELL);
      const row = floor((y + 8) / CELL);
      const type = (col * 3 + row * 5) % 4;
      const rotation = ((col + row) % 4) * HALF_PI;
      motifs.push(new MazeMotif(x + CELL / 2, y + CELL / 2, type, rotation, col, row));
    }
  }
}

class MazeMotif {
  constructor(cx, cy, type, rotation, col, row) {
    this.cx = cx;
    this.cy = cy;
    this.type = type;
    this.rotation = rotation;
    this.col = col;
    this.row = row;
    this.hover = 0;
    this.phase = random(TWO_PI);
    this.points = makeMotifPoints(type);
  }

  update(hovering) {
    const d = hovering ? dist(mouseX, mouseY, this.cx, this.cy) : 999;
    const target = constrain(1 - d / HOVER_RADIUS, 0, 1);
    this.hover = lerp(this.hover, target, 0.12);
  }

  show() {
    const wobble = this.hover * sin(frameCount * 0.055 + this.phase) * 4.5;
    const outward = this.hover * 8;
    const angle = atan2(this.cy - mouseY, this.cx - mouseX);
    const scaleAmount = 1 + this.hover * 0.08;

    push();
    translate(this.cx + cos(angle) * outward, this.cy + sin(angle) * outward);
    rotate(this.rotation + wobble * 0.01);
    scale(scaleAmount);

    if (this.hover > 0.01) {
      stroke(glowBlue);
      strokeWeight(10 + this.hover * 6);
      drawPointPath(this.points, wobble, this.col, this.row);
    }

    stroke(lineNavy);
    strokeWeight(6);
    drawPointPath(this.points, wobble, this.col, this.row);

    stroke(lightBlue);
    strokeWeight(1.15);
    drawPointPath(this.points, wobble * 0.4, this.col + 4, this.row + 7);
    pop();
  }
}

function makeMotifPoints(type) {
  if (type === 0) {
    return [
      [-18, -18], [18, -18], [18, 18], [-18, 18], [-18, -7],
      [7, -7], [7, 9], [-7, 9], [-7, 1], [0, 1]
    ];
  }

  if (type === 1) {
    return [
      [-20, -15], [20, -15], [20, -3], [-8, -3], [-8, 8],
      [18, 8], [18, 20], [-20, 20], [-20, 7]
    ];
  }

  if (type === 2) {
    return [
      [-14, -21], [-14, 21], [-1, 21], [-1, -8],
      [12, -8], [12, 21], [22, 21], [22, -21], [7, -21]
    ];
  }

  return [
    [-20, 18], [-20, -20], [18, -20], [18, 14],
    [-8, 14], [-8, -6], [7, -6], [7, 5], [0, 5]
  ];
}

function drawPointPath(points, wobble, col, row) {
  beginShape();
  for (const p of points) {
    const roughX = noise(p[0] * 0.08 + col, p[1] * 0.08) * 2.2 - 1.1;
    const roughY = noise(p[1] * 0.08 + row, p[0] * 0.08) * 2.2 - 1.1;
    const bendX = sin((p[1] + frameCount * 0.45) * 0.08) * wobble;
    const bendY = cos((p[0] - frameCount * 0.35) * 0.08) * wobble;
    vertex(p[0] + roughX + bendX, p[1] + roughY + bendY);
  }
  endShape();
}

function buildStaticThreads() {
  threads = [];

  for (let i = 0; i < 1300; i++) {
    threads.push({
      x: random(width),
      y: random(height),
      len: random(2, 9),
      vertical: random() > 0.52,
      light: random() > 0.55,
      alpha: random(12, 38)
    });
  }
}

function drawBlueWash() {
  noStroke();
  for (let y = 0; y < height; y += 2) {
    const t = y / height;
    fill(lerpColor(color("#86A8F4"), color("#587ED4"), t));
    rect(0, y, width, 2);
  }
}

function drawWovenTexture() {
  strokeWeight(1);

  for (const thread of threads) {
    const c = thread.light ? color(158, 185, 255, thread.alpha) : color(7, 16, 57, thread.alpha);
    stroke(c);

    if (thread.vertical) {
      line(thread.x, thread.y, thread.x, thread.y + thread.len);
    } else {
      line(thread.x, thread.y, thread.x + thread.len, thread.y);
    }
  }

  noFill();
}

function drawFrame() {
  noFill();
  stroke(deepNavy);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);

  stroke(lightBlue);
  strokeWeight(1);
  rect(5, 5, width - 10, height - 10);
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