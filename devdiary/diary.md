# Dev Diary / Postmortem

This is my ninth game jam entry

As in my previous years entering the competition, around the time the theme was announced I created a new project template with updated build and minify steps from my entry last year

As soon as the theme was announced I had some thoughts as to what kind of game I wanted to create to fit the theme, here as some of my initial thoughts/notes/ideas ..

Black Cat
---------
* Most black cats have golden irises
* Mythology, legend and superstition
* Associated with witches and evil spirits
* Halloween figure
* Black cat crossing your path is either good or bad luck
* Associated in ancient Egypt to goddess [Bastet](https://en.wikipedia.org/wiki/Bastet)
* Black cats can turn brown in sunlight
* Good luck at sea as a ships cat
* Required for finding the treasure of [Carbuncio](https://en.wikipedia.org/wiki/Carbuncle_(legendary_creature)) in [Chilote mythology](https://en.wikipedia.org/wiki/Chilote_mythology)
* October 27th is "Black Cat Day" in the UK, a similar "Black Cat Appreciation Day" for August 17th in USA
* Several films, TV shows, books, magazines and music (groups/albums/songs) named "Black Cat"
* 13th armoured division in the USA named "Black Cats" during WWII
* [Royal Navy helicopter display team](https://www.royalnavy.mod.uk/public-relations/display-teams/black-cats-helicopter-display-team) in the UK

Game ideas
----------
* Make a cat run around following a laser pointer, solving puzzles
* Platformer with a cat solving puzzles to escape entrapment
* Helping a witch pass her exams at spell school
* Catching mice, rats and small seabirds on a ship, avoiding the captain
* A dark assasin ninja cat, undertaking moonlit missions

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic), taken from notes and [commit logs](https://github.com/picosonic/js13k-2025/commits/)..

13th August
-----------
Looked into [Black Cat on Wikipedia](https://en.wikipedia.org/wiki/Black_cat), to have a think about possible game ideas. I also let me son know the theme soon after annoucement as he is keen to help me on it this year

Padded out the build environment and dev workflow, mostly based on previous entries, but with a few updates

Found a free to use [black cat tilemap](https://opengameart.org/content/cat-sprites) with no attribution, credit [Shepardskin](Shepardskin)

![Cat spritesheet](catspritesx2.gif?raw=true "Cat spritesheet")

Made spritesheet background transparent, aligned all the sprites to a 20x16 grid to avoid needing an (x,y) lookup table - typically used with packed sprites

Mocked up a quick sprite animation test where the cat automatically runs left and right across the screen, I thought this looked pretty good, so decided to stick with this set of sprites for the main character

![Testing sprite animation](aug13.gif?raw=true "Testing sprite animation")

14th August
-----------
Added movement of character using keyboard as input, to see how the cat animation would react to being controlled

Added timeline library for animations, I created this a while back and have added to it over the years, I knew I would have some kind of animation or timed events so this is perfect for that

Support for non-60Hz refresh rates, by working out target framerate vs actual framerate in RAF function

Added second tileset for levels

![Level tileset](../assets/tilemap_packed.png?raw=true "Level tilesset")

Levels created with Tiled are now loaded and drawn

![Test level](aug14.gif?raw=true "Test level")

15th August
-----------
Added ability to jump

Expanded test level to test jumps

Added level scrolling so that when the cat goes off the screen, it view scrolls to keep the cat visible

![Jumping and scrolling](aug15.gif?raw=true "Jumping and scrolling")

16th August
-----------
Moved input handling to separate module so that I can also add gamepad at a later date

17th August
-----------
Added character handling, basically non-solid tiles which you can either go past or interact with. This is a separate layer within Tiled so that it's easy to see where they will appear on the map

![Walk run transition](aug17.gif?raw=true "Walk run transition")

19th August
-----------
Added magnetic zipline, idle sitting, running, collision

Test jumping on spring mechanic

![Magnetic ziplines](aug19.gif?raw=true "Magnetic ziplines")

1st September
-------------
After a long break for a family holiday with unfortunately no dev, I've got back into things

Added pathfinder library from a previous project to allow characters to find their way around the map without bumping into solid things

Added cat being electrocuted collision detection, electricty animation and cat sprite, it's a yellow spikey outline with a skeleton showing

Added concept of 9 lives, which is shown on UI, although for now these are shown as 9 halves because 9 hearts on the screen took up too much space

Made the UI elements (hearts/stars) semi-transparent so that you can see what's underneath

Tidy-up by using constant IDs where possible rather than numbers, this just makes the code more readble

Made drone character animate and follow player using pathfinder

![Health UI testing](aug21.gif?raw=true "Health UI testing")

2nd September
-------------
Improved electro interaction by making friction apply all the time, previously it was only applied when the cat was on the ground

![Electrocution](sep2.gif?raw=true "Electrocution")

3rd September
-------------
Electro can now be turned off using flag points, in a phased way so there's a little animation rather than them just dissapearing

Spikes are now painful and can't be moved through, when contact is made the player is thrown off in the opposite direction

Added item collection ability, starting with keys. So overlapping a collectable object will make it dissapear and an associated action can be taken

Added water sprites and processing for water, I took inspiration for this from the water in the game Fantasy World Dizzy, although that uses a single whole sprite, then a series of XOR overlays to add the animation

4th September
-------------
Locked doors can now be unlocked using a key, the idea is you can hold as many keys as you find, then so long as you are still holding at least one key then any door can be unlocked - with your key count going down each time

Added function to find nearest char of given types, this is used to find the nearest door tiles to the player which need to be converted from locked to unlocked when a key is used

Added particles, e.g. blood when hitting spikes, water splashes, electro buzz, collecting, stomping

Added "midnight" background gradient, just to give it some texture, I may vary this over time to give the feel of a sunset / sunrise

Added support for gamepads based on code from my previous JS13k entries [2018 Planet Figadore Has Gone Offline](https://js13kgames.com/entries/planet-figadore-has-gone-offline) and [2021 Airspace Alpha Zulu](https://js13kgames.com/entries/airspace-alpha-zulu)

5th September
-------------
Added state machine so we can transition between intro, playing, new level, e.t.c.

Added "hurt" timer to make player flash (giving temporary invulnerability)

Added font based on [Pixel Square Regular](https://kenney.nl/assets/kenney-fonts) font by Kenney

![Pixel font](../assets/pixelsquareregularfont.png?raw=true "Pixel font")

Created a font PNG based on just A-Z, this is loaded with the other tilemaps. I then wrote a routine to draw the text out using the font tilemap. This was a bit bland so I started on a journey to colourise it

Convert RGB to HSL so that font can be coloured, followed [guide](https://www.rapidtables.com/convert/color/rgb-to-hsl.html), this sort of works for some colours, but not for others. After some digging found a [guide](https://stackoverflow.com/questions/72474574/pass-hex-colors-to-sepia-hue-rotate) which states that because I'm using sepia() to add colour to the font, I need to shift the hue rotation by 50 degrees. This approach seems to give a better result

![Drone chase](sep5.gif?raw=true "Drone chase")

6th September
-------------
Added level complete check stub. Once I've defined what is required to complete a level, this will transition to the next level

Fixed an issue with an assumption in my timeline library that the optional associated objects would always be set

7th September
-------------
Added cat's eye sprite, to be used in the intro, including a draw routine which does the flipping and draws them the right distance apart (this sprite was created from a photo of a real cat)

Added global strings array so that text can be rendered easier

Added end of game stub, for when game is complete an animation can be shown
As part of this if the user interacts or the animation ends, it loops back to the intro

Ensure when changing levels that any timelines are stopped and the new level number is a valid one

Start game in intro state and transition to playing after user interaction

8th September
-------------
Updates to intro animation, made it loop and added animation to reveal cat's eyes, game name and controls

Switch keyboard UIEvent processing from e.which to e.code due to [deprectated api](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/which)

Made doors functional, pressing down on a locked door when key is held will unlock the door, then pressing down on an unlocked door will transport you to the linked door - delays on door use were also introduced to prevent flicking between doors

Fixed issue when ziplining over a close block the zipline could drop, and show the magnet with the cat but not attached to the zipline

Fixed issue with jump on AZERTY keyboards, because "Q" wasn't mapped

Allow levers to turn on/off electricity, and make all levers be in sync

Added sweeper NPC, who patrols until it sees the player, then chases the player

Allow drone to be removed with electricity

Allow sweeper to fall off edges when chasing player, so the sweeper ignore it's normal edge detection safety mechanism, which will become a dynamic for the player to use to lure the drone to its demise

9th September
-------------
Fix sweeper getting "stuck" overlapping tiles when following player. Basically when safety mechanism was turned off due to fixation with the player it could get into a position where it overlapped a solid tile that it wasn't able to escape from unless lured away by the player. So this update detects solid overlaps when the happen, and reverts the NPC position to a non-overlapped one

Water and spikes now harm sweeper, this adds to mechanisms to defeat them

Added cloud parallax in the background, some randomly placed clouds adjust based on your position within the level map

Added stars which add to score when collected, this adds nothing more than a motive to visit places on the map

Flying drones start off navigating randomly, they choose a random empty position on the map, check to see if they can navigate there, but when player is seen by the drone it switches to hunt mode

Drone avoids electricity unless hunting player so that it doesn't self-terminate, again like the sweeper, the will to survive is overcome by a desire to hunt the player

Resized tilemap, removing some unused tiles to save a few bytes

Added saving/restoring of progress to localStorage

10th September
--------------
Noticed using doors can be a bit slow, as it uses timeouts to prevent flickering between door portals. I changed it so that if no input is detected whilst timer is running it skips the wait

Draw numbers using tiles - for showing score, previously I would have done this with a font, but decided to use numbers already in the Kenney tilemap

Add to score when enemies removed, 10 points !

Tweak UI positions to give more space on screen, draw lives above strings

Ensure a minimum time is waited before skipping door and lever timers, so it feels like an action took place

Added dwell time for sprites with paths, to prevent overrun. What I saw was that if you were being chased by more than one NPC then their logic could overlap and you'd only see one NPC. So this adds a bit of time to their path once they reach their destination - as if they are thinking where to go next. It has the effect over lowering the liklihood of overlaps

Test for level being completed using criteria added, collecting all the coins and destroying all the guard drones

Support gamepad in intro and endgame animations, previously when playing on gamepad you had to press something on the keyboard to interact then go back to the gamepad - this makes it more seemless so you can continue on your preferred input device

Enemies now hurt when you touch them, taking hearts away and putting you in a hurt state

Hearts give you life when collected, but up to a maximum of 9 halves (4.5 visible) hearts

Created small and large poster images for the game using a mix of AI and GIMP

![Small screenshot](../small_screenshot.png?raw=true "Small screenshot")

![Big screenshot](../big_screenshot.png?raw=true "Big screenshot")

Drone death animation, they inflate then break apart into a shower of particles

11th September
--------------
Removed debug FPS calculation as I wasn't using it

Removed strings renderer as I also wasn't using that

Added popup messageboxes (shown like toast) at bottom right (so as not to overlap the score), for general information, hints, e.t.c.

Current level is added to savedata, to allow resuming from that point

Added tiny 8x8 JS13k icon to be used in the intro popup message

Updated tile constants for readability

Only call "playing" RAF function, while still playing state, otherwise we get a few overlapping calls when each new level is started

Added a basic game-completed screen

Added level hints when starting each level, introducing the gameplay gradually, shown as popup toast message boxes

Reduce issues when inputs held between state transitions by clearing input keypress bitfield

Fixed overlapping RAF when starting new levels issue, as previous attempt didn't work in all cases

Fixed icon issue on level 6 hint

Set minimum view time for into/end to 20% of animation - looks like jerky

Fleshed out congrats screen at end of game

Made 7 tutorial levels slowly getting harder and introducing different gameplay elements one at a time

Added level descriptions to be shown on the level trnsition/start screens

Made electricity hurt sweepers, as another way to dispatch them

12th September
--------------
Added 8th tutorial level introducing doors to the player, added some hearts to level 7 to make it feel a bit fairer

Squashed level 4 width to make more room for other stuff

Added an endgame screen for when the player fails to escape

Added red and blue NPCs, they walk around, hide when the player comes nearby, inflate up like a pufferfish when hit by a drone

Added 9th "full" level

Gone over by 500 bytes, tweaked all the levels making them smaller and less complex

15th September
--------------
Added the AI-generated assets used to make the thumbnails for the competition submission

I saw a video of somebody playing the game and they appeared to get stuck on a piece of foliage like it was solid, so I've fixed that, luckily it didn't affect gameplay

Simplified how doors are defined to only store lower left of door pair, and not both sides. When the doors are processed upon level loading, the right part of the door is inferred

Noticed that the gamepad code was adding a lot of entropy (enemy of compression) by the use of full device id strings, so I've changed them all to be VID and PID only which saves a ton of space

Added a missing tile at the bottom right of level 5, so that the row of spikes is complete and you can't just drop straight down off the ledge

16th September
--------------
Allow level properties to be optional, so that an empty doors entry is not created when not required

Having made a lot of space saving improvements, there is now enough space to reinstate most of the levels (except level 7) back to their original pre-squeezed state

17th September
--------------
Remove door skip timeout when no keys are pressed to make door use much quicker

Made keyboard and gamepad code more concise to save some more bytes

1st October
-----------
Remove duplicate data url definiion for png tilemaps so that more space is saved

I've had an idea to merge the tiles and chars layers in the Tiled maps to try halving their space requirements with a view to big gains in byte usage, to this end I've discovered that level 9 has some sprites in the same position on both the tiles and chars layers, so I've fixed that

2nd October
-----------
To be able to produce a link to the game on github pages for a "directors cut" link, I need to add the generated tilemaps and levels to the repo and remove those files from the gitignore file

3rd October
-----------
Further reduction using const for png data urls to save having a function

Consolidated duplicate CSS properties for overflow

Added PHP script to parse Tiled tmx levels and output a more concise level with merged tile layers