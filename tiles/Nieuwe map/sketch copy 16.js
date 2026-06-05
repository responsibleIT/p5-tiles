const CANVAS_W = 1920;
const CANVAS_H = 1080;
const BUBBLE_COUNT = 86;
const BASE_SEED = 1606;

let bubbles = [];
let droplets = [];
let ribbons = [];
let pointerInside = false;
let hoverGlow = 0;

function setup() {
  const cnv = createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  frameRate(60);

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
  buildRibbons();
  buildBubbles();
}

function draw() {
  const t = frameCount * 0.01;
  hoverGlow = lerp(hoverGlow, pointerInside ? 1 : 0, 0.08);

  drawOilBackground(t);
  drawLiquidRibbons(t);

  for (let i = bubbles.length - 1; i >= 0; i--) {
    const bubble = bubbles[i];
    bubble.update(t);

    if (pointerInside && bubble.isHovered(mouseX, mouseY)) {
      popBubble(i);
    } else {
      bubble.draw(t);
    }
  }

  updateDroplets(t);
  drawCursorGlow(t);
  drawGlossLayer(t);
}

function buildRibbons() {
  ribbons = [];

  const presets = [
    { y: 130, amp: 120, weight: 145, drift: 0.45, col: [154, 98, 244] },
    { y: 430, amp: 210, weight: 190, drift: -0.35, col: [182, 121, 255] },
    { y: 780, amp: 155, weight: 170, drift: 0.58, col: [131, 82, 222] },
    { y: 980, amp: 90, weight: 110, drift: -0.42, col: [205, 180, 255] },
  ];

  for (const preset of presets) {
    for (let i = 0; i < 8; i++) {
      ribbons.push({
        y: preset.y + random(-95, 95),
        amp: preset.amp * random(0.65, 1.35),
        weight: preset.weight * random(0.42, 1.05),
        freq: random(0.0022, 0.006),
        phase: random(TWO_PI),
        drift: preset.drift * random(0.6, 1.55),
        col: preset.col,
        alpha: random(18, 66),
      });
    }
  }
}

function buildBubbles() {
  bubbles = [];

  const clusterDefs = [
    { x: 130, y: 375, sx: 230, sy: 410, count: 24 },
    { x: 535, y: 725, sx: 350, sy: 400, count: 20 },
    { x: 1285, y: 240, sx: 385, sy: 260, count: 20 },
    { x: 1660, y: 430, sx: 320, sy: 380, count: 18 },
  ];

  for (const cluster of clusterDefs) {
    for (let i = 0; i < cluster.count; i++) {
      const angle = random(TWO_PI);
      const spread = pow(random(), 0.55);
      const x = cluster.x + cos(angle) * cluster.sx * spread + random(-34, 34);
      const y = cluster.y + sin(angle) * cluster.sy * spread + random(-34, 34);
      const radius = random() < 0.22 ? random(72, 160) : random(13, 58);
      bubbles.push(new Bubble(x, y, radius, random(TWO_PI)));
    }
  }

  for (let i = bubbles.length; i < BUBBLE_COUNT; i++) {
    const radius = random(10, 44);
    bubbles.push(new Bubble(random(width), random(height), radius, random(TWO_PI)));
  }
}

function drawOilBackground(t) {
  background(3, 3, 4);

  noStroke();
  for (let y = 0; y < height; y += 3) {
    const n = noise(y * 0.003, t * 0.1);
    fill(4 + n * 10, 4 + n * 8, 6 + n * 12, 185);
    rect(0, y, width, 3);
  }

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  const glows = [
    [135, 720, 520, "rgba(151, 96, 255, 0.19)"],
    [650, 910, 650, "rgba(196, 165, 255, 0.1)"],
    [1290, 300, 560, "rgba(172, 109, 255, 0.16)"],
    [1720, 560, 520, "rgba(112, 154, 218, 0.08)"],
  ];

  for (const glow of glows) {
    const [x, y, r, col] = glow;
    const gx = x + sin(t * 0.9 + x) * 34;
    const gy = y + cos(t * 0.6 + y) * 26;
    const grad = drawingContext.createRadialGradient(gx, gy, 0, gx, gy, r);
    grad.addColorStop(0, col);
    grad.addColorStop(1, "rgba(0, 0, 0, 0)");
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(0, 0, width, height);
  }

  drawingContext.restore();
}

