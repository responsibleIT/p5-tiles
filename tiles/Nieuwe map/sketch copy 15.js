const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BASE_SEED = 1538;

let cells = [];
let veins = [];
let speckles = [];
let hoverAmount = 0;
let pointerInside = false;

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(30);

  cnv.style("width", "min(100vw, 1920px)");
  cnv.style("height", "auto");
  cnv.style("display", "block");
  cnv.style("cursor", "crosshair");
  document.body.style.margin = "0";
  document.body.style.background = "#030304";
  document.body.style.overflowX = "hidden";

  cnv.elt.addEventListener("mouseenter", () => {
    pointerInside = true;
  });
  cnv.elt.addEventListener("mouseleave", () => {
    pointerInside = false;
  });

  randomSeed(BASE_SEED);
  noiseSeed(BASE_SEED);
  buildComposition();
}

function draw() {
  const t = frameCount * 0.016;
  hoverAmount = lerp(hoverAmount, pointerInside ? 1 : 0, 0.08);

  drawOilyBackground(t);
  drawMarbleVeins(t);

  for (const cell of cells) {
    drawCell(cell, t);
  }

  drawSpeckles(t);
  drawHoverState(t);
  drawGloss(t);
}

function buildComposition() {
  cells = [];
  veins = [];
  speckles = [];

  const mainCells = [
    { x: -80, y: 170, w: 360, h: 520, rot: -0.12, palette: "lilac" },
    { x: 1220, y: 520, w: 260, h: 380, rot: 0.1, palette: "pink" },
    { x: 1585, y: 430, w: 430, h: 470, rot: -0.2, palette: "pink" },
    { x: 1010, y: 300, w: 240, h: 170, rot: -0.4, palette: "lilac" },
    { x: 875, y: 520, w: 330, h: 230, rot: -0.12, palette: "smoke" },
    { x: 1070, y: 760, w: 380, h: 360, rot: -0.18, palette: "pink" },
    { x: 700, y: 735, w: 280, h: 210, rot: 0.25, palette: "pink" },
    { x: 335, y: 965, w: 300, h: 260, rot: -0.05, palette: "pink" },
    { x: 200, y: 810, w: 250, h: 260, rot: 0.3, palette: "smoke" },
    { x: 1710, y: 245, w: 270, h: 190, rot: -0.24, palette: "lilac" },
    { x: 1360, y: 300, w: 250, h: 200, rot: -0.25, palette: "lilac" },
    { x: 610, y: 205, w: 300, h: 170, rot: -0.42, palette: "lilac" },
  ];

  for (const def of mainCells) {
    cells.push(makeCell(def.x, def.y, def.w, def.h, def.rot, def.palette, random(TWO_PI), true));
  }

  addCluster(250, 455, 230, 560, -0.82, 30, 28, 86, ["lilac", "smoke", "black"]);
  addCluster(515, 825, 420, 470, -0.62, 34, 34, 128, ["pink", "smoke", "black"]);
  addCluster(990, 455, 610, 280, -0.58, 42, 32, 122, ["lilac", "pink", "smoke"]);
  addCluster(1295, 570, 420, 520, -0.12, 38, 30, 110, ["pink", "lilac"]);
  addCluster(1690, 165, 360, 260, -0.68, 32, 22, 76, ["lilac", "pink"]);
  addCluster(320, 100, 520, 250, -0.18, 48, 18, 84, ["lilac", "smoke", "black"]);
  addCluster(210, 965, 530, 250, 0.05, 30, 35, 116, ["pink", "smoke"]);

  for (let i = 0; i < 110; i++) {
    const band = random(["left", "middle", "right"]);
    let x;
    let y;

    if (band === "left") {
      x = random(30, 650);
      y = 1015 - x * 0.82 + random(-110, 120);
    } else if (band === "middle") {
      x = random(720, 1390);
      y = 880 - x * 0.32 + random(-145, 150);
    } else {
      x = random(1420, 1900);
      y = 410 - (x - 1420) * 0.5 + random(-120, 135);
    }

    const s = random(12, 58);
    cells.push(makeCell(
      x,
      y,
      s * random(1.1, 2.2),
      s * random(0.8, 1.75),
      random(-0.8, 0.8),
      random(["pink", "lilac", "smoke", "black"]),
      random(TWO_PI),
      false
    ));
  }

  for (let i = 0; i < 34; i++) {
    veins.push({
      startX: random(-160, CANVAS_W + 120),
      startY: random(-80, CANVAS_H + 100),
      amp: random(22, 115),
      freq: random(0.003, 0.008),
      phase: random(TWO_PI),
      weight: random(1.5, 8),
      alpha: random(22, 88),
      drift: random(-1, 1),
      tint: random(["white", "pink", "blue", "smoke"]),
    });
  }

  for (let i = 0; i < 520; i++) {
    speckles.push({
      x: random(CANVAS_W),
      y: random(CANVAS_H),
      r: random(0.7, 3.6),
      a: random(28, 155),
      phase: random(TWO_PI),
      pink: random() < 0.34,
    });
  }
}

