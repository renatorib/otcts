import fs from "fs";
import path from "path";

import { OtbManager } from "../core/otb/OtbManager";
import { DatManager } from "../core/dat/DatManager";
import { SprManager } from "../core/spr/SprManager";

import { Client } from "../core/structures/Client";
import { OtbItemTypeAttr } from "../core/common/enums";

const OTB_PATH = path.resolve(__dirname, "../../data/server/items.otb");
const DAT_PATH = path.resolve(__dirname, "../../data/client/Tibia.dat");
const SPR_PATH = path.resolve(__dirname, "../../data/client/Tibia.spr");

const client = new Client(1231);
const otb = new OtbManager(client);
const dat = new DatManager(client);
const spr = new SprManager(client);

otb.loadOtbFromBuffer(fs.readFileSync(OTB_PATH).buffer);
dat.loadDatFromBuffer(fs.readFileSync(DAT_PATH).buffer);
spr.loadSprFromBuffer(fs.readFileSync(SPR_PATH).buffer);

const item = otb.getItem(1740);

console.log(spr.getSprite(343369));

console.log({
  name: item.getName(),
  clientId: item.getClientId(),
  severId: item.getServerId(),
  sprites: dat.getItem(item.getClientId()).getFrameGroups()[0].spritesIndex,
  sprite: spr.getSprite(343369),
});
