window.onresize = changeWindow;
const game = new Game();
const inp = {'up': false, 'right': false, 'left': false, 'down': false};

function load() {
  canvas = document.querySelector('.canvas');
  ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;
  document.onkeydown = keyPress;
  document.onkeyup = keyUp;
  document.onmousedown = click;
  runFrame();
}

function runFrame() {
  game.step(inp.left, inp.up, inp.down, inp.right, inp.space);
  game.draw(inp.space);
  requestAnimationFrame(runFrame);
}

function changeWindow() {
  width = window.innerWidth;
  height = window.innerHeight;
  //REDRAW SCREEN
  ctx.clearRect(0, 0, width, height);
  game.draw();
}

function keyPress(key) {
  if(key.keyCode == 32) {
    game.showBestLine = !game.showBestLine;
  }
  if(key.keyCode == 37) {
    inp.left = true;
  }
  if(key.keyCode == 38) {
    inp.up = true;
  }
  if(key.keyCode == 39) {
    inp.right = true;
  }
  if(key.keyCode == 40) {
    inp.down = true;
  }
}
function keyUp(key) {
  if(key.keyCode == 37) {
    inp.left = false;
  }
  if(key.keyCode == 38) {
    inp.up = false;
  }
  if(key.keyCode == 39) {
    inp.right = false;
  }
  if(key.keyCode == 40) {
    inp.down = false;
  }
}

function leftClick() {
  const x = event.clientX;
  const y = event.clientY;
}

function click() {

}
