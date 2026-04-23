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
      centerX: 100,
      centerY: 50,
      diameter: 100
    })
  }

  // centerX = width/2;
  // centerY = height/2;
  // diameter = width;

  // strokeWeight(10);
  // stroke(255,0,0);
}

function draw() {
  background(220);
  
  for (let iDingetje=0; iDingetje<100; iDingetje++){
    let eenDingetje = dingetjes[iDingetje];
    circle(eenDingetje.centerX, eenDingetje.centerY, eenDingetje.diameter);  
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
