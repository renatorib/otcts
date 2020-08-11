import { OtbmNodeTypes } from "../common/enums";
import { OtbmTileFlags } from "../common/types";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeItem } from "./OtbmNodeItem";

/*
.
└── House
    └── Item
*/
export class OtbmNodeHouseTile extends OtbmNode {
  type!: OtbmNodeTypes.HouseTile;
  x!: number;
  y!: number;
  z!: number;
  houseId!: number;
  tileId!: number;
  flags!: OtbmTileFlags;
  items!: OtbmNodeItem[];

  init() {
    this.type = OtbmNodeTypes.HouseTile;
    this.items = [];
  }

  read(tree: BinaryTree) {
    this.x = tree.getU8();
    this.y = tree.getU8();
    this.houseId = tree.getU32();

    const attrs = this.readAttributes(tree);
    this.tileId = attrs.tileId!;
    this.flags = this.readFlags(attrs.flags || 0);

    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.Item: {
          this.items.push(new OtbmNodeItem(child));
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
