// Simple denim texture with vertical fade (400x400, static)

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
  noLoop();
}

function draw() {
  colorMode(RGB, 255);
  background(0);

  // Basis-kleuren: donker blauw boven, lichter onder
  let topCol    = color(20, 40, 80);
  let middleCol = color(60, 100, 150);
  let bottomCol = color(190, 210, 230);

  // Weef-schaal: hoe fijn de "draden" zijn
  let warpStep = 2; // verticaal
  let weftStep = 2; // horizontaal

  noStroke();

  // 1. Grote verticale gradient
  for (let y = 0; y < height; y++) {
    let ny = y / height;

    // van boven (topCol) naar midden (middleCol) en dan naar onder (bottomCol)
    let col;
    if (ny < 0.5) {
      col = lerpColor(topCol, middleCol, ny * 2.0);
    } else {
      col = lerpColor(middleCol, bottomCol, (ny - 0.5) * 2.0);
    }

    stroke(col);
    line(0, y, width, y);
  }

  // 2. Weefstructuur (warp = verticaal, weft = horizontaal)
  // Gebruik kleine variaties en noise om de "korrel" te krijgen

  // Verticale draden
  for (let x = 0; x < width; x += warpStep) {
    let t = x / width;
    let warpCol = lerpColor(color(200), color(0, 10, 40), 0.7);

    // lichte variatie per kolom
    let n = noise(x * 0.1);
    let delta = map(n, 0, 1, -20, 20);
    warpCol = color(
      red(warpCol) + delta,
      green(warpCol) + delta,
      blue(warpCol) + delta,
      30 // lage alpha, subtiel
    );

    stroke(warpCol);
    strokeWeight(1);
    line(x, 0, x, height);
  }

  // Horizontale draden
  for (let y = 0; y < height; y += weftStep) {
    let ny = y / height;
    let weftCol = lerpColor(color(255), color(30, 60, 100), 0.6);

    let n = noise(y * 0.12 + 100);
    let delta = map(n, 0, 1, -25, 25);
    weftCol = color(
      red(weftCol) + delta,
      green(weftCol) + delta,
      blue(weftCol) + delta,
      35 // lage alpha
    );

    stroke(weftCol);
    strokeWeight(1);
    line(0, y, width, y);
  }

  // 3. Extra verticale "fade" zoals de foto (center wat lichter)
  noStroke();
  for (let y = 0; y < height; y++) {
    let ny = y / height;
    let fade = constrain(map(ny, 0.2, 1.0, 0, 1), 0, 1);
    let overlay = color(220, 230, 240, 40 * fade);
    fill(overlay);
    rect(0, y, width, 1);
  }

  // 4. Film grain / ruis over alles
  addGrain(25);
}

// ------------------------------------------
// GRAIN: kleine variatie per pixel
// ------------------------------------------
function addGrain(strength) {
  loadPixels();
  let d = pixelDensity();
  let W = width * d;
  let H = height * d;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let idx = 4 * (y * W + x);
      let n = random(-strength, strength);

      pixels[idx]     = constrain(pixels[idx]     + n, 0, 255); // R
      pixels[idx + 1] = constrain(pixels[idx + 1] + n, 0, 255); // G
      pixels[idx + 2] = constrain(pixels[idx + 2] + n, 0, 255); // B
      // alpha (idx+3) laten we staan
    }
  }

  updatePixels();
}