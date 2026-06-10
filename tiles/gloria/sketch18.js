var folds = [];
var hoverAmount = 0;
var shadeOptions = [
  color('#4E2A1E'), // Deep chocolate brown
  color('#8A4A2A'), // Warm red-brown
  color('#C06733'), // Burnt orange
  color('#E59B5E'), // Soft peach/orange
  color('#F3D8A3'), // Creamy beige
  color('#A79FA0'), // Medium warm gray
  color('#CBC4C3'), // Light gray
  color('#2E2626')  // Dark charcoal outline
];

function setup() {
  createCanvas(1920, 1080);
  pixelDensity(2);
  noStroke();

  for (var i = 0; i < 120; i++) {
    var layer = floor(random(5));
    var shadeIndex = floor(random(shadeOptions.length));

    folds.push({
      x: random(-30, width + 30),
      y: random(-30, height + 30),
      size: random(18, 62) - layer * 4,
      angle: random(TWO_PI),
      shade: shadeOptions[shadeIndex],
      layer: layer,
      drift: random(-1, 1),
      lift: random(10, 36)
    });
  }
}

function draw() {
  background('#4E2A1E'); // Deep chocolate brown

  var insideCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  var targetHover = insideCanvas ? 1 : 0;
  hoverAmount = lerp(hoverAmount, targetHover, 0.055);

  drawQuietGrid();
  drawFoldedField();
  drawCenterSilhouette();
  drawFrame();
}

function drawQuietGrid() {
  stroke('#CBC4C3'); // Light gray
  strokeWeight(1);

  for (var x = 40; x < width; x += 40) {
    line(x, 24, x, height - 24);
  }

  for (var y = 40; y < height; y += 40) {
    line(24, y, width - 24, y);
  }

  noStroke();
}

function drawFoldedField() {
  for (var i = 0; i < folds.length; i++) {
    var f = folds[i];
    var distanceFromMouse = dist(mouseX, mouseY, f.x, f.y);
    var influence = map(distanceFromMouse, 0, 190, 1, 0, true) * hoverAmount;
    var orbit = sin(frameCount * 0.012 + f.layer + f.drift) * influence;
    var lift = f.lift * influence;
    var px = f.x + cos(f.angle) * lift;
    var py = f.y + sin(f.angle) * lift;
    var scaleUp = 1 + influence * 0.42;

    push();
    translate(px, py);
    rotate(f.angle + orbit * 0.45);
    scale(scaleUp);

    drawFold(f.size, f.shade, influence);
    pop();
  }
}

function drawFold(size, shade, influence) {
  var highlight = lerpColor(shade, color(255), 0.2 + influence * 0.1);
  var shadow = lerpColor(shade, color(0), 0.2);
  var mid = lerpColor(shade, color(255), 0.1 + influence * 0.05);

  fill(shadow);
  triangle(-size * 0.72, -size * 0.18, size * 0.08, -size * 0.56, -size * 0.12, size * 0.34);

  fill(mid);
  triangle(size * 0.08, -size * 0.56, size * 0.72, size * 0.1, -size * 0.12, size * 0.34);

  fill(highlight);
  triangle(-size * 0.12, size * 0.34, size * 0.72, size * 0.1, size * 0.04, size * 0.72);

  fill(255, 16 + influence * 30);
  quad(-size * 0.4, -size * 0.08, size * 0.08, -size * 0.32, size * 0.32, -size * 0.08, -size * 0.06, size * 0.08);
}

function drawCenterSilhouette() {
  var breathing = sin(frameCount * 0.018) * 2;
  var reveal = hoverAmount * 18;

  push();
  translate(width / 2, height / 2);
  rotate(PI / 4 + hoverAmount * 0.18);

  fill('#2E2626'); // Dark charcoal
  rectMode(CENTER);
  rect(0, 0, 120 + breathing + reveal, 120 + breathing + reveal, 16);

  pop();
}

function drawFrame() {
  noFill();
  stroke('#2E2626'); // Dark charcoal
  strokeWeight(12);
  rect(6, 6, width - 12, height - 12, 24);
}