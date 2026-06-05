const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BASE_SEED = 1818;
const HOVER_RADIUS = 330;

let canvas;
let stars = [];
let fragments = [];
let grainLayer;
let pointerInside = false;
let hoverAmount = 0;

function setup() {
  canvas = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(30);

  document.body.style.margin = "0";
  document.body.style.background = "#030304";
  document.body.style.overflow = "hidden";
  canvas.style("display", "block");
  canvas.style("cursor", "crosshair");

  canvas.elt.addEventListener("mouseenter", () => {
    pointerInside = true;
  });

  canvas.elt.addEventListener("mouseleave", () => {
    pointerInside = false;
  });

  randomSeed(BASE_SEED);
  noiseSeed(BASE_SEED);
  buildPattern();
  buildGrain();
  fitCanvasToWindow();
}

function windowResized() {
  fitCanvasToWindow();
}

function mouseMoved() {
  pointerInside = isMouseOnCanvas();
}

function mouseDragged() {
  pointerInside = isMouseOnCanvas();
}

function touchMoved() {
  pointerInside = isMouseOnCanvas();
  return false;
}

function draw() {
  const t = frameCount * 0.018;
  hoverAmount = lerp(hoverAmount, pointerInside ? 1 : 0, 0.09);

  drawBackground(t);
  drawFragments(t);
  drawStars(t);
  drawHoverGlow(t);
  image(grainLayer, 0, 0);
}

function fitCanvasToWindow() {
  const fit = min(windowWidth / CANVAS_W, windowHeight / CANVAS_H);
  canvas.style("width", floor(CANVAS_W * fit) + "px");
  canvas.style("height", floor(CANVAS_H * fit) + "px");
}

function isMouseOnCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function buildPattern() {
  stars = [];
  fragments = [];

  for (let y = -120; y <= CANVAS_H + 160; y += 215) {
    const row = floor((y + 120) / 215);

    for (let x = -140; x <= CANVAS_W + 160; x += 250) {
      const offset = row % 2 === 0 ? 0 : 115;
      addStar(
        x + offset + random(-58, 58),
        y + random(-44, 44),
        random(92, 188),
        random(TWO_PI),
        random(0.5, 1)
      );
    }
  }

  for (let i = 0; i < 22; i++) {
    addStar(
      random(-80, CANVAS_W + 80),
      random(-70, CANVAS_H + 70),
      random(36, 94),
      random(TWO_PI),
      random(0.25, 0.72)
    );
  }

  const anchors = [
    { x: 255, y: 835, s: 210, r: -0.14 },
    { x: 775, y: 820, s: 235, r: 0.05 },
    { x: 1295, y: 705, s: 245, r: -0.22 },
    { x: 1640, y: 300, s: 205, r: 0.16 },
    { x: 1545, y: 930, s: 185, r: -0.06 },
  ];

  for (const a of anchors) {
    addStar(a.x, a.y, a.s, a.r, 1.15);
  }

  for (let i = 0; i < 460; i++) {
    const typeRoll = random();
    fragments.push({
      x: random(-60, CANVAS_W + 60),
      y: random(-60, CANVAS_H + 60),
      len: random(16, 92),
      rot: random(TWO_PI),
      tone: random(38, 112),
      alpha: random(38, 125),
      weight: random(1.2, 3.7),
      phase: random(TWO_PI),
      type: typeRoll > 0.88 ? "chevron" : "line",
    });
  }

  for (let i = 0; i < 70; i++) {
    fragments.push({
      x: random(-40, CANVAS_W + 40),
      y: random(-40, CANVAS_H + 40),
      len: random(14, 36),
      rot: random(TWO_PI),
      tone: random(32, 88),
      alpha: random(30, 90),
      weight: random(1, 2),
      phase: random(TWO_PI),
      type: "tiny-star",
    });
  }
}

