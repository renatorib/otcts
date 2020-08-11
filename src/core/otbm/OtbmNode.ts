import { OtbmNodeTypes, OtbmTileState, OtbmAttr } from "../common/enums";
import { OtbmTileFlags, OtbmAttributes } from "../common/types";
import { BinaryTree } from "../file/BinaryTree";

export abstract class OtbmNode {
  type!: OtbmNodeTypes;

  constructor(tree?: BinaryTree) {
    this.init();

    if (tree) {
      this.read(tree);
    }
  }

  init() {
    // Init function not implemented.
    // not throw error because it is not required
  }

  read(tree: BinaryTree) {
    throw new Error("Read function not implemented.");
  }

  write(fout: BinaryTree) {
    throw new Error("Write function not implemented.");
  }

  unsupportedChildType(type: any) {
    throw new Error(
      `[otbm] Unsupported child of type [0x${type.toString(16)}]`
    );
  }

  readFlags(flags: number): OtbmTileFlags {
    return {
      protection: Boolean(flags & OtbmTileState.ProtectionZone),
      deprecated: Boolean(flags & OtbmTileState.Deprecated),
      noPvp: Boolean(flags & OtbmTileState.NoPvp),
      noLogout: Boolean(flags & OtbmTileState.NoLogout),
      pvpZone: Boolean(flags & OtbmTileState.PvpZone),
      refresh: Boolean(flags & OtbmTileState.Refresh),
    };
  }

  readAttributes(node: BinaryTree) {
    const props: OtbmAttributes = {};

    while (node.canRead()) {
      switch (node.getU8()) {
        case OtbmAttr.Text: {
          props.text = node.getString16();
          break;
        }

        case OtbmAttr.SpawnFile: {
          props.spawnFile = node.getString16();
          break;
        }

        case OtbmAttr.HouseFile: {
          props.houseFile = node.getString16();
          break;
        }

        case OtbmAttr.HouseDoorId: {
          props.houseDoorId = node.getU8();
          break;
        }

        case OtbmAttr.MapDescription: {
          // Description may be written in multiple bytes identifiers
          const desc = props.description ? props.description : "";
          props.description = `${desc}${node.getString16()}`;
          break;
        }

        case OtbmAttr.ItemDescription: {
          props.description = node.getString16();
          break;
        }

        case OtbmAttr.DepotId: {
          props.depotId = node.getU16();
          break;
        }

        case OtbmAttr.TileFlags: {
          props.flags = node.getU32();
          break;
        }

        case OtbmAttr.RuneCharges: {
          props.runeCharges = node.getU16();
          break;
        }

        case OtbmAttr.Count: {
          props.count = node.getU8();
          break;
        }

        case OtbmAttr.Item: {
          props.tileId = node.getU16();
          break;
        }

        case OtbmAttr.ActionId: {
          props.actionId = node.getU16();
          break;
        }

        case OtbmAttr.TeleportDestination: {
          props.destination = {
            x: node.getU16(),
            y: node.getU16(),
            z: node.getU8(),
          };
        }
      }
    }

    return props;
  }
}
