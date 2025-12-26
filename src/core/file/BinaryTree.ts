import { DataBuffer } from "./DataBuffer";
import { FileStream } from "./FileStream";

export class BinaryTree {
  static BINARYTREE_ESCAPE_CHAR = 0xfd;
  static BINARYTREE_NODE_START = 0xfe;
  static BINARYTREE_NODE_END = 0xff;

  buffer: DataBuffer;
  pos = 0xffffffff;
  startPos = 0;

  constructor(protected fis: FileStream) {
    this.buffer = new DataBuffer();
    this.startPos = this.fis.tell();
  }

  skipNodes() {
    while (true) {
      const byte = this.fis.getU8();
      switch (byte) {
        case BinaryTree.BINARYTREE_NODE_START: {
          this.skipNodes();
          break;
        }
        case BinaryTree.BINARYTREE_NODE_END:
          return;
        case BinaryTree.BINARYTREE_ESCAPE_CHAR:
          this.fis.getU8();
          break;
        default:
          break;
      }
    }
  }

  unserialize() {
    if (this.pos != 0xffffffff) return;
    this.pos = 0;

    this.fis.seek(this.startPos);
    while (true) {
      let byte = this.fis.getU8();
      switch (byte) {
        case BinaryTree.BINARYTREE_NODE_START: {
          this.skipNodes();
          break;
        }
        case BinaryTree.BINARYTREE_NODE_END:
          this.pos = 0;
          // console.log(this.buffer);
          return;
        case BinaryTree.BINARYTREE_ESCAPE_CHAR:
          this.buffer.addU8(this.fis.getU8());
          break;
        default:
          this.buffer.addU8(byte);
          break;
      }
    }
  }

  getChildren() {
    let children: BinaryTree[] = [];
    this.fis.seek(this.startPos);
    while (true) {
      let byte = this.fis.getU8();
      switch (byte) {
        case BinaryTree.BINARYTREE_NODE_START: {
          let node = new BinaryTree(this.fis);
          children.push(node);
          node.skipNodes();
          break;
        }
        case BinaryTree.BINARYTREE_NODE_END:
          return children;
        case BinaryTree.BINARYTREE_ESCAPE_CHAR:
          this.fis.getU8();
          break;
        default:
          break;
      }
    }
  }

  seek(pos: number) {
    this.unserialize();
    if (pos > this.buffer.size) throw new Error("BinaryTree: seek failed");
    this.pos = pos;
  }

  tell() {
    return this.pos;
  }

  skip(len: number) {
    this.unserialize();
    this.seek(this.tell() + len);
  }

  getU8() {
    this.unserialize();
    if (this.pos + 1 > this.buffer.size) throw new Error("BinaryTree: getU8 failed");
    let v = this.buffer.getU8(this.pos);
    this.pos += 1;
    return v;
  }

  getU16() {
    return this.getU8() + this.getU8() * 256;
  }

  getU32() {
    return this.getU16() + this.getU16() * 256 * 256;
  }

  getU64() {
    return this.getU32() + this.getU32() * 256 * 256 * 256 * 256;
  }

  getString(len?: number) {
    this.unserialize();
    if (len == 0 || !len) len = this.getU16();

    if (this.pos + len > this.buffer.size)
      throw new Error("BinaryTree: getString failed: string length exceeded buffer size.");

    let text = "";
    for (let i = 0; i < len; i++) {
      text += String.fromCharCode(this.getU8());
    }
    return text;
  }

  getString8() {
    return this.getString(this.getU8());
  }

  getString16() {
    return this.getString(this.getU16());
  }

  getString32() {
    return this.getString(this.getU32());
  }

  canRead() {
    this.unserialize();
    return this.pos < this.buffer.size;
  }
}
