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

Padded out the build environment and dev workflow

Found a free to use [black cat tilemap](https://opengameart.org/content/cat-sprites) with no attribution, credit [Shepardskin](Shepardskin)

Made background transparent, aligned all the sprites to a 20x16 grid

Mocked up a quick sprite animation test where the cat runs left and right across the screen

14th August
-----------
Added movement of character using keyboard as input

Added timeline library for animations

Support for non-60Hz refresh rates

Added second tileset for levels

Levels are now loaded and drawn

15th August
-----------
Added ability to jump

Expanded test level to test jumps

Added level scrolling

16th August
-----------
Moved input handling to separate module

17th August
-----------
Added character handling, basically non-solid tiles which you can either go past or interact with

19th August
-----------
Added zipline, idle sitting, running, collision

Test jumping on spring mechanic

1st September
-------------
After a long break for a family holiday with unfortunately no dev, I've got back into things

Added pathfinder library from a previous project to allow characters to find their way around the map without bumping into solid things

Added cat being electrocuted collision detection, electricty animation and cat sprite

Added concept of 9 lives, which is shown on UI, although for now these are shown as 9 halves

Made the UI elements (hearts/stars) semi-transparent so that you can see what's underneath

Tidy-up by using constant IDs where possible rather than numbers

Made drone character animate and follow player using pathfinder

2nd September
-------------
Improved electro interaction by making friction apply all the time

3rd September
-------------
Electro can now be turned off using flag points, in a phased way

Spikes are now painful and can't be moved through

Added item collection ability, starting with keys

Added water sprites and processing for water

4th September
-------------
Locked doors can now be unlocked using a key

Added function to find nearest char of given types

Added particles, e.g. blood when hitting spikes, water splashes, electro buzz, collecting, stomping

Added "midnight" background gradient

Added support for gamepads based on code from my previous JS13k entries [2018 Planet Figadore Has Gone Offline](https://js13kgames.com/entries/planet-figadore-has-gone-offline) and [2021 Airspace Alpha Zulu](https://js13kgames.com/entries/airspace-alpha-zulu)

5th September
-------------
Added state machine so we can transition between intro, playing, new level, e.t.c.

Added "hurt" timer to make player flash (giving temporary invulnerability)

Added font based on [Pixel Square Regular](https://kenney.nl/assets/kenney-fonts) font by Kenney

Created a font PNG based on just A-Z, this is loaded with the other tilemaps. I then wrote a routine to draw the text out using the font tilemap. This was a bit bland so I started on a journey to colourise it

Convert RGB to HSL so that font can be coloured, followed [guide](https://www.rapidtables.com/convert/color/rgb-to-hsl.html), this sort of works for some colours, but not for others. After some digging found a [guide](https://stackoverflow.com/questions/72474574/pass-hex-colors-to-sepia-hue-rotate) which states that because I'm using sepia() to add colour to the font, I need to shift the hue rotation by 50 degrees. This approach seems to give a better result

6th September
-------------
Added level complete check stub. Once I've defined what is required to complete a level, this will transition to the next level

Fixed an issue with an assumption in my timeline library that the optional associated objects would always be set

7th September
-------------
Added cat's eye sprite, to be used in the intro, including a draw routine which does the flipping and draws them the right distance apart

Added global strings array so that text can be rendered easier

Added end of game stub, for when game is complete an animation can be shown
As part of this if the user interacts or the animation ends, it loops back to the intro

Ensure when changing levels that any timelines are stopped and the new level number is a valid one

Start game in intro state and transition to playing after user interaction

8th September
-------------
Updates to intro, made it loop and added animation to reveal cat's eyes, game name and controls

Switch keyboard UIEvent processing from e.which to e.code due to [deprectated api](https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/which)

Made doors functional, pressing down on a locked door when key is held will unlock the door, then pressing down on an unlocked door will transport you to the linked door - delays on door use were also introduced to prevent flicking between doors

Fixed issue when ziplining over a close block the zipline could drop

Fixed issue with jump on AZERTY keyboards

Allow levers to turn on/off electricity, and make all levers be in sync

Added sweeper, who patrols until it sees the player

Allow drone to be removed with electricity

Allow sweeper to fall of edges when chasing player

9th September
-------------
Fix sweeper getting "stuck" overlapping tiles when following player

Water and spikes now harm sweeper

Added cloud parallax

Added stars which add to score when collected

Drone starts off navigating randomly, when player is seen it switches to hunt mode

Drone avoids electricity unless hunting player so that it doesn't self-terminate

Resized tilemap, removing some unused tiles to save a few bytes

Added saving/restoring of progress

10th September
--------------
Noticed using doors can be a bit slow, as it uses timeouts. Changed so that if no input is detected whilst timer is running it skips the wait

Draw numbers using tiles - for showing score

Add to score when enemies removed
