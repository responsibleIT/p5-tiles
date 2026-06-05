// Premium low-poly hero background for p5.js
// Canvas: 1080 x 920, dark futuristic, subtle interactive motion

const CANVAS_W = 1080;
const CANVAS_H = 920;
const TRIANGLE_COUNT = 95;
const MOUSE_INFLUENCE_RADIUS = 260;
const NOISE_SPEED = 0.0009;
const BASE_FLOAT_AMPLITUDE = 28;
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
  bgColor = color("#0B1020");

  palette = [
    color(120, 220, 255, 230), // cyan
    color(80, 200, 210, 220),  // teal
    color(190, 230, 135, 210), // soft lime
    color(170, 150, 230, 215), // muted purple
    color(230, 240, 255, 230)  // soft white highlight
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

  // Update and draw triangles
  for (let t of triangles) {
    t.update(mouse, center);
  }

  // Depth sort by layer
  triangles.sort((a, b) => a.depth - b.depth);

  // Draw back layer
  for (let t of triangles) {
    if (t.depth < 0.6) t.display();
  }

  // Connection lines
  drawConnections();

  // Draw front layer with occasional additive blending for glow
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

  // Optional: subtle hidden cursor indicator (very faint)
  drawSoftCursor(mouse);
}

// --------- Triangle creation and class ----------

function createTriangle(normalizedIndex) {
  // Bias positions to be calmer on the left, more intense on the right
  let xBias = pow(random(), 1.6); // more values near 0
  let x = lerp(width * -0.1, width * 1.25, xBias);
  let y = random(-height * 0.1, height * 1.1);

  // Depth controls scale, blur, and parallax
  let depth = random(0.35, 1.1); // back to front

  // Size varies with depth and index (more variety on right)
  let baseSize = map(depth, 0.35, 1.1, 320, 90);
  let jitter = map(normalizedIndex, 0, 1, -40, 60);
  let size = constrain(baseSize + jitter + random(-40, 40), 60, 330);

  // Some triangles are only outlines, some filled
  let outlinedOnly = random() < 0.28;
  let filledOnly = random() < 0.65;
  if (outlinedOnly) filledOnly = false;

  // Color choice: right side tends to be brighter/whiter
  let rightFactor = constrain(map(x, width * 0.3, width * 1.25, 0, 1), 0, 1);
  let baseColor;
  if (random() < 0.25 + rightFactor * 0.35) {
    // Use white highlight more on right
    baseColor = palette[4];
  } else {
    baseColor = random(palette.slice(0, 4));
  }

  // Alpha based on depth (farther = softer)
  let alphaScale = map(depth, 0.35, 1.1, 90, 220);
  let col = color(
    red(baseColor),
    green(baseColor),
    blue(baseColor),
    alphaScale
  );

  // Create triangle geometry in local space
  let verts = [];
  let angleStart = random(TWO_PI);
  for (let i = 0; i < 3; i++) {
    let angle = angleStart + random(PI * 0.4, PI * 0.85) * i;
    let radius = size * random(0.55, 1.0);
    verts.push(createVector(cos(angle) * radius, sin(angle) * radius));
  }

  // Slight skew toward pointing towards center for intentional composition
  let centerDir = createVector(width * 0.7 - x, height * 0.5 - y).normalize();
  for (let v of verts) {
    v.add(p5.Vector.mult(centerDir, random(-25, 40)));
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

    this.glowWeight = random(0.3, 1.0);
    this.lineWeight = random(0.6, 1.8);
    this.fillAlphaFactor = random(0.5, 1.0);

    // Smoothed properties
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

    // Base floating via Perlin noise
    let nX = noise(this.noiseSeed, t * NOISE_SPEED);
    let nY = noise(this.noiseSeed + 50, t * NOISE_SPEED);
    let floatAmp = BASE_FLOAT_AMPLITUDE * lerp(0.3, 1.0, this.depth);
    let fx = map(nX, 0, 1, -floatAmp, floatAmp);
    let fy = map(nY, 0, 1, -floatAmp, floatAmp);
    let targetFloat = createVector(fx, fy);
    this.floatOffset.lerp(targetFloat, 0.03);

    // Subtle rotation via noise
    let nR = noise(this.noiseSeedRot, t * NOISE_SPEED * 0.5);
    let baseRotRange = map(this.depth, 0.35, 1.1, 0.04, 0.18);
    this.targetRotation = map(nR, 0, 1, -baseRotRange, baseRotRange);
    this.rotation = lerp(this.rotation, this.targetRotation, 0.03);

    // Alpha pulsing for atmospheric depth
    let nA = noise(this.noiseSeedAlpha, t * NOISE_SPEED * 0.65);
    let alphaRange = map(this.depth, 0.35, 1.1, 18, 45);
    let targetAlpha =
      alpha(this.baseColor) * this.fillAlphaFactor +
      map(nA, 0, 1, -alphaRange, alphaRange);
    this.currentAlpha = lerp(this.currentAlpha, targetAlpha, 0.02);

    // Mouse "magnetic" influence
    let effectivePos = p5.Vector.add(this.basePos, this.floatOffset);
    let distToMouse = p5.Vector.dist(effectivePos, mouse);
    let influence = 0;
    if (distToMouse < MOUSE_INFLUENCE_RADIUS) {
      let dNorm = distToMouse / MOUSE_INFLUENCE_RADIUS;
      influence = pow(1 - dNorm, 2.0);
    }

    let dirFromMouse = p5.Vector.sub(effectivePos, mouse).normalize();
    let mousePushStrength = map(this.depth, 0.35, 1.1, 8, 26);
    let targetMouseOffset = dirFromMouse
      .copy()
      .mult(mousePushStrength * influence);
    this.mouseOffset.lerp(targetMouseOffset, 0.09);

    // Parallax based on mouse proximity to canvas center
    let mouseOffsetFromCenter = p5.Vector.sub(mouse, center);
    let depthScale = map(this.depth, 0.35, 1.1, 0.15, 1.0);
    let targetParallax = mouseOffsetFromCenter
      .copy()
      .mult(PARALLAX_STRENGTH * depthScale);
    this.parallaxOffset.lerp(targetParallax, 0.12);

    // Final position smoothing
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
    let fillAlpha = this.currentAlpha * (this.filledOnly ? 1.1 : 0.75);
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
        outlineAlpha * 0.85
      );
      stroke(strokeCol);
      strokeWeight(this.lineWeight * lerp(0.5, 1.3, this.depth));
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

    // Slightly enlarged glow
    let glowScale = map(this.glowWeight, 0.6, 1.0, 1.06, 1.16);
    let glowAlpha = this.currentAlpha * map(this.glowWeight, 0.6, 1.0, 0.25, 0.6);

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
  // Subtle vertical + horizontal gradient to the right
  noFill();
  for (let i = 0; i < 80; i++) {
    let x = map(i, 0, 79, width * 0.4, width * 1.1);
    let w = width * 0.8 / 80;
    let c = lerpColor(
      color(5, 5, 15, 0),
      color(30, 40, 80, 90),
      i / 79.0
    );
    noStroke();
    fill(c);
    rect(x, -10, w + 2, height + 20);
  }

  for (let j = 0; j < 40; j++) {
    let y = map(j, 0, 39, -height * 0.1, height * 1.1);
    let h = height * 1.2 / 40;
    let c2 = lerpColor(
      color(0, 0, 0, 0),
      color(5, 15, 35, 80),
      j / 39.0
    );
    noStroke();
    fill(c2);
    rect(-10, y, width + 20, h);
  }

  // Dark overlay on the left to ensure quiet space
  let leftFadeWidth = width * 0.45;
  for (let k = 0; k < 35; k++) {
    let x = map(k, 0, 34, -leftFadeWidth * 0.3, leftFadeWidth);
    let w = leftFadeWidth / 35;
    let alphaVal = map(k, 0, 34, 160, 0);
    fill(5, 8, 18, alphaVal);
    noStroke();
    rect(x, -10, w + 2, height + 20);
  }
}

