# Dev Diary / Postmortem

This is my ninth game jam entry.

As in my previous years entering the competition, around the time the theme was announced I created a new project template with updated build and minify steps from my entry last year.

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
Looked into [Black Cat on Wikipedia](https://en.wikipedia.org/wiki/Black_cat), to have a think about possible game ideas. I also let me son know the theme soon after annoucement as he is keen to help me on it this year.

Padded out the build environment and dev workflow.

Found a free to use [black cat tilemap](https://opengameart.org/content/cat-sprites) with no attribution, credit [Shepardskin](Shepardskin)

Made background transparent, aligned all the sprites to a 20x16 grid.

Mocked up a quick sprite animation test where the cat runs left and right across the screen.

14th August
-----------
Added movement of character using keyboard as input

Added timeline library for animations

Support for non-60Hz refresh rates

Added second tileset for levels

Levels are now loaded and drawn