function addCluster(cx, cy, spreadX, spreadY, angle, count, minSize, maxSize, palettes) {
  const ca = cos(angle);
  const sa = sin(angle);

  for (let i = 0; i < count; i++) {
    const rx = randomGaussian() * spreadX * 0.31;
    const ry = randomGaussian() * spreadY * 0.23;
    const x = cx + rx * ca - ry * sa;
    const y = cy + rx * sa + ry * ca;
    const s = random(minSize, maxSize);
    const narrow = random(0.65, 1.45);

    cells.push(makeCell(
      x,
      y,
      s * random(1.0, 2.25),
      s * narrow,
      angle + random(-0.7, 0.7),
      random(palettes),
      random(TWO_PI),
      s > maxSize * 0.58
    ));
  }
}

function makeCell(x, y, w, h, rot, palette, phase, isLarge) {
  return {
    x,
    y,
    w,
    h,
    rot,
    palette,
    phase,
    isLarge,
    wobble: random(0.035, 0.12),
    points: floor(random(18, 30)),
    rim: random(4, 13),
    highlight: random(0.35, 1),
    veinOffset: random(1000),
  };
}

function drawOilyBackground(t) {
  background(3, 3, 4);

  noStroke();
  fill(255, 121, 196, 18 * hoverAmount);
  rect(0, 0, width, height);

  drawSoftBand(1340, 60, 610, 270, -0.48, color(126, 141, 152, 52), t, 0.8);
  drawSoftBand(1610, 920, 640, 330, -0.38, color(154, 162, 168, 45), t, 1.1);
  drawSoftBand(585, 525, 1280, 190, -0.6, color(244, 151, 197, 62), t, 1.4);
  drawSoftBand(710, 675, 1040, 170, -0.72, color(246, 177, 210, 48), t, 1.8);
  drawSoftBand(1240, 545, 980, 210, -0.16, color(210, 222, 242, 35), t, 2.3);

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";
  for (let i = 0; i < 4; i++) {
    const gx = [310, 840, 1310, 1640][i] + sin(t * 0.6 + i) * 24;
    const gy = [850, 520, 720, 315][i] + cos(t * 0.45 + i) * 18;
    const grad = drawingContext.createRadialGradient(gx, gy, 0, gx, gy, [450, 380, 520, 360][i]);
    grad.addColorStop(0, `rgba(255, ${i === 1 ? 220 : 145}, 205, 0.11)`);
    grad.addColorStop(0.48, "rgba(147, 192, 232, 0.055)");
    grad.addColorStop(1, "rgba(255, 155, 205, 0)");
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(0, 0, width, height);
  }
  drawingContext.restore();
}

function drawSoftBand(x, y, w, h, rot, col, t, phase) {
  push();
  translate(x + sin(t + phase) * 10, y + cos(t * 0.7 + phase) * 8);
  rotate(rot);

  for (let i = 12; i > 0; i--) {
    const p = i / 12;
    fill(red(col), green(col), blue(col), alpha(col) * 0.08);
    beginShape();
    for (let a = 0; a <= TWO_PI + 0.25; a += 0.18) {
      const n = noise(cos(a) * 0.9 + phase, sin(a) * 0.9 + phase, t * 0.18);
      const r = 0.82 + n * 0.28;
      curveVertex(cos(a) * w * p * r * 0.5, sin(a) * h * p * r * 0.5);
    }
    endShape(CLOSE);
  }

  pop();
}

function drawMarbleVeins(t) {
  noFill();

  for (const vein of veins) {
    const col = veinColor(vein.tint, vein.alpha * (1 + hoverAmount * 0.35));
    stroke(col);
    strokeWeight(vein.weight + hoverAmount * 1.4);
    drawingContext.shadowBlur = hoverAmount * 16;
    drawingContext.shadowColor = "rgba(255, 170, 220, 0.22)";

    beginShape();
    for (let x = -220; x <= CANVAS_W + 220; x += 70) {
      const y = vein.startY
        + sin((x + vein.startX) * vein.freq + vein.phase + t * vein.drift) * vein.amp
        + noise(vein.phase, x * 0.003, t * 0.12) * 95
        - 46;

      curveVertex(x, y);
    }
    endShape();
  }

  drawingContext.shadowBlur = 0;
}

