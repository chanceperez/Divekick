let player_one_score = 0;
let player_two_score = 0;
let winning_player = null;
const ready_msg_seconds = 1;
const fight_msg_seconds = 2;
//const ready_msg_seconds = .25; // DEBUG
//const win_msg_seconds = .25; // DEBUG
//const initial_game_state = "menu";
const initial_game_state = "title";

const canvas = document.createElement("canvas");
const canvas_width = 800;
const canvas_height = 600;
canvas.width = canvas_width;
canvas.height = canvas_height;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

function rect_left(rect) { return rect.x; }
function rect_top(rect) { return rect.y; }
function rect_right(rect) { return rect_left(rect) + rect.w; }
function rect_bottom(rect) { return rect_top(rect) + rect.h; }

function rect_set_left(rect, new_left) { rect.x = new_left; }
function rect_set_top(rect, new_top) { rect.y = new_top; }
function rect_set_right(rect, new_right) { rect.x = new_right - rect.w; }
function rect_set_bottom(rect, new_bottom) { rect.y = new_bottom - rect.h; }
// function set_player_one_color() {
//  player_one.color = characters[player1_char_highlight].color
// }
function rect_intersect(rect1, rect2) {
  if(rect_left(rect2) > rect_right(rect1)) return false;
  if(rect_top(rect2) > rect_bottom(rect1)) return false;
  if(rect_right(rect2) < rect_left(rect1)) return false;
  if(rect_bottom(rect2) < rect_top(rect1)) return false;
  return true;
}

let floor = {
  x: 50,
  y: canvas_height - 20,
  w: canvas_width - 100,
  h: 20,
};

let ring_out_hit_box = {
  x: -1000,
  y: canvas_height - 10,
  w: canvas_width + 1000 + 1000,
  h: 1000,
};

// let left_wall = {
//   x: 0,
//   y: 0,
//   w: 10,
//   h: canvas_height,
// };

// let right_wall = {
//   x: canvas_width - 10,
//   y: 0,
//   w: 10,
//   h: canvas_height,
// };

const left_keyboard = {
  name() { return "left keyboard"; },
  attack() { return keys["KeyS"]; },
  up() { return keys["ArrowUp"]; },
  down() { return keys["ArrowDown"]; },
  right() { return keys["KeyD"]; },
  left() { return keys["KeyA"]; },
  jump() { return keys["Space"] || keys["KeyW"]; },
  start() { return keys["ShiftLeft"]; },
  select_menu_option() { return keys["ShiftLeft"]; },
  frame() {},
  is_connected() { return true; }
};

const right_keyboard = {
  name() { return "right keyboard"; },
  attack() { return keys["ArrowDown"]; },
  up() { return keys["ArrowUp"]; },
  down() { return keys["ArrowDown"]; },
  right() { return keys["ArrowRight"]; },
  left() { return keys["ArrowLeft"]; },
  jump() { return keys["ArrowUp"]; },
  start() { return keys["ShiftRight"]; },
  select_menu_option() { return keys["ShiftRight"]; },
  frame() {},
  is_connected() { return true; }
};

const C_up_d_pad = 12;
const C_down_d_pad = 13;
const C_right_d_pad = 15;
const C_left_d_pad = 14;

class GamePadInput {
  constructor(gamepad_index) {
    this.gamepad_index = gamepad_index;
    this.old_buttons = new Array(16);
    this.buttons = new Array(16);
    this._is_connected = true;
    this._is_responsive = true;
    this.last_timestamp = 0;
    this.timestamp_same_count = 0;
  }

  name() { return `gamepad ${this.gamepad_index}`; }

  is_connected() { return this._is_connected; }
  is_responsive() { return this._is_responsive; } // it's connected, but we're not getting new inputs
  
