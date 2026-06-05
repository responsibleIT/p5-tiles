var folds = [];
var hoverAmount = 0;
var shadeOptions = [32, 48, 70, 92, 122, 158, 205, 238];

function setup() {
  createCanvas(400, 400);
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
  background(8);

  var insideCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  var targetHover = insideCanvas ? 1 : 0;
  hoverAmount = lerp(hoverAmount, targetHover, 0.055);

  drawQuietGrid();
  drawFoldedField();
  drawCenterSilhouette();
  drawFrame();
}

function drawQuietGrid() {
  stroke(255, 24);
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
  var highlight = constrain(shade + 44 + influence * 34, 0, 255);
  var shadow = constrain(shade - 42, 0, 255);
  var mid = constrain(shade + influence * 22, 0, 255);

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
  rotate(PI / 4 + hoverAmount * 0.18);}