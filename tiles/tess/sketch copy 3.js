
let dingetjes = [];

function setup() {
  createCanvas(400, 400);
  
  for (let iDingetje=0; iDingetje<100; iDingetje++){
    dingetjes.push({
      centerX: random(0, width),
      centerY: random(0, height),
      diameter: random(10, 50),
      velocityX: random(-3, 3),
      velocityY: random(-3, 3)
    });
  }
}

function draw() {
  background(225);
  
  for (let iDingetje=0; iDingetje<100; iDingetje++){
    let eenDingetje = dingetjes[iDingetje];

  eenDingetje.centerX += eenDingetje.velocityX;
  eenDingetje.centerY += eenDingetje.velocityY;

  if(eenDingetje.centerX > width || eenDingetje.centerX < 0){
    eenDingetje.velocityX = -eenDingetje.velocityX;
  }
  if(eenDingetje.centerY > height || eenDingetje.centerY < 0){
    eenDingetje.velocityY = -eenDingetje.velocityY;
  }

    circle(eenDingetje.centerX, eenDingetje.centerY, eenDingetje.diameter);
  }
}
