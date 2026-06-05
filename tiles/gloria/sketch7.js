function setup() {
    createCanvas(1080, 920 );
    noLoop();

    const palette = [
        '#0a0a2e', // deep navy
        '#1a0033', // dark purple
        '#6a0dad', // medium purple
        '#7b2d8b', // violet
        '#3f0080', // indigo
        '#4a6fa5', // steel blue
        '#7c6fa0', // muted lavender
        '#5b7fa6', // dusty blue
        '#05050f', // near-black
        '#a89dc5'  // light periwinkle
    ];

    const cellSize = 40;

    for (let x = 0; x < width; x += cellSize) {
        for (let y = 0; y < height; y += cellSize) {
            let color1 = random(palette);
            let color2 = random(palette);

            // Draw top-left triangle
            fill(color1);
            noStroke();
            triangle(x, y, x + cellSize, y, x, y + cellSize);

            // Draw bottom-right triangle
            fill(color2);
            noStroke();
            triangle(x + cellSize, y, x + cellSize, y + cellSize, x, y + cellSize);
        }
    }
}