function setup() {
  createCanvas(400, 400);
  randomSeed(42); // Fixed seed for consistent pattern
  background('#f0ede8'); // Cream background
  noLoop();

  let points = [];
  let cols = 10;
  let rows = 10;

  // Generate a grid of points with slight random offsets
  for (let i = 0; i <= cols; i++) {
    for (let j = 0; j <= rows; j++) {
      let x = (i / cols) * width + random(-10, 10);
      let y = (j / rows) * height + random(-10, 10);
      points.push(createVector(x, y));
    }
  }

  // Add points along the edges to ensure full coverage
  points.push(createVector(0, 0));
  points.push(createVector(width, 0));
  points.push(createVector(0, height));
  points.push(createVector(width, height));

  // Triangulate the points
  let triangles = Delaunay.triangulate(points.map(p => [p.x, p.y]));

  // Draw the triangles
  noStroke();
  for (let i = 0; i < triangles.length; i += 3) {
    let p1 = points[triangles[i]];
    let p2 = points[triangles[i + 1]];
    let p3 = points[triangles[i + 2]];

    fill('#cc3311'); // Flat red color
    stroke('#f0ede8'); // White stroke
    strokeWeight(5);
    triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  }
}