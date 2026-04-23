let dingetjes = [];

function setup() {
    createCanvas(400, 400);  
    
    for (let iDingetje=0; iDingetje<100; iDingetje++){
        dingetjes.push({
            centerX: 100,
            centerY: 50,
            diameter: 100
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
