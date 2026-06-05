function setup() {
    createCanvas(400, 400);
    noLoop(); // één statisch beeld
  }
  
  function draw() {
    background(10); // iets lichter dan puur zwart
  
    // Hoeken voor mooie lijnen
    strokeJoin(BEVEL);
    strokeCap(ROUND);
  
    // Helper: polygon met één gekozen kleur tussen color1 en color2
    function drawPolygon(vertices, color1, color2, alpha = 255) {
      let c1 = color(color1);
      let c2 = color(color2);
      let t = random(0.2, 0.8);
      let c = lerpColor(c1, c2, t);
      c.setAlpha(alpha);
      noStroke();
      fill(c);
      beginShape();
      for (let v of vertices) {
        vertex(v.x, v.y);
      }
      endShape(CLOSE);
    }
  
    // Helper: gloeiende naad tussen 2 punten
    function drawSeam(v1, v2, seamColor) {
      let c = color(seamColor);
  
      // zachte buiten-gloed
      strokeWeight(4);
      c.setAlpha(60);
      stroke(c);
      line(v1.x, v1.y, v2.x, v2.y);
  
      // heldere kern
      strokeWeight(1.5);
      c.setAlpha(220);
      stroke(c);
      line(v1.x, v1.y, v2.x, v2.y);
    }
  
    // ---------------------------
    // FACETTEN: vul bijna heel canvas
    // ---------------------------
    let polygons = [
      // TOP-RIGHT: cyan / licht blauw
      { vertices: [{x: 220, y: 0}, {x: 400, y: 0}, {x: 400, y: 140}], color1: '#00FFFF', color2: '#ADD8E6' },
      { vertices: [{x: 220, y: 0}, {x: 320, y: 150}, {x: 400, y: 140}], color1: '#00CED1', color2: '#87CEEB' },
      { vertices: [{x: 320, y: 150}, {x: 400, y: 140}, {x: 400, y: 260}], color1: '#00BFFF', color2: '#4682B4' },
      { vertices: [{x: 280, y: 220}, {x: 320, y: 150}, {x: 400, y: 260}], color1: '#40E0D0', color2: '#5F9EA0' },
  
      // TOP-LEFT: iets donkerder paars/blauw
      { vertices: [{x: 0, y: 0}, {x: 180, y: 0}, {x: 120, y: 120}], color1: '#1A0033', color2: '#4B0082' },
      { vertices: [{x: 0, y: 0}, {x: 120, y: 120}, {x: 0, y: 140}], color1: '#000020', color2: '#2F4F4F' },
      { vertices: [{x: 120, y: 120}, {x: 220, y: 0}, {x: 200, y: 160}], color1: '#4B0082', color2: '#8A2BE2' },
  
      // CENTRUM: magenta / roze / violet
      { vertices: [{x: 120, y: 120}, {x: 200, y: 160}, {x: 150, y: 230}], color1: '#FF00FF', color2: '#8A2BE2' },
      { vertices: [{x: 150, y: 230}, {x: 200, y: 160}, {x: 260, y: 210}], color1: '#FF1493', color2: '#9400D3' },
      { vertices: [{x: 150, y: 230}, {x: 260, y: 210}, {x: 210, y: 300}], color1: '#C71585', color2: '#9932CC' },
      { vertices: [{x: 90,  y: 260}, {x: 150, y: 230}, {x: 140, y: 320}], color1: '#FF007F', color2: '#FF69B4' },
  
      // BOTTOM-RIGHT: mix van roze / rood / donker
      { vertices: [{x: 210, y: 300}, {x: 260, y: 210}, {x: 340, y: 320}], color1: '#FF3366', color2: '#8B0000' },
      { vertices: [{x: 210, y: 300}, {x: 340, y: 320}, {x: 260, y: 400}], color1: '#FF0040', color2: '#4B0000' },
      { vertices: [{x: 340, y: 320}, {x: 400, y: 260}, {x: 400, y: 400}], color1: '#B22222', color2: '#2B0000' },
  
      // BOTTOM-LEFT: oranje / geel / bruin
      { vertices: [{x: 0, y: 220}, {x: 90, y: 260}, {x: 0, y: 340}], color1: '#FF8C00', color2: '#FFD700' },
      { vertices: [{x: 0, y: 340}, {x: 90, y: 260}, {x: 140, y: 320}], color1: '#FF7F50', color2: '#FFB347' },
      { vertices: [{x: 0, y: 340}, {x: 140, y: 320}, {x: 60, y: 400}], color1: '#FF4500', color2: '#8B4513' },
      { vertices: [{x: 60, y: 400}, {x: 140, y: 320}, {x: 210, y: 300}], color1: '#D2691E', color2: '#A0522D' },
      { vertices: [{x: 60, y: 400}, {x: 210, y: 300}, {x: 260, y: 400}], color1: '#CD853F', color2: '#2F1B0C' }
    ];
  
    // teken alle facetten
    for (let poly of polygons) {
      drawPolygon(poly.vertices, poly.color1, poly.color2);
    }
  
    // ---------------------------
    // LICHT: witte “stralen” / glans
    // ---------------------------
  
    // grote zachte witte driehoeken (licht dat door de vlakken breekt)
    let lightPolys = [
      // van rechtsboven naar centrum
      { vertices: [{x: 260, y: 0}, {x: 400, y: 0}, {x: 260, y: 220}] },
      // van centrum naar linksonder
      { vertices: [{x: 140, y: 80}, {x: 220, y: 220}, {x: 0, y: 260}] },
      // van midden naar rechtsonder
      { vertices: [{x: 220, y: 220}, {x: 400, y: 260}, {x: 260, y: 400}] }
    ];
  
    for (let lp of lightPolys) {
      drawPolygon(lp.vertices, '#FFFFFF', '#FFFFFF', 70); // lage alpha = zachte glans
    }
  
    // extra lichte naden
    let seams = [
      // top-right
      [{x: 220, y: 0}, {x: 320, y: 150}, '#E0FFFF'],
      [{x: 320, y: 150}, {x: 400, y: 140}, '#F0FFFF'],
      [{x: 280, y: 220}, {x: 400, y: 260}, '#B0E0E6'],
  
      // centrum
      [{x: 120, y: 120}, {x: 200, y: 160}, '#FFB6C1'],
      [{x: 150, y: 230}, {x: 260, y: 210}, '#FF69B4'],
      [{x: 150, y: 230}, {x: 210, y: 300}, '#FFC0CB'],
  
      // bottom-left
      [{x: 0, y: 340}, {x: 140, y: 320}, '#FFE4B5'],
      [{x: 60, y: 400}, {x: 210, y: 300}, '#FFDAB9'],
  
      // bottom-right
      [{x: 210, y: 300}, {x: 340, y: 320}, '#FFCCCC'],
      [{x: 340, y: 320}, {x: 400, y: 260}, '#FFEFFF']
    ];
  
    for (let s of seams) {
      drawSeam(s[0], s[1], s[2]);
    }
  }