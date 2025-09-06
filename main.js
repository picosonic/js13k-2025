// JS 13k 2025 entry

// Global constants
const XMAX=320;
const YMAX=180;
const TARGETFPS=60;

const TILEWIDTH=16;
const TILEHEIGHT=16;
const TILEWIDTH2=TILEWIDTH/2;
const TILEHEIGHT2=TILEHEIGHT/2;
const TILESPERROW=15;

const TILECATWIDTH=20;
const TILECATHEIGHT=16;
const TILESCATPERROW=6;

const BGCOLOUR="rgb(82,98,114)";

const STATEINTRO=0;
const STATEMENU=1;
const STATEPLAYING=2;
const STATENEWLEVEL=3;
const STATECOMPLETE=4;

const KEYNONE=0;
const KEYLEFT=1;
const KEYUP=2;
const KEYRIGHT=4;
const KEYDOWN=8;
const KEYACTION=16;

const ANIMSPEED=2;
const WALKSPEED=2;
const RUNSPEED=3;
const JUMPSPEED=6; // jump height
const SPRINGSPEED=8; // jump height on a spring
const ELECTROTIME=(TARGETFPS/2); // timer while electro
const CATSAT=TARGETFPS; // time after stopping until sitting
const RUNTIME=TARGETFPS*2; // time after starting to walk before running
const MAXLIVES=(9/2);
const WATERFLOW=3;

// Cat sprite ids
const CATMAGNET=1;
const CATELECTRO=5;
const CATWALK1=6;
const CATWALK2=7;
const CATWALK3=8;
const CATWALK4=9;
const CATWALK5=10;
const CATWALK6=11;
const CATRUN1=12;
const CATRUN2=13;
const CATRUN3=14;
const CATRUN4=15;
const CATRUN5=16;
const CATRUN6=17;
const CATJUMP=CATRUN1;
const CATFALL=CATRUN2;

// Tile ids
const TILENONE=0;
const TILESPRINGUP=30;
const TILESPRINGDOWN=15;
const TILEKEY=66;
const TILEFLAG=73;
const TILEPOLE=74;
const TILESPIKES=75;
const TILEELECTRIC=83;
const TILEMAGNET=89;
const TILEDRONE=112;
const TILEDRONE2=113;
const TILEDOORLOCKTL=101;
const TILEDOORLOCKTR=102;
const TILEDOORTL=103;
const TILEDOORTR=104;
const TILEDOORLOCKL=116;
const TILEDOORLOCKR=117;
const TILEDOORL=118;
const TILEDOORR=119;
const TILECAT=131;
const TILEHEART=132;
const TILEHALFHEART=133;
const TILEEMPTYHEART=134;
const TILEWATER=135;
const TILEWATER2=136;
const TILEWATER3=137;
const TILEWATER4=138;

// Game state
var gs={
  // animation frame of reference
  step:(1/TARGETFPS), // target step time @ 60 fps
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
  nightsky:null,

  // Tilemap images
  tilemap:null, // main tileset
  tilemapcat:null, // cat sprites tileset
  font:null, // font tileset
  tilesloaded:false,
  tilemapcatflip:null, // flipped cat sprites
  catloaded:false,
  fontloaded:false,

  // Main character
  x:0, // x position
  y:0, // y position
  sx:0, // start x position (for current level)
  sy:0, // start y position (for current level)
  vs:0, // vertical speed
  hs:0, // horizontal speed
  jump:false, // jumping
  fall:false, // falling
  htime:0, // hurt timer following enemy collision
  dir:0, // direction (-1=left, 0=none, 1=right)
  speed:WALKSPEED, // walking speed
  jumpspeed:JUMPSPEED, // jumping speed
  springspeed:SPRINGSPEED,
  coyote:0, // coyote timer (time after leaving ground where you can still jump)
  pausetimer:0, // countdown timer after stopping movement before sitting down
  runtimer:0, // countdown timer after walking starts before running
  electrotimer:0, // countdown timer after being electrocuted
  flip:false, // if player is horizontally flipped
  tileid:TILECAT, // current player tile
  frameindex:0, // current animation frame
  walkanim:[CATWALK1, CATWALK2, CATWALK3, CATWALK4, CATWALK5, CATWALK6],
  runanim:[CATRUN1, CATRUN2, CATRUN3, CATRUN4, CATRUN5, CATRUN6],
  magnetised:false,
  zipleft:0, // left edge of zipwire
  zipright:0, // right edge of zipwire
  lives:MAXLIVES,
  key:0, // number of keys collected

  // Level attributes
  level:0, // Level number (0 based)
  width:0, // Width in tiles
  height:0, // height in tiles
  xoffset:0, // current view offset from left (horizontal scroll)
  yoffset:0, // current view offset from top (vertical scroll)

  // Input
  keystate:KEYNONE,
  padstate:KEYNONE,
  gamepadbuttons:[], // Button mapping
  gamepadaxes:[], // Axes mapping
  gamepadaxesval:[], // Axes values

  // Tiles
  tiles:[], // copy of current level (to allow destruction)

  // Characters
  chars:[],
  anim:ANIMSPEED, // frames until next animation frame

  // Particles
  particles:[], // an array of particles

  // Game state
  state:STATEINTRO, // state machine

  // Timeline for animation
  timeline:new timelineobj(), // timeline for general animation

  // Debug flag
  debug:false
};

