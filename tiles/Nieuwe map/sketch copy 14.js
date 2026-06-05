const CANVAS_W = 1920;
const CANVAS_H = 1080;
const COLS = 40;
const ROWS = 23;
const GAP = 2.2;

let sourceLayer;
let glassTiles = [];
let pointerInside = false;
let hoverPower = 0;

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(30);
  noStroke();

  cnv.style("width", "min(100vw, 1920px)");
  cnv.style("height", "auto");
  document.body.style.background = "#050403";
  document.body.style.overflowX = "hidden";

  cnv.elt.addEventListener("mouseenter", () => {
    pointerInside = true;
  });
  cnv.elt.addEventListener("mouseleave", () => {
    pointerInside = false;
  });

  randomSeed(42);
  noiseSeed(42);
  sourceLayer = buildSourceLayer();
  buildTiles();
}

function draw() {
  const t = frameCount * 0.018;
  hoverPower = lerp(hoverPower, pointerInside ? 1 : 0, 0.08);

  background(7, 4, 2);
  drawBaseGlow(t);

  for (const tile of glassTiles) {
    drawGlassTile(tile, t);
  }

  drawHoverLight(t);
}

function buildTiles() {
  const tileW = CANVAS_W / COLS;
  const tileH = CANVAS_H / ROWS;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      glassTiles.push({
        row,
        col,
        x: col * tileW,
        y: row * tileH,
        w: tileW,
        h: tileH,
        phase: random(TWO_PI),
        lens: random(0.88, 1.24),
        bend: random(-1, 1),
        sx: random(-36, 36),
        sy: random(-30, 30),
      });
    }
  }
}

function buildSourceLayer() {
  const g = createGraphics(CANVAS_W, CANVAS_H);
  g.pixelDensity(1);
  g.noStroke();

  for (let y = 0; y < CANVAS_H; y++) {
    const a = y / (CANVAS_H - 1);
    const c1 = color(46, 12, 7);
    const c2 = color(238, 158, 39);
    const c3 = color(95, 33, 14);
    const c = a < 0.48
      ? lerpColor(c1, c2, a / 0.48)
      : lerpColor(c2, c3, (a - 0.48) / 0.52);

    g.stroke(c);
    g.line(0, y, CANVAS_W, y);
  }

  drawSoftEllipse(g, 260, 330, 820, 760, [160, 18, 8], 170, 56);
  drawSoftEllipse(g, 520, 830, 720, 520, [250, 235, 178], 180, 48);
  drawSoftEllipse(g, 765, 370, 620, 520, [25, 83, 57], 145, 46);
  drawSoftEllipse(g, 1055, 305, 520, 640, [252, 224, 103], 165, 46);
  drawSoftEllipse(g, 1310, 620, 700, 760, [238, 66, 26], 165, 50);
  drawSoftEllipse(g, 1625, 390, 420, 740, [38, 88, 58], 118, 42);
  drawSoftEllipse(g, 1800, 330, 320, 540, [23, 66, 215], 120, 38);
  drawSoftEllipse(g, 150, 760, 460, 520, [30, 205, 236], 120, 38);
  drawSoftEllipse(g, 990, 740, 360, 780, [10, 7, 5], 150, 42);

  g.blendMode(ADD);
  drawSoftEllipse(g, 1165, 480, 380, 920, [255, 238, 118], 150, 42);
  drawSoftEllipse(g, 1470, 880, 500, 360, [255, 190, 84], 92, 34);
  drawSoftEllipse(g, 430, 965, 520, 240, [220, 255, 238], 78, 32);

  g.blendMode(BLEND);
  drawLiquidRibbons(g);
  drawDarkContours(g);

  return g;
}

function drawSoftEllipse(g, x, y, w, h, rgb, strength, steps) {
  g.noStroke();

  for (let i = steps; i > 0; i--) {
    const p = i / steps;
    const alpha = (strength / steps) * (1.4 - p * 0.45);
    g.fill(rgb[0], rgb[1], rgb[2], alpha);
    g.ellipse(x, y, w * p, h * p);
  }
}

function drawLiquidRibbons(g) {
  const ribbonColors = [
    [255, 232, 126],
    [255, 118, 35],
    [138, 18, 8],
    [31, 96, 65],
    [245, 246, 188],
    [67, 190, 225],
  ];

  g.noFill();

  for (let i = 0; i < 96; i++) {
    const c = random(ribbonColors);
    const baseY = random(-80, CANVAS_H + 80);
    const amp = random(28, 160);
    const freq = random(0.0024, 0.0068);
    const phase = random(TWO_PI);

    g.stroke(c[0], c[1], c[2], random(38, 96));
    g.strokeWeight(random(5, 28));
    g.beginShape();

    for (let x = -180; x <= CANVAS_W + 180; x += 70) {
      const n = noise(i * 0.2, x * 0.0025);
      const y = baseY
        + sin(x * freq + phase) * amp
        + (n - 0.5) * 210
        + sin((x + i * 19) * 0.012) * 34;

      g.curveVertex(x, y);
    }

    g.endShape();
  }
}

