import { Position } from "../structures/Position";
import { Pixel } from "../structures/Pixel";

export class DataBuffer {
  public size: number = 0;
  public buffer: DataView;

  constructor(public capacity: number = 64) {
    this.buffer = new DataView(new ArrayBuffer(this.capacity));
  }

  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer.buffer, 0, this.size);
  }

  reserve(newSize: number) {
    if (newSize > this.capacity) {
      let buffer = new DataView(new ArrayBuffer(newSize));
      for (let i = 0; i < this.size; ++i) {
        buffer.setUint8(i, this.buffer.getUint8(i));
      }

      this.buffer = buffer;
      this.capacity = newSize;
    }
  }

  grow(newSize: number) {
    if (newSize <= this.size) {
      return;
    }
    if (newSize > this.capacity) {
      let newcapacity = this.capacity;
      do {
        newcapacity *= 2;
      } while (newcapacity < newSize);
      this.reserve(newcapacity);
    }
    this.size = newSize;
  }

  addU8(value: number) {
    this.grow(this.size + 1);
    this.buffer.setUint8(this.size - 1, value);
    return 1;
  }

  addU16(value: number) {
    this.grow(this.size + 2);
    this.buffer.setUint16(this.size - 2, value, true);
    return 2;
  }

  addU32(value: number) {
    this.grow(this.size + 4);
    this.buffer.setUint32(this.size - 4, value, true);
    return 4;
  }

  add8(value: number) {
    this.grow(this.size + 1);
    this.buffer.setInt8(this.size - 1, value);
    return 1;
  }

  add16(value: number) {
    this.grow(this.size + 2);
    this.buffer.setInt16(this.size - 2, value, true);
    return 2;
  }

  add32(value: number) {
    this.grow(this.size + 4);
    this.buffer.setInt32(this.size - 4, value, true);
    return 4;
  }

  addString(value: string) {
    this.grow(this.size + 2 + value.length);
    this.buffer.setUint16(this.size - 2 - value.length, value.length, true);
    for (let i = 0; i < value.length; i++) {
      this.buffer.setUint8(this.size - value.length + i, value.charCodeAt(i));
    }
    return 2 + value.length;
  }

  addPixel(pixel: Pixel, bytesPerPixel: number) {
    if (bytesPerPixel == 4) {
      this.grow(this.size + 4);
      this.buffer.setUint8(this.size - 4, pixel.r);
      this.buffer.setUint8(this.size - 3, pixel.g);
      this.buffer.setUint8(this.size - 2, pixel.b);
      this.buffer.setUint8(this.size - 1, pixel.a);
      return 4;
    } else {
      this.grow(this.size + 3);
      this.buffer.setUint8(this.size - 3, pixel.r);
      this.buffer.setUint8(this.size - 2, pixel.g);
      this.buffer.setUint8(this.size - 1, pixel.b);
      return 3;
    }
  }

  setU8(offset: number, value: number) {
    this.grow(offset + 1);
    this.buffer.setUint8(offset, value);
  }

  setU32(offset: number, value: number) {
    this.grow(offset + 4);
    this.buffer.setInt32(offset - 4, value, true);
  }

  setRgbaPixel(offset: number, pixel: Pixel) {
    offset = offset * 4;
    this.setU8(offset, pixel.r);
    this.setU8(offset + 1, pixel.g);
    this.setU8(offset + 2, pixel.b);
    this.setU8(offset + 3, pixel.a);
  }

  getU8(offset: number) {
    if (offset + 1 > this.size) throw new Error("DataBuffer: getU8 failed");

    return this.buffer.getUint8(offset);
  }

  getU16(offset: number) {
    if (offset + 2 > this.size) throw new Error("DataBuffer: getU16 failed");

    return this.buffer.getUint16(offset, true);
  }

  getU32(offset: number) {
    if (offset + 4 > this.size) throw new Error("DataBuffer: getU32 failed");

    return this.buffer.getUint32(offset, true);
  }

  get8(offset: number) {
    if (offset + 1 > this.size) throw new Error("DataBuffer: get8 failed");

    return this.buffer.getInt8(offset);
  }

  get16(offset: number) {
    if (offset + 2 > this.size) throw new Error("DataBuffer: get16 failed");

    return this.buffer.getInt16(offset, true);
  }

  get32(offset: number) {
    if (offset + 4 > this.size) throw new Error("DataBuffer: get32 failed");

    return this.buffer.getInt32(offset, true);
  }

  getDouble(offset: number) {
    if (offset + 8 > this.size) throw new Error("DataBuffer: getDouble failed");

    return this.buffer.getFloat64(offset, true);
  }

  getString(offset: number): string {
    const length = this.getU16(offset);
    let text = "";
    for (let i = 0; i < length; i++) {
      text += String.fromCharCode(this.getU8(offset + 2 + i));
    }
    return text;
  }

  getBytes(offset: number, bytesCount: number): ArrayBuffer {
    if (bytesCount == -1) bytesCount = this.size - offset;

    if (offset + bytesCount > this.size)
      throw new Error("Invalid offset. Cannot read.");

    return this.buffer.buffer.slice(offset, offset + bytesCount);
  }

  getPosition(offset: number): Position {
    if (offset + 5 > this.size)
      throw new Error("DataBuffer: getPosition failed");

    return new Position(
      this.getU16(offset),
      this.getU16(offset + 2),
      this.getU8(offset + 4)
    );
  }

  getRgbaPixel(offset: number): Pixel {
    offset = offset * 4;
    if (offset + 4 > this.size)
      throw new Error("DataBuffer: getRgbaPixel failed");

    return new Pixel(
      this.getU8(offset),
      this.getU8(offset + 1),
      this.getU8(offset + 2),
      this.getU8(offset + 3)
    );
  }

  reserveRgbaPixel(offset: number) {
    this.grow(offset * 4 + 4);
  }

  clear() {
    this.size = 0;
    this.capacity = 64;
    this.buffer = new DataView(new ArrayBuffer(this.capacity));
  }
}