// Random number generator
function rng()
{
  return Math.random();
}

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

  gs.ctx.drawImage(gs.tilemap, (tileid*TILEWIDTH2) % (TILESPERROW*TILEWIDTH2), Math.floor((tileid*TILEWIDTH2) / (TILESPERROW*TILEWIDTH2))*TILEHEIGHT2, TILEWIDTH2, TILEHEIGHT2, x-gs.xoffset, y-gs.yoffset, TILEWIDTH, TILEHEIGHT);
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
    gs.ctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILEWIDTH2)-((sprite.id*TILEWIDTH2) % (TILESPERROW*TILEWIDTH2)))-TILEWIDTH2, Math.floor((sprite.id*TILEWIDTH2) / (TILESPERROW*TILEWIDTH2))*TILEHEIGHT2, TILEWIDTH2, TILEHEIGHT2,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILEWIDTH, TILEHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemap, (sprite.id*TILEWIDTH2) % (TILESPERROW*TILEWIDTH2), Math.floor((sprite.id*TILEWIDTH2) / (TILESPERROW*TILEWIDTH2))*TILEHEIGHT2, TILEWIDTH2, TILEHEIGHT2,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILEWIDTH, TILEHEIGHT);
}


// Draw player sprite
function drawcatsprite(tileid, x, y)
{
  if (gs.flip==1)
    gs.ctx.drawImage(gs.tilemapcatflip, ((TILESCATPERROW*TILECATWIDTH)-((tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH)))-TILECATWIDTH, Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT,
      Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, TILECATWIDTH, TILECATHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemapcat, (tileid*TILECATWIDTH) % (TILESCATPERROW*TILECATWIDTH), Math.floor((tileid*TILECATWIDTH) / (TILESCATPERROW*TILECATWIDTH))*TILECATHEIGHT, TILECATWIDTH, TILECATHEIGHT, Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, TILECATWIDTH, TILECATHEIGHT);
}

