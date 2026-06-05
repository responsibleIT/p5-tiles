// Premium low-poly hero background for p5.js
// Variant: bigger triangles & new color palette inspired by reference image

const CANVAS_W = 1080;
const CANVAS_H = 920;
const TRIANGLE_COUNT = 70;
const MOUSE_INFLUENCE_RADIUS = 260;
const NOISE_SPEED = 0.0009;
const BASE_FLOAT_AMPLITUDE = 30;
const PARALLAX_STRENGTH = 0.06;
const GRAIN_DENSITY = 650;

let triangles = [];
let bgColor;
let palette;
let lastMouse;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  noCursor();
  bgColor = color("#050816"); // slightly deeper navy/black

  // Palette inspired by cool low-poly gradients:
  // deep blues, teals, turquoise, and soft violet + highlight
  palette = [
    color(18, 32, 68, 235),   // deep navy blue
    color(32, 66, 120, 235),  // muted blue
    color(43, 122, 175, 235), // blue-cyan
    color(48, 173, 196, 235), // teal
    color(101, 205, 197, 235),// turquoise/mint
    color(142, 124, 214, 235),// soft violet accent
    color(216, 228, 255, 235) // soft off-white highlight
  ];

  noiseDetail(3, 0.4);

  for (let i = 0; i < TRIANGLE_COUNT; i++) {
    triangles.push(createTriangle(i / TRIANGLE_COUNT));
  }

  lastMouse = createVector(width * 0.3, height * 0.5);
}

function draw() {
  background(bgColor);
  drawBackgroundGradient();

  const mouse = getSmoothedMouse();
  const center = createVector(width / 2, height / 2);

  for (let t of triangles) {
    t.update(mouse, center);
  }

  triangles.sort((a, b) => a.depth - b.depth);

  // Draw back layer
  for (let t of triangles) {
    if (t.depth < 0.6) t.display();
  }

  // Connections
  drawConnections();

  // Front layer glow
  blendMode(ADD);
  for (let t of triangles) {
    if (t.depth >= 0.6 && t.glowWeight > 0.6) {
      t.displayGlow();
    }
  }
  blendMode(BLEND);
  for (let t of triangles) {
    if (t.depth >= 0.6) t.display();
  }

  drawGrainOverlay();
  drawSoftCursor(mouse);
}

// --------- Triangle creation and class ----------

function createTriangle(normalizedIndex) {
  // Calmer on left, more intense on right
  let xBias = pow(random(), 1.6);
  let x = lerp(width * -0.1, width * 1.25, xBias);
  let y = random(-height * 0.1, height * 1.1);

  let depth = random(0.35, 1.1);

  // Bigger triangles: larger base sizes
  let baseSize = map(depth, 0.35, 1.1, 520, 160);
  let jitter = map(normalizedIndex, 0, 1, -60, 80);
  let size = constrain(baseSize + jitter + random(-40, 40), 140, 520);

  let outlinedOnly = random() < 0.24;
  let filledOnly = random() < 0.7;
  if (outlinedOnly) filledOnly = false;

  // Right side more bright / highlight tones
  let rightFactor = constrain(map(x, width * 0.3, width * 1.25, 0, 1), 0, 1);
  let baseColor;
  if (random() < 0.18 + rightFactor * 0.4) {
    baseColor = palette[6]; // soft highlight
  } else {
    baseColor = random(palette.slice(0, 6));
  }

  let alphaScale = map(depth, 0.35, 1.1, 100, 230);
  let col = color(
    red(baseColor),
    green(baseColor),
    blue(baseColor),
    alphaScale
  );

  let verts = [];
  let angleStart = random(TWO_PI);
  for (let i = 0; i < 3; i++) {
    let angle = angleStart + random(PI * 0.45, PI * 0.9) * i;
    let radius = size * random(0.6, 1.0);
    verts.push(createVector(cos(angle) * radius, sin(angle) * radius));
  }

  let centerDir = createVector(width * 0.7 - x, height * 0.5 - y).normalize();
  for (let v of verts) {
    v.add(p5.Vector.mult(centerDir, random(-30, 55)));
  }

  return new GlassTriangle(
    createVector(x, y),
    verts,
    col,
    depth,
    outlinedOnly,
    filledOnly
  );
}