  frame() {
    this.old_buttons = this.buttons;
    const gamepad = this._get_gamepad();
    
    this._is_connected = !!gamepad;

    if(!gamepad) {
      this.last_timestamp = 0;
      this.timestamp_same_count = 0;
    } else {
      if(this.last_timestamp === gamepad.timestamp) {
        this.timestamp_same_count++;
      } else {
        this.timestamp_same_count = 0;
      }

      this._is_responsive = (this.timestamp_same_count < 20);
      this.last_timestamp = gamepad.timestamp;
    }

    if(!gamepad) {
      this.buttons = new Array(16);
    } else {
      this.buttons = gamepad.buttons.map(o => o.pressed);

      if(!this.buttons[C_up_d_pad]) this.buttons[C_up_d_pad] = gamepad.axes[1] < -0.1;
      if(!this.buttons[C_down_d_pad]) this.buttons[C_down_d_pad] = gamepad.axes[1] > 0.1;
      if(!this.buttons[C_right_d_pad]) this.buttons[C_right_d_pad] = gamepad.axes[0] > 0.1;
      if(!this.buttons[C_left_d_pad]) this.buttons[C_left_d_pad] = gamepad.axes[0] < -0.1;
    }

    //console.log({ gamepad_index: this.gamepad_index, gamepad, timestamp: gamepad && gamepad.timestamp, buttons: this.buttons });
    //console.log(JSON.stringify({ gamepad_index: this.gamepad_index, gamepad, timestamp: gamepad && gamepad.timestamp, buttons: this.buttons }));
  }

  _get_gamepad() {
    const gamepads = navigator.getGamepads();
    return gamepads[this.gamepad_index]; 
  }

  _get_button(i) {
    //const gamepad = this._get_gamepad();
    //if(!gamepad) return false;
    //return gamepad.buttons[i].pressed; 
    if(!this.buttons[i]) return false;
    // POINT: pressed
    return this.old_buttons[i] ? cur_frame_num - 1 : cur_frame_num; // HACK
  }

  attack() { 
    return this._get_button(0);
  }

  up() { 
    return this._get_button(C_up_d_pad);
  }
  down() { 
    return this._get_button(C_down_d_pad);
  }
  right() { 
    return this._get_button(C_right_d_pad); // || gamepad.axes[0] > 0.1; 
  }
  left() { 
    return this._get_button(C_left_d_pad); // || gamepad.axes[0] < -0.1; 
  }
  jump() { 
    return this._get_button(3); // gamepad.axes[0] < -0.1; 
  }
  start() { 
    return this._get_button(9); // gamepad.axes[0] < -0.1; 
  }

  select_menu_option() { return this.attack(); }
}

function is_input_button_pressed(input) {
  return input.jump() || input.start() || input.attack();
}

let player_one = {
  rect: { x: -1, y: -1, w: 60, h: 80 },
  velocity_y: 0,
  velocity_x: 0,
  state: "normal",
  facing: "right",
  color: "#ff9999",

  //controller: left_keyboard,
  //controller: new GamePadInput(0),
  controller: null,
};

let player_two = {
  rect: { x: -1, y: -1, w: 60, h: 80 },
  velocity_y: 0,
  velocity_x: 0,
  state: "normal",
  facing: "right",
  color: "#9999ff",

  //controller: right_keyboard,
  //controller: new GamePadInput(1),
  controller: null,
};

function reset_players() {
  player_two.rect.x = canvas_width - 80 - 60;
  player_two.rect.y = 450;
  player_two.velocity_x = 0;
  player_two.velocity_y = 0;

  player_one.rect.x = 80;
  player_one.rect.y = 450;
  player_one.velocity_x = 0;
  player_one.velocity_y = 0;

  player_one.state = "normal";
  player_two.state = "normal";
}

//reset_players();

