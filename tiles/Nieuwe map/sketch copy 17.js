const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BASE_SEED = 1717;
const DOT_STEP = 18;

let halftoneDots = [];
let wisps = [];
let pointerInside = false;
let hoverAmount = 0;

const palette = {
  purpleDark: [38, 0, 103],
  purple: [91, 0, 142],
  magenta: [193, 0, 143],
  hotPink: [255, 18, 126],
  orange: [255, 94, 73],
  yellow: [255, 189, 23],
  ink: [31, 0, 91],
};

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(30);

  cnv.style("width", "min(100vw, 1920px)");
  cnv.style("height", "auto");
  cnv.style("display", "block");
  cnv.style("cursor", "crosshair");
  document.body.style.margin = "0";
  document.body.style.background = "#260067";
  document.body.style.overflowX = "hidden";

  cnv.elt.addEventListener("mouseenter", () => {
    pointerInside = true;
  });
  cnv.elt.addEventListener("mouseleave", () => {
    pointerInside = false;
  });

  randomSeed(BASE_SEED);
  noiseSeed(BASE_SEED);
  buildHalftoneDots();
  buildWisps();
}

function draw() {
  const t = frameCount * 0.018;
  hoverAmount = lerp(hoverAmount, pointerInside ? 1 : 0, 0.08);

  drawGradientBackground(t);
  drawSoftColorFields(t);
  drawHalftone(t);
  drawDarkVeils(t);
  drawCursorForce(t);
  drawFineGrain(t);
}

function buildHalftoneDots() {
  halftoneDots = [];

  for (let y = -DOT_STEP; y <= CANVAS_H + DOT_STEP; y += DOT_STEP) {
    for (let x = -DOT_STEP; x <= CANVAS_W + DOT_STEP; x += DOT_STEP) {
      const offsetX = (floor(y / DOT_STEP) % 2) * DOT_STEP * 0.5;
      const px = x + offsetX;
      const py = y;
      const sample = sampleHalftone(px, py, 0);

      if (sample.size < 0.55 && random() > 0.18) continue;

      halftoneDots.push({
        x: px,
        y: py,
        r: sample.size,
        baseR: sample.size,
        col: sample.col,
        shapeMix: sample.shapeMix,
        phase: random(TWO_PI),
        jitter: random(0.65, 1.35),
      });
    }
  }
}

function buildWisps() {
  wisps = [];

  const defs = [
    { x: 290, y: 520, w: 360, h: 1250, rot: -0.3, col: palette.purple, a: 92 },
    { x: 800, y: 470, w: 330, h: 1320, rot: -0.22, col: palette.purpleDark, a: 132 },
    { x: 1120, y: 690, w: 380, h: 1200, rot: -0.1, col: palette.ink, a: 156 },
    { x: 1505, y: 640, w: 420, h: 1280, rot: -0.18, col: palette.purpleDark, a: 135 },
    { x: 1740, y: 365, w: 300, h: 980, rot: -0.28, col: palette.ink, a: 112 },
  ];

  for (const def of defs) {
    for (let i = 0; i < 6; i++) {
      wisps.push({
        x: def.x + random(-70, 70),
        y: def.y + random(-90, 90),
        w: def.w * random(0.72, 1.2),
        h: def.h * random(0.78, 1.15),
        rot: def.rot + random(-0.08, 0.08),
        col: def.col,
        alpha: def.a * random(0.25, 0.65),
        phase: random(TWO_PI),
      });
    }
  }
}

function drawGradientBackground(t) {
  background(palette.purpleDark);
  noStroke();

  for (let y = 0; y < height; y += 3) {
    const p = y / height;
    const drift = noise(p * 2.2, t * 0.18) * 0.08;
    const left = lerpColorArray(palette.magenta, palette.purpleDark, p * 0.82 + drift);
    const right = lerpColorArray(palette.yellow, palette.purple, p * 0.92);

    for (let x = 0; x < width; x += 48) {
      const q = x / width;
      const diagonal = constrain(q * 0.75 + (1 - p) * 0.56, 0, 1);
      const c = lerpColorArray(left, right, pow(diagonal, 1.35));
      fill(c[0], c[1], c[2], 255);
      rect(x, y, 52, 3);
    }
  }
}

