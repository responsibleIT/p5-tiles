let driehoeken = [];
// Kleuren gebaseerd op de geüploade afbeelding (wit, rood, zwart, geel, donkerblauw, paars)
let kleuren = ['#FFFFFF', '#E31837', '#000000', '#FFD100', '#000066', '#5C005C'];

function setup() {
  createCanvas(500, 500);
  
  // Maak 40 driehoeken aan
  for (let i = 0; i < 40; i++) {
    driehoeken.push(new HvaDriehoek());
  }
}

function draw() {
  // Een rustige, donkere achtergrond zoals de PS4-stijl
  background(20, 30, 50);

  // Update en teken elke driehoek
  for (let d of driehoeken) {
    d.update();
    d.teken();
  }
}

class HvaDriehoek {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    
    // Willekeurige langzame snelheid voor het PS4 zweef-effect
    this.vx = random(-0.5, 0.5);
    this.vy = random(-0.5, 0.5);
    
    this.basisGrootte = random(15, 35);
    this.huidigeGrootte = this.basisGrootte;
    this.doelGrootte = this.basisGrootte;
    
    this.kleur = random(kleuren);
    
    // Lichte variatie in draaiing
    this.hoek = random(-0.2, 0.2); 
    this.draaiSnelheid = random(-0.005, 0.005);
  }

  update() {
    // Beweeg de driehoek
    this.x += this.vx;
    this.y += this.vy;
    this.hoek += this.draaiSnelheid;

    // Zorg dat ze aan de andere kant van het scherm terugkomen (wrap-around)
    if (this.x > width + 50) this.x = -50;
    if (this.x < -50) this.x = width + 50;
    if (this.y > height + 50) this.y = -50;
    if (this.y < -50) this.y = height + 50;

    // Hover-detectie: check de afstand tussen de muis en de driehoek
    let afstand = dist(mouseX, mouseY, this.x, this.y);
    
    if (afstand < 60) {
      // Als je in de buurt bent, wordt het doelformaat 2.5 keer zo groot
      this.doelGrootte = this.basisGrootte * 2.5;
    } else {
      // Anders is het gewoon de originele grootte
      this.doelGrootte = this.basisGrootte;
    }

    // Lerp (Linear Interpolation) zorgt voor een vloeiende overgang bij het groeien en krimpen
    this.huidigeGrootte = lerp(this.huidigeGrootte, this.doelGrootte, 0.1);
  }

  teken() {
    push();
    translate(this.x, this.y);
    rotate(this.hoek);
    
    fill(this.kleur);
    noStroke();
    
    // Teken een driehoek in HvA-stijl (wijzend naar rechts)
    let s = this.huidigeGrootte;
    triangle(-s / 2, -s / 2, -s / 2, s / 2, s / 2, 0);
    
    pop();
  }
}