// Sort the chars so sprites are last (so they appear in front of non-solid tiles)
function sortChars(a, b)
{
  const sprites=[TILEDRONE, TILEDRONE2];

  if (a.id!=b.id) // extra processing if they are different ids
  {
    var aspr=(sprites.includes(a.id)); // see if a is a sprite
    var bspr=(sprites.includes(b.id)); // see if b is a sprite

    if (aspr==bspr) return 0; // both sprites, so don't swap

    if (aspr)
      return 1; // sort a after b
    else
      return -1; // sort a before b
  }

  return 0; // same id
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
        var obj={id:(tile-1), x:(x*TILEWIDTH), y:(y*TILEHEIGHT), flip:false, hs:0, vs:0, del:false, ttl:0};

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
            gs.coyote=0;
            gs.pausetimer=0;
            gs.electrotimer=0;
            gs.runtimer=0;
            gs.speed=WALKSPEED;
            gs.key=0;
            gs.particles=[];
            break;

          case TILEMAGNET: // Magnet for zipline
            // Default to magnet linked to itself
            obj.zx=obj.x;

            // Look for other magnet at same height
            for (var zx=0; zx<gs.width; zx++)
            {
              var ztile=parseInt(levels[gs.level].chars[(y*gs.width)+zx]||0, 10);

              if (((ztile-1)==TILEMAGNET) && (zx!=x))
                obj.zx=(zx*TILEWIDTH); // Found other magnet
            }
            gs.chars.push(obj);
            break;

          case TILEELECTRIC:
            obj.anim=2; // Slow animation
            gs.chars.push(obj);
            break;

          case TILEWATER:
          case TILEWATER2:
          case TILEWATER3:
          case TILEWATER4:
            obj.anim=WATERFLOW; // Slow animation
            gs.chars.push(obj);
            break;

          case TILEDRONE:
          case TILEDRONE2:
            obj.dx=-1; // Null destination
            obj.dy=-1;
            obj.path=[]; // Empty path
            gs.chars.push(obj);
            break;

          default:
            gs.chars.push(obj); // Everything else
            break;
        }
      }
    }
  }

  // Sort chars such sprites are at the end (so are drawn last, i.e on top)
  gs.chars.sort(sortChars);

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
      switch (tile-1)
      {
        case TILESPRINGUP:
          if ((overlap(gs.x, gs.y+(TILECATHEIGHT), TILECATWIDTH, TILECATHEIGHT, x*TILEWIDTH, y*TILEHEIGHT, TILEWIDTH, TILEHEIGHT)) && (playerlook(gs.x, gs.y+1)-1==TILESPRINGUP))
            drawtile(TILESPRINGDOWN, x*TILEWIDTH, y*TILEHEIGHT);
          else
            drawtile(TILESPRINGUP, x*TILEWIDTH, y*TILEHEIGHT);
          break;

        default:
          drawtile(tile-1, x*TILEWIDTH, y*TILEHEIGHT);
          break;
      }
    }
  }
}

// Draw chars
function drawchars()
{
  for (var id=0; id<gs.chars.length; id++)
    drawsprite(gs.chars[id]);
}

// Draw single particle
function drawparticle(particle)
{
  var x=particle.x+(particle.t*Math.cos(particle.ang));
  var y=particle.y+(particle.t*Math.sin(particle.ang));

  // Clip to what's visible
    if (((Math.floor(x)-gs.xoffset)<0) && // clip left
    ((Math.floor(x)-gs.xoffset)>XMAX) && // clip right
    ((Math.floor(y)-gs.yoffset)<0) && // clip top
    ((Math.floor(y)-gs.yoffset)>YMAX))   // clip bottom
  return;

  gs.ctx.fillStyle="rgba("+particle.r+","+particle.g+","+particle.b+","+particle.a+")";
  gs.ctx.fillRect(Math.floor(x)-gs.xoffset, Math.floor(y)-gs.yoffset, particle.s, particle.s);
}

// Draw particles
function drawparticles()
{
  for (var i=0; i<gs.particles.length; i++)
    drawparticle(gs.particles[i]);
}

function drawziplines()
{
  for (var id=0; id<gs.chars.length; id++)
  {
    if (gs.chars[id].id==TILEMAGNET)
    {
      // Check it's the furthest to the left of the pair
      if (gs.chars[id].x<=gs.chars[id].zx)
      {
        // Draw this zipline
        gs.ctx.strokeStyle="yellow";
        gs.ctx.lineWidth=1;
        gs.ctx.setLineDash([1,1]);
        gs.ctx.beginPath();
        gs.ctx.moveTo(gs.chars[id].x+(TILEWIDTH/2)-gs.xoffset, gs.chars[id].y+1-gs.yoffset);
        gs.ctx.lineTo(gs.chars[id].zx+(TILEWIDTH/2)-gs.xoffset, gs.chars[id].y+1-gs.yoffset);
        gs.ctx.stroke();

        // Draw the magnet above the cat
        if (gs.magnetised)
          drawsprite({id:TILEMAGNET, x:gs.x, y:gs.y-(TILEHEIGHT/2), flip:gs.flip});
      }
    }
  }
}