function drawSoftColorFields(t) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";
  noStroke();

  drawGlow(1710, 120, 840, palette.yellow, 0.62, t, 0.2);
  drawGlow(280, 930, 760, palette.orange, 0.42, t, 1.6);
  drawGlow(880, 950, 620, palette.hotPink, 0.35, t, 2.3);
  drawGlow(1240, 320, 620, palette.yellow, 0.32, t, 3.1);

  drawingContext.restore();

  drawingContext.save();
  drawingContext.globalCompositeOperation = "multiply";
  drawSoftRibbon(620, 585, 520, 1420, -0.28, palette.purpleDark, 0.42, t, 0.4);
  drawSoftRibbon(1235, 650, 455, 1330, -0.17, palette.ink, 0.48, t, 1.5);
  drawSoftRibbon(1625, 620, 360, 1180, -0.25, palette.ink, 0.34, t, 2.4);
  drawingContext.restore();
}

function drawGlow(x, y, r, col, strength, t, phase) {
  const gx = x + sin(t * 0.7 + phase) * 22;
  const gy = y + cos(t * 0.52 + phase) * 18;
  const grad = drawingContext.createRadialGradient(gx, gy, 0, gx, gy, r);
  grad.addColorStop(0, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${strength})`);
  grad.addColorStop(0.42, `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${strength * 0.25})`);
  grad.addColorStop(1, `rgba(${col[0]}, ${col[1]}, ${col[2]}, 0)`);
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);
}

function drawSoftRibbon(x, y, w, h, rot, col, alpha, t, phase) {
  push();
  translate(x + sin(t * 0.5 + phase) * 18, y + cos(t * 0.4 + phase) * 14);
  rotate(rot);
  noStroke();

  for (let i = 11; i >= 1; i--) {
    const p = i / 11;
    fill(col[0], col[1], col[2], alpha * 255 * 0.075);

    beginShape();
    for (let a = 0; a <= TWO_PI + 0.35; a += 0.18) {
      const edge = 0.86 + noise(cos(a) + phase, sin(a) + phase, t * 0.15) * 0.22;
      curveVertex(cos(a) * w * p * 0.5 * edge, sin(a) * h * p * 0.5 * edge);
    }
    endShape(CLOSE);
  }

  pop();
}

function drawHalftone(t) {
  noStroke();

  for (const dot of halftoneDots) {
    const sample = sampleHalftone(dot.x, dot.y, t);
    const movement = repelFromMouse(dot.x, dot.y, 390, 72);
    const edgeFlow = sin(t + dot.phase) * 1.2 + noise(dot.x * 0.005, dot.y * 0.005, t) * 1.8;
    const x = dot.x + movement.x + edgeFlow * dot.jitter;
    const y = dot.y + movement.y + cos(t * 0.8 + dot.phase) * 0.8 * dot.jitter;
    const near = movement.amount;
    const pulse = 1 + sin(t * 1.8 + dot.phase) * 0.035;
    const r = max(0.35, lerp(dot.r, sample.size, 0.2) * pulse * (1 + near * 0.26));
    const col = lerpColorArray(dot.col, sample.col, 0.24);
    const alpha = map(r, 0.4, DOT_STEP * 0.66, 72, 245, true);

    drawingContext.shadowBlur = near * 18;
    drawingContext.shadowColor = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.32 * near})`;
    fill(col[0], col[1], col[2], alpha);

    if (dot.shapeMix > 0.72) {
      push();
      translate(x, y);
      rotate(-0.13 + dot.phase * 0.02);
      rectMode(CENTER);
      rect(0, 0, r * 1.48, r * 1.48, 1.5);
      pop();
    } else {
      circle(x, y, r * 2);
    }
  }

  drawingContext.shadowBlur = 0;
}

function drawDarkVeils(t) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "multiply";

  for (const wisp of wisps) {
    const push = repelFromMouse(wisp.x, wisp.y, 540, 46);
    push.x *= 0.42;
    push.y *= 0.42;

    push();
    translate(wisp.x + push.x, wisp.y + push.y);
    rotate(wisp.rot + sin(t * 0.4 + wisp.phase) * 0.025);
    noStroke();

    for (let i = 10; i > 0; i--) {
      const p = i / 10;
      fill(wisp.col[0], wisp.col[1], wisp.col[2], wisp.alpha * 0.09);
      beginShape();
      for (let a = 0; a <= TWO_PI + 0.35; a += 0.2) {
        const n = noise(cos(a) * 1.3 + wisp.phase, sin(a) * 1.3 + wisp.phase, t * 0.13);
        const wave = 0.82 + n * 0.36 + sin(a * 3 + wisp.phase) * 0.035;
        curveVertex(cos(a) * wisp.w * p * 0.5 * wave, sin(a) * wisp.h * p * 0.5 * wave);
      }
      endShape(CLOSE);
    }

    pop();
  }

  drawingContext.restore();
}

