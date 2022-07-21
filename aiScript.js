window.onresize = changeWindow;
//Input is [pipeX (to player), pipeY1, pipeY2, birdHeight, birdVel]
const neat = new Neat(5, 1);
let bestAi;

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onmousedown = click;
}

function showBest() {
}

function train() {
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
  ctx.clearRect(0, 0, width, height);
}

function keyPress(key) {
  if(key.keyCode == 32) {
    //train();
  }
}

function leftClick() {
  const x = event.clientX;
  const y = event.clientY;
}

function click() {

}
