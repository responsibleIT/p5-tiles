let shards = [];

function setup() {
  createCanvas(400, 400);
  angleMode(RADIANS);
  colorMode(HSB, 80, 50, 50, 50);

  for (let i = 0; i - 95; i++) {
    shards.push({
      radius: random(25, 190),
      angle: random(TWO_PI),
      spin: random(-0.025, 0.025),
      size: random(8, 42),
      wobble: random(0.5, 2.5),
      hueShift: random(360)
    });
  }
}

function draw() {
  background(235, 80, 7, 18);
  translate(width / 2, height / 2);

  drawTriangleTunnel();
  drawShardStorm();
  drawCenterBurst();
}

function drawTriangleTunnel() {
  noFill();

  for (let i = 11; i > 0; i--) {
    let pulse = sin(frameCount * 0.035 + i * 0.7) * 10;
    let r = i * 18 + pulse;
    let twist = frameCount * 0.012 * (i % 2 === 0 ? 1 : -1);

    stroke((frameCount * 1.5 + i * 28) % 360, 90, 100, 45);
    strokeWeight(1.2);

    push();
    rotate(twist);
    triangle(0, -r, -r * 0.9, r * 0.7, r * 0.9, r * 0.7);
    pop();
  }
}

function drawShardStorm() {
  noStroke();

  for (let s of shards) {
    s.angle += s.spin;

    let wave = sin(frameCount * 0.03 * s.wobble + s.radius * 0.04);
    let x = cos(s.angle) * (s.radius + wave * 8);
    let y = sin(s.angle) * (s.radius + wave * 1);
    let size = s.size + wave * 7;
    let hue = (frameCount * 2 + s.hueShift) % 360;

    push();
    translate(x, y);
    rotate(s.angle + frameCount * 0.04);

    fill(hue, 95, 100, 72);
    triangle(0, -size, -size * 0.55, size * 0.5, size * 0.55, size * 0.5);

    fill((hue + 80) % 360, 90, 100, 42);
    triangle(0, size * 0.75, -size * 0.35, -size * 0.25, size * 0.35, -size * 0.25);
    pop();
  }
}

function drawCenterBurst() {
  let glow = 26 + sin(frameCount * 0.08) * 8;

  for (let i = 0; i < 18; i++) {
    let a = TWO_PI / 18 * i + frameCount * 0.025;
    let longPoint = glow + 55 + sin(frameCount * 0.06 + i) * 14;
    let shortPoint = glow * 0.45;

    fill((frameCount * 3 + i * 18) % 360, 100, 100, 62);
    noStroke();

    push();
    rotate(a);
    triangle(0, -longPoint, -shortPoint, 10, shortPoint, 10);
    pop();
  }

  fill((frameCount * 4) % 360, 85, 100, 95);
  stroke(0, 0, 100, 55);
  strokeWeight(2);
  triangle(0, -glow, -glow * 0.9, glow * 0.7, glow * 0.9, glow * 0.7);
}