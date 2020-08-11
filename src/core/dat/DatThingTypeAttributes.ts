import { DatThingAttr } from "../common/enums";

export class DatThingTypeAttributes {
  public attribs: { [attr: string]: any } = {};

  has(attr: DatThingAttr) {
    return this.attribs.hasOwnProperty(attr.toString());
  }

  get(attr: DatThingAttr) {
    return this.attribs[attr];
  }

  set(attr: DatThingAttr, value: any) {
    this.attribs[attr] = value;
  }

  remove(attr: DatThingAttr) {
    delete this.attribs[attr];
  }
}
