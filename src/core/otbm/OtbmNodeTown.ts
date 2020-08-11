import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";

/*
.
└── Town
*/
export class OtbmNodeTown extends OtbmNode {
  type!: OtbmNodeTypes.Town;
  townId!: number;
  name!: string;
  x!: number;
  y!: number;
  z!: number;

  init() {
    this.type = OtbmNodeTypes.Town;
  }

  read(tree: BinaryTree) {
    this.townId = tree.getU32();
    this.name = tree.getString16();
    this.x = tree.getU16();
    this.y = tree.getU16();
    this.z = tree.getU8();
  }
}
