const SIZE = 400;
const HOVER_RADIUS = 105;

let liquidLayer;
let grainLayer;
let ribbons = [];
let pools = [];
let cursorHasVisited = false;

const colors = {
  ink: "#132522",
  deepTeal: "#21444A",
  dusk: "#5C5A86",
  lavender: "#A786B9",
  mist: "#D8D4C3",
  cream: "#F2DA9A",
  gold: "#F2B85B",
  coral: "#EF5C55",
  magenta: "#EF5AAA"
};

function setup() {
  createCanvas(SIZE, SIZE);
  pixelDensity(2);
  frameRate(30);
  noStroke();

  liquidLayer = createGraphics(SIZE, SIZE);
  grainLayer = createGraphics(SIZE, SIZE);

  buildComposition();
  paintStillLiquid();
  paintFineTexture();
}

function draw() {
  image(liquidLayer, 0, 0);

  const active = cursorHasVisited && mouseInsideCanvas();
  if (active) {
    paintHoverTide();
  }

  image(grainLayer, 0, 0);
  paintAccessibleFrame();
}

function buildComposition() {
  ribbons = [
    {
      y: 262,
      amp: 56,
      weight: 92,
      colors: [colors.cream, colors.gold, colors.coral],
      phase: 0.4
    },
    {
      y: 328,
      amp: 36,
      weight: 62,
      colors: [colors.coral, colors.magenta, colors.deepTeal],
      phase: 2.1
    },
    {
      y: 116,
      amp: 28,
      weight: 52,
      colors: [colors.mist, colors.lavender, colors.deepTeal],
      phase: 4.2
    }
  ];

  pools = [
    { x: 178, y: 156, w: 280, h: 150, angle: 0.1, hot: colors.mist, cool: colors.deepTeal },
    { x: 205, y: 222, w: 255, h: 154, angle: -0.12, hot: colors.gold, cool: colors.ink },
    { x: 96, y: 46, w: 190, h: 110, angle: 0.34, hot: colors.cream, cool: colors.magenta },
    { x: 318, y: 370, w: 156, h: 96, angle: 0.05, hot: colors.magenta, cool: colors.ink },
    { x: 345, y: 88, w: 92, h: 172, angle: -0.18, hot: colors.lavender, cool: colors.deepTeal }
  ];
}

function paintStillLiquid() {
  liquidLayer.background(colors.ink);
  paintSoftBackdrop();

  for (const pool of pools) {
    paintPool(pool);
  }

  for (const ribbon of ribbons) {
    paintRibbonShadow(ribbon);
    paintRibbon(ribbon);
  }

  paintPearlVeils();
}

function paintSoftBackdrop() {
  for (let y = 0; y < height; y += 2) {
    const t = y / height; const top = color(colors.lavender);
    const bottom = color(colors.ink);
    liquidLayer.stroke(lerpColor(top, bottom, t));
    liquidLayer.line(0, y, width, y);
  }

  softGlow(56, 64, 180, color(colors.magenta), 42);
  softGlow(250, 54, 220, color(colors.cream), 56);
  softGlow(352, 235, 210, color(colors.coral), 38);
  softGlow(84, 356, 220, color(colors.ink), 72);
}

function paintPool(pool) {
  liquidLayer.push();
  liquidLayer.translate(pool.x, pool.y);
  liquidLayer.rotate(pool.angle);

  for (let i = 0; i < 42; i++) {
    const t = i / 41;
    const w = pool.w * (1 - t * 0.9);
    const h = pool.h * (1 - t * 0.9);
    const c = lerpColor(color(pool.hot), color(pool.cool), smoothstep(t));
    liquidLayer.fill(red(c), green(c), blue(c), 210 - t * 130);
    liquidLayer.ellipse(sin(t * PI) * 24, cos(t * TWO_PI) * 10, w, h);
  }

  liquidLayer.noFill();
  liquidLayer.stroke(colors.ink);
  liquidLayer.strokeWeight(9);
  liquidLayer.ellipse(0, 0, pool.w * 0.88, pool.h * 0.82);
  liquidLayer.stroke(colors.cream);
  liquidLayer.strokeWeight(3);
  liquidLayer.ellipse(-9, -7, pool.w * 0.82, pool.h * 0.74);
  liquidLayer.noStroke();
  liquidLayer.pop();
}

