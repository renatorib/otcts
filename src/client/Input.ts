import { EventEmitter } from "./EventEmitter";
import { Direction } from "../core/common/enums";

export enum InputEvent {
  Walk = "walk",
  Turn = "turn",
  Hotkey = "hotkey",
  Command = "command",
}

enum Keys {
  Control = "Control",
  Shift = "Shift",
  Alt = "Alt",
  Space = "Space",
  ArrowRight = "ArrowRight",
  ArrowUp = "ArrowUp",
  ArrowLeft = "ArrowLeft",
  ArrowDown = "ArrowDown",
  Home = "Home",
  PageUp = "PageUp",
  PageDown = "PageDown",
  End = "End",

  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  G = "g",
  R = "r",

  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",
}

type KeyMap = {
  [key: string]: [InputEvent /* emit type */, any /* emit event */];
};

export class Input extends EventEmitter {
  constructor() {
    super();
    this.setup();
  }

  keysPressed = new Set();

  shiftKeyMap: KeyMap = {
    [Keys.F1]: [InputEvent.Hotkey, "shift+f1"],
    [Keys.F2]: [InputEvent.Hotkey, "shift+f2"],
    [Keys.F3]: [InputEvent.Hotkey, "shift+f3"],
    [Keys.F4]: [InputEvent.Hotkey, "shift+f4"],
    [Keys.F5]: [InputEvent.Hotkey, "shift+f5"],
    [Keys.F6]: [InputEvent.Hotkey, "shift+f6"],
    [Keys.F7]: [InputEvent.Hotkey, "shift+f7"],
    [Keys.F8]: [InputEvent.Hotkey, "shift+f8"],
    [Keys.F9]: [InputEvent.Hotkey, "shift+f9"],
    [Keys.F10]: [InputEvent.Hotkey, "shift+f10"],
    [Keys.F11]: [InputEvent.Hotkey, "shift+f11"],
    [Keys.F12]: [InputEvent.Hotkey, "shift+f12"],
  };

  controlKeyMap: KeyMap = {
    [Keys.ArrowLeft]: [InputEvent.Turn, Direction.West],
    [Keys.ArrowRight]: [InputEvent.Turn, Direction.East],
    [Keys.ArrowUp]: [InputEvent.Turn, Direction.North],
    [Keys.ArrowDown]: [InputEvent.Turn, Direction.South],
    [Keys.F1]: [InputEvent.Hotkey, "ctrl+f1"],
    [Keys.F2]: [InputEvent.Hotkey, "ctrl+f2"],
    [Keys.F3]: [InputEvent.Hotkey, "ctrl+f3"],
    [Keys.F4]: [InputEvent.Hotkey, "ctrl+f4"],
    [Keys.F5]: [InputEvent.Hotkey, "ctrl+f5"],
    [Keys.F6]: [InputEvent.Hotkey, "ctrl+f6"],
    [Keys.F7]: [InputEvent.Hotkey, "ctrl+f7"],
    [Keys.F8]: [InputEvent.Hotkey, "ctrl+f8"],
    [Keys.F9]: [InputEvent.Hotkey, "ctrl+f9"],
    [Keys.F10]: [InputEvent.Hotkey, "ctrl+f10"],
    [Keys.F11]: [InputEvent.Hotkey, "ctrl+f11"],
    [Keys.F12]: [InputEvent.Hotkey, "ctrl+f12"],
  };

  keyMap: KeyMap = {
    [Keys.ArrowLeft]: [InputEvent.Walk, Direction.West],
    [Keys.ArrowRight]: [InputEvent.Walk, Direction.East],
    [Keys.ArrowUp]: [InputEvent.Walk, Direction.North],
    [Keys.ArrowDown]: [InputEvent.Walk, Direction.South],
    [Keys.Home]: [InputEvent.Walk, Direction.NorthWest],
    [Keys.End]: [InputEvent.Walk, Direction.SouthWest],
    [Keys.PageUp]: [InputEvent.Walk, Direction.NorthEast],
    [Keys.PageDown]: [InputEvent.Walk, Direction.SouthEast],
    [Keys.F1]: [InputEvent.Hotkey, "f1"],
    [Keys.F2]: [InputEvent.Hotkey, "f2"],
    [Keys.F3]: [InputEvent.Hotkey, "f3"],
    [Keys.F4]: [InputEvent.Hotkey, "f4"],
    [Keys.F5]: [InputEvent.Hotkey, "f5"],
    [Keys.F6]: [InputEvent.Hotkey, "f6"],
    [Keys.F7]: [InputEvent.Hotkey, "f7"],
    [Keys.F8]: [InputEvent.Hotkey, "f8"],
    [Keys.F9]: [InputEvent.Hotkey, "f9"],
    [Keys.F10]: [InputEvent.Hotkey, "f10"],
    [Keys.F11]: [InputEvent.Hotkey, "f11"],
    [Keys.F12]: [InputEvent.Hotkey, "f12"],
    [Keys.A]: [InputEvent.Command, "a"],
    [Keys.B]: [InputEvent.Command, "b"],
    [Keys.C]: [InputEvent.Command, "c"],
    [Keys.D]: [InputEvent.Command, "d"],
    [Keys.E]: [InputEvent.Command, "e"],
    [Keys.F]: [InputEvent.Command, "f"],
    [Keys.G]: [InputEvent.Command, "g"],
    [Keys.R]: [InputEvent.Command, "r"],
  };

  setup() {
    document.addEventListener("keydown", (ev) => {
      this.keysPressed.add(ev.key);
      this.update();
    });
    document.addEventListener("keyup", (ev) => {
      this.keysPressed.delete(ev.key);
    });
  }

  pressing(key: string) {
    return this.keysPressed.has(key);
  }

  update() {
    if (this.pressing(Keys.Control)) {
      for (const key of Object.keys(this.controlKeyMap)) {
        if (this.pressing(key)) {
          this.emit(...this.controlKeyMap[key]);
        }
      }
    } else if (this.pressing(Keys.Shift)) {
      for (const key of Object.keys(this.shiftKeyMap)) {
        if (this.pressing(key)) {
          this.emit(...this.shiftKeyMap[key]);
        }
      }
    } else {
      for (const key of Object.keys(this.keyMap)) {
        if (this.pressing(key)) {
          this.emit(...this.keyMap[key]);
        }
      }
    }
  }
}
