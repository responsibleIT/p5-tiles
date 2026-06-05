const SIZE = 400;
const HOVER_RADIUS = 95;

let paths = [];
let grain = [];
let cursorHasVisited = false;

const bg = "#171916";
const nearBlack = "#0E1110";
const redGlow = "#FF3F36";
const gold = "#F8DC4E";
const teal = "#41A6A0";
const paleYellow = "#FFF17A";

function setup() {
  createCanvas(SIZE, SIZE);
  pixelDensity(2);
  frameRate(30);
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  buildLightPaths();
  buildStaticGrain();
}

function draw() {
  background(bg);
  drawDarkPanels();

  const hovering = cursorHasVisited && mouseInsideCanvas();
  for (const path of paths) {
    path.update(hovering);
    path.drawGlow();
  }

  drawGrain();
  drawFrame();
}

function buildLightPaths() {
  paths = [
    new GlowPath([
      [-34, 358], [62, 338], [154, 330], [225, 334], [305, 318], [436, 300]
    ], 54, 0.15),
    new GlowPath([
      [178, -42], [135, 45], [103, 116], [124, 181], [158, 250], [185, 326], [235, 442]
    ], 42, 1.1),
    new GlowPath([
      [244, 428], [220, 366], [220, 333], [249, 303], [303, 283], [432, 254]
    ], 40, 2.4),
    new GlowPath([
      [-42, 88], [30, 92], [74, 142], [98, 208], [134, 279], [177, 334]
    ], 30, 3.2),
    new GlowPath([
      [18, 424], [77, 378], [129, 348], [181, 334], [226, 335], [286, 374]
    ], 26, 4.5),
    new GlowPath([
      [442, 48], [365, 84], [315, 144], [285, 211], [252, 278], [221, 332]
    ], 22, 5.7),
    new GlowPath([
      [-35, 392], [50, 365], [110, 356], [173, 360], [240, 385], [338, 427]
    ], 20, 6.3),
    new GlowPath([
      [92, -38], [80, 42], [76, 101], [91, 157], [122, 218], [153, 282], [171, 338]
    ], 18, 7.9)
  ];
}

class GlowPath {
  constructor(points, weight, phase) {
    this.basePoints = points.map((point) => createVector(point[0], point[1]));
    this.points = this.basePoints.map((point) => point.copy());
    this.weight = weight;
    this.phase = phase;
    this.hover = 0;
  }

  update(hovering) {
    let strongest = 0;

    if (hovering) {
      for (const point of this.basePoints) {
        strongest = max(strongest, constrain(1 - dist(mouseX, mouseY, point.x, point.y) / HOVER_RADIUS, 0, 1));
      }
    }

    this.hover = lerp(this.hover, strongest, 0.1);
    this.points = this.basePoints.map((point, index) => {
      const distanceToMouse = hovering ? dist(mouseX, mouseY, point.x, point.y) : 999;
      const localHover = constrain(1 - distanceToMouse / HOVER_RADIUS, 0, 1);
      const angle = atan2(point.y - mouseY, point.x - mouseX);
      const wave = sin(frameCount * 0.045 + this.phase + index * 0.8) * localHover * 14;
      const pull = localHover * 18;

      return createVector(
        point.x + cos(angle) * pull + cos(angle + HALF_PI) * wave,
        point.y + sin(angle) * pull + sin(angle + HALF_PI) * wave
      );
    });    
  }

  drawGlow() {
    drawCurve(this.points, redGlow, this.weight + 30 + this.hover * 10, 76);
    drawCurve(this.points, "#FF6A3A", this.weight + 18 + this.hover * 8, 92);
    drawCurve(this.points, gold, this.weight + 8 + this.hover * 6, 225);
    drawCurve(this.points, paleYellow, this.weight * 0.58 + this.hover * 5, 245);
    drawCurve(this.points, teal, this.weight * 0.28 + this.hover * 4, 190);

    if (this.hover > 0.02) {
      drawCurve(this.points, "#B5FFF2", this.weight * 0.1 + 2, 120 * this.hover);
    }
  }
}

function drawCurve(points, strokeColor, weight, alphaValue) {
  const c = color(strokeColor);
  stroke(red(c), green(c), blue(c), alphaValue);
  strokeWeight(weight);

  beginShape();
  curveVertex(points[0].x, points[0].y);
  for (const point of points) {
    curveVertex(point.x, point.y);
  }
  curveVertex(points[points.length - 1].x, points[points.length - 1].y);
  endShape();
}

function drawDarkPanels() {
  noStroke();
  fill(14, 17, 16, 238);
  beginShape();
  vertex(178, -30);
  vertex(430, -10);
  vertex(430, 250);
  vertex(302, 274);
  vertex(236, 300);
  vertex(184, 318);
  vertex(143, 228);
  vertex(110, 137);
  endShape(CLOSE);

  fill(10, 13, 12, 210);
  beginShape();
  vertex(-20, 118);
  vertex(72, 136);
  vertex(109, 218);
  vertex(150, 312);
  vertex(68, 340);
  vertex(-20, 355);
  endShape(CLOSE);

  fill(14, 17, 16, 232);
  beginShape();
  vertex(270, 340);
  vertex(430, 302);
  vertex(430, 430);
  vertex(319, 430);
  vertex(286, 379);
  endShape(CLOSE);
}

function buildStaticGrain() {
  grain = [];
  for (let i = 0; i < 2300; i++) {
    grain.push({
      x: random(width),
      y: random(height),
      s: random(0.45, 1.35),
      a: random(9, 34),
      light: random() > 0.5
    });
  }
}

function drawGrain() {
  noStroke();
  for (const speck of grain) {
    fill(speck.light ? color(248, 220, 78, speck.a) : color(0, 0, 0, speck.a + 10));
    rect(speck.x, speck.y, speck.s, speck.s);
  }
}

function drawFrame() {
  noFill();
  stroke(245, 233, 164, 190);
  strokeWeight(2);
  rect(1, 1, width - 2, height - 2);

  stroke(14, 17, 16, 230);
  strokeWeight(1);
  rect(5, 5, width - 10, height - 10);
}

function mouseInsideCanvas() {
  return mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
}

function mouseMoved() {
  cursorHasVisited = true;
}

function mouseDragged() {
  cursorHasVisited = true;
}
