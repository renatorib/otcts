import { Color } from "../structures/Color";
import { Size } from "../structures/Size";
import { Point } from "../structures/Point";
import { Client } from "../structures/Client";
import { Pixel } from "../structures/Pixel";
import { FileInput } from "../file/FileInput";
import { FileOutput } from "../file/FileOutput";
import { DataBuffer } from "../file/DataBuffer";
import { GameFeature } from "../common/enums";
import { SprManager } from "./SprManager";

const toInt = (unknown: unknown) => parseInt(String(unknown), 10);

export class Sprite {
  size: Size;
  pixels: DataBuffer;

  constructor(size: Size, pixels?: DataBuffer) {
    this.size = size;

    if (pixels) {
      this.pixels = pixels;
    } else {
      this.pixels = new DataBuffer();
      this.pixels.reserve(size.area() * 4);
    }
  }

  blit(dest: Point, other: Sprite) {
    let otherPixels = other.getPixels();
    for (let p = 0; p < other.getPixelsCount(); ++p) {
      let x = toInt(p % other.getWidth());
      let y = toInt(p / other.getWidth());
      let pos = (dest.y + y) * toInt(this.size.width()) + (dest.x + x);

      const otherPixel = otherPixels.getRgbaPixel(p);
      if (otherPixel.a != 0) {
        this.pixels.setRgbaPixel(pos, otherPixel);
      } else {
        this.pixels.reserveRgbaPixel(pos);
      }
    }
  }

  colorize(template: Sprite, redMask: Color, greenMask: Color, blueMask: Color, yellowMask: Color) {
    const templatePixels = template.getPixels();
    const pixels = this.getPixels();
    for (let p = 0; p < template.getPixelsCount(); ++p) {
      const pixelTpl = templatePixels.getRgbaPixel(p);
      const pixel = pixels.getRgbaPixel(p);

      const x = toInt(p % template.getWidth());
      const y = toInt(p / template.getWidth());
      const pos = y * toInt(this.size.width()) + x;

      if (pixelTpl.toRgbaHex() === "ff0000ff") {
        pixel.setFromColor(pixel.toColor().multiply(redMask));
      } else if (pixelTpl.toRgbaHex() === "00ff00ff") {
        pixel.setFromColor(pixel.toColor().multiply(greenMask));
      } else if (pixelTpl.toRgbaHex() === "0000ffff") {
        pixel.setFromColor(pixel.toColor().multiply(blueMask));
      } else if (pixelTpl.toRgbaHex() === "ffff00ff") {
        pixel.setFromColor(pixel.toColor().multiply(yellowMask));
      }

      if (pixel.a != 0) {
        this.pixels.setRgbaPixel(pos, pixel);
      } else {
        this.pixels.reserveRgbaPixel(pos);
      }
    }
  }

  overwriteMask(
    color: number,
    insideColor: number = Color.white,
    outsideColor: number = Color.alpha,
  ) {}

  getWidth() {
    return this.size.width();
  }

  getHeight() {
    return this.size.height();
  }

  getPixel(x: number, y: number): Pixel {
    return this.pixels.getRgbaPixel(y * this.size.width() + x);
  }

  getPixelsCount(): number {
    return this.size.area();
  }

  getPixels() {
    return this.pixels;
  }

  getUint8Array() {
    return new Uint8Array(this.getPixels().buffer.buffer);
  }

  getUint8ClampedArray() {
    const buffer = this.getPixels().buffer.buffer;
    // DataView.buffer is ArrayBufferLike but we need ArrayBuffer for Uint8ClampedArray
    // In practice, it's always ArrayBuffer in this context
    return new Uint8ClampedArray(buffer as ArrayBuffer);
  }

  getImageData(): ImageData {
    return new ImageData(this.getUint8ClampedArray(), this.getWidth(), this.getHeight());
  }

  readFromSpr(fin: FileInput, client: Client) {
    this.pixels.clear();

    // skip color key
    fin.getU8();
    fin.getU8();
    fin.getU8();

    const pixelDataSize = fin.getU16();

    let writePos = 0;
    let read = 0;
    const useAlpha = client.getFeature(GameFeature.GameSpritesAlphaChannel);
    const channels = useAlpha ? 4 : 3;

    // decompress pixels
    while (read < pixelDataSize && writePos < SprManager.SPRITE_DATA_SIZE) {
      const transparentPixels = fin.getU16();
      const coloredPixels = fin.getU16();

      for (let i = 0; i < transparentPixels && writePos < SprManager.SPRITE_DATA_SIZE; i++) {
        this.pixels.addU8(0x00);
        this.pixels.addU8(0x00);
        this.pixels.addU8(0x00);
        this.pixels.addU8(0x00);
        writePos += 4;
      }

      for (let i = 0; i < coloredPixels && writePos < SprManager.SPRITE_DATA_SIZE; i++) {
        this.pixels.addU8(fin.getU8());
        this.pixels.addU8(fin.getU8());
        this.pixels.addU8(fin.getU8());
        this.pixels.addU8(useAlpha ? fin.getU8() : 0xff);
        writePos += 4;
      }

      read += 4 + channels * coloredPixels;
    }

    // fill remaining pixels with alpha
    while (writePos < SprManager.SPRITE_DATA_SIZE) {
      this.pixels.addU8(0x00);
      this.pixels.addU8(0x00);
      this.pixels.addU8(0x00);
      this.pixels.addU8(0x00);
      writePos += 4;
    }
  }

  writeToSpr(fout: FileOutput, client: Client) {
    fout.addU8(255);
    fout.addU8(0);
    fout.addU8(255);

    const pixelsSprData = this.getSprData(client);
    fout.addU16(pixelsSprData.size);
    for (let i = 0; i < pixelsSprData.size; i++) {
      fout.addU8(pixelsSprData.getU8(i));
    }
  }

  getSprData(client: Client) {
    const pixelsSprData = new DataBuffer();

    const useAlpha = client.getFeature(GameFeature.GameSpritesAlphaChannel);
    const bytesPerPixel = useAlpha ? 4 : 3;

    let read = 0;
    let pixel = this.pixels.getRgbaPixel(read++);
    while (read < this.getPixelsCount()) {
      let transparentPixels = 0;
      const coloredPixels: Pixel[] = [];

      while (pixel.isTransparent()) {
        transparentPixels++;
        if (read == this.getPixelsCount()) break;
        pixel = this.pixels.getRgbaPixel(read++);
      }

      while (!pixel.isTransparent()) {
        coloredPixels.push(pixel);
        if (read == this.getPixelsCount()) break;
        pixel = this.pixels.getRgbaPixel(read++);
      }

      pixelsSprData.addU16(transparentPixels);
      pixelsSprData.addU16(coloredPixels.length);

      for (const coloredPixel of coloredPixels) {
        pixelsSprData.addPixel(coloredPixel, bytesPerPixel);
      }
    }

    return pixelsSprData;
  }
}
