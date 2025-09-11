// JS 13k 2025 entry
// Mochi and the midnight escape

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
const CATEYE=2;
const CATSITTING=3;
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
const TILESPRINGDOWN=15;
const TILESPRINGUP=30;
const TILEKEY=66;
const TILEPADLOCK=67;
const TILELEVERON=73;
const TILELEVEROFF=74;
const TILESPIKES=75;
const TILEFINISH=76;
const TILECLOUD=81;
const TILEELECTRIC=83;
const TILESTAR=88;
const TILEMAGNET=89;
// const TILEr=90;
// const TILEr_WALK=91;
// const TILEr_WALK2=92;
// const TILEr_SPLAT=93;
// const TILEr_POP=94;
// const TILEb=95;
// const TILEb_WALK=96;
// const TILEb_WALK2=97;
// const TILEb_SPLAT=98;
// const TILEb_POP=99;
const TILEDOORLOCKTL=101;
const TILEDOORLOCKTR=102;
const TILEDOORTL=103;
const TILEDOORTR=104;
const TILEWATER=105;
const TILEWATER2=106;
const TILEWATER3=107;
const TILEWATER4=108;
const TILEDEATH=109;
const TILEDEATH2=110;
const TILEDEATH3=111;
const TILEDRONE=112;
const TILEDRONE2=113;
const TILESWEEPER=114;
const TILESWEEPERFALL=115;
const TILEDOORLOCKL=116;
const TILEDOORLOCKR=117;
const TILEDOORL=118;
const TILEDOORR=119;
const TILENUM0=120;
const TILENUM1=121;
const TILENUM2=122;
const TILENUM3=123;
const TILENUM4=124;
const TILENUM5=125;
const TILENUM6=126;
const TILENUM7=127;
const TILENUM8=128;
const TILENUM9=129;
const TILEJS13K=130;
const TILECAT=131;
const TILEHEART=132;
const TILEHALFHEART=133;
const TILEEMPTYHEART=134;

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
  doortimer:0, // delay after unlocking or using a door before a door can be used
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
  doors:[], // array of door pairs
  electricity:[], // array of electricity for when it's turned back on
  leverallowed:0, // time to wait until electricity lever is allowed
  score:0, // score for the level
  completed:[], // set of booleans indicating if each level has been completed

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

  // Parallax
  parallax:[], // an array of particles placed at random x, y, z

  // Game state
  state:STATEINTRO, // state machine

  // Timeline for animation
  timeline:new timelineobj(), // timeline for general animation

  // Messagebox popup
  msgboxtext:"", // text to show in current messagebox
  msgboxtime:0, // timer for showing current messagebox
  msgqueue:[] // Message box queue
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

  var drawid=sprite.id;
  switch (sprite.id)
  {
    case TILESWEEPER:
    case TILESWEEPERFALL:
    case TILEDRONE:
    case TILEDRONE2:
      if (sprite.ttl>0)
      {
        if (sprite.ttl>=(TARGETFPS*0.66))
          drawid=TILEDEATH;
        else if (sprite.ttl>=(TARGETFPS*0.33))
          drawid=TILEDEATH2;
        else
          drawid=TILEDEATH3;
      }
      break;

    default:
      break;
  }

  if (sprite.flip)
    gs.ctx.drawImage(gs.tilemapflip, ((TILESPERROW*TILEWIDTH2)-((drawid*TILEWIDTH2) % (TILESPERROW*TILEWIDTH2)))-TILEWIDTH2, Math.floor((drawid*TILEWIDTH2) / (TILESPERROW*TILEWIDTH2))*TILEHEIGHT2, TILEWIDTH2, TILEHEIGHT2,
      Math.floor(sprite.x)-gs.xoffset, Math.floor(sprite.y)-gs.yoffset, TILEWIDTH, TILEHEIGHT);
  else
    gs.ctx.drawImage(gs.tilemap, (drawid*TILEWIDTH2) % (TILESPERROW*TILEWIDTH2), Math.floor((drawid*TILEWIDTH2) / (TILESPERROW*TILEWIDTH2))*TILEHEIGHT2, TILEWIDTH2, TILEHEIGHT2,
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

// Draw number using tiles
function drawnumber(x, y, number)
{
  const numstr=number.toString();

  // Iterate through characters to write
  for (var i=0; i<numstr.length; i++)
  {
    var offs=numstr.charCodeAt(i)-0x30;

    // Don't try to draw characters outside our font set
    if ((offs<0) || (offs>9))
      continue;

    drawtile(offs+TILENUM0, x+(i*TILEWIDTH), y);
  }
}

// Sort the chars so sprites are last (so they appear in front of non-solid tiles)
function sortChars(a, b)
{
  const sprites=[TILEDRONE, TILEDRONE2, TILESWEEPER, TILESWEEPERFALL];

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

// Process doors
function loaddoors(doortext)
{
  // Clear any current doors
  gs.doors=[];

  // Make sure we have doors for this level
  if ((doortext==undefined) || (doortext.length==0))
    return;

  // Split on "|" - for multiple door pairs
  doortext.split("|").forEach((doorpair) => {
    // Split on "," - for A and B
    var doorab=doorpair.split(",");

    if (doorab.length==2)
    {
      // Split on "x" - for X and Y for this door
      var coordsa=doorab[0].split("x");
      var coordsb=doorab[1].split("x");

      // If we have all the data, then add door pair
      if ((coordsa.length==2) && (coordsb.length==2))
        gs.doors.push({ax:coordsa[0], ay:coordsa[1], bx:coordsb[0], by:coordsb[1]});
    }
  });
}

// Go through a door
function usedoor(x, y)
{
  var sx=Math.floor(x/TILEWIDTH);
  var sy=Math.floor(y/TILEHEIGHT);
  var doorused=false;

  // Check for no doors defined
  if (gs.doors.length==0) return;

  // Find out which door it was
  gs.doors.forEach((doorpair) => {
    // If match found, transfer to other door in pair
    if ((sx==doorpair.ax) && (sy==doorpair.ay))
    {
      gs.x=(doorpair.bx*TILEWIDTH);
      gs.y=(doorpair.by*TILEHEIGHT);

      doorused=true;
    }
    else
    if ((sx==doorpair.bx) && (sy==doorpair.by))
    {
      gs.x=(doorpair.ax*TILEWIDTH);
      gs.y=(doorpair.ay*TILEHEIGHT);

      doorused=true;
    }
  });

  if (doorused)
  {
    // Go to new position
    scrolltoplayer(false);

    // Prevent double press
    gs.doortimer=(TARGETFPS*2);
  }
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

  // Start with empty set of characters
  gs.chars=[];

  // Work out where all the door pairs are
  loaddoors(levels[gs.level].doors);

  // Start with no electricity turned off, levers allowed and normal pace
  gs.electricity=[];
  gs.leverallowed=0;

  // Populate chars (non solid tiles)
  for (var y=0; y<gs.height; y++)
  {
    for (var x=0; x<gs.width; x++)
    {
      var tile=parseInt(levels[gs.level].chars[(y*gs.width)+x]||0, 10);

      if (tile!=0)
      {
        var obj={id:(tile-1), x:(x*TILEWIDTH), y:(y*TILEHEIGHT), flip:false, hs:0, vs:0, dwell:0, del:false, ttl:0};

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
            obj.seenplayer=false;
            gs.chars.push(obj);
            break;

          case TILESWEEPER:
          case TILESWEEPERFALL:
            obj.hs=(rng()<0.5)?0.5:-0.5;
            obj.flip=(obj.hs<0);
            obj.fall=(obj.id==TILESWEEPERFALL);
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

  // Populate parallax field
  gs.parallax=[];
  for (var i=0; i<4; i++)
    for (var z=1; z<=2; z++)
      gs.parallax.push({t:Math.floor(rng()*2), x:Math.floor((rng()*gs.width)*TILEWIDTH), y:Math.floor((rng()*(gs.height/2))*TILEHEIGHT), z:(z*10)});

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

// Draw parallax
function drawparallax()
{
  for (var i=0; i<gs.parallax.length; i++)
    drawtile(TILECLOUD+gs.parallax[i].t, gs.parallax[i].x-Math.floor(gs.xoffset/gs.parallax[i].z), gs.parallax[i].y-Math.floor(gs.yoffset/gs.parallax[i].z));
}

// https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-using-html-canvas
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r)
{
  if (w<(2*r)) r=w/2;
  if (h<(2*r)) r=h/2;

  this.beginPath();
  this.moveTo(Number(x+r), y);
  this.arcTo(x+w, y,   x+w, y+h, Number(r));
  this.arcTo(x+w, y+h, x,   y+h, Number(r));
  this.arcTo(x,   y+h, x,   y,   Number(r));
  this.arcTo(x,   y,   x+w, y,   Number(r));
  this.closePath();
};

// Draw messagebox if required
function drawmsgbox()
{
  if (gs.msgboxtime>0)
  {
    var i;
    var width=0;
    var height=0;
    var top=0;
    var icon=-1;
    const boxborder=1;
    var px,py=0; // Position to draw at

    // Draw box //
    // Split on \n
    const txtlines=gs.msgboxtext.split("\n");

    // Determine width (length of longest string + border)
    for (i=0; i<txtlines.length; i++)
    {
      // Check for and remove icon from first line
      if ((i==0) && (txtlines[i].indexOf("[")==0))
      {
        var endbracket=txtlines[i].indexOf("]");
        if (endbracket!=-1)
        {
          icon=parseInt(txtlines[i].substring(1, endbracket), 10);
          txtlines[i]=txtlines[i].substring(endbracket+1);
        }
      }

      if (txtlines[i].length>width)
        width=txtlines[i].length;
    }

    width+=(boxborder*2);

    // Determine height (number of lines + border)
    height=txtlines.length+(boxborder*2);

    // Convert width/height into pixels
    width*=FONTWIDTH;
    height*=(FONTHEIGHT+1);

    // Add space if sprite is to be drawn
    if (icon!=-1)
    {
      // Check for centering text when only one line and icon pads height
      if (txtlines.length==1)
        top=0.5;
    
      width+=(TILEWIDTH+(FONTWIDTH*2));

      if (height<(TILEHEIGHT+(2*FONTHEIGHT)))
        height=TILEHEIGHT+(2*FONTHEIGHT);
    }

    // Roll-up
    if (gs.msgboxtime<8)
      height=Math.floor(height*(gs.msgboxtime/8));

    px=XMAX-width;
    py=YMAX-height-FONTHEIGHT;

    // Draw box
    gs.ctx.fillStyle="rgba(255,255,255,0.75)";
    gs.ctx.strokeStyle="rgba(0,0,0,0)";
    gs.ctx.roundRect(px-(boxborder*FONTWIDTH), py, width, height, FONTWIDTH);
    gs.ctx.fill();

    if (gs.msgboxtime>=8)
    {
      // Draw optional sprite
      if (icon!=-1)
        drawsprite({id:icon, x:(px)+gs.xoffset, y:py+((boxborder*2)*FONTHEIGHT)-FONTHEIGHT+gs.yoffset, flip:false});

      // Draw text //
      for (i=0; i<txtlines.length; i++)
        write(gs.ctx, px+(icon==-1?0:TILEWIDTH+FONTWIDTH), py+((i+(boxborder*2)+top)*(FONTHEIGHT+1))-FONTHEIGHT, txtlines[i], 1, {r:0, b:0, g:0});
    }

    gs.msgboxtime--;
  }
  else
  {
    // Check if there are any message boxes queued up
    if ((gs.state==STATEPLAYING) && (gs.msgqueue.length>0))
    {
      showmessagebox(gs.msgqueue[0].text, gs.msgqueue[0].duration);
      gs.msgqueue.shift();
    }
  }  
}

// Show messsage box
function showmessagebox(text, timing)
{
  if ((gs.msgboxtime==0) && (gs.state==STATEPLAYING))
  {
    // Set text to display
    gs.msgboxtext=text;

    // Set time to display messagebox
    gs.msgboxtime=timing;
  }
  else
    gs.msgqueue.push({text:text, duration:timing});
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
    var py=5+gs.yoffset;

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
    gs.htime=0;

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

  // Don't apply gravity when magnetised
  if (gs.magnetised) return;

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

  // Decrease door timer
  if (gs.doortimer>0)
  {
    gs.doortimer--;

    // Skip timer if no input detected
    if ((gs.doortimer<(TARGETFPS/2)) && (gs.keystate==KEYNONE) && (gs.padstate==KEYNONE))
      gs.doortimer=0;
  }

  // Check for electro timer
  if (gs.electrotimer>0) gs.electrotimer--;

  // Check for electro lever being allowed
  if (gs.leverallowed>0)
  {
    gs.leverallowed--;

    if ((gs.leverallowed<(TARGETFPS/2)) && (gs.keystate==KEYNONE) && (gs.padstate==KEYNONE))
      gs.leverallowed=0;
  }

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

        case TILESTAR:
          gs.score++;

          // Shiny
          generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 1, 1, {r:0xff, g:0xff, b:1});

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

            // Prevent double press
            gs.doortimer=(TARGETFPS*2);
          }
          break;

        case TILEDOORL:
        case TILEDOORR:
          // Check for using this door
          if ((gs.doortimer==0) && (ispressed(KEYDOWN)))
          {
            // Try to go through this door
            usedoor(gs.chars[id].x, gs.chars[id].y);
          }
          break;

        case TILELEVERON:
          if ((gs.leverallowed==0) && (ispressed(KEYDOWN)))
          {
            for (var id2=0; id2<gs.chars.length; id2++)
            {
              // Remove electro
              if (gs.chars[id2].id==TILEELECTRIC)
              {
                gs.chars[id2].ttl=Math.floor((gs.chars[id2].y/TILEHEIGHT)*2);
                gs.chars[id2].del=true;
                gs.electricity.push(JSON.parse(JSON.stringify(gs.chars[id2])));
              }

              // Switch all levers to off
              if (gs.chars[id2].id==TILELEVERON)
                gs.chars[id2].id=TILELEVEROFF;
            }

            // Prevent switch being flickered
            gs.leverallowed=(TARGETFPS*2);
          }
          break;

        case TILELEVEROFF:
          if ((gs.leverallowed==0) && (ispressed(KEYDOWN)))
          {
            if (gs.electricity.length>0)
            {
              for (var id2=0; id2<gs.electricity.length; id2++)
              {
                var newelec=JSON.parse(JSON.stringify(gs.electricity[id2]));
                newelec.del=false;
                gs.chars.push(newelec);
              }

              // Clear the list
              gs.electricity=[];

              // Switch all levers to on
              for (var id3=0; id3<gs.chars.length; id3++)
              {
                if (gs.chars[id3].id==TILELEVEROFF)
                  gs.chars[id3].id=TILELEVERON;
              }
            }

            // Switch lever to on
            gs.chars[id].id=TILELEVERON;

            // Prevent switch being flickered
            gs.leverallowed=(TARGETFPS*2);
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
            generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 32, 8, {r:0xff, g:0xff, b:0xff});
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
            generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 1, {r:0xff, g:0xff, b:1});
            generateparticles(gs.x+(TILECATWIDTH/2), gs.y+(TILECATHEIGHT/2), 4, 4, {});
          }
          break;

        case TILEHEART:
          gs.htime=0; // heal

          if (gs.lives<MAXLIVES)
            gs.lives+=0.5;

          // Heart explosion
          generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 16, {r:0xff, g:1, b:1});

          // Remove from map
          gs.chars[id].del=true;
          break;

        case TILESWEEPER:
        case TILESWEEPERFALL:
          if (gs.htime==0)
          {
              // Lose health (when not already hurt)
              if (gs.lives>0)
                gs.lives-=0.5;

            gs.htime=(TARGETFPS*5);
          }
          break;

        case TILEDRONE:
        case TILEDRONE2:
          if (gs.htime==0)
          {
              // Lose health (when not already hurt)
              if (gs.lives>0)
                gs.lives-=0.5;

            gs.htime=(TARGETFPS*5);
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

function countchars(tileids)
{
  var found=0;

  for (var id=0; id<gs.chars.length; id++)
    if (tileids.includes(gs.chars[id].id))
      found++;

  return found;
}

function updatecharAI()
{
  var id=0;
  var id2=0;
  var nx=0; // new x position
  var ny=0; // new y position
  var ox=0; // old x position
  var oy=0; // old y position

  for (id=0; id<gs.chars.length; id++)
  {
    ox=gs.chars[id].x;
    oy=gs.chars[id].y;

    switch (gs.chars[id].id)
    {
      case TILESWEEPER:
      case TILESWEEPERFALL:
        // Check if dwelling
        if (gs.chars[id].dwell>0)
        {
          gs.chars[id].dwell--;

          continue;
        }

        // Check for solid ground underneath
        if ((!gs.chars[id].fall) && (!collide(gs.chars[id].x, gs.chars[id].y+1, TILEWIDTH, TILEHEIGHT)))
        {
          gs.chars[id].fall=true;
          gs.chars[id].id=TILESWEEPERFALL;
        }
        else
        if ((gs.chars[id].fall) && (collide(gs.chars[id].x, gs.chars[id].y+1, TILEWIDTH, TILEHEIGHT)))
        {
          gs.chars[id].fall=false;
          gs.chars[id].id=TILESWEEPER;
        }

        if (gs.chars[id].fall)
        {
          gs.chars[id].y++;
          break;
        }

        // Check for player nearby
        if (calcHypotenuse(Math.abs(gs.x-gs.chars[id].x), Math.abs(gs.y-gs.chars[id].y))<(TILEWIDTH*3))
        {
          if (gs.chars[id].x>gs.x)
            gs.chars[id].hs=-0.5;
          else
            gs.chars[id].hs=0.5;

          gs.chars[id].flip=(gs.chars[id].hs<0);
        }

        nx=(gs.chars[id].x+=gs.chars[id].hs); // calculate new x position
        if ((collide(nx, gs.chars[id].y, TILEWIDTH, TILEHEIGHT)) || // blocked by something
            (
              (!collide(nx+(gs.chars[id].flip?(TILEWIDTH/2)*-1:(TILEWIDTH)/2), gs.chars[id].y, TILEWIDTH, TILEHEIGHT)) && // not blocked forwards
              (!collide(nx+(gs.chars[id].flip?(TILEWIDTH/2)*-1:(TILEWIDTH)/2), gs.chars[id].y+(TILEWIDTH/2), TILEWIDTH, TILEHEIGHT)) // not blocked forwards+down (i.e. edge)
            ))
        {
          // Turn around
          gs.chars[id].hs*=-1;
          gs.chars[id].flip=!gs.chars[id].flip;
        }
        else
          gs.chars[id].x=nx;

        // Check for collisions with other chars
        for (id2=0; id2<gs.chars.length; id2++)
        {
          if (overlap(gs.chars[id].x, gs.chars[id].y, TILEWIDTH, TILEHEIGHT, gs.chars[id2].x, gs.chars[id2].y, TILEWIDTH, TILEHEIGHT))
          {
            switch (gs.chars[id2].id)
            {
              case TILEWATER:
              case TILEWATER2:
              case TILEWATER3:
              case TILEWATER4:
              case TILESPIKES:
                generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 16, 2, {r:0xff, g:0xff, b:1});
                generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 8, 2, {r:0x29, g:0xad, b:0xff});

                if (gs.chars[id].del==false)
                {
                  gs.chars[id].del=true;
                  gs.chars[id].ttl=TARGETFPS;
                  gs.chars[id].hs=0;
                }
                break;

              default:
                break;
            }
          }
        }
        break;

      case TILEDRONE:
      case TILEDRONE2:
        // Check if dwelling
        if (gs.chars[id].dwell>0)
        {
          gs.chars[id].dwell--;

          continue;
        }

        if (calcHypotenuse(Math.abs(gs.x-gs.chars[id].x), Math.abs(gs.y-gs.chars[id].y))<(TILEWIDTH*4))
        {
          if (gs.chars[id].seenplayer==false)
            gs.chars[id].path=[];

          gs.chars[id].seenplayer=true;
        }

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
              // Path completed so wait a bit
              gs.chars[id].dwell=Math.floor(TARGETFPS/2);

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
          if (gs.chars[id].seenplayer)
          {
            // Go to where player is
            nx=Math.floor(gs.x/TILEWIDTH);
            ny=Math.floor(gs.y/TILEHEIGHT);
          }
          else
          {
            do
            {
              nx=Math.floor(rng()*gs.width);
              ny=Math.floor(rng()*gs.height);
            } while (collide(nx*TILEWIDTH, ny*TILEHEIGHT, TILEWIDTH, TILEHEIGHT));
          }

          gs.chars[id].path=pathfinder(
            (Math.floor(gs.chars[id].y/TILEHEIGHT)*gs.width)+Math.floor(gs.chars[id].x/TILEWIDTH)
            ,
            (ny*gs.width)+nx
            );

          // If we can't find a path then dwell for a bit, before going back into patrol
          if (gs.chars[id].path.length==0)
          {
            gs.chars[id].seenplayer=false;
            gs.chars[id].dwell=Math.floor(TARGETFPS/2);
          }
        }

        // Check for collisions with other chars
        for (id2=0; id2<gs.chars.length; id2++)
        {
          if (overlap(gs.chars[id].x, gs.chars[id].y, TILEWIDTH, TILEHEIGHT, gs.chars[id2].x, gs.chars[id2].y, TILEWIDTH, TILEHEIGHT))
          {
            switch (gs.chars[id2].id)
            {
              case TILEELECTRIC:
                if (gs.chars[id].seenplayer)
                {
                  generateparticles(gs.chars[id].x+(TILEWIDTH/2), gs.chars[id].y+(TILEHEIGHT/2), 32, 2, {r:0xff, g:0xff, b:1});
                  gs.chars[id].path=[];

                  if (gs.chars[id].del==false)
                  {
                    gs.chars[id].del=true;
                    gs.chars[id].ttl=TARGETFPS;
                  }
                }
                else
                {
                  gs.chars[id].x=ox;
                  gs.chars[id].y=oy;

                  gs.chars[id].path=[]; // We went into electric by accident - so run away
                }
                break;

              default:
                break;
            }
          }
        }
        break;

      default:
        break;
    }

    // If not following a path and colliding with a tile at new position, put char back
    if (((gs.chars[id].path==undefined) || (gs.chars[id].path.length==0)) &&
        (collide(gs.chars[id].x, gs.chars[id].y, TILEWIDTH, TILEHEIGHT)))
    {
      gs.chars[id].x=ox;
      gs.chars[id].y=oy;
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
      {
        switch (gs.chars[id].id)
        {
          case TILEDRONE:
          case TILEDRONE2:
          case TILESWEEPER:
          case TILESWEEPERFALL:
            gs.score+=10;
            break;

          default:
            break;
        }

        gs.chars.splice(id, 1);
      }
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
  //   no stars
  //   no drones
  //   no sweepers
  //   standing on fimish point

  return ((countchars([TILESTAR, TILEDRONE, TILEDRONE2, TILESWEEPER, TILESWEEPERFALL])==0) &&
          ((playerlook(gs.x, gs.y+1)-1)==TILEFINISH));
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

  // Draw the parallax
  drawparallax();

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
    gs.tileid=((gs.dir==0) && (gs.pausetimer==0))?CATSITTING:((gs.speed==RUNSPEED)?gs.runanim[gs.frameindex]:gs.walkanim[gs.frameindex]);

  // Flash sprite when electro
  if ((gs.htime==0) || ((gs.htime%7)<=4)) // Flash when hurt
    drawcatsprite(gs.tileid, gs.x, playerlook(gs.x, gs.y+1)-1==TILESPRINGUP?gs.y+8:gs.y);

  // Draw the particles
  drawparticles();

  // Draw hearts left
  drawlives();

  // Draw any visible messagebox
  drawmsgbox();

  // Draw the score
  if (gs.score>0)
    drawnumber((XMAX-((gs.score.toString().length)*TILEWIDTH)-5)+gs.xoffset, 5+gs.yoffset, gs.score);
}

// Request animation frame callback
function rafcallback(timestamp)
{
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

      gs.completed[gs.level]=true;

      try
      {
        window.localStorage.setItem('mochimidnightescape', JSON.stringify({score:gs.score, level:gs.level, completed:gs.completed}));
      }
      catch (e){}

      if ((gs.level+1)==levels.length)
      {
        // End of game
        gs.state=STATECOMPLETE;

        // Reduce issues when inputs held
        clearinputstate();

        gs.timeline.reset().add(10*1000, undefined).addcallback(endgame).begin(0);
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

  // Request we are called on the next frame, but only if still playing
  if (gs.state==STATEPLAYING)
    window.requestAnimationFrame(rafcallback);
}

// New level screen
function newlevel(level)
{
  var hints=[];

  if ((level<0) || (level>=levels.length))
    return;

  // Ensure timeline is stopped
  gs.timeline.end().reset();
  gs.timeline=new timelineobj();

  gs.state=STATENEWLEVEL;

  // Clear any messageboxes left on screen
  gs.msgqueue=[];
  gs.msgboxtime=0;

  // Reduce held inputs causing issues
  clearinputstate();

  // Set up a timeline to display level details
  gs.timeline.add(0, function()
  {
    // Advance to next level
    gs.level=level;

    // Clear canvas
    gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
  
    // Write level title
    write(gs.ctx, (XMAX/2)-((Math.floor(levels[gs.level].title.length/2)*FONTWIDTH)*2), 40, levels[gs.level].title, 2, {r:255, g:255, b:255});
  }).add(2*1000, function()
  {
    gs.state=STATEPLAYING;
    loadlevel(gs.level);
    window.requestAnimationFrame(rafcallback);
  });

  // Add hints depending on level
  switch (level)
  {
    case 0:
      hints.push("["+TILEJS13K+"]Welcome to JS13K entry\nby picosonic",
        "["+TILECAT+"]Mochi has been imprisoned",
        "["+TILESTAR+"]Collect all the stars",
        "["+TILEFINISH+"]Find the finish\nto advance");
      break;

    case 1:
      hints.push("["+TILESPRINGUP+"]Use springs to reach higher");
      break;

    case 2:
      hints.push("["+TILEWATER+"]Mochi hates bathtime",
        "["+TILEHEART+"]Collect hearts to heal");
      break;

    case 3:
      hints.push("["+TILESPIKES+"]Careful of the spikes",
        "["+TILEMAGNET+"]Jump to magnets\nto use ziplines");
      break;

    case 4:
      hints.push("["+TILELEVERON+"]Control electricy\nwith levers",
        "["+TILELEVEROFF+"]Press down on a lever\nto use it");
      break;

    case 5:
      hints.push("["+TILESWEEPER+"]Defeat the sweepers\nlure them to hazards");
      break;

    case 6:
      hints.push("["+TILEDRONE+"]Defeat the drones");
      break;

    case 7:
      hints.push("["+TILEKEY+"]Find a key to\nunlock the doors",
        "["+TILEPADLOCK+"]Press down to unlock\nand enter doors");
      break;

    default:
      break;
  }

  // Queue up all the hints as message boxes one after the other
  for (var n=0; n<hints.length; n++)
    showmessagebox(hints[n], 3*TARGETFPS);

  gs.timeline.begin();
}

function resettointro()
{
  gs.timeline.reset().add(10*1000, undefined).addcallback(intro).begin(0);
}

// End game animation
function endgame(percent)
{
  if (gs.state!=STATECOMPLETE)
    return;

  // Gamepad support
  try
  {
    if (!!(navigator.getGamepads))
      gamepadscan();
  }
  catch(e){}

  // Check if done or control key/gamepad pressed
  if ((percent>=98) || (((gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE)) && (percent>=20)))
  {
    gs.state=STATEINTRO;
    gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
    setTimeout(resettointro, 300);
  }
  else
  {
    gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

    write(gs.ctx, 30, 40, "CONGRATULATIONS", 3, {r:0, g:255, b:255});
    write(gs.ctx, 30, 70, "MOCHI", 3, {r:255, g:0, b:255});
    write(gs.ctx, 30, 100, "ESCAPED", 3, {r:239, g:255, b:0});

    write(gs.ctx, 30, 150, "SCORE", 2, {r:255, g:255, b:255});
    drawnumber(100+gs.xoffset, 149+gs.yoffset, gs.score);
  }
}

function draweyes()
{
  var fs=gs.flip
  var cex=130;
  var cey=70;

  gs.flip=false;
  drawcatsprite(CATEYE, cex+gs.xoffset, cey+gs.yoffset);

  gs.flip=true;
  drawcatsprite(CATEYE, cex+50+gs.xoffset, cey+gs.yoffset);

  gs.flip=fs;
}

// Intro animation
function intro(percent)
{
  // Gamepad support
  try
  {
    if (!!(navigator.getGamepads))
      gamepadscan();
  }
  catch(e){}

  // Check if done or control key/gamepad pressed
  if (percent>=98)
  {
    gs.timeline.end();
    setTimeout(resettointro, 3*1000);
  }
  else
  if (((gs.keystate!=KEYNONE) || (gs.padstate!=KEYNONE)) && (percent>20))
  {
    gs.timeline.end();

    gs.score=0;
    gs.lives=MAXLIVES;

    newlevel(0);
  }
  else
  {
    var tenth=Math.floor(percent/10);

    switch (tenth)
    {
      case 0:
        gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
        break;

      case 1:
        draweyes();
        break;

      case 3:
        write(gs.ctx, 40, 40, "MOCHI", 2, {r:255, g:0, b:255});
        break;

      case 5:
        write(gs.ctx, 160, 110, "AND THE MIDNIGHT ESCAPE", 1, {r:255, g:0, b:255});
        break;

      case 6:
        write(gs.ctx, 80, 160, "WASD ZQSD CURSORS OR GAMEPAD", 1, {r:255, g:223, b:0});
        break;

      default:
        break;
    }
  }
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

  // Init level vars which are stored between plays
  gs.score=0;
  for (var i=0; i<levels.length; i++)
    gs.completed[i]=false;

  // Restore from localStorage
  try
  {
    var savedata=window.localStorage.getItem("mochimidnightescape");
    if ((savedata!=undefined) && (savedata!=null))
    {
      savedata=JSON.parse(savedata);
      gs.score=savedata.score;
      // TODO ? =savedata.level
      gs.completed=savedata.completed;
    }
  }
  catch (e) {}

  // Set up intro animation callback
  gs.timeline.reset().add(10*1000, undefined).addcallback(intro);

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
        gs.timeline.begin(0);
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
        gs.timeline.begin(0);
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
      gs.timeline.begin(0);
  };
  gs.font.src=tilemapfont;
}

// Run the init() once page has loaded
window.onload=function() { init(); };
