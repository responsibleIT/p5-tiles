// Futuristic black/red shard wallpaper in p5.js
// Canvas: 400 x 400, static image

function setup() {
  createCanvas(400, 400);
  noLoop();           // static frame
}

function draw() {
  background(5);      // almost black
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

  // Soft glowing strip (for red light under shards)
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

  // Thin neon edge
  function neonEdge(v1, v2, edgeColor) {
    let c = color(edgeColor);

    // outer soft glow
    strokeWeight(5);
    c.setAlpha(70);
    stroke(c);
    line(v1.x, v1.y, v2.x, v2.y);

    // inner bright line
    strokeWeight(2);
    c.setAlpha(230);
    stroke(c);
    line(v1.x, v1.y, v2.x, v2.y);

    noStroke();
  }

  // -----------------------------
  // RED GLOW LAYERS (underneath)
  // -----------------------------
  push();
  blendMode(ADD);     // additive for bright glow

  // central long diagonal glow
  glowStrip({x: -20, y: 260}, {x: 420, y: 140}, '#ff1020', 32);
  glowStrip({x: 40,  y: 320}, {x: 380, y: 200}, '#ff1020', 26);

  // extra glows left-bottom and right-top
  glowStrip({x: -40, y: 340}, {x: 260, y: 260}, '#ff1a2a', 30);
  glowStrip({x: 180, y: 80},  {x: 420, y: 20},  '#ff4050', 20);
  pop();

  // -----------------------------
  // DARK SHARDS (panels on top)
  // -----------------------------
  let dark = '#050509';
  let mid  = '#202024';
  let light = '#3a3a40';

  let shards = [
    // large foreground shards
    [{x: -40, y: 260}, {x: 180, y: 210}, {x: 260, y: 280}, {x: 40, y: 340}],
    [{x: 180, y: 210}, {x: 420, y: 120}, {x: 420, y: 210}, {x: 260, y: 280}],

    // lower large shard
    [{x: -40, y: 340}, {x: 40, y: 340}, {x: 260, y: 280}, {x: 420, y: 330}, {x: 420, y: 420}, {x: -40, y: 420}],

    // upper right shard
    [{x: 120, y: 120}, {x: 320, y: 80}, {x: 420, y: 30}, {x: 420, y: 150}],

    // inner angular shards
    [{x: 40, y: 190}, {x: 180, y: 210}, {x: 120, y: 140}],
    [{x: 120, y: 140}, {x: 260, y: 110}, {x: 180, y: 210}],
    [{x: 260, y: 110}, {x: 420, y: 60}, {x: 420, y: 120}, {x: 320, y: 140}],
    [{x: 120, y: 300}, {x: 260, y: 280}, {x: 200, y: 340}],

    // side shards
    [{x: -40, y: 80}, {x: 80, y: 60}, {x: 40, y: 190}, {x: -40, y: 210}],
    [{x: 320, y: 140}, {x: 420, y: 150}, {x: 420, y: 260}, {x: 340, y: 260}]
  ];

  // draw shards with subtle variation
  for (let s of shards) {
    poly(s, dark, mid, 210, 255);
  }

  // Some highlight faces (lighter gray) to create depth
  let highlights = [
    [{x: 40, y: 190}, {x: 180, y: 210}, {x: 120, y: 300}],
    [{x: 180, y: 210}, {x: 320, y: 140}, {x: 260, y: 280}],
    [{x: 260, y: 110}, {x: 420, y: 60}, {x: 320, y: 140}]
  ];
  for (let h of highlights) {
    poly(h, mid, light, 180, 230);
  }

  // -----------------------------
  // RED INNER FACETS (cut-outs)
  // -----------------------------
  push();
  blendMode(ADD);
  let redFacets = [
    [{x: 40, y: 250}, {x: 150, y: 225}, {x: 120, y: 290}],
    [{x: 190, y: 230}, {x: 300, y: 205}, {x: 260, y: 270}],
    [{x: 260, y: 150}, {x: 360, y: 130}, {x: 320, y: 190}],
    [{x: 80, y: 200}, {x: 140, y: 180}, {x: 120, y: 230}]
  ];
  for (let r of redFacets) {
    poly(r, '#ff2438', '#ff0018', 120, 220);
  }
  pop();

  // -----------------------------
  // NEON EDGES
  // -----------------------------
  let neon = '#ff1525';

  neonEdge({x: -20, y: 270}, {x: 200, y: 215}, neon);
  neonEdge({x: 200, y: 215}, {x: 420, y: 130}, neon);

  neonEdge({x: 40, y: 340}, {x: 260, y: 280}, neon);
  neonEdge({x: 260, y: 280}, {x: 420, y: 330}, neon);

  neonEdge({x: 80, y: 60}, {x: 40, y: 190}, neon);
  neonEdge({x: 40, y: 190}, {x: -40, y: 210}, neon);

  neonEdge({x: 260, y: 110}, {x: 420, y: 60}, neon);
  neonEdge({x: 320, y: 140}, {x: 420, y: 150}, neon);

  // small inner neon edges
  neonEdge({x: 150, y: 225}, {x: 120, y: 290}, '#ff3a4a');
  neonEdge({x: 190, y: 230}, {x: 260, y: 270}, '#ff3a4a');
}