function drawConnections() {
  strokeWeight(0.7);
  for (let i = 0; i < triangles.length; i++) {
    let t1 = triangles[i];
    let c1 = t1.getCenter();
    for (let j = i + 1; j < triangles.length; j++) {
      let t2 = triangles[j];
      let c2 = t2.getCenter();
      let d = p5.Vector.dist(c1, c2);
      if (d < 220 && random() < 0.18) {
        // Fade with distance and depth
        let depthFactor = (t1.depth + t2.depth) * 0.5;
        let alphaFactor = map(d, 0, 220, 80, 0);
        let col = color(160, 210, 255, alphaFactor * depthFactor * 0.4);
        stroke(col);
        line(c1.x, c1.y, c2.x, c2.y);
      }
    }
  }
}

function drawGrainOverlay() {
  // Subtle film grain, very low opacity
  strokeWeight(1);
  for (let i = 0; i < GRAIN_DENSITY; i++) {
    let x = random(width);
    let y = random(height);
    let alphaVal = random(6, 26);
    let grayBase = random(160, 230);
    stroke(grayBase, grayBase, grayBase, alphaVal);
    point(x, y);
  }
}

function drawSoftCursor(mouse) {
  // Very faint circle that helps debug interaction, but is almost invisible in hero usage
  push();
  noFill();
  stroke(230, 240, 255, 18);
  strokeWeight(1);
  ellipse(mouse.x, mouse.y, 24, 24);
  pop();
}

// --------- Interaction helpers ----------

function getSmoothedMouse() {
  // If mouse is out of canvas (e.g. before interaction), keep previous
  let mx = constrain(mouseX, -50, width + 50);
  let my = constrain(mouseY, -50, height + 50);

  let target = createVector(mx, my);
  lastMouse.lerp(target, 0.12);
  return lastMouse.copy();
}