let triangles = [];
let time = 0;
let flowDirection = 0; // -1, 0, or 1 based on mouse position

function setup() {
  createCanvas(400, 400);
  
  // Create MANY triangles with small size
  const triangleSize = 10;
  const spacing = triangleSize * 0.9;
  
  // Create grid that extends far outside canvas
  for (let y = -200; y < height + 200; y += spacing * 0.866) {
    for (let x = -200; x < width + 200; x += spacing) {
      const offsetX = ((y / (spacing * 0.866)) % 2) * (spacing / 2);
      triangles.push({
        baseX: x + offsetX,
        baseY: y,
        size: triangleSize,
        pointingUp: ((y / (spacing * 0.866)) | 0) % 2 === 0,
        hue: 270 + Math.sin(x * 0.02 + y * 0.02) * 20, // Midnight purple gradient
        phaseOffset: (x + y) * 0.01,
        randomX: 0,
        randomY: 0
      });
    }
  }
  
  noStroke();
}

function draw() {
  // Dark background
  background(80, 80, 95);
  
  time += 0.03;
  
  // Check if mouse is over canvas
  const isHovering = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  
  // Update and draw triangles
  for (let tri of triangles) {
    let currentX = tri.baseX;
    let currentY = tri.baseY;
    
    let arrowAngle = 0;
    
    if (isHovering) {
      // When hovering, arrows point toward and move toward mouse
      const dx = mouseX - currentX;
      const dy = mouseY - currentY;
      const distToMouse = sqrt(dx * dx + dy * dy);
      
      // Calculate angle toward mouse
      arrowAngle = atan2(dy, dx);
      
      // Move toward mouse
      if (distToMouse > 5) {
        currentX += (dx / distToMouse) * 2;
        currentY += (dy / distToMouse) * 2;
      }
    } else {
      // When not hovering, wave-like side-to-side movement
      const waveX = sin(time + tri.phaseOffset) * 40;
      const waveY = cos(time * 0.5 + tri.phaseOffset) * 20;
      
      currentX += waveX;
      currentY += waveY;
      
      // Wrap around edges for wave effect
      if (currentX < -20) currentX = width + 20;
      if (currentX > width + 20) currentX = -20;
    }
    
    // Unsaturated HvA color
    const saturation = 25;
    const lightness = 50;
    fill(hslToRgb(tri.hue, saturation, lightness));
    
    // Draw arrow when hovering, triangle when not
    if (isHovering) {
      drawArrow(currentX, currentY, tri.size, arrowAngle);
    } else {
      drawTriangle(currentX, currentY, tri.size, tri.pointingUp);
    }
  }
}

function drawTriangle(x, y, size, pointingUp) {
  const h = size * 0.866;
  
  if (pointingUp) {
    triangle(
      x, y - h / 2,
      x - size / 2, y + h / 2,
      x + size / 2, y + h / 2
    );
  } else {
    triangle(
      x, y + h / 2,
      x - size / 2, y - h / 2,
      x + size / 2, y - h / 2
    );
  }
}

function drawArrow(x, y, size, angle) {
  push();
  translate(x, y);
  rotate(angle);
  
  // Arrow head (pointing right)
  const arrowLength = size * 1.2;
  const arrowWidth = size * 0.6;
  
  // Draw arrow shaft
  rectMode(CENTER);
  rect(0, 0, arrowLength * 0.6, arrowWidth * 0.4);
  
  // Draw arrow head (triangle)
  triangle(
    arrowLength / 2, 0,
    arrowLength / 2 - arrowLength * 0.3, -arrowWidth / 2,
    arrowLength / 2 - arrowLength * 0.3, arrowWidth / 2
  );
  
  pop();
}

function hslToRgb(h, s, l) {
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
