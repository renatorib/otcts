import { FileStream } from "./FileStream";
import { getFetch } from "../common/helpers";

export class FileInput extends FileStream {
  static fromUrl = async (url: string) => {
    const fetch = getFetch();

    try {
      const arrBuffer = await fetch(url).then((r) => r.arrayBuffer());
      return new FileInput(arrBuffer);
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  constructor(buffer: ArrayBuffer) {
    super();
    const msg = new DataView(buffer);
    this.data.buffer = msg;
    this.data.size = msg.byteLength;
    this.data.capacity = msg.byteLength;
  }
}
