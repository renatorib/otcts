import { FileStream } from "./FileStream";

export class FileOutput extends FileStream {
  constructor() {
    super();
  }

  addU8(value: number) {
    this.offset += this.data.addU8(value);
  }

  addU16(value: number) {
    this.offset += this.data.addU16(value);
  }

  addU32(value: number) {
    this.offset += this.data.addU32(value);
  }

  addString(value: string) {
    this.offset += this.data.addString(value);
  }

  add8(value: number) {
    this.offset += this.data.add8(value);
  }

  add16(value: number) {
    this.offset += this.data.add16(value);
  }

  add32(value: number) {
    this.offset += this.data.add32(value);
  }

  setU8(offset: number, value: number) {
    this.data.setU8(offset, value);
  }

  setU32(offset: number, value: number) {
    this.data.setU32(offset, value);
  }
}