let cur_frame_num = 0;
let key_recording = [];
let key_playback = [];
//let key_playback = [{"frame":51,"name":"keydown","code":"KeyD"},{"frame":74,"name":"keydown","code":"Space"},{"frame":80,"name":"keyup","code":"Space"},{"frame":89,"name":"keydown","code":"Enter"},{"frame":99,"name":"keyup","code":"Enter"},{"frame":105,"name":"keyup","code":"KeyD"},{"frame":106,"name":"keydown","code":"KeyA"},{"frame":116,"name":"keydown","code":"Space"},{"frame":125,"name":"keyup","code":"Space"},{"frame":133,"name":"keydown","code":"Enter"},{"frame":142,"name":"keyup","code":"Enter"},{"frame":149,"name":"keyup","code":"KeyA"}];

const keys = {};
let key_events = [];

document.body.addEventListener("keydown", e => {
  if(!keys[e.code]) {
    key_recording.push({ frame: cur_frame_num, name: "keydown", code: e.code });
    // console.log({key_recording});
    key_events.push({ event: "keydown", code: e.code });
    // on_key_down(e.code);
  }
});

document.body.addEventListener("keyup", function(e) {
  key_recording.push({ frame: cur_frame_num, name: "keyup", code: e.code });
  //console.log({key_recording});
  key_events.push({ event: "keyup", code: e.code });
});

function process_keys() {
  for(const key_event of key_events) {
    switch(key_event.event) {
      case "keyup":
        on_key_up(key_event.code);
        break;
      case "keydown":
        on_key_down(key_event.code);
        break;
      default:
        throw new Error(`Unsupportedevent type`);
    }
  }
  key_events = [];
}

function on_key_down(code) {
  console.log(code);
  keys[code] = cur_frame_num;
}

function on_key_up(code) {
  delete keys[code];
}

let game_state;



//let player_one_gamepad_index = null;
//let player_two_gamepad_index = null;

const ps_gamepad_start_key = 9;

const inputs = [
  right_keyboard,
  left_keyboard,
  new GamePadInput(0),
  new GamePadInput(1),
  new GamePadInput(2),
  new GamePadInput(3),
];

function get_joined_input() {
  for(const input of inputs) {
    const pressed_buttons = is_input_button_pressed(input);
    const is_joined_gamepad = (player_one.controller === input) || (player_two.controller === input);
    if(is_joined_gamepad) continue;
    if(pressed_buttons) return input;
  }
  return null;
}

function pause(reason) {
  menu_option_selected = 0;
  is_game_paused = true;
  game_paused_reason = reason;
}

let player1_char_highlight = 0;
let player2_char_highlight = 5;

const characters = [
  { color: "#ff9999" },
  { color: "#9999ff" },
  { color: "#99ff99" },
  { color: "#ffff99" },
  { color: "#ffffff" },
  { color: "#000000" },
];

let did_player_one_select = false;
let did_player_two_select = false;

