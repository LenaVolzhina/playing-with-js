const canvas = document.querySelector("#draw");

const ctx = canvas.getContext("2d");

// -----------
// global constants / variables
// -----------
var minEdgesNum = 3,     // can't be changed
    maxEdgesNum = 15;    // can be changed

var dotStep = 0.005;        // can be changed

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 150;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function choice(arr) {
  let idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

/* SOURCE:
import matplotlib.pyplot as plt
import matplotlib

cmap = plt.cm.get_cmap('jet')
N = 20

for i in range(N + 1):
	hex = matplotlib.colors.rgb2hex(cmap(1.0 * i / N))
	print('    "{}",'.format(hex))
*/
let colors = [
    "#000080",
    "#0000b6",
    "#0000f1",
    "#0018ff",
    "#004cff",
    "#0080ff",
    "#00b0ff",
    "#00e4f8",
    "#29ffce",
    "#53ffa4",
    "#7dff7a",
    "#a4ff53",
    "#ceff29",
    "#f8f500",
    "#ffc400",
    "#ff9400",
    "#ff6800",
    "#ff3800",
    "#f10800",
    "#b60000",
    "#800000",
]

function getColor(edgesNum) {
  let idx = Math.round((edgesNum - minEdgesNum) / (maxEdgesNum - minEdgesNum) * colors.length);
  return colors[idx];
}


// -----------------------
// polygon
// -----------------------

class Polygon {
  constructor(edgesNum, centerX=canvas.width / 2, centerY=canvas.height / 2) {
    this.edgesNum = edgesNum;
    this.edgeAngle = 2 * Math.PI  / this.edgesNum;
    this.diameter = 10 + edgesNum * Math.min(canvas.height, canvas.width) / 2 / maxEdgesNum;
    this.edgeLength = this.diameter * Math.sin(Math.PI / this.edgesNum);
    this.perimeter = this.edgeLength * this.edgesNum;
    
    // for even edgesNum start from horizontal line
    this.startAngle = -Math.PI / 2;
    if (this.edgesNum % 2 == 0)
      this.startAngle -= this.edgeAngle / 2;
    
    this.centerX = centerX;
    this.centerY = centerY;
  }

  getX(angle) {
    return this.centerX + Math.cos(angle) * this.diameter;
  }
  
  getY(angle) {
    return this.centerY + Math.sin(angle) * this.diameter;
  }
  
  draw() {
    let curAngle = this.startAngle;
    
    ctx.beginPath();
    ctx.moveTo(this.getX(curAngle), this.getY(curAngle))
    ctx.strokeStyle = getColor(this.edgesNum);
    
    for (var edge = 0; edge < this.edgesNum; edge++) {
      // draw each edge
      curAngle += this.edgeAngle;
      let finishX = this.getX(curAngle),
          finishY = this.getY(curAngle);      

      ctx.lineTo(finishX, finishY);
    }
    ctx.stroke();
  }
}


class Dot {
  constructor(polygon, position=0) {
    this.polygon = polygon;
    this.position = position;
    this.speed = polygon.perimeter * (1 + (maxEdgesNum - polygon.edgesNum) / 2);
  }
  
  draw() {
    let p = this.polygon;
    
    // find right edge
    let curEdge = Math.floor(this.position / p.edgeLength);
    
    // calc it's ends
    let startAngle  = p.startAngle + curEdge * p.edgeAngle,
        finishAngle = p.startAngle + (curEdge + 1) * p.edgeAngle,
        startX = p.getX(startAngle), startY = p.getY(startAngle),
        finishX = p.getX(finishAngle), finishY = p.getY(finishAngle);
    
    // calc position between it's ends
    let dotPart = (this.position - curEdge * p.edgeLength) / p.edgeLength,
        dotX = startX + (finishX - startX) * dotPart,
        dotY = startY + (finishY - startY) * dotPart;
    
    // draw
    let dotRadius = Math.min(canvas.height, canvas.width) / 100;
    ctx.fillStyle = 'black'
    ctx.beginPath();
    ctx.ellipse(
      dotX, dotY, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
  
  move() {
    this.position += dotStep * this.speed;
    this.position = this.position % this.polygon.perimeter;
  }
}


// ----------------
// interactions & drawing
// ----------------

// create polygons and dots
var polygons = [], dots = []
for (let edge = 3; edge < maxEdgesNum; edge++) {
  let p = new Polygon(edge)
  polygons.push(p)
  // want to start from te middle of the bottom edge
  let startPosition = (p.edgesNum / 2 + ((p.edgesNum % 2 == 0) ? 0.5 : 0)) * p.edgeLength;
  startPosition += 1.15 ** edge
  
  dots.push(new Dot(p, startPosition))
}

// repeated drawing
async function drawFun() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  polygons.forEach(function(polygon) {
    polygon.draw()
  })
  dots.forEach(function(dot) {
    dot.draw()
    dot.move()    
  })
  
  await sleep(40)
  window.requestAnimationFrame(drawFun);
}

window.requestAnimationFrame(drawFun);
