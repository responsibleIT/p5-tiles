dingetje = {
    centerX: 100,
    centerY: 50,
    diameter: 100
}

function setup() {
    createCanvas(400, 400);      
}

function draw() {
    background(220); 
    circle(dingetje.centerX, dingetje.centerY, dingetje.diameter);
}
