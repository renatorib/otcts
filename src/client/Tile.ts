import * as PIXI from "pixi.js";
import { Item } from "./Item";
import { OtbmTileFlags } from "../core/common/types";
import { OtbmNodeItem } from "../core/otbm/OtbmNodeItem";
import { Creature } from "./Creature";
import { Position } from "../core/structures/Position";
import { game } from "./Game";

export class Tile {
  position: Position;
  tileId?: number;
  flags: OtbmTileFlags;
  items: Item[] = [];
  creatures: Creature[] = [];
  gameObjects: PIXI.DisplayObject[] = [];

  constructor(
    position: Position,
    tileId: number,
    flags: OtbmTileFlags,
    nodeItems: OtbmNodeItem[]
  ) {
    this.position = position;
    this.flags = flags;

    const tileOtb = game.otb.getItem(tileId);
    if (tileOtb) {
      const clientTileId = tileOtb.getClientId();
      this.addItem(clientTileId);
    }

    for (let nodeItem of nodeItems) {
      this.addItem(game.otb.getItem(nodeItem.id).getClientId(), nodeItem.count);
    }
  }

  draw() {
    let elevation = 0;
    const addElevetion = (amount: number) => {
      elevation = Math.min(24, elevation + amount);
    };

    for (let item of this.items) {
      item.elevation = elevation;
      const itemDisplay = item.draw();
      this.gameObjects.push(itemDisplay);
      if (item.getThingType().hasElevation()) {
        addElevetion(item.getThingType().getElevation());
      }
    }

    for (let creature of this.creatures) {
      creature.elevation = elevation;
      const creatureDisplay = creature.draw();
      this.gameObjects.push(creatureDisplay);
    }

    return this.gameObjects;
  }

  addCreature(creature: Creature) {
    creature.position = this.position;
    this.creatures.push(creature);
  }

  removeCreature(creature: Creature) {
    const _creature = this.creatures.find((c) => c.symbol === creature.symbol);
    this.creatures.splice(this.creatures.indexOf(_creature!), 1);
  }

  addItem(clientId: number, count?: number) {
    const item = new Item(clientId);
    item.position = this.position.clone();
    if (count) item.setCount(count);
    this.items.push(item);
  }

  getItems() {
    return this.items;
  }

  isProtectionZone(): boolean {
    return this.flags.protection;
  }

  isNoLogoutZone(): boolean {
    return this.flags.noLogout;
  }

  isNotWalkable() {
    return !!this.items.find((item) => item.getThingType().isNotWalkable());
  }
}
