// Size of font characters in pixels
const FONTWIDTH=6;
const FONTHEIGHT=7;

// Text writer
function write(ctx, x, y, text, size, filter)
{
  var px=0; // Offset

  ctx.save();

  ctx.filter=filter;

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