function drawDarkContours(g) {
  g.noFill();

  for (let i = 0; i < 52; i++) {
    const baseY = random(-120, CANVAS_H + 120);
    const phase = random(TWO_PI);

    g.stroke(11, 5, 2, random(48, 132));
    g.strokeWeight(random(3, 16));
    g.beginShape();

    for (let x = -180; x <= CANVAS_W + 180; x += 85) {
      const y = baseY
        + sin(x * random(0.002, 0.004) + phase) * random(54, 180)
        + noise(i * 0.9, x * 0.002) * 160;

      g.curveVertex(x, y);
    }

    g.endShape();
  }
}

function drawBaseGlow(t) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  const leftGlow = drawingContext.createRadialGradient(
    360 + sin(t) * 60,
    760,
    0,
    360,
    760,
    620
  );
  leftGlow.addColorStop(0, "rgba(70, 205, 228, 0.22)");
  leftGlow.addColorStop(0.5, "rgba(255, 188, 58, 0.11)");
  leftGlow.addColorStop(1, "rgba(255, 188, 58, 0)");
  drawingContext.fillStyle = leftGlow;
  drawingContext.fillRect(0, 0, width, height);

  const hotGlow = drawingContext.createRadialGradient(
    1330,
    520 + cos(t * 0.7) * 50,
    0,
    1330,
    520,
    720
  );
  hotGlow.addColorStop(0, "rgba(255, 214, 82, 0.18)");
  hotGlow.addColorStop(0.55, "rgba(243, 65, 25, 0.13)");
  hotGlow.addColorStop(1, "rgba(243, 65, 25, 0)");
  drawingContext.fillStyle = hotGlow;
  drawingContext.fillRect(0, 0, width, height);

  drawingContext.restore();
}

function drawGlassTile(tile, t) {
  const baseX = tile.x + GAP * 0.5;
  const baseY = tile.y + GAP * 0.5;
  const baseW = tile.w - GAP;
  const baseH = tile.h - GAP;
  const cx = tile.x + tile.w * 0.5;
  const cy = tile.y + tile.h * 0.5;

  const d = dist(mouseX, mouseY, cx, cy);
  const reach = 235;
  const near = hoverPower * pow(constrain(1 - d / reach, 0, 1), 1.55);
  const ripple = near * (0.55 + 0.45 * sin(d * 0.065 - frameCount * 0.22));
  const angle = atan2(cy - mouseY, cx - mouseX);
  const push = near * 12 + ripple * 8;
  const expand = near * 12;
  const driftX = sin(t + tile.phase + tile.row * 0.36) * 1.5;
  const driftY = cos(t * 0.8 + tile.phase + tile.col * 0.22) * 1.3;

  const x = baseX + cos(angle) * push - expand * 0.5 + driftX;
  const y = baseY + sin(angle) * push - expand * 0.5 + driftY;
  const w = baseW + expand;
  const h = baseH + expand;
  const radius = min(w, h) * (0.18 + near * 0.08);

  const zoom = 1.12 + tile.lens * 0.16 + near * 0.42;
  const waveX = sin(tile.row * 0.62 + t * 1.3 + tile.phase) * 16;
  const waveY = cos(tile.col * 0.5 + t + tile.phase) * 14;
  const sampleW = constrain(tile.w / zoom, 14, CANVAS_W);
  const sampleH = constrain(tile.h / zoom, 14, CANVAS_H);
  const sx = constrain(
    cx - sampleW * 0.5 + tile.sx + waveX - cos(angle) * near * 80,
    0,
    CANVAS_W - sampleW
  );
  const sy = constrain(
    cy - sampleH * 0.5 + tile.sy + waveY - sin(angle) * near * 70,
    0,
    CANVAS_H - sampleH
  );

  drawingContext.save();
  roundedRectPath(x, y, w, h, radius);
  drawingContext.clip();

  image(sourceLayer, x, y, w, h, sx, sy, sampleW, sampleH);
  drawTileOverlays(x, y, w, h, tile, near, t);

  drawingContext.restore();
  drawTileRim(x, y, w, h, radius, near);
}

