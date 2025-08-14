// JS 13k 2025 entry

// Global constants
const xmax=320;
const ymax=180;

const TILEWIDTH=8;
const TILEHEIGHT=8;
const TILESPERROW=15;

const TILECATWIDTH=20;
const TILECATHEIGHT=16;
const TILESCATPERROW=6;

const BGCOLOUR="rgb(112,128,144)";

const ANIMSPEED=2;
const MOVESPEED=1;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const TILECAT=131;

// Game state
var gs={
  // animation frame of reference
  step:(1/60), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame
  fps:0, // current FPS
  frametimes:[], // array of frame times

  // Canvas
  canvas:null,
  ctx:null,
  scale:1, // Changes when resizing window

  // physics in pixels per frame @ 60fps
  friction:1,

  // Tilemap image
  tilemap:null, // main tileset
  tilemapcat:null, // cat sprites tileset
  tilesloaded:false,
  tilemapcatflip:null, // flipped cat sprites
  catloaded:false,

  // Main character
  keystate:0,
  x:xmax/2, // x position
  y:0, // y position
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  dir:0, // direction (-1=left, 0=none, 1=right)
  flip:false, // should the sprite be flipped?
  speed:MOVESPEED,
  frameindex:0, // current animation frame
  walkanim:[6, 7, 8, 9, 10, 11],
  runanim:[12, 13, 14, 15, 16, 17],

  // Animation
  anim:ANIMSPEED, // frames until next animation frame
  timeline:new timelineobj(), // timeline for general animation

  // Debug flag
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
  gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH) % (TILESPERROW*TILEWIDTH), Math.floor((tileid*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT, x*2, y*2, TILEWIDTH*2, TILEHEIGHT*2);
}

function drawsprite(tileid, x, y)
{
  if (gs.flip==1)
    gs.ctx.drawImage(gs.tilemapflip, ((TILESCATPERROW*TILEWIDTH)-((tileid*TILEWIDTH) % (TILESCATPERROW*TILEWIDTH)))-TILEWIDTH, Math.floor((tileid*TILEWIDTH) / (TILESCATPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT,
      x, y, TILEWIDTH, TILEHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH) % (TILESCATPERROW*TILEWIDTH), Math.floor((tileid*TILEWIDTH) / (TILESCATPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT, x, y, TILEWIDTH, TILEHEIGHT);
}

function drawcatsprite(tileid, x, y)
{
  if (gs.flip==1)
    gs.ctx.drawImage(gs.tilemapcatflip, ((TILESCATPERROW*TILECATWIDTH)-((tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH)))-TILECATWIDTH, Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT,
      x, y, TILECATWIDTH, TILECATHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemapcat, (tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH), Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT, x, y, TILECATWIDTH, TILECATHEIGHT);
}

function collisioncheck()
{
  gs.x+=Math.floor(gs.hs);
}

function standcheck()
{
  // When no horizontal movement pressed, slow down by friction
  if (((!ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT))) ||
      ((ispressed(KEYLEFT)) && (ispressed(KEYRIGHT))))
  {
    // Going left
    if (gs.dir==-1)
    {
      if (gs.hs<0)
      {
        gs.hs+=gs.friction;
      }
      else
      {
        gs.hs=0;
        gs.dir=0;
      }
    }

    // Going right
    if (gs.dir==1)
    {
      if (gs.hs>0)
      {
        gs.hs-=gs.friction;
      }
      else
      {
        gs.hs=0;
        gs.dir=0;
      }
    }
  }
}

// Move animation frame onwards
function updateanimation()
{
  if (gs.anim==0)
  {
    gs.frameindex++;
    if (gs.frameindex>=gs.runanim.length)
      gs.frameindex=0;

    if (gs.dir==-1)
      gs.x-=MOVESPEED;

    if (gs.dir==1)
      gs.x+=MOVESPEED;

    gs.anim=ANIMSPEED;
  }
  else
    gs.anim--;
}

// Update player movements
function updatemovements()
{
  // Move player by appropriate amount, up to a collision
  collisioncheck();

  // If no input detected, slow the player using friction
  standcheck();

  // When a movement key is pressed, adjust players speed and direction
  if (gs.keystate!=KEYNONE)
  {
    // Left key
    if ((ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT)))
    {
      gs.hs=-gs.speed;
      gs.dir=-1;
      gs.flip=false;
    }

    // Right key
    if ((ispressed(KEYRIGHT)) && (!ispressed(KEYLEFT)))
    {
      gs.hs=gs.speed;
      gs.dir=1;
      gs.flip=true;
    }
  }

  // Update any animation frames
  updateanimation();
}

// Update game state, called once per frame
function update()
{
  // Apply keystate/physics to player
  updatemovements();
}

// Redraw game frame
function redraw()
{
  gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

/*
  // Draw level tileset
  var i=0;
  for (var y=0; y<10; y++)
  for (var x=0; x<TILESPERROW; x++)
    drawtile(i++, x*TILEWIDTH, y*TILEHEIGHT);
*/

  drawcatsprite(gs.dir==0?3:gs.runanim[gs.frameindex], gs.x, 100);
}

// Request animation frame callback
function rafcallback(timestamp)
{
  if (gs.debug)
  {
    // Calculate FPS
    while ((gs.frametimes.length>0) && (gs.frametimes[0]<=(timestamp-1000)))
      gs.frametimes.shift(); // Remove all entries older than a second

    gs.frametimes.push(timestamp); // Add current time
    gs.fps=gs.frametimes.length; // FPS = length of times in array
  }

  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();

      gs.acc-=gs.step;
    }

    redraw();
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

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
  gs.ctx.imageSmoothingEnabled=false; // don't blur when scaling

  window.addEventListener("resize", function() { playfieldsize(); });

  playfieldsize();

  // Once loaded, start
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
      gs.tilesloaded=true;
      if (gs.catloaded)
        start();
    };
    gs.tilemapflip.src=c.toDataURL();
  };
  gs.tilemap.src=tilemap;

  // Load cat tiles, and create a flipped version
  gs.tilemapcat=new Image;
  gs.tilemapcat.onload=function()
  {
    // Create a flipped version of the spritesheet
    // https://stackoverflow.com/questions/21610321/javascript-horizontally-flip-an-image-object-and-save-it-into-a-new-image-objec
    var c=document.createElement('canvas');
    var ctx=c.getContext('2d');
    c.width=gs.tilemapcat.width;
    c.height=gs.tilemapcat.height;
    ctx.scale(-1, 1);
    ctx.drawImage(gs.tilemapcat, -gs.tilemapcat.width, 0);

    gs.tilemapcatflip=new Image;
    gs.tilemapcatflip.onload=function()
    {
      gs.catloaded=true;
      if (gs.tilesloaded)
        start();
    };
    gs.tilemapcatflip.src=c.toDataURL();
  };
  gs.tilemapcat.src=tilemapcat;
}

// Run the init() once page has loaded
window.onload=function() { init(); };