function drawlives()
{
  const whole=Math.floor(gs.lives);
  const empty=Math.floor(MAXLIVES-whole);

  for (var i=0; i<Math.ceil(MAXLIVES); i++)
  {
    var px=((i+0.5)*TILEWIDTH)+gs.xoffset;
    var py=(TILEHEIGHT/2)+gs.yoffset;

    if (i<whole)
      drawsprite({id:TILEHEART, x:px, y:py, flip:false});

    if (i>=whole)
    {
      if ((i==whole) && (whole!=gs.lives))
        drawsprite({id:TILEHALFHEART, x:px, y:py, flip:false});
      else
        drawsprite({id:TILEEMPTYHEART, x:px, y:py, flip:false});
    }
  }
}

// Check if player has left the map
function offmapcheck()
{
  if ((gs.x<(0-TILEWIDTH)) || ((gs.x+1)>gs.width*TILEWIDTH) || (gs.y>gs.height*TILEHEIGHT))
  {
    gs.x=gs.sx;
    gs.y=gs.sy;
    gs.speed=WALKSPEED;
    gs.coyote=0;
    gs.pausetimer=0;
    gs.electrotimer=0;
    gs.runtimer=0;

    if (gs.lives>0)
      gs.lives-=0.5;

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
          return tile;
      }
    }
  }

  return TILENONE;
}

// Collision check with player hitbox, return tile
function playerlook(x, y)
{
  return collide(x+(TILEWIDTH/3), y+((TILEHEIGHT/5)*2), TILEWIDTH/3, (TILEHEIGHT/5)*3);
}

// Collision check with player hitbox, true/flase
function playercollide(x, y)
{
  return (parseInt(playerlook(x, y), 10)!=TILENONE);
}

// Check if player on the ground or falling
function groundcheck()
{
  // Check for coyote time
  if (gs.coyote>0)
    gs.coyote--;

  // Check for pause time
  if (gs.pausetimer>0)
    gs.pausetimer--;

  // Check for electro time
  if (gs.electrotimer>0)
    gs.electrotimer--;

  // Check for run time
  if (gs.runtimer>0)
  {
    gs.runtimer--;

    if (gs.runtimer==0) gs.speed=RUNSPEED;
  }

  // Check we are on the ground
  if (playercollide(gs.x, gs.y+1))
  {
    // If we just hit the ground after falling, create a few particles under foot
    if (gs.fall==true)
      generateparticles(gs.x+(TILECATWIDTH/2), gs.y+TILECATHEIGHT, 3, 3, {r:170, g:170, b:170});

    gs.vs=0;
    gs.jump=false;
    gs.fall=false;
    gs.coyote=15;
    var tilebelow=playerlook(gs.x, gs.y+1)-1;

    // Check for jump pressed
    if ((ispressed(KEYUP)) || (ispressed(KEYACTION)))
    {
      gs.jump=true;

      // Check for being on a spring, to determine jump height
      if ((tilebelow==TILESPRINGUP) || (tilebelow==TILESPRINGDOWN))
        gs.vs=-gs.springspeed;
      else
        gs.vs=-gs.jumpspeed;
    }
  }
  else
  {
    // Check for demagnetisation
    if ((gs.magnetised) && (ispressed(KEYDOWN)))
    {
      gs.magnetised=false;
      gs.vs=1;
      gs.coyote=0;
    }

    // Check for jump pressed when coyote time not expired
    if (((ispressed(KEYUP)) || (ispressed(KEYACTION))) && (gs.jump==false) && (gs.coyote>0))
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
    gs.speed=WALKSPEED;
    gs.runtimer=0;
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

    // If mid jump, start descent
    if (gs.jump)
    {
      gs.jump=false;
      gs.fall=true;

      gs.vs+=gs.gravity;
    }
  }

  // Apply gravity when not magnetised
  if (!gs.magnetised)
    gs.y=Math.floor(gs.y+gs.vs);
}

// Slow the player using friction
function standcheck()
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
      gs.pausetimer=CATSAT;
      gs.speed=WALKSPEED;
      gs.runtimer=0;
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
      gs.pausetimer=CATSAT;
      gs.speed=WALKSPEED;
      gs.runtimer=0;
    }
  }
}

