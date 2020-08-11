import { Point } from "./Point";

export class Size {
  constructor(public wd = -1, public ht = -1) {}

  equals(size: Size) {
    return this.wd == size.wd && this.ht == size.ht;
  }

  clone() {
    return new Size(this.wd, this.ht);
  }

  add(size: Size) {
    return new Size(this.wd + size.wd, this.ht + size.ht);
  }

  sub(size: Size) {
    return new Size(this.wd - size.wd, this.ht - size.ht);
  }

  mul(ratio: number) {
    return new Size(this.wd * ratio, this.ht * ratio);
  }

  isNull() {
    return this.wd == 0 && this.ht == 0;
  }

  isEmpty() {
    return this.wd < 1 || this.ht < 1;
  }

  isValid() {
    return this.wd >= 0 && this.ht >= 0;
  }

  width() {
    return this.wd;
  }

  height() {
    return this.ht;
  }

  resize(w: number, h: number) {
    this.wd = w;
    this.ht = h;
  }

  setWidth(w: number) {
    this.wd = w;
  }

  setHeight(h: number) {
    this.ht = h;
  }

  ratio() {
    return this.wd / this.ht;
  }

  area() {
    return this.wd * this.ht;
  }

  toPoint() {
    return new Point(this.wd, this.ht);
  }
}