class GlassTriangle {
  constructor(pos, verts, baseColor, depth, outlinedOnly, filledOnly) {
    this.basePos = pos.copy();
    this.verts = verts.map(v => v.copy());
    this.depth = depth;
    this.baseColor = baseColor;
    this.outlinedOnly = outlinedOnly;
    this.filledOnly = filledOnly;

    this.noiseSeed = random(1000);
    this.noiseSeedRot = random(1000, 2000);
    this.noiseSeedAlpha = random(2000, 3000);

    this.floatOffset = createVector(0, 0);
    this.mouseOffset = createVector(0, 0);
    this.parallaxOffset = createVector(0, 0);
    this.rotation = random(TWO_PI);
    this.targetRotation = this.rotation;

    this.glowWeight = random(0.4, 1.0);
    this.lineWeight = random(0.7, 2.2);
    this.fillAlphaFactor = random(0.6, 1.0);

    this.currentAlpha = alpha(baseColor);
    this.currentPos = this.basePos.copy();
  }

  getCenter() {
    let cx = 0, cy = 0;
    for (let v of this.verts) {
      cx += v.x;
      cy += v.y;
    }
    cx /= this.verts.length;
    cy /= this.verts.length;
    return createVector(cx, cy).add(this.currentPos).add(this.parallaxOffset);
  }

  update(mouse, center) {
    let t = millis();

    // Floating via noise
    let nX = noise(this.noiseSeed, t * NOISE_SPEED);
    let nY = noise(this.noiseSeed + 50, t * NOISE_SPEED);
    let floatAmp = BASE_FLOAT_AMPLITUDE * lerp(0.3, 1.1, this.depth);
    let fx = map(nX, 0, 1, -floatAmp, floatAmp);
    let fy = map(nY, 0, 1, -floatAmp, floatAmp);
    let targetFloat = createVector(fx, fy);
    this.floatOffset.lerp(targetFloat, 0.03);

    // Rotation via noise
    let nR = noise(this.noiseSeedRot, t * NOISE_SPEED * 0.5);
    let baseRotRange = map(this.depth, 0.35, 1.1, 0.03, 0.14);
    this.targetRotation = map(nR, 0, 1, -baseRotRange, baseRotRange);
    this.rotation = lerp(this.rotation, this.targetRotation, 0.03);

    // Alpha pulsing
    let nA = noise(this.noiseSeedAlpha, t * NOISE_SPEED * 0.6);
    let alphaRange = map(this.depth, 0.35, 1.1, 20, 50);
    let targetAlpha =
      alpha(this.baseColor) * this.fillAlphaFactor +
      map(nA, 0, 1, -alphaRange, alphaRange);
    this.currentAlpha = lerp(this.currentAlpha, targetAlpha, 0.02);

    // Mouse influence
    let effectivePos = p5.Vector.add(this.basePos, this.floatOffset);
    let distToMouse = p5.Vector.dist(effectivePos, mouse);
    let influence = 0;
    if (distToMouse < MOUSE_INFLUENCE_RADIUS) {
      let dNorm = distToMouse / MOUSE_INFLUENCE_RADIUS;
      influence = pow(1 - dNorm, 2.0);
    }

    let dirFromMouse = p5.Vector.sub(effectivePos, mouse).normalize();
    let mousePushStrength = map(this.depth, 0.35, 1.1, 10, 30);
    let targetMouseOffset = dirFromMouse
      .copy()
      .mult(mousePushStrength * influence);
    this.mouseOffset.lerp(targetMouseOffset, 0.09);

    // Parallax
    let mouseOffsetFromCenter = p5.Vector.sub(mouse, center);
    let depthScale = map(this.depth, 0.35, 1.1, 0.2, 1.0);
    let targetParallax = mouseOffsetFromCenter
      .copy()
      .mult(PARALLAX_STRENGTH * depthScale);
    this.parallaxOffset.lerp(targetParallax, 0.12);

    let targetPos = p5.Vector.add(
      this.basePos,
      this.floatOffset,
      this.mouseOffset
    );
    this.currentPos.lerp(targetPos, 0.18);
  }