function drawLiquidRibbons(t) {
  noFill();
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  for (const ribbon of ribbons) {
    const pulse = 0.72 + sin(t * 1.8 + ribbon.phase) * 0.12;
    stroke(ribbon.col[0], ribbon.col[1], ribbon.col[2], ribbon.alpha * pulse);
    strokeWeight(ribbon.weight);
    drawingContext.shadowBlur = 18;
    drawingContext.shadowColor = "rgba(170, 114, 255, 0.22)";

    beginShape();
    for (let x = -180; x <= width + 180; x += 48) {
      const y = ribbon.y
        + sin(x * ribbon.freq + ribbon.phase + t * ribbon.drift) * ribbon.amp
        + noise(x * 0.002, ribbon.phase, t * 0.08) * 140
        - 70;
      curveVertex(x, y);
    }
    endShape();
  }

  drawingContext.shadowBlur = 0;
  drawingContext.restore();

  noFill();
  for (let i = 0; i < 22; i++) {
    const y = map(i, 0, 21, 80, height - 60);
    stroke(210, 208, 234, 10 + i * 0.7);
    strokeWeight(1.2);
    beginShape();
    for (let x = -160; x <= width + 160; x += 70) {
      curveVertex(
        x,
        y + sin(x * 0.006 + i + t * 0.4) * 28 + noise(i, x * 0.005, t * 0.1) * 44
      );
    }
    endShape();
  }
}

function updateDroplets(t) {
  for (let i = droplets.length - 1; i >= 0; i--) {
    const drop = droplets[i];
    drop.life -= 1;
    drop.x += drop.vx;
    drop.y += drop.vy;
    drop.vx *= 0.972;
    drop.vy = drop.vy * 0.972 + 0.035;
    drop.r *= 0.975;

    const fade = constrain(drop.life / drop.maxLife, 0, 1);
    drawingContext.save();
    drawingContext.globalCompositeOperation = "screen";
    noStroke();
    fill(180, 119, 255, 165 * fade);
    circle(drop.x, drop.y, drop.r * 2);
    fill(255, 247, 255, 110 * fade);
    circle(drop.x - drop.r * 0.28, drop.y - drop.r * 0.32, drop.r * 0.72);
    drawingContext.restore();

    noFill();
    stroke(255, 226, 255, 105 * fade);
    strokeWeight(1.4 * fade);
    circle(drop.x, drop.y, drop.r * (2.2 + sin(t * 6 + i) * 0.14));

    if (drop.life <= 0 || drop.r < 0.55) {
      droplets.splice(i, 1);
    }
  }
}

function popBubble(index) {
  const bubble = bubbles[index];
  const burstCount = floor(map(bubble.r, 10, 165, 8, 34, true));

  for (let i = 0; i < burstCount; i++) {
    const angle = random(TWO_PI);
    const speed = random(1.8, 7.6) * map(bubble.r, 10, 165, 0.75, 1.55, true);
    droplets.push({
      x: bubble.x + cos(angle) * bubble.r * random(0.18, 0.82),
      y: bubble.y + sin(angle) * bubble.r * random(0.18, 0.82),
      vx: bubble.vx + cos(angle) * speed,
      vy: bubble.vy + sin(angle) * speed,
      r: random(2.2, 8.8) * map(bubble.r, 10, 165, 0.7, 1.4, true),
      life: floor(random(34, 72)),
      maxLife: 72,
    });
  }

  droplets.push({
    x: bubble.x,
    y: bubble.y,
    vx: 0,
    vy: 0,
    r: bubble.r * 0.72,
    life: 18,
    maxLife: 18,
  });

  bubbles.splice(index, 1);

  setTimeout(() => {
    bubbles.push(new Bubble(random(width), random(height), random(12, 74), random(TWO_PI)));
  }, random(350, 1400));
}

function drawCursorGlow(t) {
  if (hoverGlow < 0.01 || !pointerInside) return;

  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";
  const grad = drawingContext.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 260);
  grad.addColorStop(0, `rgba(205, 156, 255, ${0.18 * hoverGlow})`);
  grad.addColorStop(0.38, `rgba(108, 180, 255, ${0.07 * hoverGlow})`);
  grad.addColorStop(1, "rgba(205, 156, 255, 0)");
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height);
  drawingContext.restore();

  noFill();
  for (let i = 0; i < 3; i++) {
    stroke(220, 195, 255, (42 - i * 10) * hoverGlow);
    strokeWeight(1.3);
    circle(mouseX, mouseY, 56 + i * 32 + sin(t * 4 + i) * 5);
  }
}

function drawGlossLayer(t) {
  drawingContext.save();
  drawingContext.globalCompositeOperation = "screen";

  for (let i = 0; i < 5; i++) {
    const x = -220 + i * 520 + sin(t * 0.7 + i) * 20;
    const y = 120 + i * 170 + cos(t * 0.55 + i) * 26;
    const grad = drawingContext.createLinearGradient(x, y, x + 450, y + 130);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.042)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    drawingContext.fillStyle = grad;
    drawingContext.fillRect(0, 0, width, height);
  }

  drawingContext.restore();
}

