let shards = [];
let hoverStrength = 0;
const canvasSize = 400;
const cell = 10;

function setup() {
  createCanvas(canvasSize, canvasSize);
  pixelDensity(2);
  colorMode(HSL, 360, 100, 100, 1);
  noStroke();

  for (let y = -cell; y < height + cell; y += cell) {
    for (let x = -cell; x < width + cell; x += cell) {
      const flip = (x / cell + y / cell) % 2 === 0;
      const centerX = x + cell * 0.5;
      const centerY = y + cell * 0.5;
      const wave = noise(x * 0.018, y * 0.018);
      const hue = lerp(187, 314, wave);
      const light = lerp(27, 79, noise(x * 0.033 + 20, y * 0.033));

      shards.push({
        x,
        y,
        cx: centerX,
        cy: centerY,
        flip,
        hue,
        light,
        sat: lerp(54, 82, noise(x * 0.025, y * 0.025 + 90)),
        lift: random(0.2, 1),
        angle: random(TAU),
        ripple: random(0.55, 1.4)
      });
    }
  }
}

function draw() {
  background(218, 29, 12);

  const inside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  const targetHover = inside ? 1 : 0;
  hoverStrength = lerp(hoverStrength, targetHover, 0.08);

  drawSoftGlow();

  for (const shard of shards) {
    const d = dist(mouseX, mouseY, shard.cx, shard.cy);
    const influence = inside ? max(0, 1 - d / 115) * hoverStrength : 0;
    const pulse = sin(frameCount * 0.035 + shard.ripple * d * 0.08);
    const push = influence * (6 + pulse * 3) * shard.lift;
    const dx = cos(shard.angle) * push;
    const dy = sin(shard.angle) * push;
    const rotateTiny = influence * pulse * 0.18;
    const shimmer = influence * 10 + noise(shard.cx * 0.018, shard.cy * 0.018, frameCount * 0.003) * 7;

    fill(
      (shard.hue + influence * 28 + pulse * influence * 16) % 360,
      min(92, shard.sat + influence * 16),
      constrain(shard.light + shimmer, 18, 88),
      0.96
    );

    push();
    translate(shard.cx + dx, shard.cy + dy);
    rotate(rotateTiny);
    drawHiddenTriangle(shard);
    pop();
  }

  drawQuietVignette();
}

function drawHiddenTriangle(shard) {
  const s = cell * 1.18;
  const skew = noise(shard.cx * 0.05, shard.cy * 0.05) * 2.8 - 1.4;

  if (shard.flip) {
    triangle(
      -s * 0.55 + skew,
      -s * 0.5,
      s * 0.58,
      -s * 0.52 + skew * 0.35,
      -s * 0.08,
      s * 0.62
    );
  } else {
    triangle(
      -s * 0.58,
      s * 0.52 + skew * 0.35,
      s * 0.55 + skew,
      s * 0.5,
      s * 0.08,
      -s * 0.62
    );
  }
}

function drawSoftGlow() {
  for (let r = 190; r > 20; r -= 18) {
    const alpha = map(r, 190, 20, 0.02, 0.065);
    fill(178, 83, 62, alpha);
    ellipse(width * 0.34, height * 0.28, r * 1.2, r);

    fill(313, 74, 57, alpha * 0.7);
    ellipse(width * 0.76, height * 0.7, r, r * 1.15);
  }
}

function drawQuietVignette() {
  noFill();
  for (let i = 0; i < 24; i++) {
    stroke(224, 30, 8, map(i, 0, 23, 0.03, 0.16));
    strokeWeight(12);
    rect(i * 3, i * 3, width - i * 6, height - i * 6);
  }
  noStroke();
}