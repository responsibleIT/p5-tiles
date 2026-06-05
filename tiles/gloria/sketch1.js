let dingetjes = [];

function setup() {
  createCanvas(400, 400);

  for (let iDingetje =0; iDingetje <100; iDingetje++) {
    dingetjes.push({
      centerX: random(0, width),
      centerY: random(0, height),
      diameter: random (10, 20),
      velocityX: random(-3, 3),
      velocityY: random(-3, 3),
      shade: random(100, 255)
    });
  }
}
noStroke();

function draw() {
  background(220);

  for (iDingetje = 0; iDingetje <dingetjes.length; iDingetje++){
    let eenDingetje = dingetjes[iDingetje];

eenDingetje.centerX += eenDingetje.velocityX;
eenDingetje.centerY += eenDingetje.velocityY;


if(eenDingetje.centerX > width || eenDingetje.centerX <  0){
  eenDingetje.velocityX = -eenDingetje.velocityX;
}

if(eenDingetje.centerY > width || eenDingetje.centerY <  0){
  eenDingetje.velocitY = -eenDingetje.velocityY;
}

eenDingetje.velocitY += 0.1;
fill(eenDingetje.shade);
    circle(eenDingetje.centerX, eenDingetje.centerY, eenDingetje.diameter);
  }

}
