let centerX;
let centerY;
let diameter;

function setup() {
  createCanvas(400, 400);
  centerX = width/2;
  centerY = height/2;
  diameter = width;
}

function draw() {
  background(220);
  
  if(mouseIsPressed) 
    fill(255,0,0)
  else
    fill(255);

  centerX = mouseX;
  centery = mouseY;

  circle(centerX, centerY, height);
}