function character_selection_frame() {
  // background
  ctx.fillStyle = "#000066";
  ctx.fillRect(0, 0, canvas_width, canvas_height);

  function get_character_rect(i) {
    const gap_size = 27
    return { x: 30 + (i * (100 + gap_size)), y:460, w: 100, h: 100 }
  }
  
  // selectable characters
  for(let i = 0; i < characters.length; i++){
    fill_rect(ctx, get_character_rect(i), characters[i].color)
  }
  
  // highlighted characters (big picture)
  const big_player_one_rect = { x: 30, y: 30, w: 300, h: 400 }
  const big_player_two_rect = { x: 30 + 300 + 135, y: 30, w: 300, h: 400 }
  fill_rect(ctx, big_player_one_rect, characters[player1_char_highlight].color)
  if(did_player_one_select) {
    const old_line_width = ctx.lineWidth
    ctx.lineWidth = 10
    stroke_rect(ctx, big_player_one_rect, "black")
    ctx.lineWidth = 5
    stroke_rect(ctx, big_player_one_rect, "white")
    ctx.lineWidth = old_line_width
  }
  fill_rect(ctx, big_player_two_rect, characters[player2_char_highlight].color)
  if(did_player_two_select) {
    const old_line_width = ctx.lineWidth
    ctx.lineWidth = 10
    stroke_rect(ctx, big_player_two_rect, "black")
    ctx.lineWidth = 5
    stroke_rect(ctx, big_player_two_rect, "white")
    ctx.lineWidth = old_line_width
  }

  function draw_character_selection_box(i, style) {
    const old_width = ctx.lineWidth
    
    const rect = get_character_rect(i)

    ctx.lineWidth = 8
    stroke_rect(ctx, rect, "white")

    ctx.lineWidth = 4
    stroke_rect(ctx, rect, style)

    ctx.lineWidth = old_width
  }
  
  if(player_one.controller) draw_character_selection_box(player1_char_highlight, "#990000")
  if(player_two.controller) draw_character_selection_box(player2_char_highlight, "#009900")

  if(player_one.controller) {
    if(!did_player_one_select) {
      if(player_one.controller.right() == cur_frame_num && player1_char_highlight < characters.length - 1) {
        player1_char_highlight++;
      }
      if(player_one.controller.left() == cur_frame_num && player1_char_highlight > 0) {
        player1_char_highlight--;
      }
    }
    if(player_one.controller.start() === cur_frame_num) {
      if(did_player_one_select) {
        if(did_player_two_select) {
          start_fight();
        }
      } else {
        did_player_one_select = true;
        player_one.color = characters[player1_char_highlight].color;
      }
    }
  }
  if(player_two.controller) {
    if(!did_player_two_select) {
      if(player_two.controller.right() == cur_frame_num && player2_char_highlight < characters.length - 1) {
        player2_char_highlight++;
      }
      if(player_two.controller.left() == cur_frame_num && player2_char_highlight > 0) {
        player2_char_highlight--;
      }
    }
    if(player_two.controller.start() === cur_frame_num) {
      if(did_player_two_select) {
        if(did_player_one_select) {
          start_fight();
        }
      } else {
        did_player_two_select = true;
        player_two.color = characters[player2_char_highlight].color;
      }
    }
  }

  ctx.fillStyle = "#ffff00"
  ctx.font = "100px Verdana"
  ctx.fillText("vs", 340, 300)

  // Press enter to start
  // ctx.fillStyle = "black";
  // ctx.font = "20px Verdana";

  // ctx.fillText("Player One: " + (player_one.controller ? `Joined ${player_one.controller.name()}` : "Waiting..."), 100, 100);
  // ctx.fillText("Player Two: " + (player_two.controller ? `Joined ${player_two.controller.name()}` : "Waiting..."), 100, 120);

  // //const gamepads = navigator.getGamepads();

  const joined_input = get_joined_input();
  if(joined_input != null) {
    if(!player_one.controller) {
      player_one.controller = joined_input;
    } else if(!player_two.controller) {
      player_two.controller = joined_input;
    }
  }

  // const both_players_joined = (player_one.controller && player_two.controller);

  // if(both_players_joined) {
  //   ctx.fillText("Press 'Start' to start.", 100, 140);
    
  //   if(
  //     player_one.controller && (player_one.controller.start() === cur_frame_num)
  //     || player_two.controller && (player_two.controller.start() === cur_frame_num)
  //     ) {
  //     player_one_score = 0;
  //     player_two_score = 0;
  //     start_round();
  //   }
  // }
} // function()

