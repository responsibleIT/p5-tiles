function setup() {
    createCanvas(400, 400);
    randomSeed(42);
    background('#f0ede8');
    noLoop();

    let points = [
        // Hardcoded points spread evenly across the canvas
        { x: 0, y: 0 }, { x: 200, y: 0 }, { x: 400, y: 0 },
        { x: 0, y: 200 }, { x: 200, y: 200 }, { x: 400, y: 200 },
        { x: 0, y: 400 }, { x: 200, y: 400 }, { x: 400, y: 400 },
        { x: 100, y: 100 }, { x: 300, y: 100 }, { x: 100, y: 300 },
        { x: 300, y: 300 }, { x: 50, y: 50 }, { x: 350, y: 50 },
        { x: 50, y: 350 }, { x: 350, y: 350 }, { x: 0, y: 100 },
        { x: 400, y: 100 }, { x: 0, y: 300 }, { x: 400, y: 300 },
        { x: 200, y: 50 }, { x: 200, y: 350 }, { x: 50, y: 200 },
        { x: 350, y: 200 }, { x: 100, y: 0 }, { x: 300, y: 0 },
        { x: 100, y: 400 }, { x: 300, y: 400 }, { x: 150, y: 150 },
        { x: 250, y: 150 }, { x: 150, y: 250 }, { x: 250, y: 250 },
        { x: 50, y: 100 }, { x: 350, y: 100 }, { x: 50, y: 300 },
        { x: 350, y: 300 }, { x: 100, y: 50 }, { x: 300, y: 50 },
        { x: 100, y: 350 }, { x: 300, y: 350 }
    ];

    stroke('#f0ede8');
    strokeWeight(5);
    fill('#cc3311');

    for (let i = 0; i < points.length; i++) {
        let neighbors = findNearestNeighbors(points, i, 3);
        for (let j = 0; j < neighbors.length; j++) {
            for (let k = j + 1; k < neighbors.length; k++) {
                let p1 = points[i];
                let p2 = points[neighbors[j]];
                let p3 = points[neighbors[k]];
                triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
            }
        }
    }
}

function findNearestNeighbors(points, index, count) {
    let distances = [];
    for (let i = 0; i < points.length; i++) {
        if (i !== index) {
            let d = dist(points[index].x, points[index].y, points[i].x, points[i].y);
            distances.push({ index: i, distance: d });
        }
    }
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, count).map(d => d.index);
}