function paintRibbonShadow(ribbon) {
  liquidLayer.noFill();
  liquidLayer.stroke(colors.ink);
  liquidLayer.strokeWeight(ribbon.weight + 16);
  paintRibbonCurve(ribbon, 20);
  liquidLayer.noStroke();
}

function paintRibbon(ribbon) {
  for (let i = 0; i < ribbon.colors.length; i++) {
    liquidLayer.noFill();
    liquidLayer.stroke(ribbon.colors[i]);
    liquidLayer.strokeWeight(ribbon.weight - i * 20);
    paintRibbonCurve(ribbon, i * 10);
  }
  liquidLayer.noStroke();
}

function paintRibbonCurve(ribbon, offset) {
  liquidLayer.beginShape();
  for (let x = -40; x <= width + 40; x += 10) {
    const wave = sin(x * 0.022 + ribbon.phase) * ribbon.amp;
    const smallerWave = sin(x * 0.053 + ribbon.phase * 1.7) * 14;
    liquidLayer.curveVertex(x, ribbon.y + wave + smallerWave + offset);
  }
  liquidLayer.endShape();
}

function paintPearlVeils() {
  liquidLayer.blendMode(SCREEN);
  softGlow(210, 132, 260, color(216, 212, 195, 115), 62);
  softGlow(301, 181, 130, color(239, 90, 170, 94), 28);
  liquidLayer.blendMode(BLEND);
}

function paintFineTexture() {
  grainLayer.clear();
  grainLayer.noStroke();

  for (let i = 0; i < 1800; i++) {
    const x = random(width);
    const y = random(height);
    const n = noise(x * 0.03, y * 0.03);
    const alpha = map(n, 0, 1, 10, 32);
    const light = random() > 0.45;

    grainLayer.fill(light ? color(242, 218, 154, alpha) : color(19, 37, 34, alpha));
    grainLayer.rect(x, y, random(0.5, 1.5), random(0.5, 1.7));
  }
}

function paintHoverTide() {
  const pulse = sin(frameCount * 0.075) * 0.5 + 0.5;

  for (const ribbon of ribbons) {
    for (let i = 0; i < 9; i++) {
      const x = map(i, 0, 8, 20, width - 20);
      const y = ribbon.y + sin(x * 0.022 + ribbon.phase) * ribbon.amp;
      const force = constrain(1 - dist(mouseX, mouseY, x, y) / HOVER_RADIUS, 0, 1);

      if (force > 0) {
        const glowSize = map(force, 0, 1, 12, 58) + pulse * 6;
        fill(242, 218, 154, 34 * force);ellipse(x, y, glowSize * 1.35, glowSize);
        fill(239, 90, 170, 42 * force);
        ellipse(x + sin(frameCount * 0.04 + i) * 8, y - 8, glowSize * 0.75);
      }
    }
  }

  for (let r = 0; r < 4; r++) {
    const s = 36 + r * 19 + pulse * 6;
    noFill();
    stroke(242, 218, 154, 52 - r * 9);
    strokeWeight(2);
    ellipse(mouseX, mouseY, s * 1.65, s);
  }
  noStroke();
}

function softGlow(x, y, size, glowColor, alphaMax) {
  for (let i = 0; i < 34; i++) {
    const t = i / 33;
    const c = color(glowColor);
    liquidLayer.fill(red(c), green(c), blue(c), alphaMax * (1 - t));
    liquidLayer.ellipse(x, y, size * t, size * 0.74 * t);
  }
}

function paintAccessibleFrame() {
  noFill();
  stroke(colors.cream);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);
  stroke(colors.ink);
  strokeWeight(1);
  rect(5, 5, width - 10, height - 10);
  noStroke();
}

function smoothstep(t) {
  return t * t * (3 - 2 * t);
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