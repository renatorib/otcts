import { OtbmNodeTypes } from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeMapData } from "./OtbmNodeMapData";

/*
Otbm
└── MapHeader
    ├── MapData
    │   ├── TileArea
    │   │   ├── Tile
    │   │   │    └── Item
    │   │   │   │    └── Item (recursive)
    │   │   ├── HouseTile
    │   │   │    └── Item
    │   │   │   │    └── Item (recursive)
    │   │   ├── TileSquare (not implemented)
    │   │   └── TileRef (not implemented)
    │   ├── Spanws (not implemented)
    │   │   ├── SpawnArea (not implemented)
    │   │   └── Monster (not implemented)
    │   ├── Towns
    │   │   └── Town
    │   └── Waypoints
    │       └── Waypoint
    └── ItemDef (not implemented)
*/
export class OtbmNodeMapHeader extends OtbmNode {
  type!: OtbmNodeTypes.MapHeader;
  version!: number;
  mapWidth!: number;
  mapHeight!: number;
  otbMajorVersion!: number;
  otbMinorVersion!: number;
  nodes!: OtbmNodeMapData[];

  init() {
    this.type = OtbmNodeTypes.MapHeader;
    this.nodes = [];
  }

  read(tree: BinaryTree) {
    this.version = tree.getU32();
    this.mapWidth = tree.getU16();
    this.mapHeight = tree.getU16();
    this.otbMajorVersion = tree.getU32();
    this.otbMinorVersion = tree.getU32();

    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.MapData: {
          this.nodes.push(new OtbmNodeMapData(child));
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
