// sketch.js
// Horizontal snake-like triangle pattern.
// - Triangles are left-pointing.
// - Rows move horizontally only (no vertical motion).
// - Even rows move left->right, odd rows right->left (snake effect).
// - Triangles are placed and sized to overlap so no background is visible.
// - Transparent canvas background (page shows through), but triangles
//   visually cover the canvas.
// - NEW: When hovering over the canvas, all rows reverse direction.

let triangles = [];
const ROWS = 8;
const TRI_PER_ROW = 20;
const NUM_TRIANGLES = ROWS * TRI_PER_ROW;
const SCROLL_SPEED = 2.0;
const TRI_SIZE = 120; // base triangle size (controls coverage density)

function setup() {
  createCanvas(1200, 400);
  noCursor();
  colorMode(HSB, 360, 100, 100, 100);

  // Make the canvas background transparent so the page shows through
  const c = document.querySelector('canvas');
  if (c) {
    c.style.backgroundColor = 'transparent';
  }

  // Vertical spacing: smaller than triangle height so rows overlap
  const rowHeight = TRI_SIZE * 0.5; // triangle height ≈ 1.4 * TRI_SIZE
  // Horizontal spacing: smaller than triangle width so they overlap
  const spacingX = TRI_SIZE * 0.7;

  // Center the band of rows vertically
  const totalHeight = rowHeight * (ROWS - 1);
  const startY = height / 2 - totalHeight / 2;

  let index = 0;
  for (let r = 0; r < ROWS; r++) {
    const y = startY + r * rowHeight;
    for (let k = 0; k < TRI_PER_ROW; k++) {
      const baseX = k * spacingX - width * 0.3; // some start off-screen for seamless wrap

      triangles[index] = {
        x: baseX,
        y: y,
        row: r,
        // Base direction for this row (snake pattern)
        baseDir: (r % 2 === 0) ? 1 : -1,
        baseHue: random(0, 360)
      };
      index++;
    }
  }
}

function draw() {
  const mouseInside =
    mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  // Fully transparent background (no solid rect),
  // triangles themselves cover the area by overlapping.
  clear();

  for (let i = 0; i < NUM_TRIANGLES; i++) {
    const t = triangles[i];

    // Determine current direction: flip when hovering over canvas
    const dir = mouseInside ? -t.baseDir : t.baseDir;

    // Horizontal movement only (snake rows)
    t.x += dir * SCROLL_SPEED;

    // Wrap around horizontally according to current direction
    if (dir > 0 && t.x - TRI_SIZE > width) {
      t.x = -TRI_SIZE;
    } else if (dir < 0 && t.x + TRI_SIZE < 0) {
      t.x = width + TRI_SIZE;
    }

    const x = t.x;
    const y = t.y;

    // COLOR WAVE along horizontal direction
    const phase = (x / width) * TWO_PI * 2 + frameCount * 0.03; // 2 waves across width
    const wave = sin(phase);

    let hue = (t.baseHue + wave * 50 + frameCount * 0.2) % 360;
    let sat = 85;
    let bri = 95;

    // Invert hue if mouse is over the canvas
    if (mouseInside) {
      hue = (hue + 180) % 360;
    }

    push();
    translate(x, y);

    noStroke();
    // Alpha 100 so overlapping triangles fully cover the background visually
    fill(hue, sat, bri, 100);
    const s = TRI_SIZE;

    // Left-pointing triangle
    // Tip on the left, wide base on the right
    triangle(
      -s, 0,          // left tip
       s, -0.7 * s,   // top-right
       s,  0.7 * s    // bottom-right
    );

    pop();
  }
}

// Optional: click to randomize base hues (changes the color pattern)
function mousePressed() {
  for (let t of triangles) {
    t.baseHue = random(0, 360);
  }
}