const canvas = document.querySelector('#draw')

const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth;
canvas.height = window.innerHeight - 150;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function choice(arr) {
  let idx = Math.floor(Math.random() * arr.length)
  return arr[idx]
}


// -----------------
// describing
// -----------------
let HOUSE = 1, ROAD = 2, GRASS = 4, LEAVES = 10

let col_enum = {
  1: '#332f2c',
  2: '#505050',
  4: '#013220',
}

let prob_enum = {
  1: 0.2,
  2: 0.75,
  4: 0.9
}

let field = [
  [GRASS, GRASS,  ROAD, GRASS, GRASS, GRASS, HOUSE, HOUSE, HOUSE],
  [HOUSE,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD],
  [HOUSE,  ROAD, HOUSE, HOUSE, HOUSE, HOUSE,  ROAD, GRASS,  ROAD],
  [ ROAD,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD,  ROAD, GRASS,  ROAD],
  [GRASS, HOUSE,  ROAD, GRASS, GRASS,  ROAD, GRASS,  ROAD,  ROAD],
  [GRASS, HOUSE,  ROAD,  ROAD, GRASS,  ROAD,  ROAD,  ROAD, GRASS],
  [ ROAD,  ROAD,  ROAD, GRASS,  ROAD,  ROAD, GRASS,  ROAD, GRASS],
]
let nrows = field.length, ncols = field[0].length
let rect_h = canvas.height / nrows, rect_w = canvas.width / ncols;

// start positions for cars
let start_positions = [
  // [i, j, angle]
  [2.5, 0, Math.PI / 2],
  [0, 6.5, 0],
  [0, 3.5, 0],
  [7.5, 7, -Math.PI / 2],
  [5.5, 7, -Math.PI / 2],
  [9, 3, Math.PI * 3 / 4],
  [9, 1.75, Math.PI * 9 / 8],
]

// get field type by x, y
function get_elem_by_xy(x, y) {  
  let field_col = Math.floor(x / rect_w), 
      field_row = Math.floor(y / rect_h)
  
  if (0 <= field_row && field_row < field.length &&
      0 <= field_col && field_col < field[0].length) {
    return field[field_row][field_col]
  } else {
    return -1 
  }
}

// initialize random leaves
let leaves = [], leaves_freq = 30
let leaves_colors = ['rgba(0,76,0,0.9)',
                    'rgba(0,30,0,0.9)',
                    'rgba(0,81,48,0.9)',
                    'rgba(0,81,7,0.9)']
function init_leaves() {
  leaves = []
  for (var row = 0; row < nrows; row++) {
    let leaves_row = []
    for (var col = 0; col < ncols; col++) {
      
      // get info about field item and probability
      let rect_type = field[row][col]
      let leaves_prob = prob_enum[rect_type]
      let mock = Array.apply(null, Array(leaves_freq))
      
      // create array with leaves
      let new_item = mock.map(
        i => mock.map(
          j => {
            let have_leaves = Math.random() < leaves_prob
            if (have_leaves) {
              return Math.floor(Math.random() * leaves_colors.length)
            }
            else {return -1}
          }
        )
      )
      leaves_row.push(new_item)
    } 
    leaves.push(leaves_row)
  }
}


// draw roads etc
function draw_outdoors(only_rect_type) {
  for (var row = 0; row < nrows; row++) {
    for (var col = 0; col < ncols; col++) {
      let rect_type = field[row][col] 
      
      if(rect_type == only_rect_type) {
        // draw usual outdoors (roads, grass, buildings)
        ctx.fillStyle = col_enum[rect_type];
        ctx.fillRect(col * rect_w, row * rect_h, rect_w, rect_h)    
      } 
      
      else if(only_rect_type == LEAVES) {
        // draw leaves over everything
        let leaves_arr = leaves[row][col]
        let leaves_w = rect_w / leaves_freq, leaves_h = rect_h / leaves_freq
        
        for (var lrow = 0; lrow < leaves_freq; lrow++) {
          for (var lcol = 0; lcol < leaves_freq; lcol++) {
            let val = leaves_arr[lrow][lcol]
            if(val != -1 && Math.random() < 0.99) {
              ctx.fillStyle = leaves_colors[val];
              ctx.fillRect(
                col * rect_w + lcol * leaves_w, 
                row * rect_h + lrow * leaves_h, 
                leaves_w, leaves_h
              )   
            }  
          }
        }
      }
    }  
  }
}




