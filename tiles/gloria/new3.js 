const CANVAS_W = 1080;
const CANVAS_H = 920;

const COLS = 34;
const ROWS = 30;
const CELL_W = CANVAS_W / COLS;
const CELL_H = CANVAS_H / ROWS;

const BG_A = "#1a1a14";
const BG_B = "#2b2b1d";
const DARK_GREEN = "#0b3d0b";
const OLIVE_GREEN = "#556b2f";
const SHADOW = "#0a290a";

let tiles = [];
let palette = {};
let easedMouseX = 540;
let easedMouseY = 460;

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  pixelDensity(1);
  noStroke();
  colorMode(RGB, 255, 255, 255, 255);

  palette = {
    bgA: color(BG_A),
    bgB: color(BG_B),
    darkGreen: color(DARK_GREEN),
    oliveGreen: color(OLIVE_GREEN),
    shadow: color(SHADOW)
  };

  buildTessellation();
}

function draw() {
  const t = frameCount * 0.012;

  easedMouseX = lerp(easedMouseX, mouseX, 0.035);
  easedMouseY = lerp(easedMouseY, mouseY, 0.035);

  drawSnakeBackground(t);

  for (let tile of tiles) {
    tile.draw(t);
  }
}

function buildTessellation() {
  tiles = [];

  for (let row = -2; row < ROWS + 2; row++) {
    for (let col = -2; col < COLS + 2; col++) {
      const stagger = row % 2 === 0 ? 0 : CELL_W * 0.5;
      const x = col * CELL_W + stagger;
      const y = row * CELL_H;

      const n = noise(col * 0.13, row * 0.13);
      const lean = map(noise(col * 0.23 + 40, row * 0.2), 0, 1, -0.26, 0.26);
      const lift = map(noise(col * 0.18, row * 0.18 + 90), 0, 1, -0.22, 0.22);

      const p0 = createVector(
        x + CELL_W * noise(col + 1.7, row + 8.2) * 0.22,
        y + CELL_H * noise(col + 4.1, row + 2.9) * 0.22
      );

      const p1 = createVector(
        x + CELL_W * (1 + lean + noise(col + 3.2, row + 5.4) * 0.16),
        y + CELL_H * noise(col + 9.7, row + 1.5) * 0.2
      );

      const p2 = createVector(
        x + CELL_W * (1 + noise(col + 6.4, row + 3.3) * 0.18),
        y + CELL_H * (1 + lift + noise(col + 2.6, row + 7.7) * 0.18)
      );

      const p3 = createVector(
        x + CELL_W * (lean * 0.42 + noise(col + 8.8, row + 4.6) * 0.18),
        y + CELL_H * (1 + noise(col + 5.5, row + 6.1) * 0.2)
      );

      const center = createVector(
        x + CELL_W * (0.5 + map(noise(col * 0.4, row * 0.33), 0, 1, -0.16, 0.16)),
        y + CELL_H * (0.5 + map(noise(col * 0.28 + 11, row * 0.35), 0, 1, -0.16, 0.16))
      );

      tiles.push(new SnakeTile(p0, p1, center, col, row, n, 0));
      tiles.push(new SnakeTile(p1, p2, center, col, row, n, 1));
      tiles.push(new SnakeTile(p2, p3, center, col, row, n, 2));
      tiles.push(new SnakeTile(p3, p0, center, col, row, n, 3));
    }
  }
}

class SnakeTile {
  constructor(a, b, c, col, row, n, side) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.col = col;
    this.row = row;
    this.side = side;

    this.cx = (a.x + b.x + c.x) / 3;
    this.cy = (a.y + b.y + c.y) / 3;

    this.noiseBase = noise(col * 0.11, row * 0.11);
    this.phase = noise(col * 0.31 + side * 2, row * 0.27) * TWO_PI;
  }

  draw(t) {
    const breathe = sin(t + this.phase) * 0.018;
    const slowTone = noise(this.col * 0.08, this.row * 0.08, t * 0.08);

    let base = lerpColor(palette.bgA, palette.bgB, noise(this.cx * 0.005, this.cy * 0.006));
    let dark = lerpColor(palette.darkGreen, palette.oliveGreen, slowTone);

    let textile = lerpColor(base, dark, 0.6);
    textile = brighten(textile, breathe * 0.35);

    // Add shadowing
    const shadowStrength = 0.2 + slowTone * 0.3;
    const shadowColor = lerpColor(palette.shadow, palette.darkGreen, shadowStrength);

    noStroke();
    fill(shadowColor);
    triangle(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);

    fill(textile);
    triangle(this.a.x, this.a.y, this.b.x, this.b.y, this.c.x, this.c.y);
  }
}

function drawSnakeBackground(t) {
  for (let y = -CELL_H; y < height + CELL_H; y += CELL_H) {
    for (let x = -CELL_W; x < width + CELL_W; x += CELL_W) {
      const n = noise(x * 0.006, y * 0.006, t * 0.04);
      const c = lerpColor(palette.bgA, palette.bgB, n);
      fill(c);

      const x1 = x;
      const y1 = y;
      const x2 = x + CELL_W;
      const y2 = y + noise(x * 0.02, y * 0.02) * CELL_H * 0.2;
      const x3 = x + CELL_W * 0.5;
      const y3 = y + CELL_H;

      triangle(x1, y1, x2, y2, x3, y3);

      const c2 = lerpColor(palette.bgB, palette.darkGreen, noise(x * 0.007 + 20, y * 0.007));
      fill(c2);
      triangle(x + CELL_W, y, x + CELL_W, y + CELL_H, x + CELL_W * 0.5, y + CELL_H);
    }
  }
}

function brighten(c, amount) {
  const a = constrain(amount, -0.25, 0.25);
  return color(
    constrain(red(c) + 255 * a, 0, 255),
    constrain(green(c) + 220 * a, 0, 255),
    constrain(blue(c) + 170 * a, 0, 255),
    alpha(c)
  );
}