let triangleGrid = [];
let waveHeight = 20;
let time = 0;

function setup() {
  createCanvas(400, 400);
  
  // Create grid of triangles
  // Using equilateral triangles with side length
  const triangleSize = 20;
  const rows = Math.ceil(height / (triangleSize * 0.866)); // 0.866 is height ratio
  const cols = Math.ceil(width / triangleSize);
  
  for (let row = 0; row < rows + 2; row++) {
    for (let col = 0; col < cols + 1; col++) {
      const x = col * triangleSize;
      const y = row * (triangleSize * 0.866);
      
      // Offset every other row
      const offsetX = (row % 2) * (triangleSize / 2);
      
      triangleGrid.push({
        baseX: x + offsetX,
        baseY: y,
        size: triangleSize,
        originalY: y,
        pointing: row % 2 === 0 ? 'up' : 'down' // Alternate triangle direction
      });
    }
  }
  
  noStroke();
}

function draw() {
  // Unsaturated background (muted blue-gray inspired by HvA)
  background(210, 210, 215);
  
  time += 0.02;
  
  // Draw triangles
  for (let tri of triangleGrid) {
    // Calculate distance from mouse
    const dx = mouseX - tri.baseX;
    const dy = mouseY - tri.baseY;
    const distance = sqrt(dx * dx + dy * dy);
    
    // Wave effect - influenced by distance and time
    const waveInfluence = max(0, 1 - distance / 120);
    const wave = sin(time - distance * 0.02) * waveInfluence * waveHeight;
    
    // Adjust Y position based on wave
    const currentY = tri.baseY + wave;
    
    // Calculate color based on wave height (lighter when wave peaks)
    const colorShift = wave / waveHeight; // -1 to 1
    const baseHue = tri.pointing === 'up' ? 210 : 190; // HvA-inspired hues
    const baseSaturation = 25; // Unsaturated
    const baseLightness = 55 + colorShift * 15; // Gets lighter with wave
    
    fill(hslToRgb(baseHue, baseSaturation, baseLightness));
    
    // Draw triangle
    drawTriangle(tri.baseX, currentY, tri.size, tri.pointing === 'up');
  }
}

function drawTriangle(x, y, size, pointingUp) {
  const h = size * 0.866; // Height of equilateral triangle
  
  if (pointingUp) {
    triangle(
      x, y - h / 2,           // top
      x - size / 2, y + h / 2, // bottom left
      x + size / 2, y + h / 2  // bottom right
    );
  } else {
    triangle(
      x, y + h / 2,            // bottom
      x - size / 2, y - h / 2, // top left
      x + size / 2, y - h / 2  // top right
    );
  }
}

function hslToRgb(h, s, l) {
  // Convert HSL to RGB
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return color(r * 255, g * 255, b * 255);
}
