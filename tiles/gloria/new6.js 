function setup() {
  createCanvas(1920, 1080);
  noLoop();
}

function draw() {
  // Electric blue background
  background(10, 30, 230);

  stroke(235, 238, 245);
  strokeCap(SQUARE);
  noFill();

  // Upper fan: extended so it completely covers the top edge.
  drawLineFan(
    width * 0.02,    // vanishingX
    height * 0.10,   // vanishingY (pulled up)
    width,           // edgeX on the right side
    -height * 0.35,  // yMin far above canvas to avoid blue at the very top
    height * 0.55,   // yMax into middle region for overlap
    72,              // denser lines
    1.8              // strokeWeight
  );

  // Middle fan: vanishing point near right edge, center, radiating to the left.
  drawLineFan(
    width * 0.98,   // vanishingX
    height * 0.50,  // vanishingY
    0,              // edgeX on the left side
    height * 0.15,  // yMin overlaps with upper fan
    height * 0.90,  // yMax overlaps with lower fan
    64,             // lineCount (densest fan)
    2.2             // strokeWeight
  );

  // Lower fan: vanishing point near left edge, lower third, radiating to the right.
  drawLineFan(
    width * 0.02,   // vanishingX
    height * 0.82,  // vanishingY
    width,          // edgeX on the right side
    height * 0.40,  // yMin overlapping middle fan
    height * 1.05,  // yMax extending slightly below canvas
    52,             // lineCount
    2.0             // strokeWeight
  );
}

/**
 * Draws a radiating fan of straight lines from a vanishing point to an opposite edge.
 * The end points are evenly spaced along a vertical span at edgeX.
 */
function drawLineFan(vanishingX, vanishingY, edgeX, endEdgeYMin, endEdgeYMax, lineCount, weight) {
  strokeWeight(weight);

  for (let i = 0; i <= lineCount; i++) {
    let t = i / lineCount;
    let targetY = lerp(endEdgeYMin, endEdgeYMax, t);
    line(vanishingX, vanishingY, edgeX, targetY);
  }
}