// Pool water caustics, 400x400
// Hover met de muis: extra licht + sparkle rond cursor

let t = 0; // tijd voor animatie

function setup() {
  createCanvas(400, 400);
  pixelDensity(1);
}

function draw() {
  t += 0.01;

  // --------------------------------
  // 1. Water achtergrond (blauwe gradient)
  // --------------------------------
  noFill();
  for (let y = 0; y < height; y++) {
    let ny = y / height;
    let cTop = color(10, 120, 170);
    let cBottom = color(0, 60, 110);
    let base = lerpColor(cTop, cBottom, ny);
    stroke(base);
    line(0, y, width, y);
  }

  // --------------------------------
  // 2. Caustics (lichtpatroon op de bodem)
  // --------------------------------
  let spacing = 7; // resolutie van het patroon
  strokeWeight(1.4);
  strokeCap(ROUND);

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      let nx = x * 0.04;
      let ny = y * 0.04;

      // Golven combineren met noise
      let wave1 = sin(nx + t * 3.0 + sin(ny * 2.0 + t));
      let wave2 = cos(ny + t * 2.0 + sin(nx * 2.0 - t));
      let noiseVal = (noise(nx * 0.8, ny * 0.8, t * 0.5) - 0.5) * 2.0;

      let v = (wave1 + wave2) * 0.5 + noiseVal * 0.7;
      let intensity = abs(v);       // hoe fel dit punt is
      let threshold = 0.55;         // wanneer we echt licht tekenen

      // Hover‑licht: versterk intensiteit rond de muis
      let d = dist(x, y, mouseX, mouseY);
      let hover = exp(-(d * d) / (2 * 60 * 60)); // radius ~60px
      intensity += hover * 0.9;

      if (intensity > threshold) {
        let a = map(intensity, threshold, 1.5, 80, 230);
        a = constrain(a, 80, 230);

        let c = color(220, 255, 255, a);
        stroke(c);

        // kleine “lijnsegmenten” i.p.v. losse punten
        let dx = spacing * 0.6 * wave1;
        let dy = spacing * 0.6 * wave2;
        line(x - dx * 0.5, y - dy * 0.5, x + dx * 0.5, y + dy * 0.5);
      }
    }
  }

  // --------------------------------
  // 3. Extra sparkle rond cursor
  // --------------------------------
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    push();
    blendMode(ADD);
    noStroke();
    for (let i = 0; i < 20; i++) {
      let ang = random(TWO_PI);
      let r = random(0, 35);
      let sx = mouseX + cos(ang) * r;
      let sy = mouseY + sin(ang) * r;

      let sparkleSize = random(2, 5);
      let alpha = random(150, 255);
      fill(250, 255, 255, alpha);
      ellipse(sx, sy, sparkleSize, sparkleSize);
    }
    pop();
  }

  // --------------------------------
  // 4. Heel lichte “mist” voor zachtere look
  // --------------------------------
  noStroke();
  fill(200, 240, 255, 20);
  rect(0, 0, width, height);
}