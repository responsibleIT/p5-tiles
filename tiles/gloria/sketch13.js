// Abstract vertical stripes with glowing wave + grain
// Ref: purple / pink vertical ripple image

function setup() {
  createCanvas(1920, 1080); // Changed canvas size to 1920 x 1080
  pixelDensity(1);
  noLoop(); // één stilstaand beeld
}

function draw() {
  colorMode(RGB, 255);
  background(10);

  let stripeW = 8; // Adjusted stripe width to maintain proportionality

  let topPurple = color('#c8b3ff');
  let midPurple = color('#9a7fe0');
  let bottomPurple = color('#1a0024');

  let hot1 = color('#ff9a7a');
  let hot2 = color('#ff4f6a');

  noStroke();

  // -------------------------
  // VERTICALE RIBBELS + GLOED
  // -------------------------
  for (let x = 0; x < width; x += stripeW) {
    let cx = x + stripeW * 0.5; // midden van de ribbel

    for (let y = 0; y < height; y += 2) {
      let ny = y / height;

      // Basis paarse verticale gradient (drie‑staps)
      let baseCol;
      if (ny < 0.5) {
        baseCol = lerpColor(topPurple, midPurple, ny * 2.0);
      } else {
        baseCol = lerpColor(midPurple, bottomPurple, (ny - 0.5) * 2.0);
      }

      // Golvende "banden" waar warm licht zit
      // Eerste band (meer naar links)
      let center1 =
        width * 0.25 +
        sin(y * 0.008) * width * 0.18 +
        sin(y * 0.0025) * width * 0.10;

      // Tweede band (meer naar rechts)
      let center2 =
        width * 0.7 +
        sin(y * 0.006) * width * 0.20 +
        sin(y * 0.0018) * width * 0.12;

      let d1 = abs(cx - center1);
      let d2 = abs(cx - center2);

      // Hoe dichter bij de middenlijn, hoe feller.
      let glow1 = exp(-sq(d1) * 0.0006);
      let glow2 = exp(-sq(d2) * 0.0006);

      let glow = constrain(glow1 + glow2, 0, 1.3);

      // Meng warm rood/roze in de paarse basis
      let hotBlend = lerpColor(hot1, hot2, ny);
      let mixAmount = glow; // hoeveel warm licht erdoor komt
      let col = lerpColor(baseCol, hotBlend, mixAmount);

      // subtiele donkerte tussen de ribbels (ribbelstructuur)
      let stripeFactor = map(abs((cx % stripeW) - stripeW / 2), 0, stripeW / 2, 1.0, 0.7);
      col.setRed(col.levels[0] * stripeFactor);
      col.setGreen(col.levels[1] * stripeFactor);
      col.setBlue(col.levels[2] * stripeFactor);

      fill(col);
      rect(x, y, stripeW * 0.9, 2);
    }
  }

  // -------------------------
  // FILM GRAIN / RUIS
  // -------------------------
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let n = random(-25, 25); // sterkte van de ruis
    pixels[i]   = constrain(pixels[i]   + n, 0, 255); // R
    pixels[i+1] = constrain(pixels[i+1] + n, 0, 255); // G
    pixels[i+2] = constrain(pixels[i+2] + n, 0, 255); // B
    // alpha (pixels[i+3]) laten we zoals het is
  }
  updatePixels();
}