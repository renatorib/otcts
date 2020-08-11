import { OtbmNodeTypes } from "../common/enums";
import { OtbmNodeHouseTile } from "./OtbmNodeHouseTile";
import { BinaryTree } from "../file/BinaryTree";
import { OtbmNode } from "./OtbmNode";
import { OtbmNodeTile } from "./OtbmNodeTile";

/*
.
└── TileArea
    ├── Tile
    ├── HouseTile
    ├── TileSquare (not implemented)
    └── TileRef (not implemented)
*/
export class OtbmNodeTileArea extends OtbmNode {
  type!: OtbmNodeTypes.TileArea;
  x!: number;
  y!: number;
  z!: number;
  tiles!: (OtbmNodeTile | OtbmNodeHouseTile)[];

  init() {
    this.type = OtbmNodeTypes.TileArea;
    this.tiles = [];
  }

  read(tree: BinaryTree) {
    this.x = tree.getU16();
    this.y = tree.getU16();
    this.z = tree.getU8();

    for (const child of tree.getChildren()) {
      const type = child.getU8();

      switch (type) {
        case OtbmNodeTypes.Tile: {
          const tile = new OtbmNodeTile(child);
          tile.x = this.x + tile.x;
          tile.y = this.y + tile.y;
          tile.z = this.z;
          this.tiles.push(tile);
          break;
        }
        case OtbmNodeTypes.HouseTile: {
          const tile = new OtbmNodeHouseTile(child);
          tile.x = this.x + tile.x;
          tile.y = this.y + tile.y;
          tile.z = this.z;
          this.tiles.push(tile);
          break;
        }
        default:
          this.unsupportedChildType(type);
          break;
      }
    }
  }
}