  display() {
    push();
    translate(
      this.currentPos.x + this.parallaxOffset.x,
      this.currentPos.y + this.parallaxOffset.y
    );
    rotate(this.rotation);

    let col = color(
      red(this.baseColor),
      green(this.baseColor),
      blue(this.baseColor),
      this.currentAlpha
    );

    let outlineAlpha = this.currentAlpha * 0.9;
    let fillAlpha = this.currentAlpha * (this.filledOnly ? 1.1 : 0.8);
    fillAlpha = constrain(fillAlpha, 40, 255);

    if (!this.outlinedOnly) {
      noStroke();
      let fillCol = color(
        red(col),
        green(col),
        blue(col),
        fillAlpha * this.fillAlphaFactor
      );
      fill(fillCol);
      this.drawShape();
    }

    if (!this.filledOnly || this.outlinedOnly) {
      let strokeCol = color(
        red(col),
        green(col),
        blue(col),
        outlineAlpha * 0.9
      );
      stroke(strokeCol);
      strokeWeight(this.lineWeight * lerp(0.5, 1.4, this.depth));
      noFill();
      this.drawShape();
    }

    pop();
  }

  displayGlow() {
    push();
    translate(
      this.currentPos.x + this.parallaxOffset.x,
      this.currentPos.y + this.parallaxOffset.y
    );
    rotate(this.rotation);

    let glowScale = map(this.glowWeight, 0.6, 1.0, 1.05, 1.17);
    let glowAlpha = this.currentAlpha * map(this.glowWeight, 0.6, 1.0, 0.24, 0.55);

    let glowCol = color(
      red(this.baseColor),
      green(this.baseColor),
      blue(this.baseColor),
      glowAlpha
    );
    noStroke();
    fill(glowCol);

    beginShape();
    for (let v of this.verts) {
      vertex(v.x * glowScale, v.y * glowScale);
    }
    endShape(CLOSE);

    pop();
  }

  drawShape() {
    beginShape();
    for (let v of this.verts) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
  }
}

// --------- Visual extras ----------

function drawBackgroundGradient() {
  // Right-side cool glow
  noFill();
  for (let i = 0; i < 80; i++) {
    let x = map(i, 0, 79, width * 0.4, width * 1.1);
    let w = width * 0.8 / 80;
    let c = lerpColor(
      color(3, 5, 18, 0),
      color(22, 52, 100, 110),
      i / 79.0
    );
    noStroke();
    fill(c);
    rect(x, -10, w + 2, height + 20);
  }

  // Subtle vertical depth
  for (let j = 0; j < 40; j++) {
    let y = map(j, 0, 39, -height * 0.1, height * 1.1);
    let h = height * 1.2 / 40;
    let c2 = lerpColor(
      color(0, 0, 0, 0),
      color(5, 15, 35, 90),
      j / 39.0
    );
    noStroke();
    fill(c2);
    rect(-10, y, width + 20, h);
  }

  // Darker left for quiet text area
  let leftFadeWidth = width * 0.45;
  for (let k = 0; k < 35; k++) {
    let x = map(k, 0, 34, -leftFadeWidth * 0.3, leftFadeWidth);
    let w = leftFadeWidth / 35;
    let alphaVal = map(k, 0, 34, 170, 0);
    fill(4, 6, 18, alphaVal);
    noStroke();
    rect(x, -10, w + 2, height + 20);
  }
}

function drawConnections() {
  strokeWeight(0.8);
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    let c1 = t1.getCenter();
    for (let j = i + 1; j < triangles.length; j++) {
      let t2 = triangles[j];
      let c2 = t2.getCenter();
      let d = p5.Vector.dist(c1, c2);
      if (d < 260 && random() < 0.2) {
        let depthFactor = (t1.depth + t2.depth) * 0.5;
        let alphaFactor = map(d, 0, 260, 90, 0);
        let col = color(150, 210, 255, alphaFactor * depthFactor * 0.45);
        stroke(col);
        line(c1.x, c1.y, c2.x, c2.y);
      }
    }
  }
}

function drawGrainOverlay() {
  strokeWeight(1);
  for (let i = 0; i < GRAIN_DENSITY; i++) {
    let x = random(width);
    let y = random(height);
    let alphaVal = random(6, 22);
    let grayBase = random(170, 230);
    stroke(grayBase, grayBase, grayBase, alphaVal);
    point(x, y);
  }
}

function drawSoftCursor(mouse) {
  push();
  noFill();
  stroke(216, 228, 255, 15);
  strokeWeight(1);
  ellipse(mouse.x, mouse.y, 26, 26);
  pop();
}

// --------- Interaction helpers ----------

function getSmoothedMouse() {
  let mx = constrain(mouseX, -50, width + 50);
  let my = constrain(mouseY, -50, height + 50);

  let target = createVector(mx, my);
  lastMouse.lerp(target, 0.12);
  return lastMouse.copy();
}