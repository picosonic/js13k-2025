// JS 13k 2025 entry

// Global constants
const XMAX=320;
const YMAX=180;

const TILEWIDTH=8;
const TILEHEIGHT=8;
const TILESPERROW=15;

const TILECATWIDTH=20;
const TILECATHEIGHT=16;
const TILESCATPERROW=6;

const BGCOLOUR="rgb(112,128,144)";

const ANIMSPEED=2;
const MOVESPEED=1;
const JUMPSPEED=3;

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

  // physics in pixels per frame @ 60fps
  gravity:0.25,
  terminalvelocity:10,
  friction:1,

  // Canvas
  canvas:null,
  ctx:null,
  scale:1, // Changes when resizing window

  // Tilemap image
  tilemap:null, // main tileset
  tilemapcat:null, // cat sprites tileset
  tilesloaded:false,
  tilemapcatflip:null, // flipped cat sprites
  catloaded:false,

  // Main character
  x:0, // x position
  y:0, // y position
  sx:0, // start x position (for current level)
  sy:0, // start y position (for current level)
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  dir:0, // direction (-1=left, 0=none, 1=right)
  speed:MOVESPEED, // walking speed
  jumpspeed:JUMPSPEED, // jumping speed
  coyote:0, // coyote timer (time after leaving ground where you can still jump)
  flip:false, // if player is horizontally flipped
  frameindex:0, // current animation frame
  walkanim:[6, 7, 8, 9, 10, 11],
  runanim:[12, 13, 14, 15, 16, 17],

  // Level attributes
  level:0, // Level number (0 based)
  width:0, // Width in tiles
  height:0, // height in tiles
  xoffset:0, // current view offset from left (horizontal scroll)
  yoffset:0, // current view offset from top (vertical scroll)

  // Input
  keystate:KEYNONE,

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:ANIMSPEED, // frames until next animation frame

  // Timeline for animation
  timeline:new timelineobj(), // timeline for general animation

  // Debug flag
  debug:false
};

// Handle resize events
function playfieldsize()
{
  var height=window.innerHeight;
  var ratio=XMAX/YMAX;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=YMAX/XMAX;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }

  gs.scale=(height/YMAX);

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+gs.scale+')';
}

// Draw tile
function drawtile(tileid, x, y)
{
  // Don't draw tile 0 (background)
  if (tileid==0) return;

  // Clip to what's visible
  if (((x-gs.xoffset)<-TILEWIDTH) && // clip left
      ((x-gs.xoffset)>XMAX) && // clip right
      ((y-gs.yoffset)<-TILEHEIGHT) && // clip top
      ((y-gs.yoffset)>YMAX))   // clip bottom
    return;

  gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH) % (TILESPERROW*TILEWIDTH), Math.floor((tileid*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT, (x-gs.xoffset)*2, (y-gs.yoffset)*2, TILEWIDTH*2, TILEHEIGHT*2);
}

// Draw sprite
function drawsprite(sprite)
{
  // Don't draw sprite 0 (background)
  if (sprite.id==0) return;

  // Clip to what's visible
  if (((Math.floor(sprite.x)-gs.xoffset)<-TILEWIDTH) && // clip left
      ((Math.floor(sprite.x)-gs.xoffset)>XMAX) && // clip right
      ((Math.floor(sprite.y)-gs.yoffset)<-TILEHEIGHT) && // clip top
      ((Math.floor(sprite.y)-gs.yoffset)>YMAX))   // clip bottom
    return;

  if (sprite.flip)
    gs.ctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILEWIDTH)-((sprite.id*TILEWIDTH) % (TILESPERROW*TILEWIDTH)))-TILEWIDTH, Math.floor((sprite.id*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT,
      (Math.floor(sprite.x)-gs.xoffset)*2, (Math.floor(sprite.y)-gs.yoffset)*2, TILEWIDTH*2, TILEHEIGHT*2);
  else
    gs.ctx.drawImage(gs.tilemap, (sprite.id*TILEWIDTH) % (TILESPERROW*TILEWIDTH), Math.floor((sprite.id*TILEWIDTH) / (TILESPERROW*TILEWIDTH))*TILEHEIGHT, TILEWIDTH, TILEHEIGHT,
      (Math.floor(sprite.x)-gs.xoffset)*2, (Math.floor(sprite.y)-gs.yoffset)*2, TILEWIDTH*2, TILEHEIGHT*2);
}