function veinColor(kind, a) {
  if (kind === "pink") return color(255, 151, 205, a);
  if (kind === "blue") return color(170, 218, 245, a);
  if (kind === "smoke") return color(154, 164, 173, a);
  return color(255, 248, 247, a);
}

function drawCell(cell, t) {
  const d = dist(mouseX, mouseY, cell.x, cell.y);
  const localHover = pointerInside ? constrain(map(d, 360, 20, 0, 1), 0, 1) : 0;
  const pushStrength = pointerInside ? constrain(map(d, 520, 0, 0, 1), 0, 1) : 0;
  const angleFromMouse = atan2(cell.y - mouseY, cell.x - mouseX);
  const offset = pushStrength * hoverAmount * (cell.isLarge ? 34 : 58);
  const x = cell.x + cos(angleFromMouse) * offset;
  const y = cell.y + sin(angleFromMouse) * offset;
  const scaleUp = 1 + localHover * hoverAmount * 0.12;

  push();
  translate(x, y);
  rotate(cell.rot + sin(t + cell.phase) * cell.wobble * (0.4 + hoverAmount * 1.2));
  scale(scaleUp);

  const rimCol = cell.palette === "black"
    ? color(236, 174, 215, 170 + hoverAmount * 45)
    : color(3, 3, 5, 235);

  drawingContext.shadowBlur = 18 + localHover * 30;
  drawingContext.shadowColor = cell.palette === "black"
    ? "rgba(247, 166, 216, 0.28)"
    : "rgba(0, 0, 0, 0.65)";
  drawBlobShape(cell, 1.06, rimCol);

  drawingContext.shadowBlur = localHover * 36;
  drawingContext.shadowColor = "rgba(255, 156, 211, 0.35)";
  drawBlobShape(cell, 0.94, fillForCell(cell, localHover));

  drawCellInterior(cell, t, localHover);
  drawCellRim(cell, localHover);
  pop();

  drawingContext.shadowBlur = 0;
}

function drawBlobShape(cell, mult, col) {
  fill(col);
  noStroke();
  beginShape();

  for (let i = 0; i <= cell.points + 3; i++) {
    const a = (i / cell.points) * TWO_PI;
    const n = noise(
      cos(a) * 1.3 + cell.veinOffset,
      sin(a) * 1.3 + cell.veinOffset,
      frameCount * 0.002
    );
    const wave = 1 + (n - 0.5) * 0.14 + sin(a * 3 + cell.phase) * 0.018;
    const px = cos(a) * cell.w * 0.5 * mult * wave;
    const py = sin(a) * cell.h * 0.5 * mult * wave;
    curveVertex(px, py);
  }

  endShape(CLOSE);
}

function fillForCell(cell, localHover) {
  const glow = hoverAmount * localHover;

  if (cell.palette === "black") {
    return color(1, 1, 3, 245);
  }

  if (cell.palette === "smoke") {
    return color(
      116 + glow * 45,
      128 + glow * 42,
      142 + glow * 56,
      205
    );
  }

  if (cell.palette === "lilac") {
    return color(
      205 + glow * 34,
      216 + glow * 22,
      245,
      224
    );
  }

  return color(
    244 + glow * 11,
    150 + glow * 42,
    198 + glow * 30,
    224
  );
}

function drawCellInterior(cell, t, localHover) {
  if (cell.palette === "black") {
    drawBlackCellInterior(cell, t, localHover);
    return;
  }

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";
  noFill();

  const passes = cell.isLarge ? 7 : 4;
  for (let i = 0; i < passes; i++) {
    const p = (i + 1) / (passes + 1);
    const y = map(p, 0, 1, -cell.h * 0.36, cell.h * 0.36);
    const a = 32 + localHover * 70;
    const pinkBias = cell.palette === "pink" ? 38 : 0;

    stroke(225 + pinkBias, 226 - pinkBias * 0.3, 245, a);
    strokeWeight(map(i, 0, passes, 1.2, 5.5));
    beginShape();
    for (let x = -cell.w * 0.36; x <= cell.w * 0.38; x += 20) {
      const n = noise(cell.veinOffset + i * 3, x * 0.015, t * 0.22);
      curveVertex(
        x,
        y + (n - 0.5) * cell.h * 0.2 + sin(x * 0.035 + t + cell.phase) * cell.h * 0.025
      );
    }
    endShape();
  }

  noStroke();
  const shineX = -cell.w * 0.13 + sin(cell.phase + t) * cell.w * 0.05;
  const shineY = -cell.h * 0.18;
  fill(255, 246, 255, (cell.isLarge ? 38 : 24) + localHover * 64);
  ellipse(shineX, shineY, cell.w * 0.34, cell.h * 0.18);

  fill(134, 218, 246, 20 + localHover * 50);
  ellipse(cell.w * 0.16, cell.h * 0.08, cell.w * 0.32, cell.h * 0.2);

  drawingContext.restore();
}