class Bubble {
  constructor(x, y, r, phase) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.phase = phase;
    this.vx = random(-0.45, 0.45) * map(r, 10, 165, 1.35, 0.45, true);
    this.vy = random(-0.35, 0.35) * map(r, 10, 165, 1.2, 0.38, true);
    this.squash = random(0.82, 1.25);
    this.rot = random(TWO_PI);
    this.spin = random(-0.0025, 0.0025);
    this.wobble = random(0.045, 0.12);
    this.points = floor(random(18, 28));
    this.tint = random() < 0.74 ? "black" : "purple";
  }

  update(t) {
    this.x += this.vx + sin(t * 1.8 + this.phase) * 0.18;
    this.y += this.vy + cos(t * 1.45 + this.phase) * 0.16;
    this.rot += this.spin;

    if (this.x < -this.r) this.x = width + this.r;
    if (this.x > width + this.r) this.x = -this.r;
    if (this.y < -this.r) this.y = height + this.r;
    if (this.y > height + this.r) this.y = -this.r;
  }

  isHovered(px, py) {
    const dx = (px - this.x) / this.r;
    const dy = (py - this.y) / (this.r * this.squash);
    return dx * dx + dy * dy < 0.78;
  }

  draw(t) {
    const d = dist(mouseX, mouseY, this.x, this.y);
    const near = pointerInside ? pow(constrain(1 - d / (this.r + 165), 0, 1), 1.8) : 0;
    const grow = 1 + near * 0.12;

    push();
    translate(this.x, this.y);
    rotate(this.rot + sin(t * 2 + this.phase) * this.wobble);
    scale(grow, grow * this.squash);

    drawingContext.shadowBlur = 18 + near * 34;
    drawingContext.shadowColor = "rgba(160, 98, 255, 0.36)";

    noStroke();
    this.drawBlob(1.12, color(143, 82, 247, 165 + near * 64), t);
    this.drawBlob(1.02, color(6, 5, 9, 238), t);
    this.drawInterior(near, t);
    this.drawRim(near, t);

    pop();
    drawingContext.shadowBlur = 0;
  }

  drawBlob(mult, col, t) {
    fill(col);
    beginShape();
    for (let i = 0; i <= this.points + 3; i++) {
      const a = (i / this.points) * TWO_PI;
      const wave = this.edgeWave(a, t);
      curveVertex(cos(a) * this.r * mult * wave, sin(a) * this.r * mult * wave);
    }
    endShape(CLOSE);
  }

  drawInterior(near, t) {
    drawingContext.save();
    drawingContext.globalCompositeOperation = "screen";

    const core = drawingContext.createRadialGradient(
      -this.r * 0.2,
      -this.r * 0.22,
      0,
      0,
      0,
      this.r * 1.08
    );
    core.addColorStop(0, `rgba(82, 76, 98, ${0.54 + near * 0.18})`);
    core.addColorStop(0.42, `rgba(7, 7, 11, ${0.24 + near * 0.14})`);
    core.addColorStop(1, "rgba(0, 0, 0, 0)");
    drawingContext.fillStyle = core;
    ellipse(0, 0, this.r * 1.82, this.r * 1.82);

    noStroke();
    fill(255, 250, 255, 150 + near * 80);
    ellipse(-this.r * 0.34, -this.r * 0.38, this.r * 0.34, this.r * 0.13);
    fill(255, 250, 255, 88 + near * 70);
    ellipse(this.r * 0.32, -this.r * 0.2, this.r * 0.2, this.r * 0.08);
    fill(151, 99, 255, 48 + near * 78);
    ellipse(-this.r * 0.08, this.r * 0.18, this.r * 0.94, this.r * 0.32);

    noFill();
    stroke(232, 219, 255, 28 + near * 70);
    strokeWeight(max(1.1, this.r * 0.018));
    beginShape();
    for (let x = -this.r * 0.55; x <= this.r * 0.56; x += this.r * 0.14) {
      curveVertex(
        x,
        sin(x * 0.035 + t * 5 + this.phase) * this.r * 0.08
          + noise(this.phase, x * 0.02, t * 0.3) * this.r * 0.16
      );
    }
    endShape();

    drawingContext.restore();
  }

  drawRim(near, t) {
    noFill();

    stroke(0, 0, 0, 230);
    strokeWeight(max(2.6, this.r * 0.095));
    this.drawOpenBlob(0.98, t);

    stroke(183, 128, 255, 150 + near * 95);
    strokeWeight(max(1.3, this.r * 0.038));
    this.drawOpenBlob(1.03, t);

    stroke(255, 242, 255, 75 + near * 100);
    strokeWeight(max(0.9, this.r * 0.015));
    this.drawOpenBlob(0.88, t);
  }

  drawOpenBlob(mult, t) {
    beginShape();
    for (let i = 0; i <= this.points + 3; i++) {
      const a = (i / this.points) * TWO_PI;
      const wave = this.edgeWave(a, t);
      curveVertex(cos(a) * this.r * mult * wave, sin(a) * this.r * mult * wave);
    }
    endShape(CLOSE);
  }

  edgeWave(a, t) {
    return 1
      + (noise(cos(a) + this.phase, sin(a) + this.phase, t * 0.35) - 0.5) * 0.16
      + sin(a * 3 + this.phase + t * 1.4) * 0.022;
  }
}
