var 
  Engine = Matter.Engine,
  Events = Matter.Events,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Composites = Matter.Composites,
  Common = Matter.Common,
  MouseConstraint = Matter.MouseConstraint,
  Mouse = Matter.Mouse,
  World = Matter.World,
  Bodies = Matter.Bodies,
  Body = Matter.Body;



let globalWidth = window.innerWidth, globalHeight = window.innerHeight - 200
let radius = Math.min(globalWidth, globalHeight) / 24

// create engine
var engine = Engine.create(),
    world = engine.world;

// create renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: globalWidth,
        height: globalHeight,
        showAngleIndicator: false,
    }
});

Render.run(render);

// create runner
var runner = Runner.create();
Runner.run(runner, engine);


// create bowl
const bowlParts = []
const nSegments = 15
let 
    bowlX = globalWidth / 2, 
    bowlY = globalHeight / 3, 
    bowlRadius = Math.min(globalWidth, globalHeight) / 4, 
    bowlMaxAngle = Math.PI * 0.4

for (let i = -nSegments / 2; i < nSegments / 2 + 1; i++) {
  let angle = Math.PI / 2 + i * bowlMaxAngle / (nSegments / 2), 
      x = bowlX + Math.cos(angle) * bowlRadius,
      y = bowlY + Math.sin(angle) * bowlRadius
  let segment = Bodies.rectangle(x, y, radius, radius / 4, {render: {
         fillStyle: 'rgb(255, 255, 255)',
  }})
  Body.rotate(segment, angle - Math.PI / 2)
  bowlParts.push(segment)
}

let compound = Body.create({
    parts: bowlParts,
    isStatic: true
});
World.add(world, compound);


// events on every rendering step
let counter = 0, direction = 1, speed, ballSource, ballFrequency

var speedSlider = new Slider('#speed', {})
  .on('slide', () => {speed = speedSlider.getValue()})
speed = speedSlider.getValue()

var ballSourceSlider = new Slider('#ballSource', {})
  .on('slide', () => {ballSource = ballSourceSlider.getValue()})
ballSource = ballSourceSlider.getValue()

var ballFrequencySlider = new Slider('#ballFrequency', {})
  .on('slide', () => {ballFrequency = ballFrequencySlider.getValue()})
ballFrequency = ballFrequencySlider.getValue()


Events.on(engine, 'beforeUpdate', function(event) {
  // create balls
  if ((counter) % Math.floor(500 / ballFrequency) == 0) {
  
    const ballLocation = ballSource[0] + Math.random() * (ballSource[1] - ballSource[0])
    const x = ballLocation * globalWidth
    World.add(world, Bodies.circle(x, -2, (Math.random()/4 + 0.5) * radius ))
  }
  counter += 1
  if (Math.abs(compound.angle) >= Math.PI / 5 ) {
    direction *= -1

  }
  Body.rotate(compound, direction * 0.008 * speed / 14);
});


// setup the world
World.add(world, [
    // floor
    Bodies.rectangle(globalWidth / 2, globalHeight + 5, globalWidth, 10, { isStatic: true }),    
]);

// add mouse control
var mouse = Mouse.create(render.canvas),
    mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });

World.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;
render.options.wireframes = false
// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: globalWidth, y: globalHeight }
});