function drawBlackCellInterior(cell, t, localHover) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";
  noStroke();

  fill(255, 124, 204, 18 + localHover * 40);
  ellipse(-cell.w * 0.18, -cell.h * 0.12, cell.w * 0.28, cell.h * 0.2);

  fill(185, 205, 224, 12 + localHover * 34);
  ellipse(cell.w * 0.16, cell.h * 0.1, cell.w * 0.34, cell.h * 0.22);

  noFill();
  stroke(230, 232, 241, 18 + localHover * 46);
  strokeWeight(1.3 + hoverAmount * localHover);
  beginShape();
  for (let x = -cell.w * 0.3; x <= cell.w * 0.32; x += 16) {
    curveVertex(
      x,
      sin(x * 0.06 + t + cell.phase) * cell.h * 0.09
        + noise(cell.veinOffset, x * 0.02, t) * cell.h * 0.12
    );
  }
  endShape();

  drawingContext.restore();
}

function drawCellRim(cell, localHover) {
  noFill();
  strokeWeight(cell.rim * (cell.isLarge ? 0.52 : 0.42));
  stroke(0, 0, 0, 185);
  drawOpenBlob(cell, 1.005);

  strokeWeight(max(1, cell.rim * 0.18));
  stroke(255, 222, 245, 70 + localHover * 95);
  drawOpenBlob(cell, 0.975);

  if (cell.palette !== "black") {
    strokeWeight(max(1, cell.rim * 0.14));
    stroke(116, 213, 246, 32 + localHover * 78);
    drawOpenBlob(cell, 0.89);
  }
}

function drawOpenBlob(cell, mult) {
  beginShape();
  for (let i = 0; i <= cell.points + 3; i++) {
    const a = (i / cell.points) * TWO_PI;
    const n = noise(
      cos(a) * 1.2 + cell.veinOffset,
      sin(a) * 1.2 + cell.veinOffset,
      frameCount * 0.002
    );
    const wave = 1 + (n - 0.5) * 0.11;
    curveVertex(
      cos(a) * cell.w * 0.5 * mult * wave,
      sin(a) * cell.h * 0.5 * mult * wave
    );
  }
  endShape(CLOSE);
}

function drawSpeckles(t) {
  noStroke();
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  for (const dot of speckles) {
    const d = dist(mouseX, mouseY, dot.x, dot.y);
    const near = pointerInside ? constrain(map(d, 240, 20, 0, 1), 0, 1) : 0;
    const pulse = sin(t * 3 + dot.phase) * 0.5 + 0.5;
    const a = dot.a * (0.55 + pulse * 0.45) + near * hoverAmount * 80;

    if (dot.pink) {
      fill(255, 137, 204, a);
    } else {
      fill(238, 244, 255, a);
    }

    circle(dot.x, dot.y, dot.r + near * hoverAmount * 2.6);
  }

  drawingContext.restore();
}

function drawHoverState(t) {
  if (hoverAmount < 0.01) return;

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  noFill();
  for (let i = 0; i < 5; i++) {
    const r = 78 + i * 54 + sin(t * 2 + i) * 8;
    stroke(255, 146, 214, (52 - i * 7) * hoverAmount);
    strokeWeight(2.2 - i * 0.22);
    circle(mouseX, mouseY, r);
  }

  const grad = drawingContext.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 320);
  grad.addColorStop(0, `rgba(255, 160, 220, ${0.18 * hoverAmount})`);
  grad.addColorStop(0.42, `rgba(156, 218, 250, ${0.09 * hoverAmount})`);
  grad.addColorStop(1, "rgba(255, 160, 220, 0)");
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);

  drawingContext.restore();
}

function drawGloss(t) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  for (let i = 0; i < 5; i++) {
    const x = -160 + i * 520 + sin(t * 0.7 + i) * 18;
    const y = 160 + i * 130 + cos(t * 0.5 + i) * 20;
    const grad = drawingContext.createLinearGradient(x, y, x + 410, y + 120);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.48, `rgba(255, 255, 255, ${0.045 + hoverAmount * 0.035})`);
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(0, 0, width, height);
  }

  drawingContext.restore();
}
