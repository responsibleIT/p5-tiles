// sketch.js
// Repeating triangular pattern inspired by the reference image.
// - Equilateral triangles tiled in a hex / diamond-like pattern
// - Soft color palette (orange, yellow, teal, mint, coral)
// - Slight transparency so overlaps feel soft
// - Click to regenerate with a different random arrangement

let triSide = 80; // length of one side of the triangle
let triHeight;    // computed from triSide
let palette;

function setup() {
  createCanvas(800, 500);
  colorMode(HSL, 360, 100, 100, 1);
  triHeight = triSide * sqrt(3) / 2;

  palette = [
    color( 32, 100, 60, 0.85),  // orange
    color( 45, 100, 70, 0.85),  // yellow
    color(180,  60, 70, 0.85),  // teal
    color(195,  55, 75, 0.85),  // light aqua
    color( 12,  80, 65, 0.85)   // soft red/coral
  ];

  noStroke();
  noLoop();
}

function draw() {
  background(190, 40, 90); // soft light background

  // We tile the canvas with equilateral triangles.
  // Every other row is horizontally offset to create the hex-like pattern.
  for (let row = -1; row <= height / triHeight + 2; row++) {
    const y = row * triHeight * 0.5; // vertical step is half the height (overlap)

    // Horizontal offset: every second row shifted by half a triangle
    const xOffset = (row % 2 === 0) ? 0 : triSide / 2;

    for (let col = -2; col <= width / triSide + 2; col++) {
      const x = col * triSide + xOffset;

      // choose orientation based on row+col for a regular pattern
      const pointingUp = (row + col) % 2 === 0;

      // pick a color from the palette with slight randomness
      const c = random(palette);
      fill(c);

      if (pointingUp) {
        drawUpTriangle(x, y);
      } else {
        drawDownTriangle(x, y);
      }
    }
  }
}

function drawUpTriangle(cx, cy) {
  // Centered up-pointing triangle
  const h = triHeight;
  const s = triSide;
  triangle(
    cx,         cy - h / 2, // top
    cx - s / 2, cy + h / 2, // bottom-left
    cx + s / 2, cy + h / 2  // bottom-right
  );
}

function drawDownTriangle(cx, cy) {
  // Centered down-pointing triangle
  const h = triHeight;
  const s = triSide;
  triangle(
    cx,         cy + h / 2, // bottom
    cx - s / 2, cy - h / 2, // top-left
    cx + s / 2, cy - h / 2  // top-right
  );
}

function mousePressed() {
  // Regenerate a new random color assignment
  redraw();
}