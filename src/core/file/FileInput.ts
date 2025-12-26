import { FileStream } from "./FileStream";

function toArrayBuffer(buf: Buffer) {
  const ab = new ArrayBuffer(buf.length);
  const view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

export class FileInput extends FileStream {
  static fromUrl = async (url: string) => {
    try {
      const arrBuffer = await fetch(url).then((r) => r.arrayBuffer());
      return new FileInput(arrBuffer);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  static fromBuffer = (buf: Buffer) => {
    return new FileInput(toArrayBuffer(buf));
  };

  constructor(buffer: ArrayBuffer) {
    super();
    const msg = new DataView(buffer);
    this.data.buffer = msg;
    this.data.size = msg.byteLength;
    this.data.capacity = msg.byteLength;
  }
}