function game_frame() {
  cur_frame_num++;
  process_keys();

  for(const input of inputs) {
    input.frame();
    // console.log(JSON.stringify(input));
  }

  switch(game_state) {
    case "title":
      ctx.fillStyle = "#99e50f";
      ctx.fillRect(0, 0, canvas_width, canvas_height);
      ctx.fillStyle = "#000000";
      ctx.font = "50px Verdana";
      ctx.fillText(`DiveBox`, 200, 150);
      ctx.font = "20px Verdana";
      ctx.fillText(`Press Any Button To Start`, 300, 350);
      ctx.fillText(`Left Keyboard: WASD Keys to move | Left Shift to select/start`, 150, 500)
      ctx.fillText(`Right Keyboard: Arrow Keys to move | Right Shift to select/start`, 150, 550)
      ctx.fillText(`Controller Compatible!`, 200, 200)
      const joined_input = get_joined_input(); // using thi
      if(joined_input != null) {
        if(!player_one.controller) {
          player_one.controller = joined_input;
        } else if(!player_two.controller) {
          player_two.controller = joined_input;
        }
      }
    
      if(player_one.controller) game_state = "menu";
      
      break;
    case "menu":
      character_selection_frame()
      break;
    case "fight": 
      game_fight_frame(); 
      break;
    case "won": {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, canvas_width, canvas_height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "20px Verdana";
      ctx.fillText(`${winning_player.toUpperCase()} won (press start to continue)`, 100, 100);

      if((player_one.controller && player_one.controller.start()) || (player_two.controller && player_two.controller.start())) {
        game_state = "menu";
      }

      break;
    }
    default:
      throw `ERROR!`;
  }
}

let round_start_frame;

function start_fight(){
  player_one_score = 0;
  player_two_score = 0;
  start_round();
}
function start_round() {
  is_game_paused = false;
  game_state = "fight";
  is_winning_hit_state = false;
  reset_players();
  round_start_frame = cur_frame_num;
}

let is_winning_hit_state = false;
let is_game_paused = false;
let game_paused_reason = "pause"; // "pause" or "disconnected"

