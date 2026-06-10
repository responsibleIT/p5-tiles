function setup() {
    createCanvas(1920, 1080);
    noLoop();

    const palette = [
        '#0a0a2e', // deep navy
        '#000033', // darker navy blue
        '#000066', // dark blue
        '#000099', // medium dark blue
        '#0000cc', // blue
        '#003366', // steel blue
        '#004080', // muted blue
        '#00509e', // dusty blue
        '#05050f', // near-black
        '#1a1a2e'  // very dark blue
    ];

    const cellSize = 40;

    for (let x = 0; x < width; x += cellSize) {
        for (let y = 0; y < height; y += cellSize) {
            let color1 = random(palette);
            let color2 = random(palette);

            // Draw top-left triangle with depth effect
            fill(color1);
            noStroke();
            triangle(x, y, x + cellSize, y, x, y + cellSize);

            // Draw bottom-right triangle with depth effect
            fill(color2);
            noStroke();
            triangle(x + cellSize, y, x + cellSize, y + cellSize, x, y + cellSize);
        }
    }
}