// Move animation frame onwards
function updateanimation()
{
  if (gs.anim==0)
  {
    // Player animation
    if (gs.dir!=0)
    {
      gs.frameindex++;
      if (gs.frameindex>=gs.runanim.length)
        gs.frameindex=0;
    }

    // Char animation
    for (var id=0; id<gs.chars.length; id++)
    {
      switch (gs.chars[id].id)
      {
        case TILEELECTRIC:
          gs.chars[id].anim--;
          if (gs.chars[id].anim==0)
          {
            gs.chars[id].anim=2;
            gs.chars[id].flip=(!gs.chars[id].flip);
          }
          break;

        case TILEDRONE:
        case TILEDRONE2:
          gs.chars[id].id=(gs.chars[id].id==TILEDRONE?TILEDRONE2:TILEDRONE);
          break;

        case TILEWATER:
        case TILEWATER2:
        case TILEWATER3:
        case TILEWATER4:
          gs.chars[id].anim--;
          if (gs.chars[id].anim==0)
	  {
            gs.chars[id].id++;

            gs.chars[id].anim=WATERFLOW;

	    if (gs.chars[id].id>TILEWATER4)
	      gs.chars[id].id=TILEWATER;
	  }
          break;

        default:
          break;
      }
    }

    gs.anim=ANIMSPEED;
  }
  else
    gs.anim--;
}

// Generate some particles around an origin
function generateparticles(cx, cy, mt, count, rgb)
{
  for (var i=0; i<count; i++)
  {
    var ang=(Math.floor(rng()*360)); // angle to eminate from
    var t=Math.floor(rng()*mt); // travel from centre
    var r=rgb.r||(rng()*255);
    var g=rgb.g||(rng()*255);
    var b=rgb.b||(rng()*255);

    gs.particles.push({x:cx, y:cy, ang:ang, t:t, r:r, g:g, b:b, a:1.0, s:(rng()<0.05)?2:1});
  }
}

// Do processing for particles
function particlecheck()
{
  var i=0;

  // Process particles
  for (i=0; i<gs.particles.length; i++)
  {
    // Move particle
    gs.particles[i].t+=0.5;
    gs.particles[i].y+=(gs.gravity*2);

    // Decay particle
    gs.particles[i].a-=0.007;
  }

  // Remove particles which have decayed
  i=gs.particles.length;
  while (i--)
  {
    if (gs.particles[i].a<=0)
      gs.particles.splice(i, 1);
  }
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

  // Check for particle usage
  particlecheck();

  // When a movement key is pressed, adjust players speed and direction
  if ((gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE))
  {
    // Left key
    if ((ispressed(KEYLEFT)) && (!ispressed(KEYRIGHT)))
    {
      if (gs.electrotimer==0)
        gs.hs=-gs.speed;

      if (gs.runtimer==0) gs.runtimer=RUNTIME;
      gs.dir=-1;
      gs.flip=false;
    }

    // Right key
    if ((ispressed(KEYRIGHT)) && (!ispressed(KEYLEFT)))
    {
      if (gs.electrotimer==0)
        gs.hs=gs.speed;

      if (gs.runtimer==0) gs.runtimer=RUNTIME;
      gs.dir=1;
      gs.flip=true;
    }
  }

  // Handle zipwires
  if (gs.magnetised)
  {
    if (gs.x>gs.zipright)
    {
      gs.hs=0;
      gs.x=gs.zipright;
    }

    if (gs.x<gs.zipleft)
    {
      gs.hs=0;
      gs.x=gs.zipleft;
    }
  }

  // Decrease hurt timer
  if (gs.htime>0) gs.htime--;

  // Update any animation frames
  updateanimation();
}