function game_fight_frame() {
  const debug_lines = [];
  const round_elapsed_frames = cur_frame_num - round_start_frame;

  const round_elapsed_seconds = round_elapsed_frames / 30;
  const is_opening_message = (round_elapsed_seconds < fight_msg_seconds);

  //#region `enable_input` (disable for 2 seconds at start and disabled at end of round)
  let is_input_enabled;

  if(is_game_paused) {
    is_input_enabled = false;
  } else {
    if(round_elapsed_seconds <= fight_msg_seconds) { // if displaying ready / fight
      is_input_enabled = false;
    } else {
      if(is_winning_hit_state) {
        is_input_enabled = false;
      } else {
        is_input_enabled = true;
      }
    }
  }
  //#endregion

  // f(keys["KeyR"]) start_round(); // DEBUG: Restarts round

  //#region playback
  if(key_playback) {
    const matches = key_playback.filter(o => o.frame === cur_frame_num);
    if(matches.length > 0) {
      for(const match of matches) {
        // {"frame":51,"name":"keydown","code":"KeyD"}
        switch(match.name) {
          case "keyup":
            on_key_up(match.code);
            break;
          case "keydown":
            on_key_down(match.code);
            break;
          default:
            throw `ERROR!`;
        }
      }
    }
  }
  //#endregion

  //const player = player_one;
  if(is_game_paused) {
    //player_one.up
    if(player_one.controller.up()  == cur_frame_num || player_two.controller.up() == cur_frame_num) {
      menu_option_selected = 0;
    } else if(player_one.controller.down()  == cur_frame_num || player_two.controller.down() == cur_frame_num) {
      menu_option_selected = 1;
    }

    for(const player of [player_one, player_two]) { // process player
      if(
        !is_opening_message
        && player.controller 
        && player.controller.select_menu_option() === cur_frame_num
        ) { // player pressed start
        const selected_menu_option = menu_options[menu_option_selected];
        switch(selected_menu_option) {
          case "Resume":
            is_game_paused = false;
            break;
          case "Main Menu":
            game_state = "menu";
            break;
          default:
            throw new Error('Unsupported menu option');
        }
      }
    }
  } else {
    for(const player of [player_one, player_two]) { // process player
      if(player.controller && player.controller.start() === cur_frame_num && !is_opening_message) { // player pressed start
        pause("paused");
      }
    }
  }

  if(player_one.controller && !player_one.controller.is_connected()) {
    player_one.controller = null;
  }

  if(player_two.controller && !player_two.controller.is_connected()) {
    player_two.controller = null;
  }

  const is_controller_disconnected = !player_one.controller || !player_two.controller;

  if(is_controller_disconnected) {
    const joined_input = get_joined_input();
    if(joined_input != null) {
      if(!player_one.controller) {
        player_one.controller = joined_input;
      } else if(!player_two.controller) {
        player_two.controller = joined_input;
      }
    }
  }

  if(is_controller_disconnected) {
    pause("disconnected");
  } else if(is_game_paused) {
    game_paused_reason = "paused";
  }

  for(const player of [player_one, player_two]) { // process player
    let bottom_sensor = get_player_bottom_sensor(player);
  
    //const is_on_ground = (player.rect.y >= (canvas_height - 80));
    const is_on_ground = rect_intersect(bottom_sensor, floor);

    if(is_input_enabled) {
      if(!is_on_ground && player.controller && player.controller.attack()) {
        player.state = "dive-kick";
        player.velocity_y = 15;

        if(player.facing === 'right') {
          player.velocity_x = 15;
        } else if(player.facing === 'left') {
          player.velocity_x = -15;
        } else {
          throw 'ERROR!';
        }
      }
    }

    if(player.state !== "dive-kick") {
      if(is_input_enabled) {
        if(player.controller && player.controller.right()) {
          player.rect.x += 5; // move right
          player.facing = "right";
        }
        if(player.controller && player.controller.left()) {
          player.rect.x -= 5; // move left
          player.facing = "left";
        }
      }
    }

    if(is_input_enabled) {
      if(is_on_ground && player.controller && player.controller.jump()) player.velocity_y = -20;
    }

    if(!is_game_paused) {
      player.rect.y += player.velocity_y;
      player.rect.x += player.velocity_x;

      // TODO: Check if on ground after we move the player
      if(is_on_ground) {
        // lands
        if(player.state === "dive-kick") {
          player.state = "normal";
          player.velocity_x = 0;
        }
      } else {
        if(player.dive_kick !== "dive-kick") {
          // falling
          player.velocity_y += 1; // gravity
        }
      }

      if(rect_intersect(player.rect, floor)) {
        rect_set_bottom(player.rect, rect_top(floor) - 1);
        player.velocity_y = 0;
      }
    }

    //if(rect_intersect(player.rect, right_wall)) rect_set_right(player.rect, rect_left(right_wall));
    //if(rect_intersect(player.rect, left_wall)) rect_set_left(player.rect, rect_right(left_wall));
  }

  if(!is_winning_hit_state) { // check collisions / hits
    const player1_hurt_box = get_hurt_box(player_one);
    const player1_hit_box = get_hit_box(player_one);
    const player2_hurt_box = get_hurt_box(player_two);
    const player2_hit_box = get_hit_box(player_two);
  
    let next_screen = null;

    const did_player1_hit_player2 = (player1_hit_box && rect_intersect(player1_hit_box, player2_hurt_box));
    const is_player2_ring_out = rect_intersect(player_two.rect, ring_out_hit_box);

    if(did_player1_hit_player2 || is_player2_ring_out) {
      // player 1 hit player 2
      if(did_player1_hit_player2) player_two.state = "down";
      player_one_score++;
      //reset_players();
      is_winning_hit_state = true;
      next_screen = "start_round";
    }

    const did_player2_hit_player1 = (player2_hit_box && rect_intersect(player2_hit_box, player1_hurt_box));
    const is_player1_ring_out = rect_intersect(player_one.rect, ring_out_hit_box);

    if(did_player2_hit_player1 || is_player1_ring_out) {
      // player 1 hit player 2
      if(did_player2_hit_player1) player_one.state = "down";
      player_two_score++;
      //reset_players();
      is_winning_hit_state = true;
      next_screen = "start_round";
    }

    if(player_one_score === 2 || player_two_score === 2) { // check if player won
      if(player_two_score === 2) {
        winning_player = "player 2";
      }

      if(player_one_score === 2) {
        winning_player = "player 1";
      }

      next_screen = "won";
    }

    switch(next_screen) {
      case "start_round":
        setTimeout(() => start_round(), 1000);
        break;
      case "won":
        did_player_one_select = false; // TODO: Move to intro of menu screen instead of here
        did_player_two_select = false;
        setTimeout(() => game_state = "won", 1000);
        break;
      case null:
        // do nothing
        break;
      default:
        throw `ERROR`;
    }
  }

  draw_game_fight_frame(round_elapsed_seconds, debug_lines, player_one, player_two);
}

