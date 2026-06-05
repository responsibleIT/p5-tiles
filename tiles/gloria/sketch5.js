function setup() {
    createCanvas(400, 400);
    noLoop();
}

function draw() {
    background(30); // Dark background for contrast
    let cols = 20; // Number of columns in the grid
    let rows = 20; // Number of rows in the grid
    let cellSize = width / cols;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            let xOffset = x * cellSize;
            let yOffset = y * cellSize;

            // Define colors for the palette
            let darkMassColors = [color(48, 25, 52), color(29, 0, 51)]; // Deep indigo and dark purple
            let mosaicColors = [
                color(200, 162, 200), // Lilac
                color(180, 150, 220), // Lavender
                color(135, 206, 235), // Sky blue
                color(204, 204, 255), // Periwinkle
                color(224, 176, 255), // Mauve
            ];
            let cornerColors = [color(65, 105, 225), color(138, 43, 226)]; // Royal blue and violet

            // Determine the region and color
            let tileColor;
            if (dist(x, y, cols / 2, rows / 2) < 5) {
                // Central dark mass
                tileColor = random(darkMassColors);
            } else if (x < 5 && y < 5) {
                // Top-left corner
                tileColor = random(cornerColors);
            } else {
                // Surrounding mosaic
                tileColor = random(mosaicColors);
            }

            // Draw triangles within the grid cell
            fill(tileColor);
            noStroke();
            if (random() < 0.5) {
                // Top-left to bottom-right triangle
                triangle(xOffset, yOffset, xOffset + cellSize, yOffset, xOffset, yOffset + cellSize);
            } else {
                // Top-right to bottom-left triangle
                triangle(xOffset + cellSize, yOffset, xOffset + cellSize, yOffset + cellSize, xOffset, yOffset + cellSize);
            }
        }
    }
}