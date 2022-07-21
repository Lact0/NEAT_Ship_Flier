//Vars
let width = window.innerWidth;
let height = window.innerHeight;
let canvas;
let ctx;
const DIR = [0, 0, 1000, 0, -1000, 0];

//Useful Functions
function max(n1, n2) {
  if(n1 > n2) {
    return n1;
  }
  return n2;
}

function min(n1, n2) {
  if(n1 < n2) {
    return n1;
  }
  return n2;
}

function randColor() {
  return 'rgba(' + rand(0,255) + ',' + rand(0,255) + ',' + rand(0,255) + ')';
}

function rand(min, max) {
  return Math.floor(Math.random() * (max-min+1)) + (min);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function radToDeg(rad) {
  return rad / Math.PI * 180;
}

function equals(arr1, arr2) {
  if(arr1.length != arr2.length) {
    return false;
  }
  for(let i = 0; i < arr1.length; i++) {
    if(arr1[i] != arr2[i]) {
      return false;
    }
  }
  return true;
}

function copy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

function remove(arr, n) {
  const i = arr.indexOf(n);
  if(i >= 0) {
    arr.splice(i, 1);
    return true;
  }
  return false;
}

function shuffle(arr) {
  let m = arr.length - 1;
  while(m > 0) {
    const i = rand(0, m);
    const temp = arr[i];
    arr[i] = arr[m];
    arr[m] = temp;
    m--;
  }
  return arr;
}

//Classes
class Vector {
  constructor(x = 0, y = 0, x0 = 0, y0 = 0) {
    this.x = x - x0;
    this.y = y - y0;
    this.getMag();
  }

  getMag() {
    this.mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize() {
    if(this.mag == 0) {
      return;
    }
    this.x /= this.mag;
    this.y /= this.mag;
    this.getMag();
  }

  setMag(mag) {
    this.normalize();
    this.x *= mag;
    this.y *= mag;
    this.mag = mag;
  }

  limit(mag) {
    this.getMag();
    if(this.mag > mag) {
      this.setMag(mag);
    }
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
    this.getMag();
  }

  sub(vector) {
    this.x -= vector.x;
    this.y -= vector.y;
    this.getMag();
  }
}

class Screen {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.setRatio();
    this.backgroundColor = 'white';
    this.frameWidth = 1;
    this.frameColor = 'white';
    this.toDraw = [];
  }

  draw() {
    this.setRatio();

    //Fill Background
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.xStart, this.yStart, this.newWidth, this.newHeight);

    while(this.toDraw.length > 0) {
      this.drawElement(this.toDraw.pop());
    }

    //Draw Frame
    ctx.strokeStyle = this.frameColor;
    ctx.lineWidth = this.frameWidth;
    ctx.strokeRect(this.xStart, this.yStart, this.newWidth, this.newHeight);
  }

  drawElement(obj) {
    switch(obj[0]) {
      case 'line':
        ctx.strokeStyle = obj[6];
        ctx.lineWidth = obj[5];
        ctx.beginPath();
        ctx.moveTo(this.xStart + obj[1] * this.ratio, height - (this.yStart + obj[2] * this.ratio));
        ctx.lineTo(this.xStart + obj[3] * this.ratio, height - (this.yStart + obj[4] * this.ratio));
        ctx.stroke();
        break;
      case 'circle':
        ctx.strokeStyle = obj[6];
        ctx.lineWidth = obj[7];
        ctx.beginPath();
        ctx.arc(this.xStart + obj[1] * this.ratio, height - (this.yStart + obj[2] * this.ratio), obj[3] * this.ratio, obj[4], obj[5]);
        ctx.stroke();
        break;
    }
  }

  setRatio() {
    if(this.w / this.h > width / height) {
      //This screen is wider than actual screen
      this.ratio = width / this.w;
    } else {
      //this screen is taller than actual screen
      this.ratio = height / this.h;
    }

    this.newWidth = this.w * this.ratio;
    this.newHeight = this.h * this.ratio;
    this.xStart = parseInt((width - this.newWidth) / 2);
    this.yStart = parseInt((height - this.newHeight) / 2);
  }

  clearSides(d) {
    ctx.clearRect(0, 0, width, this.yStart);
    ctx.clearRect(0, 0, this.xStart, height);
    ctx.clearRect(0, this.yStart + this.h * this.ratio, width, height);
    ctx.clearRect(this.xStart + this.w * this.ratio, 0, width, height);
  }


}

class Game {
  constructor() {
    this.screen = new Screen(1000, 1000);
    this.pos = new Vector(this.screen.w / 2, this.screen.h / 2);
    this.vel = new Vector();
    this.dir = 0;
    this.shipSize = 10;
    this.screen.backgroundColor = 'black';
    this.screen.frameWidth = 1;
    this.stars = [];
    this.maxForce = .3;
    this.maxSpeed = 1000;
    this.turnForce = 7.5;
    this.showBestLine = false;

    for(let i = 0; i < 1000; i++) {
      this.addStar();
    }
    this.score = 0;
    this.targets = [];
    for(let i = 0; i < 10; i++) {
      this.targets.push(new Vector(rand(this.shipSize * 1.5, 1000 - this.shipSize * 1.5), rand(1, 999)));
    }
    this.curTarget = 0;
    this.counter = 100;
  }

  addStar() {
    const dist = Math.random() * .1
    this.stars.push(['circle', rand(1, 999), rand(1, 999), .5, 0, Math.PI * 2, 'rgba(255, 255, 255, ' + (dist * 5 + .1) + ')', 1, dist]);
  }