const menu_options = ["Resume", "Main Menu"];
var menu_option_selected = 0;

function draw_menu(ctx) {
  // draw menu
  ctx.fillStyle = "black";
  ctx.fillRect(10, 10, 100, 100);
  ctx.fillStyle = "white";
  ctx.fillText(" Pause Menu", 20, 30);

  let y = 45;
  for(const menu_option of menu_options) {
    ctx.fillText(` ${menu_option}`, 20, y);
    y += 15;
  }

  if(menu_option_selected === 1) {
    ctx.fillText(">", 15, 60);
  } else {
    ctx.fillText(">", 15, 45);
  }
}

function draw_game_fight_frame(round_elapsed_seconds, debug_lines, player_one, player_two) {
  // background
  ctx.fillStyle = "#eeffff";
  ctx.fillRect(0, 0, canvas_width, canvas_height);

  if(round_elapsed_seconds < ready_msg_seconds) {
    ctx.fillStyle = "red";
    ctx.font = "30px Verdana";
    ctx.fillText("ready?", 100, 100);
  } else if(round_elapsed_seconds < fight_msg_seconds) {
    ctx.fillStyle = "red";
    ctx.font = "30px Verdana";
    ctx.fillText("fight", 100, 100);
  }

  if(is_game_paused) {
    draw_menu(ctx);

    ctx.fillStyle = "blue";
    ctx.font = "30px Verdana";

    let game_pause_message;
    switch(game_paused_reason) {
      case "paused":
        // game_pause_message = "PAUSED";
        game_pause_message = "";
        break;
      case "disconnected":
        game_pause_message = "Player disconnected (reconnect and press button)";
        break;
      default:
        throw `Unknown game pause reason`;
    }

    ctx.fillText(game_pause_message, 100, 100);
  }

  draw_debug_text(debug_lines.join('\n'));

  draw_player(ctx, player_one);
  draw_player(ctx, player_two);

  for(const player of [player_one, player_two]) {
    const hurt_box = get_hurt_box(player);
    stroke_rect(ctx, hurt_box, "#00ff00");

    const hit_box = get_hit_box(player);
    if(hit_box) stroke_rect(ctx, hit_box, "#ff0000");

    const right_sensor = get_right_sensor(player);
    stroke_rect(ctx, right_sensor);

    const left_sensor = get_left_sensor(player);
    stroke_rect(ctx, left_sensor);

    stroke_rect(ctx, get_player_bottom_sensor(player));
  }

  //stroke_rect(ctx, left_wall);
  //stroke_rect(ctx, right_wall);
  //stroke_rect(ctx, floor);
  fill_rect(ctx, floor);

  fill_rect(ctx, ring_out_hit_box, "orange")

  { // draw victory dots
    //player 1
    ctx.fillStyle = "#000000";
    ctx.fillRect(100, 50, 10, 10);
    ctx.fillRect(80, 50, 10, 10);

    if(player_one_score === 1){
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(100, 50, 10, 10);
      ctx.fillStyle = "#000000";
      ctx.fillRect(80, 50, 10, 10);  
    } 

    if(player_one_score === 2){
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(100, 50, 10, 10);
      ctx.fillRect(80, 50, 10, 10);
    }

    //Player 2 
    ctx.fillStyle = "#000000"
    ctx.fillRect(700, 50, 10, 10);
    ctx.fillRect(720, 50, 10, 10);

    if(player_two_score === 1){
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(700, 50, 10, 10);
      ctx.fillStyle = "#000000";
      ctx.fillRect(720, 50, 10, 10);  
    } 
    
    if(player_two_score === 2){
      ctx.fillStyle = "#00ff00";
      ctx.fillRect(700, 50, 10, 10);
      ctx.fillRect(720, 50, 10, 10);
    }
  }

  // if(rect_intersect(player_one.rect, player_two.rect)) {
  //   game_state = "won";
  // }
}

