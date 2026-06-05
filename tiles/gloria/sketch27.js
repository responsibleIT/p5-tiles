const canvasSize = 400;

let bgColor;
let primaryColor;
let accentColor;
let shadowColor;

let focalX;
let focalY;
let targetX;
let targetY;

const ringCount = 24;
const baseDotsPerRing = 22;
const maxRadius = 215;
const easing = 0.075;

function setup() {
  // setup
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  noStroke();

  bgColor = color("#FFF7E8");
  primaryColor = color("#102A83");
  accentColor = color("#D10073");
  shadowColor = color("#061044");

  focalX = width / 2;
  focalY = height / 2;
  targetX = focalX;
  targetY = focalY;
}

function draw() {
  // animation update
  const t = frameCount * 0.018;
  const hover = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  background(bgColor);

  // hover interaction logic
  if (hover) {
    targetX = lerp(width / 2, mouseX, 0.48);
    targetY = lerp(height / 2, mouseY, 0.48);
  } else {
    targetX = width / 2 + cos(t * 0.62) * 22;
    targetY = height / 2 + sin(t * 0.49) * 22;
  }

  focalX = lerp(focalX, targetX, easing);
  focalY = lerp(focalY, targetY, easing);

  // soft central glow to make the tunnel feel illuminated
  for (let g = 8; g > 0; g--) {
    const glowSize = g * 38 + sin(t * 1.4) * 5;
    fill(255, 247, 232, 18);
    ellipse(focalX, focalY, glowSize, glowSize);
  }

  // drawing rings/lines
  for (let r = ringCount; r >= 1; r--) {
    const ringRatio = r / ringCount;
    const radiusPulse = sin(t * 2.1 - r * 0.55) * 5.5;
    const radius = ringRatio * maxRadius + radiusPulse;
    const dotCount = floor(baseDotsPerRing + r * 5.2);
    const rotation = t * (0.22 + ringRatio * 0.75) + r * 0.23;
    const spiralTwist = sin(t * 0.85 + r * 0.37) * 0.26;

    for (let i = 0; i < dotCount; i++) {
      const a = TWO_PI * (i / dotCount) + rotation + spiralTwist * r;
      const wave = sin(i * 0.72 + r * 0.9 - t * 3.1);
      const ripple = cos(a * 5 + t * 2.4 + r) * 6.5;
      const warpedRadius = radius + wave * 4.5 + ripple;

      const mousePull = hover ? dist(mouseX, mouseY, focalX, focalY) * 0.006 : 0;
      const distortion = sin(a * 3 - t * 2.2) * mousePull * r;

      const x = focalX + cos(a) * (warpedRadius + distortion);
      const y = focalY + sin(a) * (warpedRadius - distortion);

      const depthScale = map(ringRatio, 0, 1, 0.45, 1.35);
      const shimmer = map(sin(t * 3.4 + i * 0.37 + r), -1, 1, 0.72, 1.22);
      const dotSize = (3.2 + ringRatio * 5.2) * depthScale * shimmer;

      const colorMix = (i + r) % 2 === 0 ? primaryColor : accentColor;
      const alpha = map(ringRatio, 0, 1, 230, 255);

      fill(red(shadowColor), green(shadowColor), blue(shadowColor), 28);
      ellipse(x + 1.8, y + 1.8, dotSize * 1.12, dotSize * 1.12);

      fill(red(colorMix), green(colorMix), blue(colorMix), alpha);
      ellipse(x, y, dotSize, dotSize);

      if ((i + r) % 7 === 0) {
        fill(255, 247, 232, 65);
        ellipse(x - dotSize * 0.17, y - dotSize * 0.17, dotSize * 0.32, dotSize * 0.32);
      }
    }
  }

  // thin alternating spiral threads add extra optical vibration
  for (let s = 0; s < 2; s++) {
    const threadColor = s === 0 ? primaryColor : accentColor;
    fill(red(threadColor), green(threadColor), blue(threadColor), 185);

    for (let i = 0; i < 135; i++) {
      const n = i / 135;
      const a = n * TWO_PI * 9.5 + t * (s === 0 ? 0.95 : -0.82) + s * PI;
      const radius = n * maxRadius * 0.94 + sin(t * 2.5 + i * 0.2) * 3;
      const x = focalX + cos(a) * radius;
      const y = focalY + sin(a) * radius;
      const size = map(n, 0, 1, 1.4, 3.5);

      ellipse(x, y, size, size);
    }
  }
}