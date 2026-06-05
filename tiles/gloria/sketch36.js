const canvasSize = 400;
const studSize = 18;
const cellSize = 31;
const gap = 3;
const pressEase = 0.16;

let bricks = [];
let bgColor;
let plateColor;
let brickPalette = [];

function setup() {
  // setup and brick initialization
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  rectMode(CORNER);
  noStroke();

  bgColor = color("#111111");
  plateColor = color("#202020");

  brickPalette = [
    color("#D71920"),
    color("#F7C600"),
    color("#008E4F"),
    color("#008FD3"),
    color("#F2F2EA"),
    color("#050505")
  ];

  createBricksGrid();
}

function draw() {
  background(bgColor);
  drawPlate();
  updateBricks();

  for (let i = 0; i < bricks.length; i++) {
    drawBrick(bricks[i]);
  }
}

function createBricksGrid() {
  bricks = [];

  const cols = ceil(canvasSize / cellSize);
  const rows = ceil(canvasSize / cellSize);
  const occupied = [];

  for (let y = 0; y < rows; y++) {
    occupied[y] = [];
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (occupied[y][x]) continue;

      let studsWide = random([1, 2, 2, 2, 3]);
      let studsHigh = random([1, 2, 2, 3]);

      if (x + studsWide > cols) studsWide = 1;
      if (y + studsHigh > rows) studsHigh = 1;

      let canPlace = true;
      for (let yy = 0; yy < studsHigh; yy++) {
        for (let xx = 0; xx < studsWide; xx++) {
          if (occupied[y + yy][x + xx]) canPlace = false;
        }
      }

      if (!canPlace) {
        studsWide = 1;
        studsHigh = 1;
      }

      for (let yy = 0; yy < studsHigh; yy++) {
        for (let xx = 0; xx < studsWide; xx++) {
          occupied[y + yy][x + xx] = true;
        }
      }

      const brickX = x * cellSize + gap;
      const brickY = y * cellSize + gap;
      const brickW = studsWide * cellSize - gap * 1.5;
      const brickH = studsHigh * cellSize - gap * 1.5;
      const studs = [];

      for (let sy = 0; sy < studsHigh; sy++) {
        for (let sx = 0; sx < studsWide; sx++) {
          studs.push({
            x: (sx + 0.5) * cellSize,
            y: (sy + 0.5) * cellSize
          });
        }
      }

      bricks.push({
        x: brickX,
        y: brickY,
        w: brickW,
        h: brickH,
        studs: studs,
        baseOffsetZ: 7,
        pressedOffsetZ: 1.5,
        currentOffsetZ: 7,
        color: random(brickPalette),
        seed: random(1000),
        hovered: false
      });
    }
  }
}

function drawPlate() {
  // dark background plate and gaps between bricks
  fill(plateColor);
  rect(0, 0, width, height);

  for (let i = 0; i < 90; i++) {
    fill(255, 255, 255, random(3, 10));
    rect(random(width), random(height), random(1, 2), random(1, 2));
  }
}

function updateBricks() {
  // hover detection and easing
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];

    brick.hovered =
      mouseX >= brick.x &&
      mouseX <= brick.x + brick.w &&
      mouseY >= brick.y &&
      mouseY <= brick.y + brick.h;

    const targetOffset = brick.hovered ? brick.pressedOffsetZ : brick.baseOffsetZ;
    brick.currentOffsetZ = lerp(brick.currentOffsetZ, targetOffset, pressEase);
  }
}

function drawBrick(brick) {
  // drawing a single brick body with 3D shading and pressed state
  const z = brick.currentOffsetZ;
  const topX = brick.x + (brick.baseOffsetZ - z) * 0.55;
  const topY = brick.y + (brick.baseOffsetZ - z) * 0.55;
  const bodyColor = brick.hovered ? lerpColor(brick.color, color(0), 0.12) : brick.color;
  const lightColor = lerpColor(bodyColor, color(255), 0.18);
  const darkColor = lerpColor(bodyColor, color(0), 0.36);
  const deeperColor = lerpColor(bodyColor, color(0), 0.55);

  noStroke();

  fill(0, 0, 0, 130);
  rect(brick.x + 4, brick.y + 6, brick.w, brick.h, 3);

  fill(deeperColor);
  rect(brick.x, brick.y + z, brick.w, brick.h, 3);

  fill(darkColor);
  rect(brick.x + 2, brick.y + brick.h * 0.72 + z, brick.w - 4, brick.h * 0.28, 3);

  fill(bodyColor);
  rect(topX, topY, brick.w, brick.h, 3);

  fill(lightColor);
  rect(topX + 3, topY + 3, brick.w - 6, 4, 3);

  fill(0, 0, 0, 28);
  rect(topX + 3, topY + brick.h - 6, brick.w - 6, 3, 2);

  drawBrickStuds(brick, topX, topY, bodyColor, lightColor, darkColor);
}

function drawBrickStuds(brick, topX, topY, bodyColor, lightColor, darkColor) {
  // drawing rounded studs with highlights and shadows
  for (let i = 0; i < brick.studs.length; i++) {
    const stud = brick.studs[i];
    const sx = topX + stud.x - gap;
    const sy = topY + stud.y - gap;
    const pressedDarken = brick.hovered ? 0.12 : 0;
    const studColor = lerpColor(bodyColor, color(0), pressedDarken);

    fill(0, 0, 0, 105);
    ellipse(sx + 3, sy + 4, studSize, studSize * 0.92);

    fill(darkColor);
    ellipse(sx, sy + 2, studSize, studSize);

    fill(studColor);
    ellipse(sx, sy, studSize, studSize);

    fill(lightColor);
    ellipse(sx - 3, sy - 4, studSize * 0.34, studSize * 0.2);

    fill(255, 255, 255, brick.hovered ? 18 : 34);
    ellipse(sx - 2, sy - 2, studSize * 0.72, studSize * 0.48);
  }
}