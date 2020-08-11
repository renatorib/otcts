import { SprManager } from "../core/spr/SprManager";
import { DatManager } from "../core/dat/DatManager";
import { OtbManager } from "../core/otb/OtbManager";
import { OtbmManager } from "../core/otbm/OtbmManager";
import { XMLManager } from "../core/xml/XMLManager";
import { EventEmitter } from "./EventEmitter";
import { Clock } from "./Clock";
import { Input } from "./Input";
import { GameMap } from "./GameMap";

const SPR_URL = "http://localhost:5000/client/Tibia.spr";
const DAT_URL = "http://localhost:5000/client/Tibia.dat";
const OTB_URL = "http://localhost:5000/server/items.otb";
const ITEMS_XML_URL = "http://localhost:5000/server/items.xml";
const OTBM_URL = "http://localhost:5000/server/world.otbm";
const SPAWN_XML_URL = "http://localhost:5000/server/world-spawn.xml";
const HOUSE_XML_URL = "http://localhost:5000/server/world-house.xml";
const OUTFITS_XML_URL = "http://localhost:5000/server/outfits.xml";

class Game extends EventEmitter {
  loaded: boolean;
  clock: Clock;
  dat!: DatManager;
  spr!: SprManager;
  otb!: OtbManager;
  otbm!: OtbmManager;
  items!: XMLManager;
  spawn!: XMLManager;
  house!: XMLManager;
  outfits!: XMLManager;
  map!: GameMap;
  input!: Input;

  constructor() {
    super();

    this.loaded = false;

    this.clock = new Clock();

    this.loadAssets();
    this.on("load-assets", () => {
      this.map = GameMap.fromOtbm(this.otbm);
      this.input = new Input();
      this.loaded = true;
      this.emit("load");
    });
  }

  async loadAssets() {
    this.spr = await SprManager.fromUrl(SPR_URL);
    this.dat = await DatManager.fromUrl(DAT_URL);
    this.otb = await OtbManager.fromUrl(OTB_URL);
    this.otbm = await OtbmManager.fromUrl(OTBM_URL);
    this.items = await XMLManager.fromUrl(ITEMS_XML_URL);
    this.spawn = await XMLManager.fromUrl(SPAWN_XML_URL);
    this.house = await XMLManager.fromUrl(HOUSE_XML_URL);
    this.outfits = await XMLManager.fromUrl(OUTFITS_XML_URL);
    this.emit("load-assets");
  }

  isLoaded() {
    return this.loaded;
  }
}

export const game = new Game();