// -----------------
// drawing and moving cars
// -----------------
let car_width = 10, car_length = 15;
let car_colors = ["#3d083a", "#0f083d", "#3d083b", "#3d3d08", "#1e5e45"]
let car_light_radius = Math.PI / 6;
let steps_ahead = 25, move_step = (rect_h + rect_w) / 40;

// initialize cars with x, y, angle
let start_xya = []
start_positions.forEach(function([i, j, a]) {
  let steps_back = 40
  let x = rect_w * i - steps_back * Math.cos(a)
  let y = rect_h * j - steps_back * Math.sin(a)
  start_xya.push([x, y, a])
})

class Car {
  constructor(position) {
    // TODO: силу фар, направление, мерцание
    if (position) {
      [this.x, this.y, this.angle] = position
    }
    else {
      [this.x, this.y, this.angle] = choice(start_xya)
    }
    this.rotation = 0     // 1 / 0 / -1
    this.color = choice(car_colors)
  }
  
  canMove() {
    // TODO: other cars    
    let next_x = this.x + steps_ahead * Math.cos(this.angle) * move_step, 
        next_y = this.y + steps_ahead * Math.sin(this.angle) * move_step;
    
    let next_field_type = get_elem_by_xy(next_x, next_y)
    // console.log(next_field_type, next_field_type == ROAD)
    return next_field_type == ROAD || next_field_type == -1
  }

  move() {
    // can't move -> rotate  (also a bit of random rotations)
    if (!this.canMove() || Math.random() > 0.97) {
      if (Math.abs(this.rotation) != 1) {
        if (this.rotation == 0) {
          // start rotation
          this.rotation = Math.sign(Math.random() - 0.5)
        }
        else { 
          // fasten rotation
          this.rotation = this.rotation * 2
          if (Math.abs(this.rotation) > 1) {
            // shrink to -1 or 1 if it is out of bounds
            this.rotation = Math.sign(this.rotation)
          }
        }
      }
      // rotate
      this.angle += this.rotation * Math.PI / 20
    }
    else {
      // smoothly stop rotation
      this.rotation = this.rotation * 0.5
      if (this.rotation < 0.001) { this.rotation = 0 }
    } 
    
    // move anyways
    this.x += Math.cos(this.angle) * move_step
    this.y += Math.sin(this.angle) * move_step
  }
  
  draw() {
    // light
    function addLight(x, y, angle, length, radius) {
      // TODO: angles
      var startAngle = - radius / 2,
          endAngle   = + radius / 2
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.ellipse(x, y, length, length, angle, startAngle, endAngle);
      ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(255,213,0,0.125)'
    for (var light_length_coef of [3, 3.5, 4, 4.5, 5, 5.5, 6.5, 7.5, 9.5, 12]) {
      let light_length = light_length_coef * car_length
      let light_radius = car_light_radius + light_length / 200
      addLight(this.x, this.y, this.angle, light_length, light_radius)
    }    
    
    // car
    ctx.fillStyle = this.color    
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, car_length, car_width, this.angle, 0, 2 * Math.PI);
    ctx.fill();
  }
}


//---------------
// real drawing
//---------------

// initialize leaves
init_leaves()

let initLeavesButton = document.getElementById("initLeavesButton")
initLeavesButton.addEventListener("click", () => {
  init_leaves()
})

// initialize cars
let cars = [];
for (var pos of start_xya) {
  cars.push(new Car(pos))
}

let addCarButton = document.getElementById("addCarButton")
addCarButton.addEventListener("click", () => {
  cars.push(new Car())
})

let addAllCarsButton = document.getElementById("addAllCarsButton")
addAllCarsButton.addEventListener("click", () => {
  for (var pos of start_xya) {
    cars.push(new Car(pos))
  }
})


// repeated drawing
async function drawFun() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  draw_outdoors(ROAD)
  draw_outdoors(GRASS)
  
  cars.forEach(function(car) {
    car.move()
    car.draw()
  });
  draw_outdoors(HOUSE)
  draw_outdoors(LEAVES)
  
  await sleep(100)
  window.requestAnimationFrame(drawFun)
}

window.requestAnimationFrame(drawFun)

