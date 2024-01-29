[ ] GOAL: Good enough for game night

[ ]FIX: add "draw" or "tie" state for when both characters win

[ ] turn off showing hitboxes
[ ] fight screen show player name and energy bars
[x] title screen
[ ] character selection screen
- [x] change the character selection outline boxes so that they are controlled with variables
- [x] display the correct color in the "selected character" section
- [ ] make it clear when both players select the same character (better to just prevent them from selecting the same character)
- [ ] LATER: (LOW) uncommit from character
[x] IDEA: player selection
[ ] IDEA: add menu option "show moves", and it's always the same move, and displays special move, but it's "nothing" (or some other useless value depending on the select character)
[x] add support for thumbpads (not just d-pad)

[x] draw 2 chars
[x] animation
[x] keyboard input
[x] move - with keyboard
[x] add second player
[x] fix issue with overlapping player with floor on initial fall
[x] hurt
- [x] hit boxes

[x] start on opposite side of screen
[x] after hit reset

[x] "menu" screen - just start option
[x] ready, fight
[x] track win 2 rounds to win

[x] after hit extra time and slow down (so you can see the hit)

[x] add pause

[x] controller input
- [x] player join
-- [x] play 1 join
-- [x] play 2 join
- [x] press start
- [x] control player
- [x] show controller name on join screen
- [x] assign controller interface to player based on join (including keyboard)
- [x] pause on disconnect (gamepad index would be null)
-- [x] pause
--- [x] stop physics
--- [x] stop playing input
-- [x] disconnect pause
-- [x] display message when paused
-- [x] display message that controller is disconnected
- [x] re-connect with any controller
-- [x] we will check if button pressed on any 'free' controller
- [x] in game menu / pause menu
-- [x] we have to display menu options
--- [x] select menu options (up down)
--- [x] take menu action (press any action button)
--- [x] should only display when game is paused
--- [x] stop using `keys`
- --- [x] menu should work with controllers (maybe using attack option in controller) (add .select_menu_option)

# DESIGN
- [ ] (DESIGN) winning quotes

# START: art assets
[ ] art assets
- player assets animation
- - [x] hit animation - sideways
- - [x] player state
- ready / fight text
-- [x] make text bigger
-- [ ] center text
- sprites
-- menu screen
-- background
-- characters
-- screen
-- player picture in HUD
-- player energy bar
-- win count
[ ] special effects
[ ] sound
# END: art assets

[x] IDEA: ring out

IDEA: wall jump