// Check for collision between player and character/collectable
function updateplayerchar()
{
  // Generate player hitbox
  var px=gs.x+(TILECATWIDTH/3);
  var py=gs.y+((TILECATHEIGHT/5)*2);
  var pw=(TILECATWIDTH/3);
  var ph=(TILECATHEIGHT/5)*3;
  var id=0;

  for (id=0; id<gs.chars.length; id++)
  {
    // Check for collision with this char
    if (overlap(px, py, pw, ph, gs.chars[id].x, gs.chars[id].y, TILEWIDTH, TILEHEIGHT))
    {
      switch (gs.chars[id].id)
      {
        case TILEMAGNET:
          if ((gs.chars[id].zx!=gs.chars[id].x) && (gs.jump))
          {
            gs.jump=false;
            gs.fall=false;
            gs.magnetised=true;
            gs.zipleft=Math.min(gs.chars[id].x, gs.chars[id].zx);
            gs.zipright=Math.max(gs.chars[id].x, gs.chars[id].zx);
            gs.vs=0; // Stop vertical movement
            gs.x=gs.chars[id].x;
            gs.y=gs.chars[id].y+(TILEHEIGHT/2);
          }
          break;

        case TILEKEY:
          gs.key++;

          // Shiny
	  generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 16, {r:0xff, g:0xff, b:1});

          // Remove from map
          gs.chars[id].del=true;
          break;

        case TILEDOORLOCKL:
        case TILEDOORLOCKR:
          // Check for unlocking this door
          if ((gs.key>0) && (ispressed(KEYDOWN)))
          {
            var did=-1;

            // A key has been used
            gs.key--;

            // Switch closest locked door to this point to an unlocked door
            did=findnearestchar(gs.chars[id].x, gs.chars[id].y, [TILEDOORLOCKL]);
            if (did!=-1) gs.chars[did].id=TILEDOORL;

            did=findnearestchar(gs.chars[id].x, gs.chars[id].y, [TILEDOORLOCKR]);
            if (did!=-1) gs.chars[did].id=TILEDOORR;

            did=findnearestchar(gs.chars[id].x, gs.chars[id].y, [TILEDOORLOCKTL]);
            if (did!=-1) gs.chars[did].id=TILEDOORTL;

            did=findnearestchar(gs.chars[id].x, gs.chars[id].y, [TILEDOORLOCKTR]);
            if (did!=-1) gs.chars[did].id=TILEDOORTR;
          }
          break;

        case TILEFLAG:
	  {
	    for (var id2=0; id2<gs.chars.length; id2++)
	    {
              // Remove electro
	      if (gs.chars[id2].id==TILEELECTRIC)
	      {
                gs.chars[id2].ttl=id2;
                gs.chars[id2].del=true;
              }
	    }

            // Switch to pole
            gs.chars[id].id=TILEPOLE;
	  }
          break;

        case TILEWATER:
        case TILEWATER2:
        case TILEWATER3:
        case TILEWATER4:
          if (gs.fall)
          {
            if (gs.htime==0)
	    {
              // Lose health (when not already hurt)
              if (gs.lives>0)
                gs.lives-=0.5;

              gs.htime=(TARGETFPS*1);
            }

            gs.jump=true;
            gs.fall=false;

            gs.vs=-(gs.jumpspeed*0.75); // Fly up in the air

            // Splash
	    generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 32, 32, {r:0x29, g:0xad, b:0xff});
	    generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 32, 8, {r:0x2ff, g:0xff, b:0xff});
          }
          break;

        case TILESPIKES:
          if (gs.fall)
          {
            clearinputstate();

            if (gs.htime==0)
	    {
              // Lose health (when not already hurt)
              if (gs.lives>0)
                gs.lives-=0.5;

              gs.htime=(TARGETFPS*2);
            }

            gs.jump=true;
            gs.fall=false;

            gs.vs=-(gs.jumpspeed*0.80); // Fly up in the air

            // Blood
	    generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 16, {r:0xff, g:1, b:1});
          }
          break;

        case TILEELECTRIC:
          clearinputstate();

          // Don't start electro when already affected by it
          if (gs.electrotimer==0)
          {
            if (gs.htime==0)
	    {
              // Lose health (when not already hurt)
              if (gs.lives>0)
                gs.lives-=0.5;

              gs.htime=(TARGETFPS*2);
            }

            // Drop from magnet if on zipline
            gs.magnetised=false;

            gs.electrotimer=ELECTROTIME;

            gs.jump=true;
            gs.fall=false;

            gs.y-=1; // Make sure we're not touching the ground
            gs.vs=-(gs.jumpspeed/2); // Fly up in the air

            if (gs.hs!=0)
              gs.hs=(gs.hs>0?-(RUNSPEED*8):(RUNSPEED*8)); // Send back in the opposite direction

            // Electro buzz
	    generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 16, {r:0xff, g:0xff, b:1});
	    generateparticles(gs.x+(TILECATWIDTH/2), gs.y+(TILECATHEIGHT/2), 4, 4, {});
          }
          break;

        default:
          break;
      }
    }
  }
}

