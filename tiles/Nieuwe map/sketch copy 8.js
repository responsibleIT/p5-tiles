let triangles = [];

function setup() {
  createCanvas(500, 500);
  
  // Definiëren van de specifieke HvA-driehoeken (kleur, grootte, richting)
  let hvaDesigns = [
    { color: '#FFFFFF', size: 70, dir: 'left' },   // Grote witte (links)
    { color: '#D32F2F', size: 60, dir: 'right' },  // Rode (rechts)
    { color: '#FFEB3B', size: 25, dir: 'right' },  // Kleine gele (rechts)
    { color: '#0A194F', size: 90, dir: 'right' },  // Grote donkerblauwe (rechts)
    { color: '#1A1A1A', size: 65, dir: 'left' },   // Zwarte (links)
    { color: '#6A1B9A', size: 30, dir: 'right' },  // Paarse (rechts)
    { color: '#C2185B', size: 40, dir: 'right' }   // Roze/maroon (rechts)
  ];
  
  // Maak de objecten aan
  for (let design of hvaDesigns) {
    triangles.push(new HvaTriangle(design.color, design.size, design.dir));
  }
}

function draw() {
  // Strakke, lichtgrijze achtergrondbasis
  background('#E5E7EB');
  
  // Teken de subtiele HvA grid-lijnen op de achtergrond
  drawHvaGrid();
  
  // Controleer of de muis over het canvas hovert
  let isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  
  // Update en toon alle driehoeken
  for (let t of triangles) {
    t.update(isHovering);
    t.display();
  }
}

// Functie om de kenmerkende vierkant-verdeling op de achtergrond te tekenen
function drawHvaGrid() {
  stroke('#D1D5DB');
  strokeWeight(1);
  noFill();
  // Hoofdassen
  line(width / 2, 0, width / 2, height);
  line(0, height / 2, width, height / 2);
  // Sub-kwadranten (zoals in de afbeelding)
  line(width * 0.75, 0, width * 0.75, height / 2);
  line(width / 2, height * 0.25, width, height * 0.25);
  line(width * 0.625, height * 0.25, width * 0.625, height / 2);
}

class HvaTriangle {
  constructor(col, size, dir) {
    this.x = random(width);
    this.y = random(height);
    this.size = size;
    this.color = col;
    this.dir = dir; // 'left' of 'right'
    
    // Snelheid voor het rustige zweven (naar rechts)
    this.floatSpeed = random(1, 2.5);
    
    // Willekeurige hoek en snelheid voor het DVD-bouncen
    let angle = random(TWO_PI);
    this.bounceSpeed = random(3, 5);
    this.vx = cos(angle) * this.bounceSpeed;
    this.vy = sin(angle) * this.bounceSpeed;
  }
  
  update(hovering) {
    if (hovering) {
      // --- HOVER STAND: DVD logo bounce ---
      this.x += this.vx;
      this.y += this.vy;
      
      let halfSize = this.size / 2;
      
      // Bouncen tegen de zijkanten
      if (this.x - halfSize < 0 || this.x + halfSize > width) {
        this.vx *= -1;
        this.x = constrain(this.x, halfSize, width - halfSize);
      }
      // Bouncen tegen de boven- en onderkant
      if (this.y - halfSize < 0 || this.y + halfSize > height) {
        this.vy *= -1;
        this.y = constrain(this.y, halfSize, height - halfSize);
      }
    } else {
      // --- STANDAARD STAND: Rustig naar rechts zweven ---
      this.x += this.floatSpeed;
      
      // Een subtiele sinusgolf toevoegen voor het 'zweef' effect
      this.y += sin(frameCount * 0.02 + this.size) * 0.3;
      
      // Als de driehoek volledig rechts uit het scherm is, reset naar links
      if (this.x - this.size > width) {
        this.x = -this.size;
        this.y = random(height);
      }
    }
  }
  
  display() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.color);
    
    let w = this.size * 0.9; // Breedte verhouding
    let h = this.size * 0.7; // Hoogte verhouding
    
    // Teken de strakke HvA-stijl rechterdriehoeken
    if (this.dir === 'right') {
      // Punt wijst naar rechts
      triangle(-w/2, -h/2, -w/2, h/2, w/2, 0);
    } else {
      // Punt wijst naar links
      triangle(w/2, -h/2, w/2, h/2, -w/2, 0);
    }
    pop();
  }
}