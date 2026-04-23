
let dingetjes = [];

function setup() {
  createCanvas(400, 400);
  
  for (let iDingetje=0; iDingetje<100; iDingetje++){
    dingetjes.push({
      centerX: random(0, width),
      centerY: random(0, height),
      diameter: random(10, 50)
    });
  }
}

function draw() {
  background(220);
  
  for (let iDingetje=0; iDingetje<100; iDingetje++){
    let eenDingetje = dingetjes[iDingetje];
    circle(eenDingetje.centerX, eenDingetje.centerY, eenDingetje.diameter);
  }
}
