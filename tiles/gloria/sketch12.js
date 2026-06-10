function setup() {
  createCanvas(1920, 1080);
  noLoop(); // static frame
}

function draw() {
  background(5); // almost black
  noStroke();
  strokeJoin(BEVEL);
  strokeCap(ROUND);

  // Convenience functions
  function poly(vertices, c1, c2, alphaMin = 180, alphaMax = 255) {
    let col1 = color(c1);
    let col2 = color(c2);
    let t = random(0.2, 0.8);
    let c = lerpColor(col1, col2, t);
    c.setAlpha(random(alphaMin, alphaMax));
    fill(c);
    beginShape();
    for (let v of vertices) vertex(v.x, v.y);
    endShape(CLOSE);
  }

  function glowStrip(v1, v2, baseColor, thickness) {
    let steps = 8;
    let c = color(baseColor);
    for (let i = 0; i < steps; i++) {
      let t = i / (steps - 1);
      let w = lerp(thickness, 0, t);
      let a = lerp(160, 0, t);
      c.setAlpha(a);
      stroke(c);
      strokeWeight(w);
      line(v1.x, v1.y, v2.x, v2.y);
    }
    noStroke();
  }

  function neonEdge(v1, v2, edgeColor) {
    let c = color(edgeColor);

    strokeWeight(10);
    c.setAlpha(70);
    stroke(c);
    line(v1.x, v1.y, v2.x, v2.y);

    strokeWeight(4);
    c.setAlpha(230);
    stroke(c);
    line(v1.x, v1.y, v2.x, v2.y);

    noStroke();
  }

  push();
  blendMode(ADD);

  glowStrip({ x: -40, y: 700 }, { x: 1960, y: 400 }, '#ff1020', 80);
  glowStrip({ x: 100, y: 900 }, { x: 1820, y: 600 }, '#ff1020', 60);

  glowStrip({ x: -80, y: 1000 }, { x: 1300, y: 800 }, '#ff1a2a', 70);
  glowStrip({ x: 860, y: 300 }, { x: 1960, y: 100 }, '#ff4050', 50);
  pop();

  let dark = '#050509';
  let mid = '#202024';
  let light = '#3a3a40';

  let shards = [
    [{ x: -80, y: 700 }, { x: 860, y: 560 }, { x: 1240, y: 800 }, { x: 100, y: 1000 }],
    [{ x: 860, y: 560 }, { x: 1960, y: 320 }, { x: 1960, y: 700 }, { x: 1240, y: 800 }],
    [{ x: -80, y: 1000 }, { x: 100, y: 1000 }, { x: 1240, y: 800 }, { x: 1960, y: 940 }, { x: 1960, y: 1080 }, { x: -80, y: 1080 }],
    [{ x: 480, y: 360 }, { x: 1280, y: 240 }, { x: 1960, y: 60 }, { x: 1960, y: 300 }],
    [{ x: 100, y: 570 }, { x: 860, y: 560 }, { x: 480, y: 380 }],
    [{ x: 480, y: 380 }, { x: 1240, y: 300 }, { x: 860, y: 560 }],
    [{ x: 1240, y: 300 }, { x: 1960, y: 160 }, { x: 1960, y: 320 }, { x: 1520, y: 380 }],
    [{ x: 480, y: 800 }, { x: 1240, y: 800 }, { x: 960, y: 1000 }],
    [{ x: -80, y: 160 }, { x: 320, y: 120 }, { x: 100, y: 570 }, { x: -80, y: 630 }],
    [{ x: 1520, y: 380 }, { x: 1960, y: 400 }, { x: 1960, y: 700 }, { x: 1560, y: 700 }]
  ];

  for (let s of shards) {
    poly(s, dark, mid, 210, 255);
  }

  let highlights = [
    [{ x: 100, y: 570 }, { x: 860, y: 560 }, { x: 480, y: 800 }],
    [{ x: 860, y: 560 }, { x: 1520, y: 380 }, { x: 1240, y: 800 }],
    [{ x: 1240, y: 300 }, { x: 1960, y: 160 }, { x: 1520, y: 380 }]
  ];
  for (let h of highlights) {
    poly(h, mid, light, 180, 230);
  }

  push();
  blendMode(ADD);
  let redFacets = [
    [{ x: 100, y: 750 }, { x: 600, y: 675 }, { x: 480, y: 870 }],
    [{ x: 760, y: 690 }, { x: 1200, y: 615 }, { x: 1040, y: 810 }],
    [{ x: 1040, y: 450 }, { x: 1440, y: 390 }, { x: 1280, y: 570 }],
    [{ x: 320, y: 600 }, { x: 560, y: 540 }, { x: 480, y: 690 }]
  ];
  for (let r of redFacets) {
    poly(r, '#ff2438', '#ff0018', 120, 220);
  }
  pop();

  let neon = '#ff1525';

  neonEdge({ x: -40, y: 720 }, { x: 960, y: 580 }, neon);
  neonEdge({ x: 960, y: 580 }, { x: 1960, y: 350 }, neon);

  neonEdge({ x: 100, y: 1000 }, { x: 1240, y: 800 }, neon);
  neonEdge({ x: 1240, y: 800 }, { x: 1960, y: 940 }, neon);

  neonEdge({ x: 320, y: 120 }, { x: 100, y: 570 }, neon);
  neonEdge({ x: 100, y: 570 }, { x: -80, y: 630 }, neon);

  neonEdge({ x: 1240, y: 300 }, { x: 1960, y: 160 }, neon);
  neonEdge({ x: 1520, y: 380 }, { x: 1960, y: 400 }, neon);

  neonEdge({ x: 600, y: 675 }, { x: 480, y: 870 }, '#ff3a4a');
  neonEdge({ x: 760, y: 690 }, { x: 1040, y: 810 }, '#ff3a4a');
}