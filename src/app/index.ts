import "./index.css";
import { main } from "../client";

main();

/* import "./index.css";

import { Client } from "./src/core/structures/Client";
import { DatManager } from "./src/core/dat/DatManager";
import { SprManager } from "./src/core/spr/SprManager";
import { FileInput } from "./src/core/file/FileInput";

import { Sprite } from "./src/core/spr/Sprite";

const DAT_URL = "http://localhost:5173/client/Tibia.dat";
const SPR_URL = "http://localhost:5173/client/Tibia.spr";

const fileInputFromUrl = async (url: string) =>
  new FileInput(await fetch(url).then((response) => response.arrayBuffer()));

const client = new Client(1231);

const loadDatMAIN = async () => {
  const datManager = new DatManager(client);
  datManager.loadDat(await fileInputFromUrl(DAT_URL));
  return datManager;
};

const loadSprMAIN = async () => {
  const sprManager = new SprManager(client);
  sprManager.setSprFile(await fileInputFromUrl(SPR_URL));
  return sprManager;
};

const main = async () => {
  console.log("started");

  const dat = await loadDatMAIN();
  const spr = await loadSprMAIN();

  (window as any).dat = dat;
  (window as any).spr = spr;
};

main(); */
