// Size of font characters in pixels
const FONTWIDTH=6;
const FONTHEIGHT=7;

function rgbtohsl(r, g, b)
{
  // Normalise to 0..1
  r/=255,g/=255,b/=255;

  // Determine extents
  var max=Math.max(r,g,b), min=Math.min(r,g,b);
  var h,s=max
  var l=(max+min)/2;

  var d=max-min; // Calculate delta
  s=(max==0)?0:(d/max);

  // Check for greyscale
  if (max==min)
  {
    h=0;
  }
  else
  {
    switch (max)
    {
      case r: h=((g-b)/d)+(g<b?6:0); break;
      case g: h=((b-r)/d)+2; break;
      case b: h=((r-g)/d)+4; break;
    }
    h/=6;
  }

  return {h:Math.floor(h*360), s:Math.floor(s*100), l:Math.floor(l*100)};
}

// Text writer
function write(ctx, x, y, text, size, rgb)
{
  var px=0; // Offset
  var hsl=rgbtohsl(rgb.r, rgb.g, rgb.b);

  ctx.save();

  var filterstr="invert(100%) brightness("+hsl.l+"%) sepia(100%) hue-rotate("+(hsl.h-50)+"deg) saturate("+(hsl.s*100)+"%)";
  ctx.filter=filterstr;

  // Iterate through characters to write
  for (var i=0; i<text.length; i++)
  {
    var offs=((text.charCodeAt(i)&0xdf)-65);

    // Process SPACE
    if (text.charCodeAt(i)==32)
      px+=Math.floor(FONTWIDTH*size);

    // Don't try to draw characters outside our font set
    if ((offs<0) || (offs>25))
      continue;

    // "draw" this letter
    ctx.drawImage(gs.font, (offs%13)*FONTWIDTH, Math.floor(offs/13)*FONTHEIGHT, FONTWIDTH, FONTHEIGHT, x+px, y, Math.floor(FONTWIDTH*size), Math.floor(FONTHEIGHT*size));

    px+=Math.floor(FONTWIDTH*size);
  }

  ctx.restore();
}
