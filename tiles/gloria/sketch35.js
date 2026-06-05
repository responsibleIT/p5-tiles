const canvasSize = 400;
const gap = 5;
const unit = 34;
const startX = 6;
const startY = 6;
const pressEase = 0.18;

let keys = [];
let bgColor;
let plateColor;
let keyPalettes = [];
let labels = [];

function setup() {
  // setup and key initialization
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  rectMode(CORNER);
  textAlign(CENTER, CENTER);
  textFont("monospace");

  bgColor = color("#08090A");
  plateColor = color("#151719");

  keyPalettes = [
    { top: color("#E9E4D6"), side: color("#AAA392"), text: color("#505050") },
    { top: color("#D9D9DE"), side: color("#909098"), text: color("#55555A") },
    { top: color("#5B5E64"), side: color("#292B30"), text: color("#F0F0F0") },
    { top: color("#2A2D31"), side: color("#0D0E10"), text: color("#E7E7E7") },
    { top: color("#101216"), side: color("#050608"), text: color("#DADADA") }
  ];

  labels = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "1", "2", "7", "9", "?", "<", "Home", "End", "Enter"
  ];

  createKeysGrid();
}

function draw() {
  background(bgColor);
  drawPlate();
  updateKeys();

  for (let i = 0; i < keys.length; i++) {
    drawKey(keys[i]);
  }
}

function createKeysGrid() {
  keys = [];

  const rows = 12;
  const cols = 12;
  const occupied = [];

  for (let r = 0; r < rows; r++) {
    occupied[r] = [];
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (occupied[r][c]) continue;

      let spanX = 1;
      let spanY = 1;

      if (random() < 0.08 && c < cols - 1 && !occupied[r][c + 1]) {
        spanX = 2;
      }

      if (random() < 0.055 && r < rows - 1 && !occupied[r + 1][c]) {
        spanY = 2;
      }

      occupied[r][c] = true;
      if (spanX === 2) occupied[r][c + 1] = true;
      if (spanY === 2) occupied[r + 1][c] = true;

      const x = startX + c * unit + random(-1.6, 1.6);
      const y = startY + r * unit + random(-1.6, 1.6);
      const w = unit * spanX - gap;
      const h = unit * spanY - gap;
      const palette = random(keyPalettes);
      const label = spanX > 1 || spanY > 1 ? random(["Enter", "Home", "End"]) : random(labels);

      keys.push({
        x: x,
        y: y,
        w: w,
        h: h,
        baseHeight: 7,
        pressedHeight: 1.4,
        currentHeight: 7,
        label: label,
        topColor: palette.top,
        sideColor: palette.side,
        textColor: palette.text,
        grainSeed: random(1000)
      });
    }
  }
}

function drawPlate() {
  // dark background plate behind the keycaps
  noStroke();
  fill(plateColor);
  rect(0, 0, width, height);

  for (let i = 0; i < 80; i++) {
    fill(255, 255, 255, random(4, 12));
    rect(random(width), random(height), random(1, 3), random(1, 3));
  }
}

function updateKeys() {
  // hover detection and easing
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const hovered =
      mouseX >= key.x &&
      mouseX <= key.x + key.w &&
      mouseY >= key.y &&
      mouseY <= key.y + key.h;

    const targetHeight = hovered ? key.pressedHeight : key.baseHeight;
    key.currentHeight = lerp(key.currentHeight, targetHeight, pressEase);
    key.hovered = hovered;
  }
}

function drawKey(key) {
  // drawing a single key with shading and pressed state
  const lift = key.currentHeight;
  const topY = key.y - lift;
  const corner = 5;

  noStroke();

  fill(0, 0, 0, 160);
  rect(key.x + 3, key.y + 5, key.w, key.h, corner);

  fill(key.sideColor);
  rect(key.x, key.y, key.w, key.h + lift, corner);

  fill(lerpColor(key.sideColor, color(0), 0.25));
  rect(key.x + 2, key.y + key.h * 0.72, key.w - 4, key.h * 0.3 + lift, 4);

  let topCol = key.topColor;
  if (key.hovered) {
    topCol = lerpColor(key.topColor, color(255), 0.08);
  }

  fill(topCol);
  rect(key.x + 2, topY + 2, key.w - 4, key.h - 5, corner);

  fill(255, 255, 255, key.hovered ? 72 : 42);
  rect(key.x + 5, topY + 5, key.w - 10, 3, 3);

  fill(0, 0, 0, 45);
  rect(key.x + 5, topY + key.h - 9, key.w - 10, 2, 2);

  drawKeyTexture(key, topY);

  fill(key.textColor);
  textSize(key.label.length > 1 ? 9 : 16);
  text(key.label, key.x + key.w / 2, topY + key.h / 2 - 1);
}

function drawKeyTexture(key, topY) {
  // subtle rough plastic texture on each key top
  randomSeed(floor(key.grainSeed));

  for (let i = 0; i < 14; i++) {
    const gx = key.x + random(5, key.w - 5);
    const gy = topY + random(6, key.h - 8);
    const alpha = random(8, 22);

    if (random() > 0.5) {
      fill(255, 255, 255, alpha);
    } else {
      fill(0, 0, 0, alpha);
    }

    rect(gx, gy, random(0.8, 1.8), random(0.8, 1.8));
  }

  randomSeed();
}