// Find the nearst char of type included in [tileids] to given x, y point or -1
function findnearestchar(x, y, tileids)
{
  var closest=(gs.width*gs.height*TILEHEIGHT);
  var charid=-1;
  var dist;

  for (var id=0; id<gs.chars.length; id++)
  {
    if (tileids.includes(gs.chars[id].id))
    {
      dist=calcHypotenuse(Math.abs(x-gs.chars[id].x), Math.abs(y-gs.chars[id].y));

      if (dist<closest)
      {
        charid=id;
        closest=dist;
      }
    }
  }

  return charid;
}

function updatecharAI()
{
  var id=0;
  var nx=0; // new x position
  var ny=0; // new y position

  for (id=0; id<gs.chars.length; id++)
  {
    switch (gs.chars[id].id)
    {
      case TILEDRONE:
      case TILEDRONE2:
        // Check if following a path, then move to next node
        if (gs.chars[id].path.length>0)
        {
          var nextx=Math.floor(gs.chars[id].path[0]%gs.width)*TILEWIDTH;
          var nexty=Math.floor(gs.chars[id].path[0]/gs.width)*TILEHEIGHT;
          var deltax=Math.abs(nextx-gs.chars[id].x);
          var deltay=Math.abs(nexty-gs.chars[id].y);

          // Check if we have arrived at the current path node
          if ((deltax<=(TILEWIDTH/2)) && (deltay<=(TILEHEIGHT/2)))
          {
            // We are here, so move on to next path node
            gs.chars[id].path.shift();

            // Check for being at end of path
            if (gs.chars[id].path.length==0)
            {
              // Set a null destination
              gs.chars[id].dx=-1;
              gs.chars[id].dy=-1;
            }
          }
          else
          {
            // Move onwards, following path
            if (deltax!=0)
            {
              gs.chars[id].hs=(nextx<gs.chars[id].x)?-1:1; // set horizontal speed
              gs.chars[id].x+=gs.chars[id].hs; // move horizontally
              gs.chars[id].flip=(gs.chars[id].hs<0); // left/right flip

              if (gs.chars[id].x<0)
                gs.chars[id].x=0;
            }

            if (deltay!=0)
            {
              gs.chars[id].y+=(nexty<gs.chars[id].y)?-1:1;

              if (gs.chars[id].y<0)
                gs.chars[id].y=0;
            }
          }
        }
        else
        {
          // Not following a path
          gs.chars[id].path=pathfinder(
                  (Math.floor(gs.chars[id].y/TILEHEIGHT)*gs.width)+Math.floor(gs.chars[id].x/TILEWIDTH)
                  ,
                  (Math.floor(gs.y/TILEHEIGHT)*gs.width)+Math.floor(gs.x/TILEWIDTH)
                  );
        }
        break;

      default:
        break;
    }
  }

  // Remove anything marked for deletion
  id=gs.chars.length;
  while (id--)
  {
    if (gs.chars[id].del)
    {
      if (gs.chars[id].ttl>0)
        gs.chars[id].ttl--;

      if (gs.chars[id].ttl==0)
        gs.chars.splice(id, 1);
    }
  }
}

// Determine distance (Hypotenuse) between two lengths in 2D space (using Pythagoras)
function calcHypotenuse(a, b)
{
  return(Math.sqrt((a * a) + (b * b)));
}

// Update game state, called once per frame
function update()
{
  // Apply keystate/physics to player
  updatemovements();

  // Update other character movements / AI
  updatecharAI();

  // Check for player/character/collectable collisions
  updateplayerchar();
}

// Check for level being completed
function islevelcompleted()
{
  // This is defined as ..
  //   TODO

  return (false);
}

