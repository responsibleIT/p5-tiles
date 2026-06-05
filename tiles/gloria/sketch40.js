new p5(function(p) {

  const W = 1080, H = 920;
  let mx = W / 2, my = H / 2;
  let targetMx = W / 2, targetMy = H / 2;

  const layers = [
    { scale: 1.00, alpha: 180, col: [80,  30, 140] },
    { scale: 0.90, alpha: 200, col: [60,  20, 160] },
    { scale: 0.80, alpha: 210, col: [30,  80, 180] },
    { scale: 0.72, alpha: 220, col: [20, 160, 180] },
    { scale: 0.64, alpha: 230, col: [60, 200, 160] },
    { scale: 0.57, alpha: 235, col: [200,140,  40] },
    { scale: 0.50, alpha: 240, col: [240,100,  20] },
    { scale: 0.43, alpha: 245, col: [255,160,  30] },
    { scale: 0.36, alpha: 250, col: [255,210,  80] },
    { scale: 0.28, alpha: 255, col: [255,240, 180] },
    { scale: 0.20, alpha: 255, col: [255,255, 230] },
  ];

  function triPts(cx, cy, r, angle) {
    let pts = [];
    for (let i = 0; i < 3; i++) {
      let a = angle + (i * p.TWO_PI / 3) - p.HALF_PI;
      pts.push({ x: cx + r * p.cos(a), y: cy + r * p.sin(a) });
    }
    return pts;
  }

  function drawAuraTriangle(cx, cy, r, angle, col, alpha, blurSteps) {
    p.noFill();
    let pts = triPts(cx, cy, r, angle);
    for (let b = blurSteps; b >= 0; b--) {
      let spread = b * 6;
      let a = p.map(b, blurSteps, 0, 0, alpha);
      p.stroke(col[0], col[1], col[2], a * 0.9);
      p.strokeWeight(spread + 2);
      p.beginShape();
      for (let pt of pts) p.vertex(pt.x, pt.y);
      p.endShape(p.CLOSE);
    }
  }

  let offsets = layers.map((_, i) => ({
    ox: 0, oy: 0,
    phase: i * 0.4
  }));

  let t = 0;

  p.setup = function() {
    p.createCanvas(W, H);
    p.colorMode(p.RGB, 255, 255, 255, 255);
    p.smooth();
  };

  p.mouseMoved = function() {
    targetMx = p.mouseX;
    targetMy = p.mouseY;
  };

  p.draw = function() {
    t += 0.012;

    mx += (targetMx - mx) * 0.06;
    my += (targetMy - my) * 0.06;

    p.background(55, 20, 110);

    for (let r = 700; r > 0; r -= 30) {
      let a = p.map(r, 0, 700, 60, 0);
      p.noStroke();
      p.fill(90, 30, 160, a);
      p.ellipse(W / 2, H / 2, r * 1.6, r * 1.2);
    }

    let baseR = 380;
    let baseAngle = t * 0.18;
    let mdx = (mx - W / 2) / W;
    let mdy = (my - H / 2) / H;

    layers.forEach((layer, i) => {
      let off = offsets[i];

      let strength = p.map(i, 0, layers.length - 1, 80, 8);
      let lag = 0.04 + i * 0.012;

      off.ox += (mdx * strength - off.ox) * lag;
      off.oy += (mdy * strength - off.oy) * lag;

      let drift = 12 * (1 - i / layers.length);
      let driftX = p.cos(t * 0.7 + off.phase) * drift;
      let driftY = p.sin(t * 0.5 + off.phase * 1.3) * drift;

      let cx = W / 2 + off.ox + driftX;
      let cy = H / 2 + off.oy + driftY;

      let r = baseR * layer.scale;
      let angle = baseAngle + i * 0.08 + p.sin(t * 0.3 + off.phase) * 0.15;
      let blurSteps = p.map(i, 0, layers.length - 1, 14, 6);

      drawAuraTriangle(cx, cy, r, angle, layer.col, layer.alpha, blurSteps);
    });

    p.loadPixels();
    for (let i = 0; i < 6000; i++) {
      let x = p.floor(p.random(W));
      let y = p.floor(p.random(H));
      let idx = 4 * (y * W + x);
      let g = p.random(60);
      p.pixels[idx]     = p.min(255, p.pixels[idx]     + g);
      p.pixels[idx + 1] = p.min(255, p.pixels[idx + 1] + g);
      p.pixels[idx + 2] = p.min(255, p.pixels[idx + 2] + g);
    }
    p.updatePixels();
  };
});
