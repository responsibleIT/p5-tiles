// HvA Driehoeken Simulatie – p5.js sketch
// Canvas: 500x500
// Hover → DVD-bounce modus | Geen hover → zweef naar rechts

const triangleDefs = [
  { r: 255, g: 255, b: 255, size: 90  }, // wit   (groot)
  { r: 200, g: 35,  b: 35,  size: 70  }, // rood
  { r: 18,  g: 18,  b: 18,  size: 60  }, // zwart
  { r: 15,  g: 25,  b: 95,  size: 115 }, // donkerblauw (groot)
  { r: 230, g: 195, b: 0,   size: 34  }, // geel  (klein)
  { r: 105, g: 25,  b: 105, size: 24  }, // paars (klein)
  { r: 210, g: 100, b: 100, size: 20  }, // roze  (klein)
];

let triangles = [];
let isHovering = false;

class Triangle {
  constructor(def) {
    this.col  = color(def.r, def.g, def.b);
    this.size = def.size;
    this.x = random(-200, 150);
    this.y = random(40, 460);
    this.vx = random(0.6, 1.6);
    this.vy = 0;
    this.driftTimer = random(0, 300);
    this.dvdVx = (random() > 0.5 ? 1 : -1) * random(1.8, 3.2);
    this.dvdVy = (random() > 0.5 ? 1 : -1) * random(1.8, 3.2);
  }

  drawShape() {
    let s = this.size;
    triangle(
      this.x - s * 0.58, this.y - s * 0.52,
      this.x - s * 0.58, this.y + s * 0.52,
      this.x + s * 0.52, this.y
    );
  }

  updateDrift() {
    this.driftTimer++;
    this.vy  = sin(this.driftTimer * 0.013) * 0.75;
    this.vx  = lerp(this.vx, 1.3, 0.025);
    this.x  += this.vx;
    this.y  += this.vy;
    if (this.x - this.size > width) {
      this.x = -this.size;
      this.y = random(40, 460);
      this.vx = random(0.6, 1.4);
      this.driftTimer = random(0, 300);
    }
  }

  updateDVD() {
    this.x += this.dvdVx;
    this.y += this.dvdVy;
    const h = this.size * 0.58;
    if (this.x + h >= width)  { this.x = width  - h; this.dvdVx *= -1; }
    if (this.x - h <= 0)      { this.x = h;           this.dvdVx *= -1; }
    if (this.y + h >= height) { this.y = height - h;  this.dvdVy *= -1; }
    if (this.y - h <= 0)      { this.y = h;           this.dvdVy *= -1; }
  }

  draw() {
    noStroke();
    fill(this.col);
    this.drawShape();
  }
}

function setup() {
  let cnv = createCanvas(500, 500);
  cnv.elt.addEventListener('mouseenter', () => { isHovering = true;  });
  cnv.elt.addEventListener('mouseleave', () => { isHovering = false; });
  for (let def of triangleDefs) triangles.push(new Triangle(def));
}

function draw() {
  background(isHovering ? color(12, 12, 12) : color(95, 95, 105));

  // Subtiele HvA gridlijnen
  stroke(255, 255, 255, 18);
  strokeWeight(0.6);
  for (let i = 0; i <= 500; i += 62.5) {
    line(i, 0, i, 500);
    line(0, i, 500, i);
  }

  for (let t of triangles) {
    isHovering ? t.updateDVD() : t.updateDrift();
    t.draw();
  }

  // Modus-label
  noStroke();
  fill(255, 255, 255, isHovering ? 180 : 60);
  textSize(11);
  textFont('monospace');
  text(isHovering ? '⟳ DVD mode' : '▶ drift mode', 10, 490);
}