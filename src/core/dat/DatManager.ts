import { DatThingType } from "./DatThingType";
import { FileInput } from "../file/FileInput";
import { FileOutput } from "../file/FileOutput";
import { DatThingAttr, DatThingCategory } from "../common/enums";
import { sortObjectByKey } from "../common/helpers";
import { Client } from "../structures/Client";

export class DatManager {
  private static nullThingType = new DatThingType();
  private readonly thingTypes: DatThingType[][] = [];
  private datSignature: number = 0;
  private contentRevision: number = 0;

  constructor(public client: Client) {
    for (let i = DatThingCategory.ThingCategoryItem; i < DatThingCategory.ThingLastCategory; ++i) {
      this.thingTypes[i] = [];
    }
  }

  static fromUrl = async (url: string, clientVersion: number = 1200) => {
    const fin = await FileInput.fromUrl(url);
    if (fin) return DatManager.fromFileInput(fin, clientVersion);
    return new DatManager(new Client(clientVersion));
  };

  static fromFileInput = (fin: FileInput, clientVersion: number = 1200) => {
    const dat = new DatManager(new Client(clientVersion));
    dat.loadDat(fin);
    return dat;
  };

  getThingType(id: number, category: DatThingCategory): DatThingType {
    if (category >= DatThingCategory.ThingLastCategory || id >= this.thingTypes[category].length) {
      console.error(`invalid thing type client id ${id} in category ${category}`);
      return DatManager.nullThingType;
    }
    return this.thingTypes[category][id];
  }

  getThingTypes() {
    return this.thingTypes;
  }

  getCategory(category: DatThingCategory) {
    return this.thingTypes[category];
  }

  getItem(id: number) {
    return this.getThingType(id, DatThingCategory.ThingCategoryItem);
  }

  getCreature(id: number) {
    return this.getThingType(id, DatThingCategory.ThingCategoryCreature);
  }

  getEffect(id: number) {
    return this.getThingType(id, DatThingCategory.ThingCategoryEffect);
  }

  getMissile(id: number) {
    return this.getThingType(id, DatThingCategory.ThingCategoryMissile);
  }

  isValidDatId(_id: number, _category: DatThingCategory): boolean {
    return true;
  }

  getNullThingType(): DatThingType {
    return DatManager.nullThingType;
  }

  getDatSignature() {
    return this.datSignature;
  }

  getContentRevision() {
    return this.contentRevision;
  }

  loadDatFromBuffer(buffer: ArrayBuffer) {
    return this.loadDat(new FileInput(buffer));
  }

