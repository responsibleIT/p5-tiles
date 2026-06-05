function draw() {
  createCanvas(400, 400);
  background(250);

  const colors = [
    color(211, 211, 211),
    color(230, 230, 250),
    color(255, 182, 193),
    color(255, 219, 88),
    color(75, 0, 130)
  ];

  const triangleWidth = 60;
  const triangleHeight = triangleWidth * sqrt(3) / 2;

  const rows = ceil(height / triangleHeight);
  const cols = ceil(width / triangleWidth) + 2;

  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      fill(255, 182, 193);

      // Verspringende rijen
      let x = col * triangleWidth;

      if (row % 2 === 1) {
        x += triangleWidth / 2;
      }

      let y = row * triangleHeight;

      // Om-en-om driehoeken
      if ((row + col) % 2 === 0) {

        // omhoog
        triangle(
          x, y + triangleHeight,
          x + triangleWidth / 2, y,
          x + triangleWidth, y + triangleHeight
        );

      } else {

        // omlaag
        triangle(
          x, y,
          x + triangleWidth / 2, y + triangleHeight,
          x + triangleWidth, y
        );
      }
    }
  }
} 