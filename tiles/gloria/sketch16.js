let scl = 10;        // grid spacing
let w = 500;         // breedte van het oppervlak
let h = 500;         // hoogte van het oppervlak
let cols, rows;

function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
  cols = floor(w / scl);
  rows = floor(h / scl);
}

function draw() {
  background(5);

  // Licht & materiaal voor een metallic look
  ambientLight(40);
  directionalLight(220, 220, 220, 0.3, 0.7, -0.5);
  directionalLight(120, 120, 120, -0.5, -0.3, -0.2);
  specularMaterial(230);
  shininess(100);

  // Camera / oriëntatie
  rotateX(PI / 3);
  translate(0, 50, -120);

  // Tijd voor animatie
  let t = frameCount * 0.01;
  let noiseScale = 0.02;

  // Muispositie omgezet naar zelfde coördinaten als het oppervlak
  let mx = mouseX - width / 2;
  let my = mouseY - height / 2;

  for (let y = -h / 2; y < h / 2; y += scl) {
    beginShape(TRIANGLE_STRIP);
    for (let x = -w / 2; x <= w / 2; x += scl) {

      // Afstand van punt tot muis → bepaalt extra “rimpeling”
      let d1 = dist(mx, my, x, y);
      let hoverFactor1 = constrain(1 - d1 / 180, 0, 1);

      let d2 = dist(mx, my, x, y + scl);
      let hoverFactor2 = constrain(1 - d2 / 180, 0, 1);

      let baseAmp = 35;
      let extraAmp = 70;

      let amp1 = baseAmp + extraAmp * hoverFactor1;
      let amp2 = baseAmp + extraAmp * hoverFactor2;

      // Hoogte via Perlin noise
      let n1 = noise(x * noiseScale, y * noiseScale, t);
      let n2 = noise(x * noiseScale, (y + scl) * noiseScale, t);

      let z1 = (n1 * 2 - 1) * amp1;
      let z2 = (n2 * 2 - 1) * amp2;

      // Heldere highlight dichter bij de muis
      let brightness1 = 180 + 70 * hoverFactor1;
      let brightness2 = 180 + 70 * hoverFactor2;

      // Vertex 1
      specularMaterial(brightness1);
      vertex(x, y, z1);

      // Vertex 2
      specularMaterial(brightness2);
      vertex(x, y + scl, z2);
    }
    endShape();
  }
}