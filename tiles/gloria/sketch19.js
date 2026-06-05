const SIZE = 400;
const CENTER = SIZE / 2;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pieces = [];
let hoverEase = 0;
let focusEase = 0;
let grainLayer;

function setup() {
  stylePage();

  const canvas = createCanvas(SIZE, SIZE);
  canvas.attribute(
    "aria-label",
    "A calm high-contrast prismatic field that gently reacts when hovered or focused."
  );
  canvas.attribute("role", "img");
  canvas.attribute("tabindex", "0");
  canvas.elt.style.display = "block";
  canvas.elt.style.outline = "2px solid transparent";
  canvas.elt.style.outlineOffset = "8px";

  pixelDensity(2);
  colorMode(HSL, 360, 100, 100, 1);
  noStroke();

  buildPieces();
  makeGrain();
}

function stylePage() {
  document.documentElement.style.margin = "0";
  document.documentElement.style.minHeight = "100%";
  document.body.style.margin = "0";
  document.body.style.minHeight = "100vh";
  document.body.style.display = "grid";
  document.body.style.placeItems = "center";
  document.body.style.background = "#05070b";
  document.body.style.color = "#f8fafc";
  document.body.style.fontFamily = "Arial, Helvetica, sans-serif";

  const focusStyle = document.createElement("style");
  focusStyle.textContent = "canvas:focus-visible{outline-color:#f8fafc!important;}";
  document.head.appendChild(focusStyle);
}

function draw() {
  const inside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  const focused = document.activeElement === drawingContext.canvas;
  const target = inside || focused ? 1 : 0;
  const rate = reduceMotion ? 0.035 : 0.075;

  hoverEase = lerp(hoverEase, target, rate);
  focusEase = lerp(focusEase, focused ? 1 : 0, rate);

  background(226, 42, 4);
  drawQuietAura();
  drawVeil();
  drawHalo();
  image(grainLayer, 0, 0);
}

function buildPieces() {
  pieces = [];
  const step = 36;

  for (let y = -step; y < height + step; y += step) {
    for (let x = -step; x < width + step; x += step) {
      const flip = ((x / step + y / step) & 1) === 0;
      const cx = x + step * 0.5;
      const cy = y + step * 0.5;
      const d = dist(cx, cy, CENTER, CENTER);

      if (d < 190 + random(-12, 36)) {
        pieces.push({
          x,
          y,
          s: step * random(0.82, 1.22),
          flip,
          lift: random(6, 28),
          spin: random(-0.22, 0.22),
          phase: random(TAU),
          hue: random([182, 204, 272, 318, 44]),
          light: random(48, 76),
          alpha: random(0.34, 0.68),
        });
      }
    }
  }
}

function drawQuietAura() {
  push();
  translate(CENTER, CENTER);
  for (let r = 190; r > 12; r -= 9) {
    const a = map(r, 190, 12, 0.035, 0.12);
    fill(214, 54, map(r, 190, 12, 9, 18), a);
    ellipse(0, 0, r * 1.18, r * 0.92);
  }}