import { Color } from "./Color";

export class Pixel {
  static readonly BYTES_PER_PIXEL = 4;

  constructor(
    public r: number, // 0-255
    public g: number, // 0-255
    public b: number, // 0-255
    public a: number // 0-255
  ) {}

  isTransparent() {
    return this.r == 0 && this.g == 0 && this.b == 0 && this.a == 0;
  }

  toRgbaHex(): string {
    const r = this.r.toString(16).padStart(2, "0");
    const g = this.g.toString(16).padStart(2, "0");
    const b = this.b.toString(16).padStart(2, "0");
    const a = this.a.toString(16).padStart(2, "0");

    return `${r}${g}${b}${a}`;
  }

  rgba(): number {
    return this.a | (this.b << 8) | (this.g << 16) | (this.r << 24);
  }

  setR(value: number) {
    this.r = value;
  }

  setG(value: number) {
    this.g = value;
  }

  setB(value: number) {
    this.b = value;
  }

  setA(value: number) {
    this.a = value;
  }

  toColor() {
    return new Color(this.r, this.g, this.b);
  }

  setFromColor(color: Color) {
    this.setR(color.r());
    this.setG(color.g());
    this.setB(color.b());
    this.setA(color.a());
  }
}
