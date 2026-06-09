// ─────────────────────────────────────────────────────────────────────────────
// Green Nested Rectangles – p5.js static artwork  |  1920 × 1080 px
// Dark forest green outside → pale yellow-green center
// ─────────────────────────────────────────────────────────────────────────────

// ── Palette: dark forest green (outer) → olive → pale yellow-green (inner) ──
const DEPTH_COLORS = [
  [ 10,  22,  12],  // 0  near-black forest green  (outermost)
  [ 15,  30,  16],  // 1  very dark green
  [ 20,  38,  18],  // 2  dark forest green
  [ 25,  48,  20],  // 3  deep green
  [ 32,  58,  22],  // 4  forest green
  [ 42,  68,  25],  // 5  medium forest green
  [ 55,  78,  28],  // 6  olive-green
  [ 70,  90,  32],  // 7  muted green
  [ 88, 105,  38],  // 8  warm olive
  [108, 118,  48],  // 9  olive
  [130, 135,  62],  // 10 yellow-olive
  [155, 155,  80],  // 11 pale olive
  [178, 175, 105],  // 12 light olive-yellow
  [200, 198, 140],  // 13 pale yellow-green
  [220, 218, 170],  // 14 very pale green-cream
  [238, 235, 205],  // 15 near-white cream-green   (innermost)
];

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Vanishing point: horizontally centered, near bottom of canvas
const VP_X = CANVAS_W / 2;
const VP_Y = CANVAS_H * 0.96;

// The outermost rectangle — wider than canvas, top bleeds above canvas
const OUTER_W = CANVAS_W * 1.05;
const OUTER_H = CANVAS_H * 1.35;
const OUTER_X = (CANVAS_W - OUTER_W) / 2;
const OUTER_Y = -CANVAS_H * 0.32;

const NUM_LAYERS = 16;

// ── Easing: layers crowd together toward VP ───────────────────────────────────
function layerT(i) {
  const linear = i / (NUM_LAYERS - 1);
  return Math.pow(linear, 0.75);
}

// ─────────────────────────────────────────────────────────────────────────────
function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  colorMode(RGB, 255);
  noLoop();
}

// ─────────────────────────────────────────────────────────────────────────────
function draw() {
  background(10, 22, 12); // darkest forest green
  drawNestedRectangles();
}

// ── Nested rectangles converging to VP at bottom-center ──────────────────────
function drawNestedRectangles() {
  for (let i = 0; i < NUM_LAYERS; i++) {
    const t = layerT(i);

    const rx = lerp(OUTER_X, VP_X, t);
    const ry = lerp(OUTER_Y, VP_Y, t);
    const rw = lerp(OUTER_W, 0,    t);
    const rh = lerp(OUTER_H, 0,    t);

    // Palette color for this layer
    const palIdx  = Math.min(Math.floor((i / (NUM_LAYERS - 1)) * (DEPTH_COLORS.length - 1)), DEPTH_COLORS.length - 2);
    const palFrac = ((i / (NUM_LAYERS - 1)) * (DEPTH_COLORS.length - 1)) - palIdx;
    const c0 = DEPTH_COLORS[palIdx];
    const c1 = DEPTH_COLORS[palIdx + 1];
    const fr = lerp(c0[0], c1[0], palFrac);
    const fg = lerp(c0[1], c1[1], palFrac);
    const fb = lerp(c0[2], c1[2], palFrac);

    noStroke();
    fill(fr, fg, fb);
    rect(rx, ry, rw, rh);

    drawBevel(rx, ry, rw, rh, fr, fg, fb);

    if (i % 2 === 0) {
      drawHatch(rx, ry, rw, rh, fr, fg, fb);
    }
  }
}

// ── Bevel effect ──────────────────────────────────────────────────────────────
function drawBevel(rx, ry, rw, rh, fr, fg, fb) {
  const bevelSize = max(rw * 0.018, 2);

  stroke(min(fr + 28, 255), min(fg + 22, 255), min(fb + 18, 255));
  strokeWeight(1.2);
  noFill();
  line(rx + bevelSize, ry, rx + rw - bevelSize, ry);
  line(rx, ry + bevelSize, rx, ry + rh);

  stroke(fr * 0.72, fg * 0.72, fb * 0.72);
  strokeWeight(0.8);
  line(rx,      ry, rx + bevelSize,      ry + bevelSize);
  line(rx + rw, ry, rx + rw - bevelSize, ry + bevelSize);

  stroke(fr * 0.86, fg * 0.86, fb * 0.86);
  strokeWeight(0.6);
  line(rx + bevelSize, ry + bevelSize, rx + rw - bevelSize, ry + bevelSize);
}

// ── Hatch texture ─────────────────────────────────────────────────────────────
function drawHatch(rx, ry, rw, rh, fr, fg, fb) {
  if (rw < 6 || rh < 6) return;

  stroke(fr * 0.80, fg * 0.80, fb * 0.80, 38);
  strokeWeight(0.55);
  noFill();

  const spacing = 18;
  for (let d = -rh; d < rw + rh; d += spacing) {
    const x1 = rx + d;
    const y1 = ry;
    const x2 = rx + d + rh;
    const y2 = ry + rh;
    const cx1 = constrain(x1, rx, rx + rw);
    const cy1 = constrain(y1, ry, ry + rh);
    const cx2 = constrain(x2, rx, rx + rw);
    const cy2 = constrain(y2, ry, ry + rh);
    if (!(cx1 === cx2 && cy1 === cy2)) {
      line(cx1, cy1, cx2, cy2);
    }
  }
}
