import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";

/*
.
└── Item
    └── Item (containers may have items inside, so recursion)
*/
export class OtbmNodeItem extends OtbmNode {
  type!: OtbmNodeTypes.Item;
  id!: number;
  count!: number;
  actionId?: number;
  text?: string;
  runeCharges?: number;
  houseDoorId?: number;
  depotId?: number;
  destination?: {
    x: number;
    y: number;
    z: number;
  };
  items!: OtbmNodeItem[];

  init() {
    this.type = OtbmNodeTypes.Item;
    this.items = [];
  }

  read(tree: BinaryTree) {
    this.id = tree.getU16();

    const attrs = this.readAttributes(tree);
    this.count = attrs.count || 1;
    this.destination = attrs.destination;
    this.actionId = attrs.actionId;
    this.text = attrs.text;
    this.runeCharges = attrs.runeCharges;
    this.houseDoorId = attrs.houseDoorId;
    this.depotId = attrs.depotId;

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
