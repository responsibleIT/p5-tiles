// HvA driehoeken - p5.js sketch
// HvA driehoeken - p5.js sketch
// Canvas: 500x500
// Hover: driehoeken worden magnetisch en lichten op.

const triangleDefs = [
  { r: 255, g: 255, b: 255, size: 112, x: 82,  y: 92  },
  { r: 210, g: 35,  b: 42,  size: 82,  x: 238, y: 118 },
  { r: 18,  g: 18,  b: 18,  size: 74,  x: 376, y: 78  },
  { r: 22,  g: 42,  b: 112, size: 126, x: 138, y: 306 },
  { r: 235, g: 200, b: 22,  size: 46,  x: 334, y: 268 },
  { r: 120, g: 44,  b: 132, size: 38,  x: 424, y: 340 },
  { r: 230, g: 116, b: 124, size: 32,  x: 272, y: 404 },
  { r: 245, g: 245, b: 240, size: 56,  x: 82,  y: 418 },
];

let triangles = [];
let isHovering = false;
let hoverAmount = 0;

class Hvatriangle {
  constructor(def, index) {
    this.base = createVector(def.x, def.y);
    this.pos = this.base.copy();
    this.vel = p5.Vector.random2D().mult(random(0.25, 0.65));
    this.size = def.size;
    this.col = color(def.r, def.g, def.b);
    this.phase = random(TWO_PI);
    this.rotation = random(-0.08, 0.08);
    this.index = index;
  }

  update() {
    const t = frameCount * 0.018 + this.phase;
    const floatTarget = createVector(
      this.base.x + sin(t * 1.4) * 16,
      this.base.y + cos(t) * 14
    );

    let target = floatTarget;
    if (isHovering) {
      const mouse = createVector(mouseX, mouseY);
      const away = p5.Vector.sub(this.pos, mouse);
      const distance = max(away.mag(), 1);
      away.setMag(map(distance, 0, 260, 96, 12, true));
      target = p5.Vector.add(floatTarget, away);
    }

    const pull = p5.Vector.sub(target, this.pos).mult(0.045);
    this.vel.add(pull);
    this.vel.mult(isHovering ? 0.88 : 0.92);
    this.pos.add(this.vel);
    this.rotation = lerp(this.rotation, isHovering ? sin(t * 1.7) * 0.24 : sin(t) * 0.08, 0.08);
  }

  draw() {
    const glow = isHovering ? 95 : 35;
    const s = this.size * (1 + hoverAmount * 0.08);

    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.rotation);
    noStroke();

    fill(red(this.col), green(this.col), blue(this.col), glow);
    this.drawShape(s * 1.14);

    fill(this.col);
    this.drawShape(s);
    pop();
  }

  drawShape(s) {
    triangle(
      -s * 0.58, -s * 0.52,
      -s * 0.58,  s * 0.52,
       s * 0.56,  0
    );
  }
}

function setup() {
  const cnv = createCanvas(500, 500);
  cnv.elt.addEventListener("mouseenter", () => isHovering = true);
  cnv.elt.addEventListener("mouseleave", () => isHovering = false);

  for (let i = 0; i < triangleDefs.length; i++) {
    triangles.push(new Hvatriangle(triangleDefs[i], i));
  }
}

function draw() {
  hoverAmount = lerp(hoverAmount, isHovering ? 1 : 0, 0.08);

  drawGradient();
  drawGrid();
  drawCursorAura();

  for (const tri of triangles) {
    tri.update();
    tri.draw();
  }

  drawFrameDetails();
}

function drawGradient() {
  const top = lerpColor(color(38, 42, 54), color(12, 15, 28), hoverAmount);
  const mid = lerpColor(color(112, 112, 122), color(105, 31, 44), hoverAmount);
  const bottom = lerpColor(color(210, 215, 218), color(18, 42, 112), hoverAmount);

  for (let y = 0; y < height; y++) {
    const amt = y / (height - 1);
    const c = amt < 0.55
      ? lerpColor(top, mid, amt / 0.55)
      : lerpColor(mid, bottom, (amt - 0.55) / 0.45);

    stroke(c);
    line(0, y, width, y);
  }

  noStroke();
  fill(255, 255, 255, 18 - hoverAmount * 8);
  triangle(0, 0, 500, 0, 0, 500);
}

function drawGrid() {
  stroke(255, 255, 255, 16 + hoverAmount * 18);
  strokeWeight(0.7);

  for (let i = 0; i <= width; i += 62.5) {
    line(i, 0, i, height);
    line(0, i, width, i);
  }
}

function drawCursorAura() {
  if (!isHovering) return;

  noStroke();
  for (let r = 150; r > 0; r -= 18) {
    fill(255, 255, 255, map(r, 150, 0, 0, 18));
    circle(mouseX, mouseY, r);
  }
}

function drawFrameDetails() {
  noFill();
  stroke(255, 255, 255, 40 + hoverAmount * 50);
  strokeWeight(1);
  rect(12, 12, width - 24, height - 24);

  noStroke();
  fill(255, 255, 255, 95 + hoverAmount * 90);
  textFont("monospace");
  textSize(11);
  text(isHovering ? "hover: magnetic HvA triangles" : "drift: HvA triangles", 18, 482);
}
