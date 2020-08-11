import { EventEmitter } from "./EventEmitter";

enum Keys {
  Control = 17,
  Shift = 16,
  Alt = 18,
  Space = 32,
  ArrowRight = 39,
  ArrowUp = 38,
  ArrowLeft = 37,
  ArrowDown = 40,
  Home = 36,
  PageUp = 33,
  PageDown = 34,
  End = 35,

  F1 = 112,
  F2 = 113,
  F3 = 114,
  F4 = 115,
  F5 = 116,
  F6 = 117,
  F7 = 118,
  F8 = 119,
  F9 = 120,
  F10 = 121,
  F11 = 122,
  F12 = 123,
}

type KeyMap = {
  [key: number]: [string /* emit type */, string /* emit event */];
};

export class Input extends EventEmitter {
  keysPressed = new Set();

  shiftKeyMap: KeyMap = {
    [Keys.F1]: ["hotkey", "shift+f1"],
    [Keys.F2]: ["hotkey", "shift+f2"],
    [Keys.F3]: ["hotkey", "shift+f3"],
    [Keys.F4]: ["hotkey", "shift+f4"],
    [Keys.F5]: ["hotkey", "shift+f5"],
    [Keys.F6]: ["hotkey", "shift+f6"],
    [Keys.F7]: ["hotkey", "shift+f7"],
    [Keys.F8]: ["hotkey", "shift+f8"],
    [Keys.F9]: ["hotkey", "shift+f9"],
    [Keys.F10]: ["hotkey", "shift+f10"],
    [Keys.F11]: ["hotkey", "shift+f11"],
    [Keys.F12]: ["hotkey", "shift+f12"],
  };

  controlKeyMap: KeyMap = {
    [Keys.ArrowLeft]: ["turn", "w"],
    [Keys.ArrowRight]: ["turn", "e"],
    [Keys.ArrowUp]: ["turn", "n"],
    [Keys.ArrowDown]: ["turn", "s"],
    [Keys.F1]: ["hotkey", "ctrl+f1"],
    [Keys.F2]: ["hotkey", "ctrl+f2"],
    [Keys.F3]: ["hotkey", "ctrl+f3"],
    [Keys.F4]: ["hotkey", "ctrl+f4"],
    [Keys.F5]: ["hotkey", "ctrl+f5"],
    [Keys.F6]: ["hotkey", "ctrl+f6"],
    [Keys.F7]: ["hotkey", "ctrl+f7"],
    [Keys.F8]: ["hotkey", "ctrl+f8"],
    [Keys.F9]: ["hotkey", "ctrl+f9"],
    [Keys.F10]: ["hotkey", "ctrl+f10"],
    [Keys.F11]: ["hotkey", "ctrl+f11"],
    [Keys.F12]: ["hotkey", "ctrl+f12"],
  };

  keyMap: KeyMap = {
    [Keys.ArrowLeft]: ["walk", "w"],
    [Keys.ArrowRight]: ["walk", "e"],
    [Keys.ArrowUp]: ["walk", "n"],
    [Keys.ArrowDown]: ["walk", "s"],
    [Keys.Home]: ["walk", "nw"],
    [Keys.End]: ["walk", "sw"],
    [Keys.PageUp]: ["walk", "ne"],
    [Keys.PageDown]: ["walk", "se"],
    [Keys.F1]: ["hotkey", "f1"],
    [Keys.F2]: ["hotkey", "f2"],
    [Keys.F3]: ["hotkey", "f3"],
    [Keys.F4]: ["hotkey", "f4"],
    [Keys.F5]: ["hotkey", "f5"],
    [Keys.F6]: ["hotkey", "f6"],
    [Keys.F7]: ["hotkey", "f7"],
    [Keys.F8]: ["hotkey", "f8"],
    [Keys.F9]: ["hotkey", "f9"],
    [Keys.F10]: ["hotkey", "f10"],
    [Keys.F11]: ["hotkey", "f11"],
    [Keys.F12]: ["hotkey", "f12"],
  };

  setup() {
    document.addEventListener("keydown", (ev) => {
      this.keysPressed.add(ev.which);
    });
    document.addEventListener("keyup", (ev) => {
      this.keysPressed.delete(ev.which);
    });
  }

  pressing(key: number) {
    return this.keysPressed.has(key);
  }

  update() {
    if (this.pressing(Keys.Control)) {
      for (const key of Object.keys(this.controlKeyMap)) {
        const keyCode = parseInt(key, 10);
        if (this.pressing(parseInt(key, 10))) {
          this.emit(...this.controlKeyMap[keyCode]);
        }
      }
    } else if (this.pressing(Keys.Shift)) {
      for (const key of Object.keys(this.shiftKeyMap)) {
        const keyCode = parseInt(key, 10);
        if (this.pressing(parseInt(key, 10))) {
          this.emit(...this.shiftKeyMap[keyCode]);
        }
      }
    } else {
      for (const key of Object.keys(this.keyMap)) {
        const keyCode = parseInt(key, 10);
        if (this.pressing(parseInt(key, 10))) {
          this.emit(...this.keyMap[keyCode]);
        }
      }
    }
  }
}
