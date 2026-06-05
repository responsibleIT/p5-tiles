function setup() {
    createCanvas(1080, 920);
    noLoop();

    const palette = [
        '#ffd700', // gold
        '#ffec47', // bright yellow
        '#ffe066', // soft yellow
        '#ffc200', // amber yellow
        '#e6ac00', // dark amber
        '#fff4a3', // pale yellow
        '#b8860b', // dark goldenrod
        '#f5c842', // warm yellow
        '#3d2b00', // near-black brown
        '#fff9d6'  // cream white
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