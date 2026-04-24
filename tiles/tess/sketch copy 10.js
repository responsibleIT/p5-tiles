// sketch.js
// Right-pointing triangle pattern in blue tints that scrolls smoothly to the RIGHT
// and loops seamlessly after moving the width of EXACTLY 3 triangles.

let triSide = 80;   // vertical extent of each triangle
let triWidth;       // horizontal extent (distance tip <-> base center)
let palette;
let colorPhase = 0; // optional offset you can change on click

let offsetX = 0;         // horizontal scroll offset in pixels
let scrollSpeed = 0.3;   // movement speed to the right

function setup() {
  createCanvas(800, 500);
  colorMode(HSL, 360, 100, 100, 1);

  // For an equilateral triangle of side triSide, its "height" is
  // triSide * sqrt(3) / 2. When rotated, we use that as the width.
  triWidth = triSide * sqrt(3) / 2;

  // Different blue tints
  palette = [
    color(195, 90, 65, 0.75),  // bright sky blue
    color(205, 80, 55, 0.75),  // medium blue
    color(215, 75, 45, 0.75),  // deeper blue
    color(185, 60, 70, 0.85),  // cyan-ish blue
    color(225, 40, 35, 0.85)   // dark desaturated blue
  ];

  noStroke();
}

function draw() {
  // very light bluish background
  background(195, 40, 93);

  const stepX = triWidth * 0.5; // horizontal step between columns (centers)
  const stepY = triSide * 0.5;  // vertical step between rows

  // We want the animation to fully repeat after the pattern moves
  // exactly the width of 3 triangles: 3 * triWidth = 6 * stepX
  const periodCols = 6;               // number of column steps per loop
  const periodX = periodCols * stepX; // distance for one full loop

  // Scroll visually to the RIGHT by increasing offsetX.
  // Wrap after 3 triangles so the loop is seamless.
  offsetX += scrollSpeed;
  if (offsetX >= periodX) {
    offsetX -= periodX;
  }

  const extraCols = periodCols + 2;
  const extraRows = 3;

  // 6-column color cycle; 6th repeats the first to match the loop period
  const colToPalette = [0, 1, 2, 3, 4, 0];

  for (let row = -extraRows; row <= height / stepY + extraRows; row++) {
    const y = row * stepY;

    // Stagger every second row for a woven / diagonal feel
    const xOffset = (row % 2 === 0) ? 0 : stepX * 0.5;

    for (let col = -extraCols; col <= width / stepX + extraCols; col++) {
      // Color depends only on (row, col) in a 6-step cycle
      let k = (row + col + colorPhase) % periodCols;
      if (k < 0) k += periodCols;
      const paletteIndex = colToPalette[k];
      fill(palette[paletteIndex]);

      // Apply scrolling to x-position (positive offsetX moves triangles right)
      const x = col * stepX + xOffset + offsetX;

      drawRightTriangle(x, y);
    }
  }
}

function drawRightTriangle(cx, cy) {
  // Right-pointing equilateral triangle centered at (cx, cy).
  const w = triWidth;   // width (tip to base center)
  const h = triSide;    // total vertical extent

  triangle(
    cx + w * 0.5, cy,        // right tip
    cx - w * 0.5, cy - h / 2,  // top-left of base
    cx - w * 0.5, cy + h / 2   // bottom-left of base
  );
}

function mousePressed() {
  // Optional: shift the color phase while preserving seamless looping.
  colorPhase = (colorPhase + 1) % 6;
}