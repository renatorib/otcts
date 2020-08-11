import { OtbItemTypeAttr } from "../common/enums";

export class OtbItemTypeAttributes {
  public attribs: { [key: number]: any } = {};

  has(attr: OtbItemTypeAttr) {
    return this.attribs.hasOwnProperty(attr.toString());
  }

  get(attr: OtbItemTypeAttr) {
    return this.attribs[attr];
  }

  set(attr: OtbItemTypeAttr, value: any) {
    this.attribs[attr] = value;
  }

  remove(attr: OtbItemTypeAttr) {
    delete this.attribs[attr];
  }
}