function drawTileOverlays(x, y, w, h, tile, near, t) {
  const ctx = drawingContext;

  const topGlow = ctx.createLinearGradient(x, y, x, y + h);
  topGlow.addColorStop(0, `rgba(255, 245, 155, ${0.42 + near * 0.3})`);
  topGlow.addColorStop(0.22, `rgba(255, 206, 70, ${0.08 + near * 0.1})`);
  topGlow.addColorStop(0.58, "rgba(255, 255, 255, 0)");
  topGlow.addColorStop(1, `rgba(18, 7, 2, ${0.46 - near * 0.16})`);
  ctx.fillStyle = topGlow;
  ctx.fillRect(x, y, w, h);

  const sideGlow = ctx.createLinearGradient(x, y, x + w, y);
  sideGlow.addColorStop(0, `rgba(255, 236, 164, ${0.28 + near * 0.25})`);
  sideGlow.addColorStop(0.22, "rgba(255, 255, 255, 0)");
  sideGlow.addColorStop(0.78, "rgba(255, 255, 255, 0)");
  sideGlow.addColorStop(1, `rgba(20, 8, 3, ${0.5 - near * 0.18})`);
  ctx.fillStyle = sideGlow;
  ctx.fillRect(x, y, w, h);

  push();
  noStroke();
  fill(255, 248, 176, 42 + near * 62);
  ellipse(
    x + w * (0.28 + sin(tile.phase + t) * 0.08),
    y + h * 0.18,
    w * 0.82,
    h * 0.22
  );

  fill(8, 3, 2, 42 - near * 18);
  ellipse(
    x + w * (0.7 + tile.bend * 0.08),
    y + h * 0.74,
    w * 0.92,
    h * 0.44
  );

  noFill();
  strokeWeight(1.1 + near * 1.8);
  stroke(255, 235, 128, 52 + near * 92);
  beginShape();
  for (let i = 0; i < 7; i++) {
    const p = i / 6;
    const px = x + w * p;
    const py = y + h * (0.48 + sin(p * TWO_PI + tile.phase + t * 2) * 0.2);
    curveVertex(px, py);
  }
  endShape();

  stroke(36, 8, 2, 74 - near * 24);
  strokeWeight(2.2);
  beginShape();
  for (let i = 0; i < 7; i++) {
    const p = i / 6;
    const px = x + w * p;
    const py = y + h * (0.72 + cos(p * TWO_PI + tile.phase) * 0.18);
    curveVertex(px, py);
  }
  endShape();
  pop();
}

function drawTileRim(x, y, w, h, radius, near) {
  const ctx = drawingContext;
  ctx.save();

  ctx.shadowColor = `rgba(255, 204, 73, ${0.12 + near * 0.5})`;
  ctx.shadowBlur = 3 + near * 20;

  roundedRectPath(x, y, w, h, radius);
  ctx.lineWidth = 3.6;
  ctx.strokeStyle = `rgba(18, 7, 2, ${0.85 - near * 0.2})`;
  ctx.stroke();

  roundedRectPath(x + 1.3, y + 1.3, w - 2.6, h - 2.6, max(1, radius - 1.2));
  ctx.lineWidth = 1.4 + near * 1.6;
  ctx.strokeStyle = `rgba(255, 220, 112, ${0.5 + near * 0.35})`;
  ctx.stroke();

  ctx.shadowBlur = 0;
  roundedRectPath(x + 3.8, y + 3.8, w - 7.6, h - 7.6, max(1, radius - 4));
  ctx.lineWidth = 0.9;
  ctx.strokeStyle = `rgba(255, 255, 220, ${0.2 + near * 0.42})`;
  ctx.stroke();

  ctx.restore();
}

function drawHoverLight(t) {
  if (hoverPower < 0.01) return;

  const ctx = drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const halo = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 310);
  halo.addColorStop(0, `rgba(255, 244, 162, ${0.24 * hoverPower})`);
  halo.addColorStop(0.36, `rgba(255, 86, 26, ${0.12 * hoverPower})`);
  halo.addColorStop(1, "rgba(255, 86, 26, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  push();
  noFill();
  strokeWeight(1.2);
  for (let i = 0; i < 3; i++) {
    const r = 92 + i * 58 + sin(t * 3 + i) * 7;
    stroke(255, 232, 132, (42 - i * 10) * hoverPower);
    circle(mouseX, mouseY, r);
  }
  pop();
}

function roundedRectPath(x, y, w, h, r) {
  const ctx = drawingContext;
  const rr = min(r, w * 0.5, h * 0.5);

  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}