  draw() {
    for(let i = 0; i < this.stars.length; i++) {
      this.screen.toDraw.push(this.stars[i]);
    }

    const target = this.targets[this.curTarget];
    this.screen.toDraw.push(['circle', target.x, target.y, this.shipSize, 0, Math.PI * 2, 'red', 3])

    let lines = this.getBestLine();
    if(this.showBestLine) {
      while(lines.length > 0) {
        this.screen.toDraw.push(lines.pop());
      }
    }

    this.drawPlayerAt(this.pos.x, this.pos.y);
    this.drawPlayerAt(this.pos.x + 1000, this.pos.y);
    this.drawPlayerAt(this.pos.x - 1000, this.pos.y);
    this.drawPlayerAt(this.pos.x, this.pos.y + 1000);
    this.drawPlayerAt(this.pos.x, this.pos.y - 1000);

    this.screen.draw();
    this.screen.clearSides();

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = String(parseInt(1000 * .02 * this.screen.ratio)) + 'pt Courier New';
    ctx.fillStyle = 'white';
    ctx.fillText('Score:' + this.score, this.screen.xStart, this.screen.yStart);
  }

  getInput() {
    const target = this.targets[this.curTarget];
    let mn = {'mag': 100000};
    let minInd = 0;
    for(let i = 0; i < 5; i++) {
      const pos = new Vector(this.pos.x + DIR[i], this.pos.y + DIR[i + 1]);
      const direction = new Vector(target.x, target.y, pos.x, pos.y);
      if(direction.mag < mn.mag) {
        mn = direction;
        minInd = i;
      }
    }
    const ret = [mn.x, mn.y];
    let angle = radToDeg(Math.atan(mn.y / mn.x));
    if(mn.x < 0) {
      angle = 180 - angle;
    }
    angle += 360;
    angle %= 360;
    ret.push(angle);
    ret.push(this.dir);
    ret.push(this.vel.mag);
    return ret;
  }

  getBestLine() {
    const target = this.targets[this.curTarget];
    let mn = {'mag': 100000};
    let p;
    let minInd = 0;
    for(let i = 0; i < 5; i++) {
      const pos = new Vector(this.pos.x + DIR[i], this.pos.y + DIR[i + 1]);
      const direction = new Vector(target.x, target.y, pos.x, pos.y);
      if(direction.mag < mn.mag) {
        mn = direction;
        p = pos;
        minInd = i;
      }
    }
    const ret = [];
    ret.push(['line', p.x, p.y, target.x, target.y, 1, 'green']);

    if(minInd != 0) {
      ret.push(['line', this.pos.x, this.pos.y, this.pos.x + mn.x, this.pos.y + mn.y, 1, 'green']);
    }

    return ret;
  }

  drawPlayerAt(x, y) {
    this.screen.toDraw.push(['circle', x, y, this.shipSize, -degToRad(this.dir - 45), -degToRad(this.dir + 45), 'white', 1])
    const pos1 = [x + Math.cos(degToRad(this.dir + 45)) * this.shipSize, y + Math.sin(degToRad(this.dir + 45)) * this.shipSize]
    const pos2 = [x + Math.cos(degToRad(this.dir - 45)) * this.shipSize, y + Math.sin(degToRad(this.dir - 45)) * this.shipSize]
    const pos3 = [x + Math.cos(degToRad(this.dir)) * Math.sqrt(2 * Math.pow(this.shipSize, 2)), y + Math.sin(degToRad(this.dir)) * Math.sqrt(2 * Math.pow(this.shipSize, 2))];
    this.screen.toDraw.push(['line', pos1[0], pos1[1], pos3[0], pos3[1]], 1, 'white');
    this.screen.toDraw.push(['line', pos2[0], pos2[1], pos3[0], pos3[1]], 1, 'white');
  }

  step(left, up, down, right) {
    const force = new Vector();
    if(up) {
      const add = new Vector();
      add.x = Math.cos(degToRad(this.dir)) * this.maxForce;
      add.y = Math.sin(degToRad(this.dir)) * this.maxForce;
      force.add(add);
    }
    if(down) {
      const add = new Vector();
      const copy = this.vel.copy();
      add.x = -copy.x;
      add.y = -copy.y;
      add.limit(this.maxForce);
      force.add(add);
    }
    force.limit(this.maxForce);
    if(left) {
      this.dir += this.turnForce;
    }
    if(right) {
      this.dir -= this.turnForce;
    }
    this.dir += 360;
    this.dir %= 360;

    this.vel.add(force);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);

    this.pos.x += 1000;
    this.pos.y += 1000;
    this.pos.x %= 1000;
    this.pos.y %= 1000;

    for(let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];
      star[1] += this.vel.x * star[8] + 1000;
      star[2] += this.vel.y * star[8] + 1000 + (Math.random() * 2 - 1) * .0;
      star[1] %= 1000;
      star[2] %= 1000;
    }

    const target = this.targets[this.curTarget];
    if(new Vector(target.x, target.y, this.pos.x, this.pos.y).mag < this.shipSize * 2) {
      this.counter--;
      this.score += .01;
      this.score = Math.round(100 * this.score) / 100;
    }
    if(this.counter == 0) {
      this.curTarget++;
      this.curTarget %= this.targets.length;
      this.counter = 100;
    }
  }
}
