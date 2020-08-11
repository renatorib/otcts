import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeWaypoint } from "./OtbmNodeWaypoint";

/*
.
└── Waypoints
    └── Waypoint
*/
export class OtbmNodeWaypoints extends OtbmNode {
  type!: OtbmNodeTypes.Waypoints;
  waypoints!: OtbmNodeWaypoint[];

  init() {
    this.type = OtbmNodeTypes.Waypoints;
    this.waypoints = [];
  }

  read(tree: BinaryTree) {
    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.Waypoint: {
          this.waypoints.push(new OtbmNodeWaypoint(child));
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
