let triangles = [];
let noiseOffset = 0;

function setup() {
  createCanvas(400, 400, WEBGL);
  noStroke();
  smooth();
  noiseDetail(4, 0.5);
}

function draw() {
  background(20, 10, 30); // Dark atmospheric background
  translate(-width / 2, -height / 2, 0);

  // Add subtle grain/noise texture
  for (let i = 0; i < 100; i++) {
    fill(255, 255, 255, random(5, 15));
    ellipse(random(width), random(height), 1, 1);
  }

  // Draw and animate triangles
  for (let t of triangles) {
    t.update();
    t.display();
  }

  // Add new triangles over time
  if (frameCount % 10 === 0) {
    triangles.push(new Triangle(random(width), random(height)));
  }

  // Remove old triangles to optimize performance
  if (triangles.length > 200) {
    triangles.shift();
  }
}

class Triangle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.z = random(-200, 200);
    this.size = random(20, 80);
    this.color = color(random(200, 255), random(50, 100), random(150, 255), random(50, 150));
    this.offset = random(1000);
  }

  update() {
    let wave = sin(frameCount * 0.01 + this.offset) * 10;
    this.x += wave * 0.1;
    this.y += wave * 0.1;
    this.z += wave * 0.05;
  }

  display() {
    push();
    translate(this.x, this.y, this.z);
    fill(this.color);
    beginShape();
    vertex(0, -this.size);
    vertex(this.size, this.size);
    vertex(-this.size, this.size);
    endShape(CLOSE);
    pop();
  }
}

function mouseMoved() {
  // Add subtle parallax/ripple effect around the cursor
  for (let t of triangles) {
    let d = dist(mouseX, mouseY, t.x, t.y);
    if (d < 100) {
      t.x += (mouseX - t.x) * 0.02;
      t.y += (mouseY - t.y) * 0.02;
    }
  }
}