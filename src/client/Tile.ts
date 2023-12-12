import * as PIXI from "pixi.js";
import { Item } from "./Item";
import { OtbmTileFlags } from "../core/common/types";
import { OtbmNodeItem } from "../core/otbm/OtbmNodeItem";
import { Creature } from "./Creature";
import { Position } from "../core/structures/Position";
import { game } from "./Game";
import { Effect } from "./Effect";

export class Tile {
  symbol = Symbol("tile");
  drawn = false;
  display!: PIXI.Container;
  position!: Position;
  tileId?: number;
  flags!: OtbmTileFlags;
  items: Item[] = [];
  creatures: Creature[] = [];
  effects = new Set<Effect>();

  constructor(
    position: Position,
    tileId: number,
    flags: OtbmTileFlags,
    nodeItems: OtbmNodeItem[]
  ) {
    this.createDisplay();
    this.setPosition(position);
    this.setFlags(flags);

    const tileOtb = game.otb.getItem(tileId);
    if (tileOtb) {
      const clientTileId = tileOtb.getClientId();
      this.addItem(clientTileId);
    }

    for (let nodeItem of nodeItems) {
      this.addItem(game.otb.getItem(nodeItem.id).getClientId(), nodeItem.count);
    }
  }

  createDisplay() {
    this.display = new PIXI.Container();
    this.display.width = 32;
    this.display.height = 32;
  }

  setPosition(position: Position) {
    this.position = position;
    this.display.position.set(...this.getDisplayPosition());
  }

  setFlags(flags: OtbmTileFlags) {
    this.flags = flags;
  }

  getDisplayPosition() {
    const { x, y, z } = this.position;
    const tileSize = 32;
    return [(x + z - 7) * tileSize, (y + z - 7) * tileSize];
  }

  updateGameObjects() {
    const gameObjects = [];
    this.display.removeChildren();

    let elevation = 0;
    const addElevetion = (amount: number) => {
      elevation = Math.min(24, elevation + amount);
    };

    for (let item of this.items) {
      item.elevation = elevation;
      const itemDisplay = item.draw();
      gameObjects.push(itemDisplay);
      if (item.getThingType().hasElevation()) {
        addElevetion(item.getThingType().getElevation());
      }
    }

    for (let creature of this.creatures) {
      creature.elevation = elevation;
      const creatureDisplay = creature.draw();
      gameObjects.push(creatureDisplay);
    }

    for (let effect of this.effects) {
      effect.elevation = elevation;
      const effectDisplay = effect.draw();
      if (!effect.expired()) {
        gameObjects.push(effectDisplay);
      }
    }

    this.display.addChild(...gameObjects);
    return gameObjects;
  }

  draw() {
    this.updateGameObjects();
    return [this.display];
  }

  addCreature(creature: Creature) {
    creature.position = this.position;
    creature.update();
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
    item.update();
    this.items.push(item);
  }

  addEffect(effect: Effect) {
    effect.position = this.position;
    effect.update();
    this.effects.add(effect);
    /* setTimeout(() => {
      this.effects.delete(effect);
      effect.destroy();
    }, effect.getDuration()); */
  }

  removeEffect(effect: Effect) {
    this.effects.delete(effect);
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
