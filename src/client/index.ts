import * as PIXI from "pixi.js";
import { Viewport, Plugin } from "pixi-viewport";

import { game } from "./Game";
import { Creature } from "./Creature";
import { Position } from "../core/structures/Position";
import { Effect } from "./Effect";

export const main = () => {
  game.on("load", start);
};

const start = async () => {
  Object.assign(globalThis, {
    game: game,
    PIXI,
  });
};
