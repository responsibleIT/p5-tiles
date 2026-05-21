// HvA-driehoeken met PS4-achtige beweging en hover-zoom
// Sla dit op als bijvoorbeeld sketch.js en laad het in een HTML-pagina met p5.js.

let triangles = [];
const NUM_TRIANGLES = 18;

function setup() {
  createCanvas(500, 500);
  noStroke();

  // Maak een set driehoeken
  for (let i = 0; i < NUM_TRIANGLES; i++) {
    triangles.push(new HvATriangle());
  }
}

function draw() {
  // Donkere achtergrond, licht verloop-effect
  background(15, 15, 25);
  push();
  noStroke();
  for (let i = 0; i < height; i++) {
    let c = lerpColor(color(15, 15, 25), color(40, 40, 60), i / height);
    stroke(c);
    line(0, i, width, i);
  }
  pop();

  for (let t of triangles) {
    t.update();
    t.display();
  }
}

// Klasse voor een HvA-driehoek
class HvATriangle {
  constructor() {
    this.x = random(width);
    this.y = random(height);

    this.baseSize = random(25, 55);     // originele grootte
    this.scale = 1;                     // huidige schaal
    this.targetScale = 1;               // doel-schaal (1 normaal, >1 bij hover)

    // Langzame, zwevende snelheden zoals PS4-achtergrond
    this.vx = random(-0.4, 0.4);
    this.vy = random(-0.4, 0.4);

    // Kleine rotatie voor extra “float”
    this.angle = random(TWO_PI);
    this.rotationSpeed = random(-0.002, 0.002);

    // Kleuren geïnspireerd op HvA/voorbeelden
    const palette = [
      color(255, 255, 255),   // wit
      color(255, 230, 0),     // geel
      color(210, 0, 40),      // rood
      color(5, 30, 110)       // donkerblauw
    ];
    this.col = random(palette);

    this.alpha = random(140, 230);      // lichte transparantie
  }

  update() {
    // Beweging
    this.x += this.vx;
    this.y += this.vy;
    this.angle += this.rotationSpeed;

    // Zachte bounce tegen de randen
    const margin = 40;
    if (this.x < -margin || this.x > width + margin) this.vx *= -1;
    if (this.y < -margin || this.y > height + margin) this.vy *= -1;

    // Hover-detectie (benaderd met een cirkel rondom de driehoek)
    const d = dist(mouseX, mouseY, this.x, this.y);
    const hoverRadius = this.baseSize; // simpel, maar werkt goed genoeg
    if (d < hoverRadius) {
      this.targetScale = 1.9; // hoe groot bij hover
    } else {
      this.targetScale = 1.0;
    }

    // Smooth interpolatie richting targetScale
    this.scale = lerp(this.scale, this.targetScale, 0.15);
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    scale(this.scale);

    fill(red(this.col), green(this.col), blue(this.col), this.alpha);

    // HvA/“play”-driehoek naar rechts:
    // basisvorm wordt gecentreerd rond (0,0)
    const s = this.baseSize;
    const h = s * 0.9;

    // Linkerpunt boven, onder, rechterpunt midden
    triangle(
      -s * 0.5, -h * 0.5,   // links-boven
      -s * 0.5,  h * 0.5,   // links-onder
       s * 0.5,  0          // rechts-midden
    );

    pop();
  }
}