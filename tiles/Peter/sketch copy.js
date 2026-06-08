// let centerX ;
// let centerY ;
// let diameter ;

// let dingetje = {
//   centerX: 100,
//   centerY: 50,
//   diameter:100
// }

let dingetjes = [];

function setup() {
  createCanvas(400, 400);

  for (let iDingetje=0; iDingetje<100; iDingetje++){
    dingetjes.push({
      centerX: random(0, width),
      centerY: random(0, width),
      diameter: random(10, 20),
      velocityX: random(-3, 3),
      velocityY: random(-3, 3),
      shade: random(100, 255)
    })
  }

  noStroke();
  
  // centerX = width/2;
  // centerY = height/2;
  // diameter = width;

  // strokeWeight(10);
  // stroke(255,0,0);
}

function draw() {
  background(220);
  
  for (let iDingetje=0; iDingetje<dingetjes.length; iDingetje++){
    let eenDingetje = dingetjes[iDingetje];

    eenDingetje.centerX += eenDingetje.velocityX;
    eenDingetje.centerY += eenDingetje.velocityY;

    if (eenDingetje.centerX > width || eenDingetje.centerX < 0){
      eenDingetje.velocityX = -eenDingetje.velocityX;
    }

    if (eenDingetje.centerY > width || eenDingetje.centerY < 0){
      eenDingetje.velocityY = -eenDingetje.velocityY;
    }

    eenDingetje.velocityY += 0.1;
    fill(eenDingetje.shade);
    circle(eenDingetje.centerX, eenDingetje.centerY, eenDingetje.diameter);  
    
    // eenDingetje.centerX += random(-4, 4);
    // eenDingetje.centerY += random(-4, 4);

    // eenDingetje.centerX = eenDingetje.centerX + 10;
    // eenDingetje.centerY = eenDingetje.centerY + 10;
    // eenDingetje.centerX += 1;
    // eenDingetje.centerY += 1;
    // eenDingetje.centerX += random(0.5, 3.5);
    // eenDingetje.centerY += random(0.5, 3.5);

  }

  // circle(dingetje.centerX, dingetje.centerY, dingetje.diameter)

  // centerX = mouseX;
  // centerY = mouseY;
  // circle(centerX, centerY, height)

  // circle(width/2, length/2, 400);

  // if (mouseIsPressed) 
  //   fill(255,0,0)
  // else
  //   fill(255)
  
  // circle(mouseX, mouseY, 50);

}
