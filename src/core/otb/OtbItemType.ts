import {
  OtbItemCategory,
  OtbItemFlags,
  OtbItemTypeAttr,
} from "../common/enums";
import { BinaryTree } from "../file/BinaryTree";
import { Light } from "../structures/Light";
import { BinaryTreeOutput } from "../file/BinaryTreeOutput";
import { OtbManager } from "./OtbManager";
import { OtbItemTypeAttributes } from "./OtbItemTypeAttributes";

export class OtbItemType {
  null = true;
  category = OtbItemCategory.ItemCategoryInvalid;
  flags = 0;
  attribs = new OtbItemTypeAttributes();

  serialize(node: BinaryTreeOutput, otbManager: OtbManager) {
    node.addU8(this.category);
    node.addU32(this.flags);

    for (let attrString in this.attribs.attribs) {
      const attr = parseInt(attrString);
      node.addU8(attr);

      switch (attr) {
        case OtbItemTypeAttr.ItemTypeAttrServerId: {
          let serverId = this.attribs.get(attr);
          if (otbManager.client.getClientVersion() < 960) {
            if (serverId > 20000 && serverId < 20100) {
              serverId += 20000;
            }
          } else {
            if (serverId > 30000 && serverId < 30100) {
              serverId += 30000;
            }
          }

          node.addU16(2);
          node.addU16(serverId);
          break;
        }
        case OtbItemTypeAttr.ItemTypeAttrClientId:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrName:
          node.addString(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrSpeed:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrWritable:
          node.addU16(1);
          node.addU8(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrSpriteHash:
          node.addString(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrMinimapColor:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttr07:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttr08:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrLight2:
          node.addU16(4);
          const light: Light = this.attribs.get(attr);
          node.addU16(light.intensity);
          node.addU16(light.color);
          break;
        case OtbItemTypeAttr.ItemTypeAttrTopOrder:
          //1: borders
          //2: ladders, signs, splashes
          //3: doors etc
          //4: creatures
          node.addU16(1);
          node.addU8(this.attribs.get(attr));
          break;
        case OtbItemTypeAttr.ItemTypeAttrWareId:
          node.addU16(2);
          node.addU16(this.attribs.get(attr));
          break;
        default:
          node.addString(this.attribs.get(attr));
      }
    }
  }

  unserialize(node: BinaryTree, otbManager: OtbManager) {
    this.null = false;
    this.category = node.getU8();

    this.flags = node.getU32();

    while (node.canRead()) {
      let attr = node.getU8();
      if (attr == 0 || attr == 0xff) {
        break;
      }

      let len = node.getU16();
      switch (attr) {
        case OtbItemTypeAttr.ItemTypeAttrServerId: {
          let serverId = node.getU16();
          if (otbManager.client.getClientVersion() < 960) {
            if (serverId > 20000 && serverId < 20100) {
              serverId -= 20000;
            } else if (
              otbManager.getLastId() > 99 &&
              otbManager.getLastId() != serverId - 1
            ) {
              while (otbManager.getLastId() != serverId - 1) {
                let tmp = new OtbItemType();
                tmp.setServerId(otbManager.getLastId());
                otbManager.increaseLastId();
                otbManager.addItemType(tmp);
              }
            }
          } else {
            if (serverId > 30000 && serverId < 30100) {
              serverId -= 30000;
            } else if (
              otbManager.getLastId() > 99 &&
              otbManager.getLastId() != serverId - 1
            ) {
              while (otbManager.getLastId() != serverId - 1) {
                let tmp = new OtbItemType();
                tmp.setServerId(otbManager.getLastId());
                otbManager.increaseLastId();
                otbManager.addItemType(tmp);
              }
            }
          }
          this.setServerId(serverId);
          otbManager.setLastId(serverId);
          break;
        }
        case OtbItemTypeAttr.ItemTypeAttrClientId:
          this.setClientId(node.getU16());
          break;
        case OtbItemTypeAttr.ItemTypeAttrName:
          this.setName(node.getString(len));
          break;
        case OtbItemTypeAttr.ItemTypeAttrSpeed:
          this.attribs.set(OtbItemTypeAttr.ItemTypeAttrSpeed, node.getU16());
          break;
        case OtbItemTypeAttr.ItemTypeAttrWritable:
          this.setWritable(true);
          break;
        case OtbItemTypeAttr.ItemTypeAttrSpriteHash:
          this.attribs.set(
            OtbItemTypeAttr.ItemTypeAttrSpriteHash,
            node.getString(len)
          );
          break;
        case OtbItemTypeAttr.ItemTypeAttrMinimapColor:
          this.attribs.set(
            OtbItemTypeAttr.ItemTypeAttrMinimapColor,
            node.getU16()
          );
          break;
        case OtbItemTypeAttr.ItemTypeAttr07:
          this.attribs.set(OtbItemTypeAttr.ItemTypeAttr07, node.getU16());
          break;
        case OtbItemTypeAttr.ItemTypeAttr08:
          this.attribs.set(OtbItemTypeAttr.ItemTypeAttr08, node.getU16());
          break;
        case OtbItemTypeAttr.ItemTypeAttrLight2:
          this.attribs.set(
            OtbItemTypeAttr.ItemTypeAttrLight2,
            new Light(node.getU16(), node.getU16())
          );
          break;
        case OtbItemTypeAttr.ItemTypeAttrTopOrder:
          //1: borders
          //2: ladders, signs, splashes
          //3: doors etc
          //4: creatures
          this.attribs.set(OtbItemTypeAttr.ItemTypeAttrTopOrder, node.getU8());
          break;
        case OtbItemTypeAttr.ItemTypeAttrWareId:
          this.attribs.set(OtbItemTypeAttr.ItemTypeAttrWareId, node.getU16());
          break;
        default:
          this.attribs.set(attr, node.getString(len));
          break;
      }
    }
  }

  isNull() {
    return this.null;
  }

  setCategory(category: OtbItemCategory) {
    this.category = category;
  }

  getCategory(): OtbItemCategory {
    return this.category;
  }

  setFlags(flags: number) {
    this.flags = flags;
  }

  getFlags(): number {
    return this.flags;
  }

  hasFlag(flag: OtbItemFlags): boolean {
    return (this.flags & flag) == flag;
  }

  setFlag(flag: OtbItemFlags, value: boolean) {
    if (value) {
      this.flags |= flag;
    } else {
      this.flags &= ~flag;
    }
  }

  setServerId(serverId: number) {
    this.attribs.set(OtbItemTypeAttr.ItemTypeAttrServerId, serverId);
  }

  getServerId(): number {
    return this.attribs.get(OtbItemTypeAttr.ItemTypeAttrServerId);
  }

  setClientId(clientId: number) {
    this.attribs.set(OtbItemTypeAttr.ItemTypeAttrClientId, clientId);
  }

  getClientId(): number {
    return this.attribs.get(OtbItemTypeAttr.ItemTypeAttrClientId);
  }

  setName(name: string) {
    this.attribs.set(OtbItemTypeAttr.ItemTypeAttrName, name);
  }

  getName(): string {
    return this.attribs.get(OtbItemTypeAttr.ItemTypeAttrName);
  }

  setDescription(description: string) {
    this.attribs.set(OtbItemTypeAttr.ItemTypeAttrDesc, description);
  }

  getDescription(): string {
    return this.attribs.get(OtbItemTypeAttr.ItemTypeAttrDesc);
  }

  setWritable(value: boolean) {
    this.attribs.set(OtbItemTypeAttr.ItemTypeAttrWritable, value);
  }

  isWritable(): boolean {
    return this.attribs.get(OtbItemTypeAttr.ItemTypeAttrWritable);
  }

  getAttributes(): OtbItemTypeAttributes {
    return this.attribs;
  }

  setAttributes(otbItemTypeAttributes: OtbItemTypeAttributes) {
    this.attribs = otbItemTypeAttributes;
  }
}
