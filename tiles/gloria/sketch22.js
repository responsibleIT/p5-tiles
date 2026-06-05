const CANVAS_SIZE = 400;
const TILE = 8;
const HOVER_RADIUS = 76;

let pieces = [];
let grain = [];
let palette;
let cursorHasVisited = false;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  pixelDensity(2);
  noStroke();
  noiseDetail(5, 0.52);

  palette = {
    shadow: color("#100616"),
    violet: color("#5622A8"),
    blue: color("#1754E8"),
    hotBlue: color("#2F79FF"),
    orange: color("#FF6B1A"),
    amber: color("#FF9B1A"),
    cream: color("#FFE4B8")
  };

  buildTriangleMosaic();
  buildStaticGrain();
}

function draw() {
  background(palette.shadow);

  const hovering = cursorHasVisited && mouseInsideCanvas();

  for (const piece of pieces) {
    const distanceToMouse = hovering ? dist(mouseX, mouseY, piece.cx, piece.cy) : 999;
    const hover = constrain(1 - distanceToMouse / HOVER_RADIUS, 0, 1);
    const breathe = hovering ? sin(frameCount * 0.045 + piece.phase) * hover : 0;
    const angle = atan2(piece.cy - mouseY, piece.cx - mouseX);
    const scatter = hover * piece.hoverLift;
    const glow = hover * 0.95;

    push();
    translate(
      piece.cx + cos(angle) * scatter,
      piece.cy + sin(angle) * scatter
    );
    rotate(piece.rotation + breathe * 0.1);
    scale(1 + hover * 0.28 + abs(breathe) * 0.05);
    fill(lerpColor(piece.baseColor, piece.hoverColor, glow));
    triangle(
      piece.points[0].x,
      piece.points[0].y,
      piece.points[1].x,
      piece.points[1].y,
      piece.points[2].x,
      piece.points[2].y
    );
    pop();
  }

  drawTriangleGrain();
  drawFocusFrame();
}

function buildTriangleMosaic() {
  pieces = [];

  for (let y = 0; y < height; y += TILE) {
    for (let x = 0; x < width; x += TILE) {
      const flip = (x / TILE + y / TILE) % 2 === 0;
      addPiece(x, y, flip);
      addPiece(x, y, !flip);
    }
  }
}

function buildStaticGrain() {
  grain = [];

  for (let i = 0; i < 520; i++) {
    grain.push({
      x: random(width),
      y: random(height),
      size: random(1.2, 2.8),
      dark: random() > 0.5
    });
  }
}

function addPiece(x, y, flip) {
  const cx = x + TILE / 2;
  const cy = y + TILE / 2;
  const half = TILE / 2 + 0.42;
  const portraitTone = portraitLight(cx, cy);
  const paperGrain = noise(cx * 0.75, cy * 0.75);
  const colorJitter = map(paperGrain, 0, 1, -0.12, 0.12);
  const baseColor = colorForTone(constrain(portraitTone + colorJitter, 0, 1), cx, cy);
  const hoverColor = portraitTone > 0.58 ? palette.cream : palette.amber;


  const points = flip
    ? [{ x: -half, y: -half }, { x: half, y: -half }, { x: -half, y: half }]
    : [{ x: half, y: half }, { x: half, y: -half }, { x: -half, y: half }];

  pieces.push({
    cx,
    cy,
    points,
    baseColor,
    hoverColor,
    phase: random(TWO_PI),
    rotation: random(-0.018, 0.018),
    hoverLift: random(2.2, 6.6)
  });
}

function portraitLight(x, y) {
  const nx = x / width;
  const ny = y / height;
  const centerGlow = softOval(nx, ny, 0.5, 0.42, 0.32, 0.43);
  const forehead = softOval(nx, ny, 0.52, 0.13, 0.24, 0.18);
  const cheekLeft = softOval(nx, ny, 0.32, 0.55, 0.16, 0.2);
  const cheekRight = softOval(nx, ny, 0.68, 0.55, 0.16, 0.2);
  const lips = softOval(nx, ny, 0.5, 0.72, 0.18, 0.055);
  const noseBlue = softOval(nx, ny, 0.5, 0.48, 0.095, 0.22);
  const eyeLeft = softOval(nx, ny, 0.34, 0.38, 0.13, 0.045);
  const eyeRight = softOval(nx, ny, 0.66, 0.38, 0.13, 0.045);
  const sideShadow = max(
    softOval(nx, ny, 0.16, 0.52, 0.2, 0.58),
    softOval(nx, ny, 0.84, 0.52, 0.2, 0.58)
  );
  const diagonalHeat = map(sin((x + y) * 0.035), -1, 1, 0, 0.16);
  const texture = noise(x * 0.028, y * 0.028) * 0.18;

  let tone = 0.16;
  tone += centerGlow * 0.4;
  tone += forehead * 0.26;
  tone += cheekLeft * 0.3 + cheekRight * 0.3;
  tone += lips * 0.32;
  tone += diagonalHeat + texture;
  tone -= noseBlue * 0.22;
  tone -= (eyeLeft + eyeRight) * 0.48;
  tone -= sideShadow * 0.18;

  return constrain(tone, 0, 1);
}

function colorForTone(tone, x, y) {
  const electricShadow = softOval(x / width, y / height, 0.5, 0.48, 0.12, 0.38);

  if (tone < 0.18) return palette.shadow;
  if (tone < 0.34) return lerpColor(palette.violet, palette.blue, tone * 1.8);
  if (tone < 0.56) return electricShadow > 0.35 ? palette.hotBlue : palette.violet;
  if (tone < 0.78) return lerpColor(palette.orange, palette.amber, tone);
  return palette.cream;
}

function softOval(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return constrain(1 - (dx * dx + dy * dy), 0, 1);
}

function drawTriangleGrain() {
  blendMode(MULTIPLY);
  for (const speck of grain) {
    fill(speck.dark ? color(16, 6, 22, 28) : color(255, 228, 184, 24));
    triangle(
      speck.x,
      speck.y - speck.size,
      speck.x - speck.size,
      speck.y + speck.size,
      speck.x + speck.size,
      speck.y + speck.size
    );
  }
  blendMode(BLEND);
}

function drawFocusFrame() {
  noFill();
  stroke(palette.cream);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);

  stroke(palette.shadow);
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