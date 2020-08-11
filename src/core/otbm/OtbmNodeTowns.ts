import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeTown } from "./OtbmNodeTown";

/*
.
└── Towns
    └── Town
*/
export class OtbmNodeTowns extends OtbmNode {
  type!: OtbmNodeTypes.Towns;
  towns!: OtbmNodeTown[];

  init() {
    this.type = OtbmNodeTypes.Towns;
    this.towns = [];
  }

  read(tree: BinaryTree) {
    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.Town: {
          this.towns.push(new OtbmNodeTown(child));
          break;
        }
        default: {
          this.unsupportedChildType(type);
          break;
        }
      }
    }
  }
}
