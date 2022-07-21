window.onresize = changeWindow;
//Input is [xToTarget, yToTarget, AngleToTarget, curAngle, curSpeed]
const neat = new Neat(5, 4, {'startMut':100});
let bestAi = new Net(5, 4);
let bestAiScore = 0;
let game = new Game();
let run = false;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onmousedown = click;
}

function showBest() {
  if(!bestAi) {
    return;
  }
  const inp = game.getInput();
  const out = bestAi.pass(inp);
  game.step(out[0], out[1], out[2], out[3], out[4]);
  game.draw();
}

function train() {
  for(let i = 0; i < neat.popSize; i++) {
    const net = neat.pop[i];
    const game = new Game();
    let ticks = 1000;
    let maxScore = 0;
    while(ticks != 0) {
      const inp = game.getInput();
      const out = net.pass(inp);
      game.step(out[0], out[1], out[2], out[3], out[4]);
      if(game.score == maxScore) {
        ticks -= 1;
      } else {
        maxScore = game.score;
        ticks = 1000;
      }
      if(game.score == 40) {
        break;
      }
    }
    neat.fitness[i] = game.score;
    if(game.score > bestAiScore) {
      bestAiScore = game.score;
      bestAi = net;
    }
  }
  neat.step();
  console.log(neat.gen);
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
  ctx.clearRect(0, 0, width, height);
}

function keyPress(key) {
  if(key.keyCode == 32) {
    train();
  }
}

function leftClick() {
  const x = event.clientX;
  const y = event.clientY;
}

function click() {
  train();
  game = new Game();
  clearInterval(run);
  run = setInterval(showBest, 1000 / 60);
  setTimeout(click, 5000);
}
