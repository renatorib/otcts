import { Position } from "../structures/Position";
import { BinaryTree } from "./BinaryTree";
import { DataBuffer } from "./DataBuffer";

export abstract class FileStream {
  public data: DataBuffer;
  protected offset: number;

  constructor() {
    this.data = new DataBuffer();
    this.offset = 0;
  }

  getUint8Array(byteOffset?: number): Uint8Array {
    return this.data.getUint8Array(byteOffset);
  }

  getOffsetBuffer(_byteOffset?: number): Buffer {
    return this.data.getBuffer(this.offset);
  }

  getU8(): number {
    const v = this.data.getU8(this.offset);
    this.offset += 1;
    return v;
  }

  getU16(): number {
    const v = this.data.getU16(this.offset);
    this.offset += 2;
    return v;
  }

  getU32(): number {
    const v = this.data.getU32(this.offset);
    this.offset += 4;
    return v;
  }

  getU64(): number {
    const v = this.data.getU32(this.offset) + this.data.getU32(this.offset) * 256 * 256 * 256 * 256;
    this.offset += 8;
    return v;
  }

  get8(): number {
    const v = this.data.get8(this.offset);
    this.offset += 1;
    return v;
  }

  get16(): number {
    const v = this.data.get16(this.offset);
    this.offset += 2;
    return v;
  }

  get32(): number {
    const v = this.data.get32(this.offset);
    this.offset += 4;
    return v;
  }

  getDouble(): number {
    const v = this.data.getDouble(this.offset);
    this.offset += 8;
    return v;
  }

  getString(): string {
    const v = this.data.getString(this.offset);
    this.offset += 2 + v.length;
    return v;
  }

  getPosition(): Position {
    return new Position(this.getU16(), this.getU16(), this.getU8());
  }

  getBytes(bytesCount: number): ArrayBuffer {
    const bytes = this.data.getBytes(this.offset, bytesCount);
    this.offset += bytesCount;
    return bytes;
  }

  getBinaryTree(): BinaryTree {
    const byte = this.getU8();
    if (byte != BinaryTree.BINARYTREE_NODE_START)
      throw new Error("failed to read node start (getBinaryTree): " + byte);

    return new BinaryTree(this);
  }

  peekU8(): number {
    return this.data.getU8(this.offset);
  }

  peekU16(): number {
    return this.data.getU16(this.offset);
  }

  peekU32(): number {
    return this.data.getU32(this.offset);
  }

  skipBytes(bytesCount: number): void {
    if (this.offset + bytesCount > this.data.size) throw new Error("Invalid offset. Cannot read.");

    this.offset += bytesCount;
  }

  skip(bytesCount: number): void {
    this.skipBytes(bytesCount);
  }

  getUnreadSize(): number {
    return this.data.size - this.offset;
  }

  tell(): number {
    return this.offset;
  }

  seek(offset: number): void {
    this.offset = offset;
  }
}
