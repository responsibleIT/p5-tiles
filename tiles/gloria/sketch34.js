const canvasSize = 400;
const topHeight = 255;
const midHeight = 48;
const bottomHeight = 97;
const sliceCount = 52;
const hoverEase = 0.08;

let bars = [];
let middleBars = [];
let bottomBars = [];

let time = 0;
let glitchBase = 0.34;
let glitchStrength = glitchBase;
let glitchTarget = glitchBase;
let easedMouseX = 200;
let easedMouseY = 200;

function setup() {
  // setup and base color arrays
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  noStroke();

  bars = [
    color("#E8EFE8"),
    color("#FFF600"),
    color("#00E9E9"),
    color("#00EB18"),
    color("#F400F4"),
    color("#F20A0A"),
    color("#0715D8")
  ];

  middleBars = [
    color("#0715D8"),
    color("#101010"),
    color("#F400F4"),
    color("#101010"),
    color("#00E9E9"),
    color("#101010"),
    color("#E8EFE8")
  ];

  bottomBars = [
    color("#00325C"),
    color("#F3F3F3"),
    color("#3C0080"),
    color("#11110C"),
    color("#060606"),
    color("#191919")
  ];
}

function draw() {
  updateGlitch();
  background(0);
  drawGlitchedPattern();
  drawScanLines();
  drawNoiseOverlay();
}

function updateGlitch() {
  // animation update and hover interaction easing
  time = frameCount * 0.026;

  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;

  if (isHovering) {
    easedMouseX = lerp(easedMouseX, mouseX, hoverEase);
    easedMouseY = lerp(easedMouseY, mouseY, hoverEase);
    glitchTarget = map(easedMouseX, 0, width, 0.5, 1.35);
  } else {
    easedMouseX = lerp(easedMouseX, width / 2, hoverEase * 0.45);
    easedMouseY = lerp(easedMouseY, height / 2, hoverEase * 0.45);
    glitchTarget = glitchBase + sin(time * 0.85) * 0.13;
  }

  glitchStrength = lerp(glitchStrength, glitchTarget, hoverEase);
}

function drawGlitchedPattern() {
  // glitch effect math: draw the test card in horizontally shifted slices
  const sliceHeight = height / sliceCount;

  for (let i = 0; i < sliceCount; i++) {
    const y = i * sliceHeight;
    const hoverBand = 1 - constrain(abs(y - easedMouseY) / 105, 0, 1);
    const wave = sin(y * 0.07 + time * 3.2) * 7.5;
    const noiseShift = map(noise(i * 0.18, time * 0.9), 0, 1, -14, 14);
    const burst = random() < 0.055 * glitchStrength ? random(-38, 38) : 0;
    const xShift = (wave + noiseShift + burst) * glitchStrength * (1 + hoverBand * 1.3);

    push();
    translate(xShift, 0);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(-60, y, width + 120, sliceHeight + 1);
    drawingContext.clip();

    drawBasePattern(0);
    drawColorBleed(xShift * 0.16, y, sliceHeight, hoverBand);

    drawingContext.restore();
    pop();
  }
}

function drawBasePattern(xOffset) {
  // base clean TV pattern: top bars, middle blocks, bottom blocks
  const barW = width / bars.length;

  for (let i = 0; i < bars.length; i++) {
    fill(bars[i]);
    rect(xOffset + i * barW, 0, barW + 1, topHeight);
  }

  const midW = width / middleBars.length;

  for (let i = 0; i < middleBars.length; i++) {
    fill(middleBars[i]);
    rect(xOffset + i * midW, topHeight, midW + 1, midHeight);
  }

  const bottomW = width / bottomBars.length;

  for (let i = 0; i < bottomBars.length; i++) {
    fill(bottomBars[i]);
    rect(xOffset + i * bottomW, topHeight + midHeight, bottomW + 1, bottomHeight);
  }

  fill(0, 0, 0, 170);
  rect(xOffset, topHeight + midHeight - 6, width, 8);

  fill(245, 245, 245, 210);
  rect(xOffset + width * 0.16, topHeight + midHeight, width * 0.18, bottomHeight);

  fill(54, 0, 120, 220);
  rect(xOffset + width * 0.34, topHeight + midHeight, width * 0.2, bottomHeight);

  fill(5, 5, 5, 225);
  rect(xOffset + width * 0.54, topHeight + midHeight, width * 0.46, bottomHeight);
}

function drawColorBleed(xOffset, y, sliceHeight, hoverBand) {
  // subtle RGB-style misregistration and bright glitch streaks
  blendMode(ADD);

  const intensity = glitchStrength * (0.35 + hoverBand * 0.65);
  const streakChance = 0.022 + intensity * 0.035;

  if (random() < streakChance) {
    fill(0, 255, 255, 45 + intensity * 45);
    rect(xOffset - random(12, 45), y, random(55, 150), sliceHeight + random(1, 5));

    fill(255, 0, 90, 35 + intensity * 50);
    rect(xOffset + random(120, 360), y + random(-2, 2), random(35, 125), sliceHeight + random(1, 5));
  }

  if (random() < 0.018 + intensity * 0.025) {
    fill(255, 255, 255, 28 + intensity * 40);
    rect(xOffset + random(-20, width), y, random(18, 90), sliceHeight + 1);
  }

  blendMode(BLEND);
}

function drawScanLines() {
  // horizontal scanlines keep the analog TV feeling clear
  for (let y = 0; y < height; y += 3) {
    const alpha = 22 + sin(y * 0.13 + time * 5.0) * 8;
    fill(0, 0, 0, alpha);
    rect(0, y, width, 1);
  }

  const rollY = (time * 46) % height;
  fill(255, 255, 255, 18);
  rect(0, rollY, width, 3);

  fill(0, 0, 0, 32);
  rect(0, rollY + 4, width, 9);
}

function drawNoiseOverlay() {
  // transparent static texture over the whole signal
  const noiseAmount = floor(900 + glitchStrength * 900);

  for (let i = 0; i < noiseAmount; i++) {
    const x = random(width);
    const y = random(height);
    const bright = random() > 0.5 ? 255 : 0;
    const alpha = random(10, 42 + glitchStrength * 28);

    fill(bright, bright, bright, alpha);
    rect(x, y, random(0.7, 2.6), random(0.7, 2.2));
  }

  if (random() < 0.08 * glitchStrength) {
    fill(255, 255, 255, 38);
    rect(0, random(height), width, random(1, 4));
  }
}