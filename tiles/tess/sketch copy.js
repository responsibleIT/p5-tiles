let flowfield;
let vehicles = [];
let debug = false;
let time = 0;

function setup() {
  createCanvas(400, 400);
  flowfield = new FlowField(15);
  
  // Create vehicles
  for (let i = 0; i < 800; i++) {
    vehicles.push(
      new Vehicle(
        random(width),
        random(height),
        // Even slower movement
        random(0.05, 0.25),
        // Much smaller steering force for very gentle turns
        random(0.0008, 0.005)
      )
    );
  }
}

function draw() {
  background(hslToRgb(210, 30, 12));
  
  time += 0.003;
  
  // Display the flowfield in debug mode
  if (debug) flowfield.show();
  
  // Check if hovering
  const isHovering =
    mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  
  // Tell all vehicles to follow the flow field
  for (let i = 0; i < vehicles.length; i++) {
    // Keep a bit of personal space so they don't flock tightly
    vehicles[i].separate(vehicles);
    // Subtle individuality + flow following
    vehicles[i].follow(flowfield);
    
    // Add repulsion when hovering
    if (isHovering) {
      vehicles[i].repel(createVector(mouseX, mouseY), 100);
    }
    
    vehicles[i].run();
  }
}

function keyPressed() {
  if (key == " ") {
    debug = !debug;
  }
}

function mousePressed() {
  flowfield.init();
}

// FlowField class
class FlowField {
  constructor(resolution) {
    this.resolution = resolution;
    this.cols = floor(width / resolution);
    this.rows = floor(height / resolution);
    this.vectors = [];
    this.init();
  }

  init() {
    // Wavy flow from top-right to bottom-left
    const baseAngle = (5 * PI) / 4;
    
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        // Create wave effect perpendicular to the main flow direction
        const wave = sin(x * 0.3) * 0.8 + cos(y * 0.2) * 0.5;
        const angle = baseAngle + wave;
        this.vectors[x + y * this.cols] = createVector(cos(angle), sin(angle));
      }
    }
  }

  lookup(lookup) {
    let col = constrain(
      floor(lookup.x / this.resolution),
      0,
      this.cols - 1
    );
    let row = constrain(
      floor(lookup.y / this.resolution),
      0,
      this.rows - 1
    );
    return this.vectors[col + row * this.cols].copy();
  }

  show() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        let index = x + y * this.cols;
        let v = this.vectors[index];
        stroke(hslToRgb(210, 20, 60));
        strokeWeight(1);
        drawArrowLine(
          x * this.resolution + this.resolution / 2,
          y * this.resolution + this.resolution / 2,
          v.x,
          v.y,
          5
        );
      }
    }
  }
}

function drawArrowLine(x, y, vx, vy, len) {
  let angle = atan2(vy, vx);
  stroke(hslToRgb(210, 20, 60));
  strokeWeight(1);
  let fromX = x - cos(angle) * len;
  let fromY = y - sin(angle) * len;
  let toX = x + cos(angle) * len;
  let toY = y + sin(angle) * len;
  line(fromX, fromY, toX, toY);
}

// Vehicle class
class Vehicle {
  constructor(x, y, maxSpeed, maxForce) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.size = 14;
    this.hue = 210 + random(-10, 10);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  follow(flowField) {
    let desired = flowField.lookup(this.position);
    desired.mult(this.maxSpeed);
    // Add a very subtle Perlin-noise-based angular offset for individuality
    const noiseAngle = map(noise(this.position.x * 0.01, this.position.y * 0.01, time), 0, 1, -PI / 36, PI / 36);
    desired.rotate(noiseAngle);

    let steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxForce);
    this.applyForce(steer);
  }

  repel(target, radius) {
    let distance = p5.Vector.dist(this.position, target);
    
    if (distance < radius) {
      // Create repel force
      let away = p5.Vector.sub(this.position, target);
      away.normalize();
      
      // Stronger the closer to mouse
      let strength = (radius - distance) / radius;
      away.mult(this.maxForce * strength * 2);
      
      this.applyForce(away);
    }
  }

  // Separation: small repulsive force from nearby vehicles
  separate(others) {
    const desiredSeparation = 12;
    let steer = createVector(0, 0);
    let count = 0;

    for (let i = 0; i < others.length; i++) {
      const other = others[i];
      if (other === this) continue;
      const d = p5.Vector.dist(this.position, other.position);
      if (d > 0 && d < desiredSeparation) {
        let diff = p5.Vector.sub(this.position, other.position);
        diff.normalize();
        diff.div(d); // weight by distance
        steer.add(diff);
        count++;
      }
    }

    if (count > 0) {
      steer.div(count);
      steer.normalize();
      steer.mult(this.maxSpeed);
      steer.sub(this.velocity);
      steer.limit(this.maxForce);
      this.applyForce(steer);
    }
  }

  run() {
    this.update();
    this.display();
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    
    // Wraparound
    if (this.position.x < 0) this.position.x = width;
    if (this.position.x > width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = height;
    if (this.position.y > height) this.position.y = 0;
  }

  display() {
    fill(hslToRgb(this.hue, 60, 50));
    noStroke();
    
    // Draw as colored triangle
    this.drawTriangle(this.position.x, this.position.y, this.size);
  }

  drawTriangle(x, y, size) {
    const h = size * 0.866;
    
    push();
    translate(x, y);
    
    // If you want them to point in the direction of motion, uncomment:
    // let angle = this.velocity.heading();
    // rotate(angle + PI / 2);
    
    // Upward pointing triangle
    triangle(
      0, -h / 2,
      -size / 2, h / 2,
      size / 2, h / 2
    );
    
    pop();
  }
}

function hslToRgb(h, s, l) {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return color(r * 255, g * 255, b * 255);
}