// Scroll level to player
function scrolltoplayer(dampened)
{
  var xmiddle=Math.floor((XMAX-TILEWIDTH)/2);
  var ymiddle=Math.floor((YMAX-TILEHEIGHT)/2);
  var maxxoffs=((gs.width*TILEWIDTH)-XMAX);
  var maxyoffs=((gs.height*TILEHEIGHT)-YMAX);

  // Work out where x and y offsets should be
  var newxoffs=gs.x-xmiddle;
  var newyoffs=gs.y-ymiddle;

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
      var xdelta=1;

      if (Math.abs(gs.xoffset-newxoffs)>(XMAX/5)) xdelta=Math.abs(Math.floor(gs.hs));

      gs.xoffset+=newxoffs>gs.xoffset?xdelta:-xdelta;
    }
    else
      gs.xoffset=newxoffs;
  }

  // Determine if yoffset should be changed
  if (newyoffs!=gs.yoffset)
  {
    if (dampened)
    {
      var ydelta=1;

      if (Math.abs(gs.yoffset-newyoffs)>(YMAX/5)) ydelta=Math.abs(Math.floor(gs.vs));

      gs.yoffset+=newyoffs>gs.yoffset?ydelta:-ydelta;
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
  //gs.ctx.fillStyle=BGCOLOUR;
  gs.ctx.fillStyle=gs.nightsky;
  gs.ctx.fillRect(0, 0, gs.canvas.width, gs.canvas.height);

  // Draw the level
  drawlevel();

  // Draw the characters
  drawchars();

  // Draw ziplines
  drawziplines();

  // Draw the player
  if (gs.magnetised)
    gs.tileid=CATMAGNET;
  else if (gs.electrotimer>0)
    gs.tileid=CATELECTRO;
  else if (gs.jump)
    gs.tileid=CATJUMP;
  else if (gs.fall)
    gs.tileid=CATFALL;
  else
    gs.tileid=((gs.dir==0) && (gs.pausetimer==0))?3:((gs.speed==RUNSPEED)?gs.runanim[gs.frameindex]:gs.walkanim[gs.frameindex]);

  // Flash sprite when electro
  if ((gs.htime==0) || ((gs.htime%7)<=4)) // Flash when hurt
    drawcatsprite(gs.tileid, gs.x, playerlook(gs.x, gs.y+1)-1==TILESPRINGUP?gs.y+8:gs.y);

  // Draw hearts left
  drawlives();

  // Draw the particles
  drawparticles();
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
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(TARGETFPS*15)))
      gs.acc=gs.step*2;

    // Gamepad support
    try
    {
      if (!!(navigator.getGamepads))
        gamepadscan();
    }
    catch(e){}

    // Process "steps" since last call
    while (gs.acc>gs.step)
    {
      update();
      gs.acc-=gs.step;
    }

    redraw();

    // Check for level completed
    if ((gs.state==STATEPLAYING) && (islevelcompleted()))
    {
      gs.xoffset=0;
      gs.yoffset=0;

      if ((gs.level+1)==levels.length)
      {
        // End of game
        gs.state=STATECOMPLETE;

        //gs.timeline.reset().add(10*1000, undefined).addcallback(endgame).begin(0);
      }
      else
        newlevel(gs.level+1);
    }

    // If the update took us out of play state then stop now
    if (gs.state!=STATEPLAYING)
      return;
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Request we are called on the next frame
  window.requestAnimationFrame(rafcallback);
}

// New level screen
function newlevel(level)
{
  gs.level=level;
  gs.state=STATEPLAYING;
  loadlevel(gs.level);
  window.requestAnimationFrame(rafcallback);
}

// End game animation
function endgame(percent)
{
  if (gs.state!=STATECOMPLETE)
    return;

  // TODO
}

// Intro animation
function intro(percent)
{
  // TODO
  newlevel(0);
  // TODO
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
  gs.nightsky=gs.ctx.createLinearGradient(XMAX/2, 0, XMAX/2, YMAX);
  gs.nightsky.addColorStop(0, "#000000");
  gs.nightsky.addColorStop(0.85, "#1c2052");
  gs.nightsky.addColorStop(0.95, "#410e6b");
  gs.nightsky.addColorStop(1, "#502570");

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
      if ((gs.catloaded) && (gs.fontloaded))
        intro(0);
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
      if ((gs.tilesloaded) && (gs.fontloaded))
        intro(0);
    };
    gs.tilemapcatflip.src=c.toDataURL();
  };
  gs.tilemapcat.src=tilemapcat;

  // Load font tiles
  gs.font=new Image;
  gs.font.onload=function()
  {
    gs.fontloaded=true;
    if ((gs.tilesloaded) && (gs.catloaded))
      intro(0);
  };
  gs.font.src=tilemapfont;
}

// Run the init() once page has loaded
window.onload=function() { init(); };
