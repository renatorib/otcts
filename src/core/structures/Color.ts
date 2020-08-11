enum BlendModes {
  Multiply = 2,
}

const blendModeFormula = {
  [BlendModes.Multiply]: (a: number, b: number) => a * b,
};

export class Color {
  public static readonly alpha = 0x00000000;
  public static readonly white = 0xffffffff;
  public static readonly red = 0xff0000ff;
  public static readonly green = 0xff00ff00;
  public static readonly blue = 0xffff0000;
  public static readonly yellow = 0xff00ffff;

  _r: number = 1; // 0-1
  _g: number = 1; // 0-1
  _b: number = 1; // 0-1
  _a: number = 1; // 0-1

  // Color() : r(1.0f), g(1.0f), b(1.0f), a(1.0f) { }
  //Color(uint32 rgba) { setRGBA(rgba); }
  constructor(...args: any[]) {
    if (args.length == 0) {
      this._r = 1;
      this._g = 1;
      this._b = 1;
      this._a = 1;
      return;
    } else if (args.length == 1) {
      if (typeof args[0] == "number") {
        this.setRGBA(args[0]);
        return;
      }
    } else if (args.length == 3) {
      if (
        typeof args[0] == "number" &&
        typeof args[1] == "number" &&
        typeof args[2] == "number"
      ) {
        let r = args[0] / 255;
        let g = args[1] / 255;
        let b = args[2] / 255;
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = 1;
        return;
      }
    }
    throw new Error("Unhandled constructor");
  }

  equals(color: Color): boolean {
    return (
      this.r() == color.r() &&
      this.g() == color.g() &&
      this.b() == color.b() &&
      this.a() == color.a()
    );
  }

  clone(): Color {
    let color = new Color();
    color._r = this._r;
    color._g = this._g;
    color._b = this._b;
    color._a = this._a;
    return color;
  }

  a(): number {
    return this._a * 255.0;
  }

  b(): number {
    return this._b * 255.0;
  }

  g(): number {
    return this._g * 255.0;
  }

  r(): number {
    return this._r * 255.0;
  }

  aF(): number {
    return this._a;
  }

  bF(): number {
    return this._b;
  }

  gF(): number {
    return this._g;
  }

  rF(): number {
    return this._r;
  }

  rgba(): number {
    return this.a() | (this.b() << 8) | (this.g() << 16) | (this.r() << 24);
  }

  applyBlend(target: Color, blendMode: BlendModes) {
    const formula = blendModeFormula[blendMode];
    const r = formula(this.rF(), target.rF());
    const g = formula(this.gF(), target.gF());
    const b = formula(this.bF(), target.bF());
    this.setRGBA(r * 255.0, g * 255.0, b * 255.0);
    return this;
  }

  multiply(target: Color) {
    return this.applyBlend(target, BlendModes.Multiply);
  }

  setRGBA(r: number, g: number = -1, b: number = -1, a: number = 255) {
    if (g == -1) {
      // r is rgba
      let rgba = r;
      this.setRGBA(
        (rgba >> 0) & 0xff,
        (rgba >> 8) & 0xff,
        (rgba >> 16) & 0xff,
        (rgba >> 24) & 0xff
      );
    } else {
      this._r = r / 255;
      this._g = g / 255;
      this._b = b / 255;
      this._a = a / 255;
    }
  }

  static from8bit(color: number): any {
    if (color >= 216 || color <= 0) return new Color(0, 0, 0);

    let r = (parseInt((color / 36).toString()) % 6) * 51;
    let g = (parseInt((color / 6).toString()) % 6) * 51;
    let b = (color % 6) * 51;
    return new Color(r, g, b);
  }
}