// Draw player sprite
function drawcatsprite(tileid, x, y)
{
  if (gs.flip==1)
    gs.ctx.drawImage(gs.tilemapcatflip, ((TILESCATPERROW*TILECATWIDTH)-((tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH)))-TILECATWIDTH, Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT,
      Math.floor(x)-(gs.xoffset*2), Math.floor(y)-(gs.yoffset*2), TILECATWIDTH, TILECATHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemapcat, (tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH), Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT, Math.floor(x)-(gs.xoffset*2), Math.floor(y)-(gs.yoffset*2), TILECATWIDTH, TILECATHEIGHT);
}

// Load level
function loadlevel(level)
{
  // Make sure it exists
  if ((level>=0) && (levels.length-1<level)) return;

  // Set current level to new one
  gs.level=level;

  // Deep copy tiles list to allow changes
  gs.tiles=JSON.parse(JSON.stringify(levels[gs.level].tiles));

  // Get width/height of new level
  gs.width=parseInt(levels[gs.level].width, 10);
  gs.height=parseInt(levels[gs.level].height, 10);

  gs.chars=[];

  // Populate chars (non solid tiles)
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].chars[(y*gs.width)+x]||0, 10);

      if (tile!=0)
      {
        var obj={id:(tile-1), x:(x*TILEWIDTH), y:(y*TILEHEIGHT), flip:false, hs:0, vs:0, del:false};

        switch (tile-1)
        {
          case TILECAT: // Player
            gs.x=obj.x; // Set current position
            gs.y=obj.y;

            gs.sx=gs.x; // Set start position
            gs.sy=gs.y;

            gs.vs=0; // Start not moving
            gs.hs=0;
            gs.jump=false;
            gs.fall=false;
            gs.dir=0;
            gs.flip=false;
            break;

          default:
            gs.chars.push(obj); // Everything else
            break;
        }
      }
    }
  }

  // TODO Sort chars such sprites are at the end (so are drawn last, i.e on top)

  // Move scroll offset to player with damping disabled
  scrolltoplayer(false);
}

// Draw level
function drawlevel()
{
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);
      drawtile(tile-1, x*TILEWIDTH, y*TILEHEIGHT);
    }
  }
}

// Draw chars
function drawchars()
{
  for (var id=0; id<gs.chars.length; id++)
    drawsprite(gs.chars[id]);
}

// Check if player has left the map
function offmapcheck()
{
  if ((gs.x<(0-TILEWIDTH)) || ((gs.x+1)>gs.width*TILEWIDTH) || (gs.y>gs.height*TILEHEIGHT))
  {
    gs.x=gs.sx;
    gs.y=gs.sy;

    scrolltoplayer(false);
  }
}

// Check if area a overlaps with area b
function overlap(ax, ay, aw, ah, bx, by, bw, bh)
{
  // Check horizontally
  if ((ax<bx) && ((ax+aw))<=bx) return false; // a too far left of b
  if ((ax>bx) && ((bx+bw))<=ax) return false; // a too far right of b

  // Check vertically
  if ((ay<by) && ((ay+ah))<=by) return false; // a too far above b
  if ((ay>by) && ((by+bh))<=ay) return false; // a too far below b

  return true;
}

function collide(px, py, pw, ph)
{
  // Check for screen edge collision
  if (px<=(0-(TILEWIDTH/5))) return true;
  if ((px+(TILEWIDTH/3))>=(gs.width*TILEWIDTH)) return true;

  // Look through all the tiles for a collision
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(gs.tiles[(y*gs.width)+x]||1, 10);

      if ((tile-1)!=0)
      {
        if (overlap(px, py, pw, ph, x*TILEWIDTH, y*TILEHEIGHT, TILEWIDTH, TILEHEIGHT))
          return true;
      }
    }
  }

  return false;
}

// Collision check with player hitbox
function playercollide(x, y)
{
  return collide(x+(TILEWIDTH/3), y+((TILEHEIGHT/5)*2), TILEWIDTH/3, (TILEHEIGHT/5)*3);
}

// Check if player on the ground or falling
function groundcheck()
{
  // Check for coyote time
  if (gs.coyote>0)
    gs.coyote--;

  // Check we are on the ground
  if (playercollide(gs.x, gs.y+1))
  {
    gs.vs=0;
    gs.jump=false;
    gs.fall=false;
    gs.coyote=15;

    // Check for jump pressed
    if (ispressed(KEYUP))
    {
      gs.jump=true;
      gs.vs=-gs.jumpspeed;
    }
  }
  else
  {
    // Check for jump pressed when coyote time not expired
    if ((ispressed(KEYUP)) && (gs.jump==false) && (gs.coyote>0))
    {
      gs.jump=true;
      gs.vs=-gs.jumpspeed;
    }

    // We're in the air, increase falling speed until we're at terminal velocity
    if (gs.vs<gs.terminalvelocity)
      gs.vs+=gs.gravity;

    // Set falling flag when vertical speed is positive
    if (gs.vs>0)
      gs.fall=true;
  }
}