function drawCursorForce(t) {
  if (!pointerInside || hoverAmount < 0.01) return;

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  const grad = drawingContext.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 310);
  grad.addColorStop(0, `rgba(255, 223, 84, ${0.18 * hoverAmount})`);
  grad.addColorStop(0.36, `rgba(255, 50, 143, ${0.1 * hoverAmount})`);
  grad.addColorStop(1, "rgba(255, 50, 143, 0)");
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);

  noFill();
  for (let i = 0; i < 4; i++) {
    stroke(255, 205, 59, (42 - i * 8) * hoverAmount);
    strokeWeight(1.6);
    circle(mouseX, mouseY, 82 + i * 58 + sin(t * 2.2 + i) * 6);
  }

  drawingContext.restore();
}

function drawFineGrain(t) {
  noStroke();
  drawingContext.save();
  drawingContext.globalCompositeOperation = "overlay";

  for (let i = 0; i < 900; i++) {
    const x = (i * 97 + frameCount * 0.31) % width;
    const y = (i * 193 + floor(t * 1000) * 0.07) % height;
    const a = noise(i, frameCount * 0.02) * 24;
    fill(255, 194, 86, a);
    rect(x, y, 1.25, 1.25);
  }

  drawingContext.restore();
}

function sampleHalftone(x, y, t) {
  const p = y / CANVAS_H;
  const q = x / CANVAS_W;
  const waveA = sin(x * 0.0068 - y * 0.0038 + t * 0.75);
  const waveB = sin(x * 0.0027 + y * 0.0062 - t * 0.48);
  const n = noise(x * 0.0023, y * 0.0023, t * 0.12);

  const topRight = smoothstep(0.16, 0.98, q * 1.2 + (1 - p) * 0.86 + waveA * 0.08);
  const bottomLeft = smoothstep(0.2, 0.95, (1 - q) * 0.78 + p * 0.95 + waveB * 0.12);
  const middleGlow = ridge(q, p, 0.54, 0.42, 0.36, 0.68);
  const rightViolet = ridge(q, p, 0.83, 0.62, 0.23, 0.88);
  const darkRiver = ridge(q, p, 0.56 + waveB * 0.03, 0.57, 0.2, 1.2);
  const density = constrain(
    topRight * 0.8
      + bottomLeft * 0.72
      + middleGlow * 0.7
      + rightViolet * 0.58
      - darkRiver * 0.72
      + n * 0.55
      - 0.25,
    0,
    1
  );

  const sizeCurve = pow(density, 1.15);
  const size = sizeCurve * DOT_STEP * 0.66;
  const warmMix = constrain(topRight * 0.86 + bottomLeft * 0.52 + middleGlow * 0.33, 0, 1);
  const pinkMix = constrain(bottomLeft * 0.76 + rightViolet * 0.42, 0, 1);
  const baseWarm = lerpColorArray(palette.hotPink, palette.yellow, warmMix);
  const col = lerpColorArray(baseWarm, palette.orange, pinkMix * 0.35);
  const shapeMix = smoothstep(0.54, 0.9, topRight + bottomLeft * 0.28 - middleGlow * 0.2);

  return { size, col, shapeMix };
}

function repelFromMouse(x, y, radius, strength) {
  if (!pointerInside || hoverAmount < 0.01) {
    return { x: 0, y: 0, amount: 0 };
  }

  const dx = x - mouseX;
  const dy = y - mouseY;
  const d = sqrt(dx * dx + dy * dy);
  const amount = pow(constrain(1 - d / radius, 0, 1), 2) * hoverAmount;
  const angle = d > 0.001 ? atan2(dy, dx) : random(TWO_PI);
  return {
    x: cos(angle) * strength * amount,
    y: sin(angle) * strength * amount,
    amount,
  };
}

function ridge(q, p, cx, cy, w, stretch) {
  const dx = (q - cx) / w;
  const dy = (p - cy) / (w * stretch);
  return constrain(1 - sqrt(dx * dx + dy * dy), 0, 1);
}

function smoothstep(edge0, edge1, x) {
  const p = constrain((x - edge0) / (edge1 - edge0), 0, 1);
  return p * p * (3 - 2 * p);
}

function lerpColorArray(a, b, amount) {
  return [
    lerp(a[0], b[0], amount),
    lerp(a[1], b[1], amount),
    lerp(a[2], b[2], amount),
  ];
}
