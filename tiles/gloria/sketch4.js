// sketch4.js
// This code uses p5.js to create a geometric tessellation with a cool-toned palette.

function setup() {
  createCanvas(400, 400);
  noLoop();
}

function draw() {
  background(30); // Dark background to enhance jewel tones
  const tileSize = 40; // Size of each triangular tile
  const cols = width / tileSize;
  const rows = height / tileSize;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const xOffset = x * tileSize;
      const yOffset = y * tileSize;

      // Randomly decide the orientation of the triangle
      const orientation = random([0, 1]);

      // Define the color palette
      const centralMassColors = [color(48, 25, 52), color(29, 0, 51)]; // Deep indigo and dark purple
      const mosaicColors = [
        color(200, 162, 200), // Lilac
        color(181, 126, 220), // Lavender
        color(135, 206, 235), // Sky blue
        color(204, 204, 255), // Periwinkle
        color(224, 176, 255), // Mauve
      ];
      const cornerColors = [color(65, 105, 225), color(138, 43, 226)]; // Royal blue and violet

      // Determine the color based on position
      let tileColor;
      if (dist(xOffset, yOffset, width / 2, height / 2) < 200) {
        tileColor = random(centralMassColors); // Central mass
      } else if (x < cols * 0.2 && y < rows * 0.2) {
        tileColor = random(cornerColors); // Top-left corner
      } else {
        tileColor = random(mosaicColors); // Surrounding mosaic
      }

      fill(tileColor);
      noStroke();

      // Draw the triangle
      if (orientation === 0) {
        triangle(
          xOffset, yOffset,
          xOffset + tileSize, yOffset,
          xOffset + tileSize / 2, yOffset + tileSize
        );
      } else {
        triangle(
          xOffset, yOffset + tileSize,
          xOffset + tileSize, yOffset + tileSize,
          xOffset + tileSize / 2, yOffset
        );
      }
    }
  }
}