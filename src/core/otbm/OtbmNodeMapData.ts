import { OtbmNodeTypes } from "../common/enums";
import { OtbmNodeTileArea } from "./OtbmNodeTileArea";
import { OtbmNodeWaypoints } from "./OtbmNodeWaypoints";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeTowns } from "./OtbmNodeTowns";

/*
.
└── MapData
    ├── TileArea
    ├── Spawns
    └── Towns
*/
export class OtbmNodeMapData extends OtbmNode {
  type!: OtbmNodeTypes.MapData;
  description?: string;
  spawnFile!: string;
  houseFile!: string;
  features!: (OtbmNodeTileArea | OtbmNodeTowns | OtbmNodeWaypoints)[];

  init() {
    this.type = OtbmNodeTypes.MapData;
    this.features = [];
  }

  read(tree: BinaryTree) {
    this.features = [];

    const attrs = this.readAttributes(tree);
    this.description = attrs.description;

    if (!attrs.spawnFile) {
      throw new Error("No spawnFile specified in otbm file. Aborting...");
    }

    if (!attrs.houseFile) {
      throw new Error("No houseFile specified in otbm file. Aborting...");
    }

    this.spawnFile = attrs.spawnFile!;
    this.houseFile = attrs.houseFile!;

    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.TileArea: {
          this.features.push(new OtbmNodeTileArea(child));
          break;
        }
        case OtbmNodeTypes.Towns: {
          this.features.push(new OtbmNodeTowns(child));
          break;
        }
        case OtbmNodeTypes.Waypoints: {
          this.features.push(new OtbmNodeWaypoints(child));
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