// Process jumping
function jumpcheck()
{
  // When jumping ..
  if (gs.jump)
  {
    // Check if loosing altitude
    if (gs.vs>=0)
    {
      gs.jump=false;
      gs.fall=true;
    }
  }
}

// Move player by appropriate amount, up to a collision
function collisioncheck()
{
  var loop;

  // Check for horizontal collisions
  if ((gs.hs!=0) && (playercollide(gs.x+gs.hs, gs.y)))
  {
    loop=TILEWIDTH;
    // A collision occured, so move the character until it hits
    while ((!playercollide(gs.x+(gs.hs>0?1:-1), gs.y)) && (loop>0))
    {
      gs.x+=(gs.hs>0?1:-1);
      loop--;
    }

    // Stop horizontal movement
    gs.hs=0;
  }
  gs.x+=Math.floor(gs.hs);

  // Check for vertical collisions
  if ((gs.vs!=0) && (playercollide(gs.x, gs.y+gs.vs)))
  {
    loop=TILEHEIGHT;
    // A collision occured, so move the character until it hits
    while ((!playercollide(gs.x, gs.y+(gs.vs>0?1:-1))) && (loop>0))
    {
      gs.y+=(gs.vs>0?1:-1);
      loop--;
    }

    // Stop vertical movement
    gs.vs=0;
  }
  gs.y+=Math.floor(gs.vs);
}

// If no input detected, slow the player using friction
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

    gs.anim=ANIMSPEED;
  }
  else
    gs.anim--;
}

// Update player movements
function updatemovements()
{
  // Check if player has left the map
  offmapcheck();

  // Check if player on the ground or falling
  groundcheck();

  // Process jumping
  jumpcheck();

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

// Scroll level to player
function scrolltoplayer(dampened)
{
  var xmiddle=Math.floor((XMAX-TILEWIDTH)/2);
  var ymiddle=Math.floor((YMAX-TILEHEIGHT)/2);
  var maxxoffs=((gs.width*TILEWIDTH)-XMAX);
  var maxyoffs=((gs.height*TILEHEIGHT)-YMAX);

  // Work out where x and y offsets should be
  var newxoffs=Math.floor(((gs.x*2)-xmiddle)/2);
  var newyoffs=Math.floor(((gs.y*2)-ymiddle)/2);

  // Restrict right side to edge of level
  if (newxoffs>maxxoffs) newxoffs=maxxoffs;
  if (newyoffs>maxyoffs) newyoffs=maxyoffs;

  // Restrict left side to edge of level
  if (newxoffs<0) newxoffs=0;
  if (newyoffs<0) newyoffs=0;

  // Determine if xoffset should be changed
  if (newxoffs!=gs.xoffset)
  {
    if (dampened)
    {
      var xdelta=0.5;

      if (
        (Math.abs(gs.xoffset-newxoffs)>(XMAX/5)) ||
        (newxoffs==0) ||
        (newxoffs==maxxoffs)) xdelta=1;

      gs.xoffset+=Math.floor(newxoffs>gs.xoffset?xdelta:-xdelta);
    }
    else
      gs.xoffset=newxoffs;
  }

  // Determine if yoffset should be changed
  if (newyoffs!=gs.yoffset)
  {
    if (dampened)
    {
      var ydelta=0.5;

      if (
        (Math.abs(gs.yoffset-newyoffs)>(YMAX/5)) ||
        (newyoffs==0) ||
        (newyoffs==maxyoffs)) ydelta=1;

      gs.yoffset+=Math.floor(newyoffs>gs.yoffset?ydelta:-ydelta);
    }
    else
      gs.yoffset=newyoffs;
  }
}

// Redraw game frame
function redraw()
{
  // Scroll to keep player in view
  scrolltoplayer(true);

  // Clear the canvas
  gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

  // Draw the level
  drawlevel();

  // Draw the characters
  drawchars();

  // Draw the player
  drawcatsprite(gs.dir==0?3:gs.runanim[gs.frameindex], gs.x*2, gs.y*2);
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
  loadlevel(gs.level);
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

  // Ignore mouse
  window.onmousedown=function(e)
  {
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