function get_left_sensor(player) {
  return {
    x: rect_left(player.rect) - 1,
    y: rect_top(player.rect),
    w: 10,
    h: player.rect.h,
};
}

function get_right_sensor(player) {
  return {
    x: rect_right(player.rect) - 10 + 1,
    y: rect_top(player.rect),
    w: 10,
    h: player.rect.h,
  };
}

function get_hit_box(player) {
  if(player.state != "dive-kick") return null;

  return {
    x: rect_left(player.rect),
    w: player.rect.w,

    y: rect_top(player.rect) + player.rect.h / 2,
    h: player.rect.h / 2,
  };
}

function get_hurt_box(player) {
  if(player.state === "dive-kick") {
    return {
      x: rect_left(player.rect),
      w: player.rect.w,

      y: rect_top(player.rect) ,
      h: player.rect.h / 2,
    };
  } else {
    return { ... player.rect };
  }
}

function draw_debug_text(text) {
  const lines = text.split('\n');
  ctx.fillStyle = "black";
  let y = 10;
  for(const line of lines) {
    ctx.font = "10px Verdana";
    ctx.fillText(line, 10, y);
    y += 15;
  }
}

function get_player_bottom_sensor(player) {
  return {
    x: rect_left(player.rect),
    y: rect_bottom(player.rect) - 9,
    w: player.rect.w,
    h: 10,
  };
}

function stroke_rect(ctx, rect, style = "gray") {
  ctx.strokeStyle = style;
  ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

function fill_rect(ctx, rect, style = "gray") {
  ctx.fillStyle = style;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}

function draw_player(ctx, player) {
  if(player.state === "down") {
    ctx.fillStyle = "purple";
    ctx.fillRect(player.rect.x - ((player.rect.h - player.rect.w) / 2), player.rect.y + (player.rect.h - player.rect.w), player.rect.h, player.rect.w);
  } else {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.rect.x, player.rect.y, player.rect.w, player.rect.h);
  }
}

function set_game_state(new_state) {
  if(game_state !== new_state) {
    if(new_state === "fight") {
      //player_one.controller = left_keyboard; // TODO: DEBUG: REMOVE
      //player_two.controller = right_keyboard; // TODO: DEBUG: REMOVE
      start_round();
    }

    game_state = new_state;
  }
}

set_game_state(initial_game_state);
setInterval(game_frame, 1000 / 30);

//var gamepads = {};
//window.addEventListener("gamepadconnected",  e => {
//  console.log(e.gamepad);
//  //console.log(`Gamepad connected at index ${e.gamepad.index}: ${e.gamepad.id}. ${e.gamepad.buttons.length} buttons, ${e.gamepad.axes.length} axes.`);
//  //gamepads[e.gamepad.index] = gamepad;
//});
//window.addEventListener("gamepaddisconnected", e => {
//  console.log(e.gamepad);
//  //e.gamepad.index, e.gamepad.id
//  //delete gamepads[e.gamepad.index];
//});