function addStar(x, y, size, rot, weightMix) {
  const layerCount = floor(random(4, 7));
  const dashA = random(22, 48);
  const dashB = random(10, 26);
  const cuts = [];

  for (let i = 0; i < 15; i++) {
    const radius = random(size * 0.18, size * 0.95);
    cuts.push({
      a: random(TWO_PI),
      radius,
      len: random(size * 0.12, size * 0.34),
      tone: random(42, 120),
      alpha: random(28, 86),
      weight: random(1, 2.2),
    });
  }

  stars.push({
    x,
    y,
    size,
    rot,
    layerCount,
    dashA,
    dashB,
    cuts,
    tone: random(58, 145),
    alpha: random(65, 150),
    weight: random(1.7, 3.5) * weightMix,
    phase: random(TWO_PI),
    wobble: random(0.25, 1.05),
  });
}

function drawBackground(t) {
  background(3, 3, 4);

  const ctx = drawingContext;
  ctx.save();
  const grad = ctx.createRadialGradient(
    CANVAS_W * 0.56,
    CANVAS_H * 0.55,
    70,
    CANVAS_W * 0.56,
    CANVAS_H * 0.55,
    CANVAS_W * 0.72
  );
  grad.addColorStop(0, "rgba(18, 18, 20, 0.95)");
  grad.addColorStop(0.52, "rgba(7, 7, 8, 0.9)");
  grad.addColorStop(1, "rgba(0, 0, 0, 1)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noStroke();
  for (let i = 0; i < 26; i++) {
    const x = (i * 337 + sin(t * 0.45 + i) * 26) % CANVAS_W;
    const y = (i * 191 + cos(t * 0.3 + i * 0.7) * 18) % CANVAS_H;
    fill(18, 18, 20, 10);
    ellipse(x, y, 360, 220);
  }
}

function drawStars(t) {
  for (const star of stars) {
    const influence = hoverInfluence(star.x, star.y, HOVER_RADIUS + star.size * 0.45);
    const drift = hoverPush(star.x, star.y, HOVER_RADIUS + star.size * 0.55, 18);
    const pulse = sin(t * 2.1 + star.phase) * 0.5 + 0.5;
    const bright = influence * (95 + pulse * 38);

    push();
    translate(star.x + drift.x, star.y + drift.y);
    rotate(star.rot + sin(t * star.wobble + star.phase) * 0.006 + influence * 0.08);
    scale(1 + influence * 0.085);

    drawingContext.shadowBlur = influence * 22;
    drawingContext.shadowColor = `rgba(210, 210, 215, ${0.3 * influence})`;

    for (let i = 0; i < star.layerCount; i++) {
      const p = i / max(1, star.layerCount - 1);
      const radius = star.size * (1 - p * 0.155);
      const inner = radius * (0.42 + sin(star.phase + i) * 0.018);
      const tone = constrain(star.tone + bright - p * 20, 0, 235);
      const alpha = constrain(star.alpha + influence * 95 - p * 8, 0, 245);
      const dashOffset = -frameCount * influence * (0.6 + i * 0.15) - star.phase * 8;

      noFill();
      stroke(tone, tone, tone + 4, alpha);
      strokeWeight(max(0.8, star.weight * (1 - p * 0.08) + influence * 1.4));
      setDashedLine(
        star.dashA * (1 - p * 0.12),
        star.dashB + p * 10,
        dashOffset
      );
      drawStarOutline(radius, inner);
    }

    setSolidLine();
    drawInnerCuts(star, influence);
    drawingContext.shadowBlur = 0;
    pop();
  }
}

function drawInnerCuts(star, influence) {
  for (const cut of star.cuts) {
    const x = cos(cut.a) * cut.radius;
    const y = sin(cut.a) * cut.radius;
    const angle = cut.a + HALF_PI + sin(star.phase + cut.radius) * 0.28;
    const tone = constrain(cut.tone + influence * 110, 0, 230);
    const alpha = constrain(cut.alpha + influence * 80, 0, 210);

    push();
    translate(x, y);
    rotate(angle);
    stroke(tone, tone, tone + 3, alpha);
    strokeWeight(cut.weight + influence * 0.8);
    setDashedLine(cut.len * 0.5, cut.len * 0.3, -frameCount * influence);
    line(-cut.len * 0.5, 0, cut.len * 0.5, 0);
    pop();
  }

  setSolidLine();
}

function drawFragments(t) {
  for (const frag of fragments) {
    const influence = hoverInfluence(frag.x, frag.y, HOVER_RADIUS * 0.92);
    const drift = hoverPush(frag.x, frag.y, HOVER_RADIUS * 0.92, 26);
    const tone = constrain(frag.tone + influence * 120, 0, 230);
    const alpha = constrain(frag.alpha + influence * 90, 0, 210);
    const flicker = sin(t * 2.5 + frag.phase) * influence * 0.18;

    push();
    translate(frag.x + drift.x, frag.y + drift.y);
    rotate(frag.rot + flicker);
    stroke(tone, tone, tone + 3, alpha);
    strokeWeight(frag.weight + influence * 0.9);
    noFill();

    if (frag.type === "chevron") {
      setSolidLine();
      line(-frag.len * 0.48, -frag.len * 0.18, 0, 0);
      line(0, 0, frag.len * 0.48, -frag.len * 0.18);
    } else if (frag.type === "tiny-star") {
      setDashedLine(frag.len * 0.42, frag.len * 0.24, frag.phase * 10);
      drawStarOutline(frag.len, frag.len * 0.43);
    } else {
      setDashedLine(frag.len * 0.55, frag.len * 0.24, frag.phase * 5);
      line(-frag.len * 0.5, 0, frag.len * 0.5, 0);
    }

    pop();
  }

  setSolidLine();
}

function drawHoverGlow(t) {
  if (!pointerInside || hoverAmount < 0.01) return;

  const ctx = drawingContext;
  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, HOVER_RADIUS * 1.18);
  grad.addColorStop(0, `rgba(210, 210, 215, ${0.15 * hoverAmount})`);
  grad.addColorStop(0.38, `rgba(120, 120, 125, ${0.085 * hoverAmount})`);
  grad.addColorStop(1, "rgba(80, 80, 85, 0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.restore();

  noFill();
  setSolidLine();
  stroke(210, 210, 214, 58 * hoverAmount);
  strokeWeight(1.4);
  circle(mouseX, mouseY, 34 + sin(t * 4) * 4);

  stroke(120, 120, 125, 34 * hoverAmount);
  strokeWeight(1);
  circle(mouseX, mouseY, HOVER_RADIUS * 2 + sin(t * 1.5) * 18);
}

function drawStarOutline(outerRadius, innerRadius) {
  beginShape();
  for (let i = 0; i < 10; i++) {
    const a = -HALF_PI + (TWO_PI * i) / 10;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape(CLOSE);
}

function hoverInfluence(x, y, radius) {
  if (!pointerInside || hoverAmount < 0.01) return 0;

  const d = dist(mouseX, mouseY, x, y);
  const n = constrain(1 - d / radius, 0, 1);
  return pow(n, 2) * hoverAmount;
}

function hoverPush(x, y, radius, strength) {
  const amount = hoverInfluence(x, y, radius);
  if (amount <= 0) return { x: 0, y: 0 };

  const angle = atan2(y - mouseY, x - mouseX);
  return {
    x: cos(angle) * amount * strength,
    y: sin(angle) * amount * strength,
  };
}

function buildGrain() {
  grainLayer = createGraphics(CANVAS_W, CANVAS_H);
  grainLayer.pixelDensity(1);
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i = 0; i < 52000; i++) {
    const x = random(CANVAS_W);
    const y = random(CANVAS_H);
    const shade = random() > 0.5 ? 255 : 0;
    grainLayer.fill(shade, shade, shade, random(6, 22));
    grainLayer.rect(x, y, random(0.8, 2.2), random(0.8, 2.2));
  }

  for (let i = 0; i < 9000; i++) {
    const x = random(CANVAS_W);
    const y = random(CANVAS_H);
    grainLayer.fill(0, 0, 0, random(14, 45));
    grainLayer.circle(x, y, random(1, 3.5));
  }
}

function setDashedLine(a, b, offset = 0) {
  drawingContext.setLineDash([max(2, a), max(2, b)]);
  drawingContext.lineDashOffset = offset;
}

function setSolidLine() {
  drawingContext.setLineDash([]);
  drawingContext.lineDashOffset = 0;
}
