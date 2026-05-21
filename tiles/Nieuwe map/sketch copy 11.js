// HvA driehoeken in een PS4-achtige achtergrondbeweging.
// Canvas: 500x500. Hover over het canvas voor de animatie.

const CANVAS_SIZE = 500;
const TRIANGLE_COUNT = 34;

let hvaTriangles = [];
let hoverStrength = 0;

function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  angleMode(RADIANS);
  noStroke();

  for (let i = 0; i < TRIANGLE_COUNT; i++) {
    hvaTriangles.push(new HavaTriangle(i));
  }
}

function draw() {
  hoverStrength = lerp(hoverStrength, isMouseInsideCanvas() ? 1 : 0, 0.08);

  drawPlaystationBackground();
  drawSoftWaves();

  for (const triangleShape of hvaTriangles) {
    triangleShape.update();
    triangleShape.display();
  }

  drawHoverRipple();
}

class HavaTriangle {
  constructor(index) {
    this.index = index;
    this.layer = random([0, 1, 2]);
    this.size = random(26, 86) + this.layer * 12;
    this.x = random(-120, width + 120);
    this.y = random(-40, height + 40);
    this.baseY = this.y;
    this.speed = random(0.18, 0.52) + this.layer * 0.09;
    this.phase = random(TWO_PI);
    this.waveHeight = random(16, 54);
    this.alpha = random(52, 150) - this.layer * 10;
    this.rotation = random(-0.22, 0.22);
    this.targetRotation = this.rotation;
    this.gray = random(120, 215);
    this.hoverPulse = 0;
  }

  update() {
    const time = frameCount * 0.016;

    this.x += this.speed + hoverStrength * 0.35;
    this.y = this.baseY + sin(time + this.phase + this.x * 0.012) * this.waveHeight;

    if (this.x > width + this.size + 120) {
      this.x = -this.size - random(30, 130);
      this.baseY = random(-30, height + 30);
      this.phase = random(TWO_PI);
    }

    const d = dist(mouseX, mouseY, this.x, this.y);
    const isClose = isMouseInsideCanvas() && d < this.size * 1.45;
    this.hoverPulse = lerp(this.hoverPulse, isClose ? 1 : 0, 0.18);

    const orbit = sin(time * 2 + this.phase) * 0.05;
    const hoverSpin = this.hoverPulse * sin(frameCount * 0.22 + this.index) * 0.42;
    this.targetRotation = -0.08 + orbit + hoverSpin;
    this.rotation = lerp(this.rotation, this.targetRotation, 0.08);

    if (isClose) {
      const pushX = (this.x - mouseX) * 0.015;
      const pushY = (this.y - mouseY) * 0.015;
      this.x += pushX;
      this.baseY += pushY;
    }
  }

  display() {
    const depthBlur = this.layer * 10;
    const scalePulse = 1 + this.hoverPulse * 0.32 + hoverStrength * 0.03;
    const glowAlpha = 28 + this.hoverPulse * 95;
    const triangleAlpha = this.alpha + this.hoverPulse * 90;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    scale(scalePulse);

    drawingContext.shadowColor = `rgba(255, 255, 255, ${0.1 + this.hoverPulse * 0.45})`;
    drawingContext.shadowBlur = depthBlur + this.hoverPulse * 28;

    fill(255, 255, 255, glowAlpha);
    drawHvaTriangle(this.size * 1.22);

    drawingContext.shadowBlur = 0;
    fill(this.gray + this.hoverPulse * 35, triangleAlpha);
    drawHvaTriangle(this.size);

    fill(255, 255, 255, 22 + this.hoverPulse * 42);
    drawHvaTriangle(this.size * 0.64);

    pop();
  }
}

function drawHvaTriangle(s) {
  triangle(
    -s * 0.54, -s * 0.60,
    -s * 0.54, s * 0.60,
    s * 0.58, 0
  );
}

function drawPlaystationBackground() {
  const topColor = color(10, 21, 49);
  const middleColor = color(35, 87, 138);
  const bottomColor = color(7, 13, 35);

  for (let y = 0; y < height; y++) {
    const amount = y / (height - 1);
    const backgroundColor = amount < 0.55
      ? lerpColor(topColor, middleColor, amount / 0.55)
      : lerpColor(middleColor, bottomColor, (amount - 0.55) / 0.45);

    stroke(backgroundColor);
    line(0, y, width, y);
  }
}

function drawSoftWaves() {
  noFill();

  for (let wave = 0; wave < 5; wave++) {
    const yBase = 110 + wave * 72;
    const alpha = 22 + wave * 5 + hoverStrength * 20;

    stroke(255, 255, 255, alpha);
    strokeWeight(1.2 + wave * 0.2);
    beginShape();

    for (let x = -30; x <= width + 30; x += 12) {
      const y = yBase
        + sin(x * 0.018 + frameCount * 0.012 + wave) * (20 + wave * 4)
        + cos(x * 0.011 - frameCount * 0.008 + wave) * 12;
      curveVertex(x, y);
    }

    endShape();
  }

  noStroke();
  fill(255, 255, 255, 10 + hoverStrength * 12);
  triangle(0, 0, width, 0, 0, height);
}

function drawHoverRipple() {
  if (hoverStrength < 0.02) return;

  noFill();
  stroke(255, 255, 255, 70 * hoverStrength);
  strokeWeight(1);

  for (let i = 0; i < 3; i++) {
    const rippleSize = 34 + i * 24 + sin(frameCount * 0.08 + i) * 8;
    circle(mouseX, mouseY, rippleSize);
  }
}

function isMouseInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}
