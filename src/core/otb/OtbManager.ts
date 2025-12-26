import { FileInput } from "../file/FileInput";
import { Client } from "../structures/Client";
import { FileOutput } from "../file/FileOutput";
import { BinaryTreeOutput } from "../file/BinaryTreeOutput";
import { OtbItemType } from "./OtbItemType";

export class OtbManager {
  private loaded = false;
  private lastId = 99;
  private itemTypes: OtbItemType[] = [];
  private reverseItemTypes: OtbItemType[] = [];
  private otbMajorVersion: number = 0;
  private otbMinorVersion: number = 0;
  private otbBuildVersion: number = 0;
  private otbDescription: string = "";

  constructor(public client: Client) {}

  static fromUrl = async (url: string, clientVersion: number = 1200) => {
    const fin = await FileInput.fromUrl(url);
    if (fin) return OtbManager.fromFileInput(fin, clientVersion);
    return new OtbManager(new Client(clientVersion));
  };

  static fromFileInput = (fin: FileInput, clientVersion: number = 1200) => {
    const otb = new OtbManager(new Client(clientVersion));
    otb.loadOtb(fin);
    return otb;
  };

  getItem(id: number) {
    return this.itemTypes[id];
  }

  getItemByClientId(id: number) {
    return this.reverseItemTypes[id];
  }

  isValidOtbId(id: number): boolean {
    return this.itemTypes[id] !== undefined;
  }

  getLastId() {
    return this.lastId;
  }

  setLastId(value: number) {
    this.lastId = value;
  }

  increaseLastId() {
    this.setLastId(this.getLastId() + 1);
  }

  getMajorVersion() {
    return this.otbMajorVersion;
  }

  setMajorVersion(version: number) {
    this.otbMajorVersion = version;
  }

  getMinorVersion() {
    return this.otbMajorVersion;
  }

  setMinorVersion(version: number) {
    this.otbMajorVersion = version;
  }

  getBuildVersion() {
    return this.otbBuildVersion;
  }

  setBuildVersion(version: number) {
    this.otbBuildVersion = version;
  }

  getDescription() {
    return this.otbDescription;
  }

  /**
   * Set description to 128 ASCII characters.
   * Format required by OTBI.
   * @param description
   */
  setDescription(description: string) {
    let newDescription = "";
    for (let i = 0; i < description.length, newDescription.length < 128; i++) {
      newDescription += String.fromCharCode(description.charCodeAt(i) % 256);
    }

    while (newDescription.length < 128) {
      newDescription += String.fromCharCode(0);
    }
    this.otbDescription = newDescription;
  }

  loadOtbFromBuffer(buffer: ArrayBuffer) {
    return this.loadOtb(new FileInput(buffer));
  }

  loadOtb(fin: FileInput): boolean {
    if (this.loaded) {
      throw new Error("OtbManager already loaded");
    }

    try {
      let signature = fin.getU32();
      if (signature != 0) throw new Error("invalid otb file 1, " + signature);

      let root = fin.getBinaryTree();
      root.skip(1);

      signature = root.getU32();
      if (signature != 0) throw new Error("invalid otb file 2, " + signature);

      let rootAttr = root.getU8();
      if (rootAttr == 0x01) {
        // OTB_ROOT_ATTR_VERSION
        let size = root.getU16();
        if (size != 4 + 4 + 4 + 128) throw new Error("invalid otb root attr version size");

        this.otbMajorVersion = root.getU32();
        this.otbMinorVersion = root.getU32();
        this.otbBuildVersion = root.getU32();
        this.otbDescription = root.getString(128);
      }

      for (let node of root.getChildren()) {
        let itemType = new OtbItemType();
        itemType.unserialize(node, this);
        this.addItemType(itemType);
      }

      this.loaded = true;
      return true;
    } catch (e) {
      console.error("Failed to load (OTB file): %s", e);
      return false;
    }
  }

  saveOtb(): FileOutput {
    const fout = new FileOutput();
    fout.addU32(0);
    let root = new BinaryTreeOutput(fout);
    root.addU32(0); // signature

    root.addU8(1); // OTB_ROOT_ATTR_VERSION

    root.addU16(4 + 4 + 4 + 128); // size

    root.addU32(this.otbMajorVersion);
    root.addU32(this.otbMinorVersion);
    root.addU32(this.otbBuildVersion);
    root.addString(this.otbDescription, 128); // build version

    for (let otbItemType of this.itemTypes) {
      if (otbItemType) {
        root.startNode(-1);
        otbItemType.serialize(root, this);
        root.endNode();
      }
    }
    root.endNode();

    return fout;
  }

  addItemType(itemType: OtbItemType) {
    this.itemTypes[itemType.getServerId()] = itemType;
    this.reverseItemTypes[itemType.getClientId()] = itemType;
  }
}
