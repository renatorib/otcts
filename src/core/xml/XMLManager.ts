import { parse } from "fast-xml-parser";

export class XMLManager<T = unknown> {
  constructor(public data: T) {}

  static fromUrl = async <T = unknown>(url: string, _clientVersion: number = 1200) => {
    try {
      const content = await fetch(url).then((r) => r.text());
      const xml = new XMLManager(parse(content) as T);
      return xml;
    } catch (e) {
      throw new Error(`Failed to load XML from ${url}: ${e}`);
    }
  };
}
