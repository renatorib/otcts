import { FileInput } from "../file/FileInput";
import { OtbmNodeMapHeader } from "./OtbmNodeMapHeader";

export class OtbmManager {
  public loaded = false;
  public header!: OtbmNodeMapHeader;

  static fromUrl = async (url: string) => {
    const fin = await FileInput.fromUrl(url);
    if (fin) return OtbmManager.fromFileInput(fin);
    return new OtbmManager();
  };

  static fromFileInput = (fin: FileInput) => {
    const otbm = new OtbmManager();
    otbm.loadOtbm(fin);
    return otbm;
  };

  loadOtbmFromBuffer(buffer: ArrayBuffer) {
    return this.loadOtbm(new FileInput(buffer));
  }

  loadOtbm(fin: FileInput): boolean {
    if (this.loaded === true) {
      throw new Error("[otbm] OtbmManager already loaded otbm file.");
    }

    try {
      const signature = fin.getU32();
      if (signature != 0 && signature != 1296192591) {
        throw new Error("[otbm] Invalid otbm file. Signature " + signature);
      }

      const root = fin.getBinaryTree();
      root.skip(1); // skip the type byte of node MapHeader

      this.header = new OtbmNodeMapHeader(root); // all children recursion loads here
      this.loaded = true;
      return true;
    } catch (e) {
      console.error("[otbm] Failed to load otbm file %s", e);
      return false;
    }
  }
}
