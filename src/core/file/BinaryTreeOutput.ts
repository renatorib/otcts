import { BinaryTree } from "./BinaryTree";
import { FileOutput } from "./FileOutput";
import { Point } from "../structures/Point";

/**
 * In BinaryTreeOutput we got to add BINARYTREE_ESCAPE_CHAR before every special character.
 * We also need to operate on bytes of numbers, so code is a bit dirty.
 */
export class BinaryTreeOutput extends BinaryTree {
  static BINARYTREE_ESCAPE_CHAR = 0xfd;
  static BINARYTREE_NODE_START = 0xfe;
  static BINARYTREE_NODE_END = 0xff;

  pos = 0xffffffff;
  startPos = 0;

  constructor(protected fout: FileOutput) {
    super(fout);
    this.startNode(0);
  }

  addU8(value: number) {
    value = value % 256;

    if (
      value == BinaryTree.BINARYTREE_NODE_START ||
      value === BinaryTree.BINARYTREE_NODE_END ||
      value === BinaryTree.BINARYTREE_ESCAPE_CHAR
    ) {
      this.fout.addU8(BinaryTree.BINARYTREE_ESCAPE_CHAR);
    }

    this.fout.addU8(value);
  }

  addU16(value: number) {
    value = value % 65536;
    const b2 = Math.floor(value / 256);
    value -= b2 * 256;
    const b1 = value;

    this.addU8(b1);
    this.addU8(b2);
  }

  addU32(value: number) {
    value = value % 4294967296;
    const b4 = Math.floor(value / 16777216);
    value -= b4 * 16777216;
    const b3 = Math.floor(value / 65536);
    value -= b3 * 65536;
    const b2 = Math.floor(value / 256);
    value -= b2 * 256;
    const b1 = value;

    this.addU8(b1);
    this.addU8(b2);
    this.addU8(b3);
    this.addU8(b4);
  }

  addString(value: string, length: number = -1) {
    if (length === -1) {
      this.addU16(value.length);
      length = value.length;
    }
    for (let i = 0; i < length; i++) {
      this.addU8(value.charCodeAt(i));
    }
  }

  addPos(x: number, y: number, z: number) {
    this.addU16(x);
    this.addU16(y);
    this.addU8(z);
  }

  addPoint(point: Point) {
    this.addU8(point.x);
    this.addU8(point.y);
  }

  startNode(node: number) {
    this.fout.addU8(BinaryTree.BINARYTREE_NODE_START);
    if (node !== -1) {
      this.addU8(node);
    }
  }

  endNode() {
    this.fout.addU8(BinaryTree.BINARYTREE_NODE_END);
  }
}