  loadDat(fin: FileInput): boolean {
    this.datSignature = 0;
    this.contentRevision = 0;
    try {
      this.datSignature = fin.getU32();
      this.contentRevision = this.datSignature & 0xffff;

      for (
        let category = DatThingCategory.ThingCategoryItem;
        category < DatThingCategory.ThingLastCategory;
        ++category
      ) {
        let count = fin.getU16() + 1;
        this.thingTypes[category] = [];
        for (let thingCount = 0; thingCount < count; ++thingCount) {
          this.thingTypes[category][thingCount] = DatManager.nullThingType;
        }
      }

      const clientTranslationArray = this.getClientTranslationArray();
      for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
        let firstId = 1;
        if (category == DatThingCategory.ThingCategoryItem) firstId = 100;
        for (let id = firstId; id < this.thingTypes[category].length; ++id) {
          let type = new DatThingType();
          type.unserialize(id, category, fin, this.client, clientTranslationArray);
          this.thingTypes[category][id] = type;
        }
      }

      return true;
    } catch (e) {
      console.error("Failed to read dat: %s'", e);
      return false;
    }
  }

  saveDat(): FileOutput {
    const fin = new FileOutput();
    fin.addU32(this.datSignature);

    for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
      fin.addU16(this.thingTypes[category].length - 1);
    }

    const clientTranslationArray = this.getClientTranslationArray();

    for (let category = 0; category < DatThingCategory.ThingLastCategory; ++category) {
      let firstId = 1;
      if (category == DatThingCategory.ThingCategoryItem) firstId = 100;

      for (let id = firstId; id < this.thingTypes[category].length; ++id)
        this.thingTypes[category][id].serialize(fin, category, this.client, clientTranslationArray);
    }
    return fin;
  }

  getClientTranslationArray(): number[] {
    let clientAttributesTranslator: { [key: string]: any } = {};
    for (let thingAttr = 0; thingAttr < DatThingAttr.ThingLastAttr; ++thingAttr) {
      if (DatThingAttr[thingAttr] === undefined) {
        continue;
      }
      let clientDatAttribute = thingAttr;
      if (this.client.getClientVersion() >= 1000) {
        /* In 10.10+ all attributes from 16 and up were
         * incremented by 1 to make space for 16 as
         * "No Movement Animation" flag.
         */
        if (thingAttr == DatThingAttr.ThingAttrNoMoveAnimation) clientDatAttribute = 16;
        else if (thingAttr >= DatThingAttr.ThingAttrPickupable) clientDatAttribute += 1;
      } else if (this.client.getClientVersion() >= 860) {
        /* Default attribute values follow
         * the format of 8.6-9.86.
         * Therefore no changes here.
         */
      } else if (this.client.getClientVersion() >= 780) {
        /* In 7.80-8.54 all attributes from 8 and higher were
         * incremented by 1 to make space for 8 as
         * "Item Charges" flag.
         */
        if (thingAttr == DatThingAttr.ThingAttrChargeable)
          clientDatAttribute = DatThingAttr.ThingAttrWritable;
        else if (thingAttr >= DatThingAttr.ThingAttrWritable) clientDatAttribute += 1;
      } else if (this.client.getClientVersion() >= 755) {
        /* In 7.55-7.72 attributes 23 is "Floor Change". */
        if (thingAttr == DatThingAttr.ThingAttrFloorChange) clientDatAttribute = 23;
      } else if (this.client.getClientVersion() >= 740) {
        /* In 7.4-7.5 attribute "Ground Border" did not exist
         * attributes 1-15 have to be adjusted.
         * Several other changes in the format.
         */

        if (thingAttr > 1 && thingAttr <= 16) thingAttr -= 1;
        else if (thingAttr == DatThingAttr.ThingAttrLight) thingAttr = 16;
        else if (thingAttr == DatThingAttr.ThingAttrFloorChange) thingAttr = 17;
        else if (thingAttr == DatThingAttr.ThingAttrFullGround) thingAttr = 18;
        else if (thingAttr == DatThingAttr.ThingAttrElevation) thingAttr = 19;
        else if (thingAttr == DatThingAttr.ThingAttrDisplacement) thingAttr = 20;
        else if (thingAttr == DatThingAttr.ThingAttrMinimapColor) thingAttr = 22;
        else if (thingAttr == DatThingAttr.ThingAttrRotateable) thingAttr = 23;
        else if (thingAttr == DatThingAttr.ThingAttrLyingCorpse) thingAttr = 24;
        else if (thingAttr == DatThingAttr.ThingAttrHangable) thingAttr = 25;
        else if (thingAttr == DatThingAttr.ThingAttrHookSouth) thingAttr = 26;
        else if (thingAttr == DatThingAttr.ThingAttrHookEast) thingAttr = 27;
        else if (thingAttr == DatThingAttr.ThingAttrAnimateAlways) thingAttr = 28;

        /* "Multi Use" and "Force Use" are swapped */
        if (thingAttr == DatThingAttr.ThingAttrMultiUse)
          clientDatAttribute = DatThingAttr.ThingAttrForceUse;
        else if (thingAttr == DatThingAttr.ThingAttrForceUse)
          clientDatAttribute = DatThingAttr.ThingAttrMultiUse;
      }
      clientAttributesTranslator[clientDatAttribute] = thingAttr;
    }

    return sortObjectByKey(clientAttributesTranslator);
  }
}
