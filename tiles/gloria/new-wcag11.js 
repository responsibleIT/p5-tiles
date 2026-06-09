// ─────────────────────────────────────────────────────────────────────────────
// Warm Nested Rectangles – p5.js static artwork  |  1920 × 1080 px
// Vanishing point at bottom-center; outermost rect bleeds off top of canvas.
// ─────────────────────────────────────────────────────────────────────────────

// ── Palette: pale cream → amber → burnt orange → deep red (outer → inner) ───
const DEPTH_COLORS = [
  [250, 220, 160],  // 0  pale cream-yellow
  [245, 205, 135],  // 1  warm sand
  [242, 190, 110],  // 2  light amber
  [238, 175,  85],  // 3  amber
  [232, 158,  65],  // 4  amber-orange
  [225, 138,  50],  // 5  orange
  [218, 118,  42],  // 6  deep orange
  [210,  98,  38],  // 7  burnt orange
  [200,  80,  35],  // 8  burnt orange-red
  [188,  62,  32],  // 9  orange-red
  [175,  48,  30],  // 10 red-orange
  [162,  38,  28],  // 11 medium red
  [150,  30,  26],  // 12 red
  [138,  24,  24],  // 13 deep red
  [125,  20,  22],  // 14 dark red
  [112,  16,  20],  // 15 very dark red (innermost)
];

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// Vanishing point: horizontally centered, near bottom of canvas
const VP_X = CANVAS_W / 2;
const VP_Y = CANVAS_H * 0.96;

// The outermost rectangle — wider than canvas, top bleeds above canvas
const OUTER_W = CANVAS_W * 1.05;
const OUTER_H = CANVAS_H * 1.35;
const OUTER_X = (CANVAS_W - OUTER_W) / 2;   // slightly off left/right edges
const OUTER_Y = -CANVAS_H * 0.32;            // top bleeds above canvas

const NUM_LAYERS = 16;

// ── Easing: layers crowd together toward VP (perspective feel) ───────────────
function layerT(i) {
  const linear = i / (NUM_LAYERS - 1);
  // Ease-in so inner bands compress
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
  background(250, 220, 160); // fallback = outermost color
  drawNestedRectangles();
}

// ── Nested rectangles converging to VP at bottom-center ──────────────────────
function drawNestedRectangles() {
  for (let i = 0; i < NUM_LAYERS; i++) {
    const t = layerT(i);

    // Interpolate rect from outer bounds toward vanishing point
    const rx = lerp(OUTER_X,           VP_X, t);
    const ry = lerp(OUTER_Y,           VP_Y, t);
    const rw = lerp(OUTER_W,           0,    t);
    const rh = lerp(OUTER_H,           0,    t);

    // Palette color for this layer
    const palIdx  = Math.min(Math.floor((i / (NUM_LAYERS - 1)) * (DEPTH_COLORS.length - 1)), DEPTH_COLORS.length - 2);
    const palFrac = ((i / (NUM_LAYERS - 1)) * (DEPTH_COLORS.length - 1)) - palIdx;
    const c0 = DEPTH_COLORS[palIdx];
    const c1 = DEPTH_COLORS[palIdx + 1];
    const fr = lerp(c0[0], c1[0], palFrac);
    const fg = lerp(c0[1], c1[1], palFrac);
    const fb = lerp(c0[2], c1[2], palFrac);

    // Fill rectangle
    noStroke();
    fill(fr, fg, fb);
    rect(rx, ry, rw, rh);

    // Subtle bevel: draw diagonal corner lines on top-left and top-right
    drawBevel(rx, ry, rw, rh, fr, fg, fb, i);

    // Subtle hatch texture on every other band
    if (i % 2 === 0) {
      drawHatch(rx, ry, rw, rh, fr, fg, fb);
    }
  }
}

// ── Bevel effect: diagonal cut lines at top corners ──────────────────────────
// Mimics the 3D chamfered-edge look visible in the reference image
function drawBevel(rx, ry, rw, rh, fr, fg, fb) {
  const bevelSize = max(rw * 0.018, 2);

  // Light edge (top and left sides) — slightly brighter
  stroke(min(fr + 30, 255), min(fg + 22, 255), min(fb + 18, 255));
  strokeWeight(1.2);
  noFill();

  // Top edge highlight
  line(rx + bevelSize, ry, rx + rw - bevelSize, ry);
  // Left edge highlight
  line(rx, ry + bevelSize, rx, ry + rh);

  // Dark edge (inner diagonal cuts at corners) — slightly darker
  stroke(fr * 0.78, fg * 0.78, fb * 0.78);
  strokeWeight(0.8);

  // Top-left diagonal
  line(rx, ry, rx + bevelSize, ry + bevelSize);
  // Top-right diagonal
  line(rx + rw, ry, rx + rw - bevelSize, ry + bevelSize);

  // Inner bevel line along top (just inside)
  stroke(fr * 0.88, fg * 0.88, fb * 0.88);
  strokeWeight(0.6);
  line(rx + bevelSize, ry + bevelSize, rx + rw - bevelSize, ry + bevelSize);
}

// ── Hatch texture: very subtle diagonal lines within the band ─────────────────
function drawHatch(rx, ry, rw, rh, fr, fg, fb) {
  if (rw < 6 || rh < 6) return;

  // Semi-transparent darker lines
  stroke(fr * 0.82, fg * 0.82, fb * 0.82, 38);
  strokeWeight(0.55);
  noFill();

  const spacing = 18;
  // Diagonal ↘ lines clipped to rect
  for (let d = -rh; d < rw + rh; d += spacing) {
    const x1 = rx + d;
    const y1 = ry;
    const x2 = rx + d + rh;
    const y2 = ry + rh;
    // Clamp to rect
    const cx1 = constrain(x1, rx, rx + rw);
    const cy1 = constrain(y1, ry, ry + rh);
    const cx2 = constrain(x2, rx, rx + rw);
    const cy2 = constrain(y2, ry, ry + rh);
    if (!(cx1 === cx2 && cy1 === cy2)) {
      line(cx1, cy1, cx2, cy2);
    }
  }
}
