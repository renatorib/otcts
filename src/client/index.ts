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
  const app = new PIXI.Application();
  document.getElementById("app")!.appendChild(app.view);
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  const VIEWPORT_WIDTH = 15 * 32;
  const VIEWPORT_HEIGHT = 11 * 32;

  // create viewport
  app.view.width = VIEWPORT_WIDTH;
  app.view.height = VIEWPORT_HEIGHT;

  const viewport = new Viewport({
    screenWidth: VIEWPORT_WIDTH,
    screenHeight: VIEWPORT_HEIGHT,
    worldWidth: 55 * 32,
    worldHeight: 55 * 32,
    interaction: app.renderer.plugins.interaction,
  });

  app.view.style.width = `${VIEWPORT_WIDTH * 1.5}px`;
  app.view.style.height = `${VIEWPORT_HEIGHT * 1.5}px`;

  // add the viewport to the stage
  app.stage.addChild(viewport);

  viewport.drag({ wheel: false });
  viewport.plugins.pause("drag");
  viewport.decelerate();

  let pressedKeys = new Set();
  document.addEventListener("keydown", (ev) => {
    pressedKeys.add(ev.which);
  });
  document.addEventListener("keyup", (ev) => {
    pressedKeys.has(ev.which) && pressedKeys.delete(ev.which);
  });

  const player = new Creature(1);
  player.outfit.setId(131);
  player.outfit.setAddons(3);
  player.outfit.setMount(373);

  game.map.getTile([23, 22, 7])?.addCreature(player);
  game.map.getTile([23, 22, 7])?.addEffect(new Effect(3));

  update();

  enum Keys {
    Space = 32,
    ArrowRight = 39,
    ArrowUp = 38,
    ArrowLeft = 37,
    ArrowDown = 40,
    Home = 36,
    PageUp = 33,
    PageDown = 34,
    End = 35,
  }

  app.ticker.add(() => {
    const { position } = player;
    const displayOffset = player.getDisplayOffset();

    viewport.left = (position.x - 7) * 32 + displayOffset.x;
    viewport.top = (position.y - 5) * 32 + displayOffset.y;

    const drag = viewport.plugins.get("drag") as Plugin & { paused: boolean };
    if (pressedKeys.has(Keys.Space)) {
      if (drag.paused) {
        drag.resume();
        app.view.style.cursor = "move";
      }
    } else {
      if (!drag.paused) {
        drag.pause();
        app.view.style.cursor = "auto";
      }
    }

    if (player.walking === false) {
      if (pressedKeys.has(Keys.ArrowLeft)) {
        player.walkTo(player.position.clone().add(-1, 0, 0));
        update();
      }
      if (pressedKeys.has(Keys.ArrowRight)) {
        player.walkTo(player.position.clone().add(+1, 0, 0));
        update();
      }
      if (pressedKeys.has(Keys.ArrowUp)) {
        player.walkTo(player.position.clone().add(0, -1, 0));
        update();
      }
      if (pressedKeys.has(Keys.ArrowDown)) {
        player.walkTo(player.position.clone().add(0, +1, 0));
        update();
      }
      if (pressedKeys.has(Keys.Home)) {
        player.walkTo(player.position.clone().add(-1, -1, 0));
        update();
      }
      if (pressedKeys.has(Keys.End)) {
        player.walkTo(player.position.clone().add(-1, +1, 0));
        update();
      }
      if (pressedKeys.has(Keys.PageUp)) {
        player.walkTo(player.position.clone().add(+1, -1, 0));
        update();
      }
      if (pressedKeys.has(Keys.PageDown)) {
        player.walkTo(player.position.clone().add(+1, +1, 0));
        update();
      }
    }
  });

  function update() {
    game.map.render(player.position, viewport);
  }

  Object.assign(globalThis, {
    game: game,
    app,
    viewport,
    pressedKeys,
    PIXI,
  });
};
