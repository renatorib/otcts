import * as PIXI from "pixi.js";
import { SprManager } from "../core/spr/SprManager";
import { DatManager } from "../core/dat/DatManager";
import { OtbManager } from "../core/otb/OtbManager";
import { OtbmManager } from "../core/otbm/OtbmManager";
import { XMLManager } from "../core/xml/XMLManager";
import { EventEmitter } from "./EventEmitter";
import { Clock } from "./Clock";
import { Input } from "./Input";
import { GameMap } from "./GameMap";
import { Creature } from "./Creature";
import { Effect } from "./Effect";
import { Direction } from "../core/common/enums";

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
  player = new Creature(1);
  app = new PIXI.Application();

  constructor() {
    super();

    this.loaded = false;
    this.clock = new Clock();
    this.loadAssets();
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
    this.onLoadAssets();
  }

  onLoadAssets() {
    this.map = GameMap.fromOtbm(this.otbm);
    this.input = new Input();
    document.getElementById("app")!.appendChild(this.app.view);

    this.player.outfit.setId(131);
    this.player.outfit.setAddons(3);
    this.player.outfit.setMount(373);

    this.map.getTile([23, 22, 7])?.addCreature(this.player);
    this.map.getTile([23, 22, 7])?.addEffect(new Effect(3));

    this.app.ticker.add(() => {
      const { position } = this.player;
      const displayOffset = this.player.getDisplayOffset();

      this.map.viewport.left = (position.x - 7) * 32 + displayOffset.x;
      this.map.viewport.top = (position.y - 5) * 32 + displayOffset.y;
    });

    this.input.on("walk", (direction: Direction) => {
      const dirDiff: { [k: number]: [number, number, number] } = {
        [Direction.West]: [-1, 0, 0], // left
        [Direction.East]: [+1, 0, 0], // right
        [Direction.North]: [0, -1, 0], // up
        [Direction.South]: [0, +1, 0], // down
        [Direction.NorthWest]: [-1, -1, 0], // up left
        [Direction.NorthEast]: [+1, -1, 0], // up right
        [Direction.SouthWest]: [-1, +1, 0], // down left
        [Direction.SouthEast]: [+1, +1, 0], // down right
      };
      const diff = dirDiff[direction];
      this.player.walkTo(this.player.position.clone().add(...diff));
      this.update();
    });

    this.input.on("turn", (direction: Direction) => {
      this.player.direction = direction;
    });

    this.loaded = true;
    this.emit("load");
    this.update();
  }

  update() {
    this.map.render(this.player.position);
  }

  isLoaded() {
    return this.loaded;
  }
}

export const game = new Game();
