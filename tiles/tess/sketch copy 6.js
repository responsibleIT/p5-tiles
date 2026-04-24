// sketch.js
// Triangle pattern that scrolls from left to right in a repeating color wave.
// When the mouse is over the canvas, the leading triangle follows the mouse
// and colors are hue-inverted ("invert colors").

let triangles = [];
const NUM_TRIANGLES = 40;
let scrollOffset = 0;
const SCROLL_SPEED = 1.5; // horizontal movement speed

function setup() {
  createCanvas(1200, 400);
  noCursor();
  colorMode(HSB, 360, 100, 100, 100);

  // Create base positions and hues for the pattern
  for (let i = 0; i < NUM_TRIANGLES; i++) {
    triangles.push({
      x: random(width),      // base x (before scrolling)
      y: random(height),     // base y
      size: random(30, 120),
      angle: random(TWO_PI),
      rotSpeed: random(-0.02, 0.02),
      baseHue: random(0, 360) // base hue for color wave
    });
  }
}

function draw() {
  const mouseInside =
    mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  // Background: dark when idle, light when mouse over (visual inversion)
  if (mouseInside) {
    background(0, 0, 95);    // light
  } else {
    background(240, 40, 10); // dark
  }

  // Scroll the pattern horizontally from left to right
  scrollOffset += SCROLL_SPEED;

  // Draw all triangles
  for (let i = 0; i < triangles.length; i++) {
    const t = triangles[i];

    let x, y;

    if (mouseInside && i === 0) {
      // Leading triangle follows the mouse
      x = mouseX;
      y = mouseY;
    } else {
      // Other triangles scroll from left to right and repeat
      const span = width + t.size * 2; // extra space for smooth wrap
      x = ((t.x + scrollOffset) % span) - t.size;

      // Slight vertical wave motion for more organic feel
      const waveY =
        sin((t.x + scrollOffset) * 0.01 + frameCount * 0.03);
      y = t.y + waveY * 20;
    }

    // Update rotation
    t.angle += t.rotSpeed;

    // COLOR WAVE
    // Wave based on x-position plus time
    const phase = (x / width) * TWO_PI * 2 + frameCount * 0.05; // 2 waves across width
    const wave = sin(phase);

    let hue = (t.baseHue + wave * 60 + frameCount * 0.3) % 360;
    let sat = 80;
    let bri = 90;

    // Invert colors (hue shift) when mouse is over the canvas
    if (mouseInside) {
      hue = (hue + 180) % 360; // hue inversion
    }

    push();
    translate(x, y);
    rotate(t.angle);

    noStroke();
    fill(hue, sat, bri, 90);
    const s = t.size;

    // All shapes are TRIANGLES
    triangle(
      0, -s * 0.6,        // top
      -s * 0.6, s * 0.6,  // bottom left
      s * 0.6, s * 0.6    // bottom right
    );
    pop();
  }
}

// Optional: click to randomize base hues of all triangles
function mousePressed() {
  for (let t of triangles) {
    t.baseHue = random(0, 360);
  }
}