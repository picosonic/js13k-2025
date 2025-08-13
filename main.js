// JS 13k 2025 entry

// Global constants
const xmax=320;
const ymax=180;
const TILEWIDTH=20;
const TILEHEIGHT=16;
const TILESPERROW=6;
const BGCOLOUR="rgb(112,128,144)";
const ANIMSPEED=2;
const MOVESPEED=4;

// Game state
var gs={
  // Canvas
  canvas:null,
  ctx:null,
  scale:1, // Changes when resizing window

  // Tilemap image
  tilemap:null,
  tilemapflip:null,

  // Main character
  keystate:0,
  x:xmax/2, // x position
  y:0, // y position
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  dir:-1, //direction (-1=left, 0=none, 1=right)
  frameindex:0, // current animation frame
  walkanim:[6, 7, 8, 9, 10, 11],
  runanim:[12, 13, 14, 15, 16, 17],
  
  anim:ANIMSPEED, // frames until next animation frame

  debug:false
};

// Clear keyboard input state
function clearinputstate()
{
  gs.keystate=0;
}

// Check if an input is set in keyboard input state
function ispressed(keybit)
{
  return ((gs.keystate&keybit)!=0);
}

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
  var aspectratio=xmax/ymax;
  var ratio=xmax/ymax;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=ymax/xmax;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }

  gs.scale=(height/ymax);

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';
}

// Update the player key state
function updatekeystate(e, dir)
{
  switch (e.which)
  {
    case 37: // cursor left
    case 65: // A
    case 90: // Z
      if (dir==1)
        gs.keystate|=1;
      else
        gs.keystate&=~1;

      e.preventDefault();
      break;

    case 38: // cursor up
    case 87: // W
    case 59: // semicolon
      if (dir==1)
        gs.keystate|=2;
      else
        gs.keystate&=~2;

      e.preventDefault();
      break;

    case 39: // cursor right
    case 68: // D
    case 88: // X
      if (dir==1)
        gs.keystate|=4;
      else
        gs.keystate&=~4;

      e.preventDefault();
      break;

    case 40: // cursor down
    case 83: // S
    case 190: // dot
      if (dir==1)
        gs.keystate|=8;
      else
        gs.keystate&=~8;

      e.preventDefault();
      break;

    case 13: // enter
    case 32: // space
      if (dir==1)
        gs.keystate|=16;
      else
        gs.keystate&=~16;

      e.preventDefault();
      break;

    case 73: // I (for info/debug)
      if (dir==1)
        gs.debug=(!gs.debug);

      e.preventDefault();
      break;

    default:
      break;
  }
}

function drawtile(tileid, x, y)
{
  gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH) % (TILESPERROW*TILEWIDTH), Math.floor((tileid*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT, x, y, TILEWIDTH, TILEHEIGHT);
}

function drawsprite(tileid, x, y)
{
  if (gs.dir==1)
    gs.ctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILEWIDTH)-((tileid*TILEWIDTH) % (TILESPERROW*TILEWIDTH)))-TILEWIDTH, Math.floor((tileid*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT,
      x, y, TILEWIDTH, TILEHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH) % (TILESPERROW*TILEWIDTH), Math.floor((tileid*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT, x, y, TILEWIDTH, TILEHEIGHT);
}

// Update game state
function update()
{
  if (gs.anim==0)
  {
    gs.frameindex++;
    if (gs.frameindex>=gs.runanim.length)
      gs.frameindex=0;

    if (gs.dir==-1)
    {
      gs.x-=MOVESPEED;

      if (gs.x<=0-TILEWIDTH)
        gs.dir=1;
    }
    
    if (gs.dir==1)
    {
      gs.x+=MOVESPEED;
      
      if (gs.x>=xmax)
        gs.dir=-1;
    }
      
    gs.anim=ANIMSPEED;
  }
  else
    gs.anim--;
}

// Redraw game frame
function redraw()
{
  gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

  drawsprite(gs.runanim[gs.frameindex], gs.x, 100);
}

// Request animation frame callback
function rafcallback(timestamp)
{
  update();
  redraw();

  // Request we are called on the next frame
  window.requestAnimationFrame(rafcallback);
}

function start()
{
  window.requestAnimationFrame(rafcallback);
}

// Entry point
function init()
{
  // Initialise stuff
  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);
  };

  document.onkeyup=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 0);
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Set up canvas
  gs.canvas=document.getElementById("canvas");
  gs.ctx=gs.canvas.getContext("2d");

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Once image has loaded, start timeline for intro
  gs.tilemap=new Image;
  gs.tilemap.onload=function()
  {
    // Create a flipped version of the spritesheet
    // https://stackoverflow.com/questions/21610321/javascript-horizontally-flip-an-image-object-and-save-it-into-a-new-image-objec
    var c=document.createElement('canvas');
    var ctx=c.getContext('2d');
    c.width=gs.tilemap.width;
    c.height=gs.tilemap.height;
    ctx.scale(-1, 1);
    ctx.drawImage(gs.tilemap, -gs.tilemap.width, 0);

    gs.tilemapflip=new Image;
    gs.tilemapflip.onload=function()
    {
      // Start
      start();
    };
    gs.tilemapflip.src=c.toDataURL();
  };
  gs.tilemap.src=tilemap;
}

// Run the init() once page has loaded
window.onload=function() { init(); };
