const canvasSize = 400;
const cellSize = 66;
const linkStroke = 9;
const hoverRadius = 105;
const hoverEase = 0.12;

let links = [];
let time = 0;
let hoverX = 200;
let hoverY = 200;
let hoverAmount = 0;
let targetHoverAmount = 0;

function setup() {
  // setup and grid creation
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  colorMode(HSB, 360, 100, 100, 100);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  createLinksGrid();
}

function draw() {
  updateLinks();
  background(0, 0, 0);
  drawSoftGlow();
  drawAllLinks();
}

function createLinksGrid() {
  links = [];

  const cols = ceil(width / cellSize) + 3;
  const rows = ceil(height / cellSize) + 3;

  for (let y = -1; y < rows; y++) {
    for (let x = -1; x < cols; x++) {
      const offsetX = y % 2 === 0 ? 0 : cellSize * 0.5;
      const px = x * cellSize + offsetX;
      const py = y * cellSize * 0.78;

      links.push({
        x: px,
        y: py,
        rotation: floor(random(4)) * HALF_PI,
        baseHue: (x * 38 + y * 27 + random(60)) % 360,
        phase: random(TWO_PI),
        currentBoost: 0,
        scale: random(0.86, 1.08),
        style: random(["s", "loop", "wave"])
      });
    }
  }
}

function updateLinks() {
  // color and animation logic
  time = frameCount * 0.018;

  // hover interaction and easing
  const hovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (hovering) {
    hoverX = lerp(hoverX, mouseX, hoverEase);
    hoverY = lerp(hoverY, mouseY, hoverEase);
    targetHoverAmount = 1;
  } else {
    hoverX = lerp(hoverX, width / 2, hoverEase * 0.4);
    hoverY = lerp(hoverY, height / 2, hoverEase * 0.4);
    targetHoverAmount = 0;
  }

  hoverAmount = lerp(hoverAmount, targetHoverAmount, hoverEase);

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const d = dist(link.x, link.y, hoverX, hoverY);
    const targetBoost = constrain(1 - d / hoverRadius, 0, 1) * hoverAmount;
    link.currentBoost = lerp(link.currentBoost, targetBoost, hoverEase);
  }
}

function drawSoftGlow() {
  // subtle background glow behind brighter areas
  blendMode(ADD);
  noStroke();

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const pulse = sin(time * 1.8 + link.phase) * 0.5 + 0.5;
    const glowAlpha = 3 + link.currentBoost * 10 + pulse * 2;
    const hueValue = (link.baseHue + time * 22) % 360;

    fill(hueValue, 90, 80, glowAlpha);
    circle(link.x, link.y, 62 + link.currentBoost * 28);
  }

  blendMode(BLEND);
}

function drawAllLinks() {
  // draw darker links first, then bright links for layered depth
  for (let i = 0; i < links.length; i++) {
    drawLink(links[i], true);
  }

  blendMode(ADD);

  for (let i = 0; i < links.length; i++) {
    drawLink(links[i], false);
  }

  blendMode(BLEND);
}

function drawLink(link, shadowPass) {
  // drawing of the link shape
  const pulse = sin(time * 1.7 + link.phase) * 0.5 + 0.5;
  const thickness = linkStroke + pulse * 1.2 + link.currentBoost * 6;
  const brightness = shadowPass ? 18 : 78 + pulse * 17 + link.currentBoost * 20;
  const alpha = shadowPass ? 28 : 74 + link.currentBoost * 24;
  const liftScale = link.scale * (1 + link.currentBoost * 0.11);
  const hueShift = time * 28 + link.currentBoost * 22;

  push();
  translate(link.x, link.y);
  rotate(link.rotation + sin(time * 0.6 + link.phase) * 0.035);
  scale(liftScale);

  if (shadowPass) {
    stroke(0, 0, 0, 48);
    strokeWeight(thickness + 8);
    drawLinkPath(link.style, 0);
  } else {
    strokeWeight(thickness + 6);
    stroke((link.baseHue + hueShift) % 360, 85, brightness * 0.45, 18);
    drawLinkPath(link.style, 0);

    strokeWeight(thickness);
    drawGradientLink(link, brightness, alpha, hueShift);

    strokeWeight(max(2, thickness * 0.28));
    stroke((link.baseHue + hueShift + 35) % 360, 55, 100, 26 + link.currentBoost * 24);
    drawLinkPath(link.style, -1.5);
  }

  pop();
}

function drawGradientLink(link, brightness, alpha, hueShift) {
  // segmented strokes create a multicolor gradient along each link
  const points = getLinkPoints(link.style);
  const segmentCount = points.length - 1;

  for (let i = 0; i < segmentCount; i++) {
    const a = points[i];
    const b = points[i + 1];
    const hueValue = (link.baseHue + hueShift + i * 11) % 360;

    stroke(hueValue, 92, brightness, alpha);
    line(a.x, a.y, b.x, b.y);
  }
}

function drawLinkPath(style, yOffset) {
  const points = getLinkPoints(style);

  beginShape();
  for (let i = 0; i < points.length; i++) {
    curveVertex(points[i].x, points[i].y + yOffset);
  }
  endShape();
}

function getLinkPoints(style) {
  const points = [];

  if (style === "loop") {
    for (let a = -PI * 0.15; a <= TWO_PI * 0.92; a += 0.18) {
      const r = 21 + sin(a * 2) * 4;
      points.push({ x: cos(a) * r, y: sin(a) * r });
    }
    points.push(points[0]);
    return points;
  }

  if (style === "wave") {
    for (let i = 0; i <= 28; i++) {
      const t = map(i, 0, 28, -1, 1);
      points.push({
        x: t * 42,
        y: sin(t * PI * 1.5) * 19
      });
    }
    return duplicateEndpoints(points);
  }

  for (let i = 0; i <= 30; i++) {
    const t = map(i, 0, 30, -1, 1);
    points.push({
      x: t * 39,
      y: sin(t * PI) * 24
    });
  }

  return duplicateEndpoints(points);
}

function duplicateEndpoints(points) {
  const result = [];
  result.push(points[0]);

  for (let i = 0; i < points.length; i++) {
    result.push(points[i]);
  }

  result.push(points[points.length - 1]);
  return result;
}