import { DatThingCategory } from "../common/enums";
import { Color } from "./Color";

export class Outfit {
  public static HSI_SI_VALUES = 7;
  public static HSI_H_STEPS = 19;

  category: DatThingCategory;
  id: number;
  auxId: number;

  head!: number;
  body!: number;
  legs!: number;
  feet!: number;
  addons!: number;
  mount!: number;
  headColor!: Color;
  bodyColor!: Color;
  legsColor!: Color;
  feetColor!: Color;

  constructor() {
    this.category = DatThingCategory.ThingCategoryCreature;
    this.id = 128;
    this.auxId = 0;
    this.resetClothes();
  }

  getId() {
    return this.id;
  }

  getAuxId() {
    return this.auxId;
  }

  getHead() {
    return this.head;
  }

  getBody() {
    return this.body;
  }

  getLegs() {
    return this.legs;
  }

  getFeet() {
    return this.feet;
  }

  getAddons() {
    return this.addons;
  }

  getMount() {
    return this.mount;
  }

  getCategory(): DatThingCategory {
    return this.category;
  }

  setId(id: number) {
    this.id = id;
  }

  setAuxId(id: number) {
    this.auxId = id;
  }

  setHead(head: number) {
    this.head = head;
    this.headColor = Outfit.getColor(head);
  }

  setBody(body: number) {
    this.body = body;
    this.bodyColor = Outfit.getColor(body);
  }

  setLegs(legs: number) {
    this.legs = legs;
    this.legsColor = Outfit.getColor(legs);
  }

  setFeet(feet: number) {
    this.feet = feet;
    this.feetColor = Outfit.getColor(feet);
  }

  setAddons(addons: number) {
    this.addons = addons;
  }

  setMount(mount: number): any {
    this.mount = mount;
  }

  setCategory(category: DatThingCategory) {
    this.category = category;
  }

  resetClothes() {
    this.setHead(50);
    this.setBody(79);
    this.setLegs(120);
    this.setFeet(18);
    this.setMount(0);
  }

  static getColor(color: number): Color {
    if (color >= Outfit.HSI_H_STEPS * Outfit.HSI_SI_VALUES) color = 0;

    var loc1 = 0,
      loc2 = 0,
      loc3 = 0;
    if (color % Outfit.HSI_H_STEPS != 0) {
      loc1 = (color % Outfit.HSI_H_STEPS) / 18.0;
      loc2 = 1;
      loc3 = 1;

      switch (Math.floor(color / Outfit.HSI_H_STEPS)) {
        case 0:
          loc2 = 0.25;
          loc3 = 1.0;
          break;
        case 1:
          loc2 = 0.25;
          loc3 = 0.75;
          break;
        case 2:
          loc2 = 0.5;
          loc3 = 0.75;
          break;
        case 3:
          loc2 = 0.667;
          loc3 = 0.75;
          break;
        case 4:
          loc2 = 1.0;
          loc3 = 1.0;
          break;
        case 5:
          loc2 = 1.0;
          loc3 = 0.75;
          break;
        case 6:
          loc2 = 1.0;
          loc3 = 0.5;
          break;
      }
    } else {
      loc1 = 0;
      loc2 = 0;
      loc3 = 1 - color / Outfit.HSI_H_STEPS / Outfit.HSI_SI_VALUES;
    }

    if (loc3 == 0) return new Color(0, 0, 0);

    if (loc2 == 0) {
      const loc7 = Math.floor(loc3 * 255);
      return new Color(loc7, loc7, loc7);
    }

    let red = 0,
      green = 0,
      blue = 0;

    if (loc1 < 1.0 / 6.0) {
      red = loc3;
      blue = loc3 * (1 - loc2);
      green = blue + (loc3 - blue) * 6 * loc1;
    } else if (loc1 < 2.0 / 6.0) {
      green = loc3;
      blue = loc3 * (1 - loc2);
      red = green - (loc3 - blue) * (6 * loc1 - 1);
    } else if (loc1 < 3.0 / 6.0) {
      green = loc3;
      red = loc3 * (1 - loc2);
      blue = red + (loc3 - red) * (6 * loc1 - 2);
    } else if (loc1 < 4.0 / 6.0) {
      blue = loc3;
      red = loc3 * (1 - loc2);
      green = blue - (loc3 - red) * (6 * loc1 - 3);
    } else if (loc1 < 5.0 / 6.0) {
      blue = loc3;
      green = loc3 * (1 - loc2);
      red = green + (loc3 - green) * (6 * loc1 - 4);
    } else {
      red = loc3;
      green = loc3 * (1 - loc2);
      blue = red - (loc3 - green) * (6 * loc1 - 5);
    }
    return new Color(
      Math.floor(red * 255),
      Math.floor(green * 255),
      Math.floor(blue * 255)
    );
  }
}
