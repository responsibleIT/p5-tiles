function setup() {
    createCanvas(400, 400);
    noLoop();
    randomSeed(42); // Ensures consistent results on reload
}

function draw() {
    background(10, 10, 20); // Deep navy background
    noStroke();

    const colors = [
        color(30, 10, 50, 200), // Deep purple
        color(20, 20, 60, 180), // Dark blue
        color(40, 30, 70, 220), // Indigo
        color(10, 10, 30, 200), // Navy
        color(5, 5, 15, 180),   // Black
        color(200, 180, 230, 150), // Lavender
        color(180, 200, 220, 150), // Pale blue
        color(240, 220, 200, 150), // Soft beige
        color(220, 150, 100, 150)  // Muted orange
    ];

    const tileSize = 40; // Base size for grid tiles
    for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
            drawTile(x, y, tileSize, colors);
        }
    }
}

function drawTile(x, y, size, palette) {
    push();
    translate(x, y);

    // Randomly choose between triangle or square
    if (random() < 0.7) {
        drawRandomTriangle(size, palette);
    } else {
        drawRandomSquare(size, palette);
    }

    pop();
}

function drawRandomTriangle(size, palette) {
    fill(random(palette));
    beginShape();
    vertex(random(size), random(size));
    vertex(random(size), random(size));
    vertex(random(size), random(size));
    endShape(CLOSE);
}

function drawRandomSquare(size, palette) {
    fill(random(palette));
    beginShape();
    vertex(random(size), random(size));
    vertex(random(size), random(size));
    vertex(random(size), random(size));
    vertex(random(size), random(size));
    endShape(CLOSE);
}