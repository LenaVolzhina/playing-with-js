const canvas = document.querySelector("#draw");

const ctx = canvas.getContext("2d");

// -----------
// constants
// -----------
let FREE = 1,
  OCCUPIED = 2,
  PATH = 3,
  USER = 4,
  ENEMY = 5;

// https://www.imgonline.com.ua/eng/color-palette.php
let colorsEnum = {
  1: "#FFEFD5",
  2: "#800080",
  3: "#400040",
  4: "#FF1493",
  5: "#6495ED"
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 150;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function choice(arr) {
  let idx = Math.floor(Math.random() * arr.length);
  return arr[idx];
}

// -----------------------
// field-related functions
// -----------------------

let nRows, nCols;
let field;
let rectH, rectW;

function initField(density = 10) {
  // density: bigger = more dense field
  let squareSize = Math.min(canvas.height, canvas.width) / density;
  nRows = Math.floor(canvas.height / squareSize);
  nCols = Math.floor(canvas.width / squareSize);
  rectH = canvas.height / nRows; rectW = canvas.width / nCols;

  // create empty array
  field = new Array(nRows);
  for (var row = 0; row < nRows; row++) {
    field[row] = new Array(nCols);
  }

  // initialize with values
  for (var row = 0; row < nRows; row++) {
    for (var col = 0; col < nCols; col++) {
      if (row == 0 || row == nRows - 1)
        field[row][col] = OCCUPIED;
      else if (col == 0 || col == nCols - 1)
        field[row][col] = OCCUPIED;
      else field[row][col] = FREE;
    }
  }
}

function showField() {
  if (field) {
    // draw rectangles row-by-row
    for (var row = 0; row < nRows; row++) {
      for (var col = 0; col < nCols; col++) {
        let rectType = field[row][col];     // free / occupied / path
        ctx.fillStyle = colorsEnum[rectType];
        ctx.fillRect(col * rectW, row * rectH, rectW, rectH);
      }
    }
  }
}

// ----------------
// enemies & user
// ----------------

//   N
// W   E
//   S
let N = - Math.PI / 2,
    E = 0,
    S = Math.PI / 2,
    W = Math.PI,
    NE = -Math.PI / 4,
    SE = Math.PI / 4,
    SW = Math.PI * 3 / 4,
    NW = -Math.PI * 3 / 4;

var startPositionsEnemies

// floating point arithmetic creates troubles 
function shrinkToZero(val) {
  if (Math.abs(val) < 1e-5) {
    return 0
  } else {
    return val
  }
}

function signSin(val) {
  return Math.sign(shrinkToZero(Math.sin(val)))
}

function signCos(val) {
  return Math.sign(shrinkToZero(Math.cos(val)))
}

// enemy: moves automatically, bounces off the occupied spaces
class Enemy {
  constructor(position) {
    if (position) {
      [this.row, this.col, this.direction] = position
    }
    else {
      [this.row, this.col, this.direction] = choice(startPositionsEnemies)
    }
  }

  move() {
    let nextRow = this.row + signSin(this.direction), nextCol = this.col + signCos(this.direction)
    
    if (field[nextRow][nextCol] == OCCUPIED) {
      // riched the border -- turn around
      if (field[this.row][nextCol] == OCCUPIED) {
        // horizontal border
        this.direction = Math.PI - this.direction
      }
      if (field[nextRow][this.col] == OCCUPIED) {
        // vertical border
        this.direction = - this.direction
      }
    }
    // update position
    this.row = this.row + signSin(this.direction); this.col = this.col + signCos(this.direction)
  }
  
  draw() {
    ctx.fillStyle = colorsEnum[ENEMY]
    ctx.beginPath();
    ctx.ellipse(
      (this.col + 0.5) * rectW,    // x
      (this.row + 0.5) * rectH,    // y
      0.5 * rectW, 0.5 * rectH, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
}


// user: moves considering keyboard input (but direction is freezed while moving through free space)
class User {
  constructor(position) {
    if (position) {
      [this.row, this.col, this.direction] = position
    }
    else {
      // the middle of the upper boundary
      [this.row, this.col, this.direction] = [0, Math.floor(field[0].length / 2), null]
    }
  }

  move() {
    // update direction if needed
    if (this.direction === null) {
      // check if user is pressing keys
      if (!(directionPressed === null)) {
        console.log("directionPressed", this.direction)
        this.direction = directionPressed
        directionPressed = null      // to be sure we processed keydown only once
      }
    }
    
    // move
    if (!(this.direction === null)) {
      let nextRow = this.row + signSin(this.direction), nextCol = this.col + signCos(this.direction)
      // check that user is not trying go outside the field
      if (0 <= nextRow && nextRow <= field.length) {
        this.row = nextRow
      }
      if (0 <= nextCol && nextCol <= field[0].length) {
        this.col = nextCol
      }
    }
    
    // check if we should stop moving
    if (field[this.row][this.col] == OCCUPIED) {
      this.direction = null
    }
  }
  
  draw() {
    ctx.fillStyle = colorsEnum[USER]
    ctx.beginPath();
    ctx.ellipse(
      (this.col + 0.5) * rectW,    // x
      (this.row + 0.5) * rectH,    // y
      0.5 * rectW, 0.5 * rectH, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
}


// ----------------
// interactions & drawing
// ----------------
// button for step-by-step debug
var debugNextStep = false
var debugNextStepButton = document.getElementById("debugNextStep")
debugNextStepButton.addEventListener("click", () => {
  debugNextStep = true
})

// input from keyboard
var directionPressed = null;
document.addEventListener('keydown', function(event) {
  let code = event.keyCode
  if ([38, 87].includes(code)) {
    directionPressed = N
  } else if ([39, 68].includes(code)) {
    directionPressed = E
  } else if ([40, 83].includes(code)) {
    directionPressed = S
  } else if ([37, 65].includes(code)) {
    directionPressed = W
  }
});
document.addEventListener('keyup', function(event) {
  directionPressed = null
});


var DEBUG = false

if (DEBUG) initField(7)
else initField(20);

// TODO: randomize
startPositionsEnemies = [
  [1, 3, SE],
  [3, 3, NW],
  // [2, 2, NE]
]
var enemies = []
startPositionsEnemies.forEach(function(pos) {
  enemies.push(new Enemy(pos))
})
var user = new User()

// repeated drawing
var frameNum = 0
var moveEnemyPerFrame = 4
var moveUserPerFrame = 2
if (DEBUG) { moveEnemyPerFrame = 1; moveUserPerFrame = 1 }
async function drawFun() {
  // draw field and current positions
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  showField();  
  user.draw()
  enemies.forEach(function(enemy) {
    enemy.draw()
  })
  
  // move if needed
  if (frameNum % moveEnemyPerFrame == 0) {
    enemies.forEach(function(enemy) {
      enemy.move()
    })
  }
  if (frameNum % moveUserPerFrame == 0) {
    user.move()
  }
  
  if (DEBUG) {
    while(!debugNextStep) {
      await sleep(100);
    }
    debugNextStep = false  
  } else {
    await sleep(20);  
  } 
  
  frameNum++; if(frameNum == 10000) frameNum = 0 
  window.requestAnimationFrame(drawFun);
}

window.requestAnimationFrame(drawFun);
