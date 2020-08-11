import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";

/*
.
└── Waypoint
*/
export class OtbmNodeWaypoint extends OtbmNode {
  type!: OtbmNodeTypes.Waypoint;
  name!: string;
  x!: number;
  y!: number;
  z!: number;

  init() {
    this.type = OtbmNodeTypes.Waypoint;
  }

  read(tree: BinaryTree) {
    this.name = tree.getString16();
    this.x = tree.getU16();
    this.y = tree.getU16();
    this.z = tree.getU8();
  }
}
