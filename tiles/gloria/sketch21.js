const CANVAS_SIZE = 400;
const TILE = 10;
const HOVER_RADIUS = 82;

let triangles = [];
let accentInk;
let deepInk;
let paper;
let gold;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  pixelDensity(2);
  noStroke();

  paper = color("#F8F7F1");
  deepInk = color("#101820");
  accentInk = color("#006B5F");
  gold = color("#C47A00");

  buildTriangleField();
}

function draw() {
  background(paper);

  const hovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  for (const tri of triangles) {
    const cx = tri.cx;
    const cy = tri.cy;
    const distanceToMouse = hovering ? dist(mouseX, mouseY, cx, cy) : 999;
    const hoverForce = constrain(1 - distanceToMouse / HOVER_RADIUS, 0, 1);
    const pulse = hovering ? sin(frameCount * 0.055 + tri.phase) * hoverForce : 0;
    const drift = hoverForce * 4.5;
    const liftX = cos(tri.angleToMouse()) * drift;
    const liftY = sin(tri.angleToMouse()) * drift;
    const scaleUp = 1 + hoverForce * 0.45 + pulse * 0.08;

    const fillColor = lerpColor(tri.baseColor, tri.hoverColor, hoverForce * 0.9);

    push();
    translate(cx + liftX, cy + liftY);
    rotate(tri.rotation + pulse * 0.18);
    scale(scaleUp);
    fill(fillColor);
    triangle(
      tri.points[0].x,
      tri.points[0].y,
      tri.points[1].x,
      tri.points[1].y,
      tri.points[2].x,
      tri.points[2].y
    );
    pop();
  }

  drawQuietFrame();
}

function buildTriangleField() {
  triangles = [];

  for (let y = 0; y < height; y += TILE) {
    for (let x = 0; x < width; x += TILE) {
      const diagonal = (x / TILE + y / TILE) % 2 === 0;
      const tone = noise(x * 0.035, y * 0.035);
      const brightBand = abs(y - waveLine(x)) < 16;
      const baseColor = chooseBaseColor(tone, brightBand);
      const hoverColor = brightBand ? deepInk : gold;

      addTriangle(x, y, diagonal, baseColor, hoverColor);
      addTriangle(x, y, !diagonal, shade(baseColor, tone), accentInk);
    }
  }
}

function addTriangle(x, y, diagonal, baseColor, hoverColor) {
  const jitter = 0.45;
  const x0 = -TILE / 2 - jitter;
  const y0 = -TILE / 2 - jitter;
  const x1 = TILE / 2 + jitter;
  const y1 = TILE / 2 + jitter;
  const cx = x + TILE / 2;
  const cy = y + TILE / 2;

  const points = diagonal
    ? [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x0, y: y1 }]
    : [{ x: x1, y: y1 }, { x: x1, y: y0 }, { x: x0, y: y1 }];

  triangles.push({
    cx,
    cy,
    points,
    baseColor,
    hoverColor,
    phase: random(TWO_PI),
    rotation: random(-0.025, 0.025),
    angleToMouse() {
      return atan2(this.cy - mouseY, this.cx - mouseX);
    }
  });
}

function chooseBaseColor(tone, brightBand) {
  if (brightBand) {
    return tone > 0.52 ? gold : accentInk;
  }

  if (tone < 0.32) return color("#101820");
  if (tone < 0.58) return color("#24566B");
  if (tone < 0.76) return color("#E7E0C9");
  return color("#F8F7F1");
}

function shade(baseColor, tone) {
  const shadow = tone > 0.5 ? deepInk : color("#D6CFB8");
  return lerpColor(baseColor, shadow, 0.2);
}

function waveLine(x) {
  return height * 0.5 + sin(x * 0.035) * 46 + sin(x * 0.09) * 12;
}

function drawQuietFrame() {
  noFill();
  stroke("#101820");
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);
  noStroke();
}