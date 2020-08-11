import { parse } from "fast-xml-parser";
import { getFetch } from "../common/helpers";

export class XMLManager {
  data: any;

  constructor() {}

  static fromUrl = async (url: string, clientVersion: number = 1200) => {
    const fetch = getFetch();

    try {
      const content = await fetch(url).then((r) => r.text());
      const xml = new XMLManager();
      xml.loadXml(content);
      return xml;
    } catch (e) {
      console.error(e);
      return new XMLManager();
    }
  };

  loadXml(content: string) {
    this.data = parse(content);
  }
}
