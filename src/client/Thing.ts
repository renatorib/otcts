import * as PIXI from "pixi.js";
import { DatThingCategory, FrameGroupType } from "../core/common/enums";
import { DatThingType } from "../core/dat/DatThingType";
import { Position } from "../core/structures/Position";
import { Sprite } from "../core/spr/Sprite";
import { Size } from "../core/structures/Size";
import { Point } from "../core/structures/Point";
import { Cache } from "./Cache";
import { game } from "./Game";

const flat = (val: number | number[]) => (Array.isArray(val) ? val : [val]);

export abstract class Thing {
  symbol = Symbol("thing");
  drawn = false;
  clientId: number;
  useVirtualPosition = false;
  virtualPosition = new Position();
  position = new Position();
  display = new PIXI.Sprite();
  elevation = 0;
  textures = new Cache();

  constructor(clientId: number) {
    this.clientId = clientId;
  }

  abstract category: DatThingCategory;

  abstract getThingType(): DatThingType;

  // Each subtype have your own rules about x, y and z patterns
  abstract getPatterns(): {
    x: number | number[];
    y: number | number[];
    z: number | number[];
  };

  get dat() {
    return this.getThingType();
  }

  get frameGroup() {
    return this.dat.getFrameGroup(this.getFrameGroupType());
  }

  isItem() {
    return this.category === DatThingCategory.ThingCategoryItem;
  }

  isCreature() {
    return this.category === DatThingCategory.ThingCategoryCreature;
  }

  isEffect() {
    return this.category === DatThingCategory.ThingCategoryEffect;
  }

  isMissile() {
    return this.category === DatThingCategory.ThingCategoryMissile;
  }

  getFrameGroupType() {
    return FrameGroupType.Idle;
  }

  getLayersBlend(layers: Sprite[]) {
    return layers[0];
  }

  getPhaseSprite(animationPhase: number) {
    const tileSize = 32;
    const width = this.frameGroup.getWidth(); // width is measured in number of tiles
    const height = this.frameGroup.getHeight(); // height is measured in number of tiles
    const { x: xPatterns, y: yPatterns, z: zPatterns } = this.getPatterns();

    let layers = [];
    for (let l = 0; l < this.frameGroup.layers; l++) {
      const sprite = new Sprite(new Size(width * tileSize, height * tileSize));
      // loop over height * width parts and build full sprite like a puzzle
      for (let w = 1; w <= width; w++) {
        for (let h = 1; h <= height; h++) {
          for (const xPattern of flat(xPatterns)) {
            for (const yPattern of flat(yPatterns)) {
              for (const zPattern of flat(zPatterns)) {
                const a = animationPhase;
                const pattern = { xPattern, yPattern, zPattern, h, w, l, a };
                const spriteIndex = this.frameGroup.getSpriteIndex(pattern);
                const spriteId = this.frameGroup.getSprite(spriteIndex);
                const spritePart = game.spr.getSprite(spriteId);
                if (spritePart) {
                  sprite.blit(
                    new Point((w - 1) * tileSize, (h - 1) * tileSize),
                    spritePart
                  );
                }
              }
            }
          }
        }
      }

      layers.push(sprite);
    }

    return this.getLayersBlend(layers);
  }

  getCurrentPhase() {
    return this.frameGroup.animator
      ? this.frameGroup.animator.getCurrentPhase(game.clock.elapsed())
      : 0;
  }

  getSprite(): Sprite {
    return this.getPhaseSprite(this.getCurrentPhase());
  }

  getDisplayTexture(): PIXI.Texture {
    const phase = this.getCurrentPhase();
    const frameGroupType = this.getFrameGroupType();
    const { x, y, z } = this.getPatterns();

    // create texture object for sprite phase and cache it
    // (since always will be the same for the same phase)
    const cacheKeys = { phase, frameGroupType, x, y, z };

    if (!this.textures.has(cacheKeys)) {
      const sprite = this.getSprite();
      this.textures.set(
        cacheKeys,
        PIXI.Texture.fromBuffer(
          sprite.getUint8Array(),
          sprite.getWidth(),
          sprite.getHeight()
        )
      );
    }

    return this.textures.get(cacheKeys);
  }

  getWorldDisplayPosition(): [number, number] {
    const { x, y, z } = this.useVirtualPosition
      ? this.virtualPosition
      : this.position;

    const tileSize = 32;
    const width = this.frameGroup.getWidth();
    const height = this.frameGroup.getHeight();
    const displacement = this.dat.getDisplacement();

    return [
      (x - width + z - 6) * tileSize - this.elevation - displacement.x,
      (y - height + z - 6) * tileSize - this.elevation - displacement.y,
    ];
  }

  getTileDisplayPosition(): [number, number] {
    const tileSize = 32;
    const width = this.frameGroup.getWidth();
    const height = this.frameGroup.getHeight();
    const displacement = this.dat.getDisplacement();

    return [
      -((width - 1) * tileSize) - this.elevation - displacement.x,
      -((height - 1) * tileSize) - this.elevation - displacement.y,
    ];
  }

  getDisplayPosition(): [number, number] {
    // return this.getWorldDisplayPosition();
    return this.getTileDisplayPosition();
  }

  onBeforeDraw() {}
  onAfterDraw() {}
  onBeforeUpdate() {}
  onAfterUpdate() {}
  onBeforeDestroy() {}
  onAfterDestroy() {}

  update() {
    this.onBeforeUpdate();

    const [x, y] = this.getDisplayPosition();
    const texture = this.getDisplayTexture();

    if (this.display.texture !== texture) {
      this.display.texture = texture;
    }

    if (this.display.position.x !== x || this.display.position.y !== y) {
      this.display.position.set(x, y);
    }

    this.onAfterUpdate();
  }

  draw() {
    if (!this.drawn) {
      this.onBeforeDraw();

      /* Look on item */
      this.display.interactive = true;
      this.display.on("rightdown", (event: any) => {
        event.data.originalEvent.preventDefault();
        event.data.originalEvent.stopPropagation();
        console.log(event);
      });

      /* this.display.on("mouseover", (event: any) => {
        console.log(this.display.tint);
        this.display.tint = 0x666666;
      });

      this.display.on("mouseout", () => {
        this.display.tint = 0xffffff;
      }); */

      const tileSize = 32;
      const width = this.frameGroup.getWidth();
      const height = this.frameGroup.getHeight();

      this.display.width = width * tileSize;
      this.display.height = height * tileSize;

      PIXI.Ticker.shared.add(this.update, this, PIXI.UPDATE_PRIORITY.HIGH);
      this.drawn = true;

      this.onAfterDraw();
    }

    return this.display;
  }

  destroy() {
    this.onBeforeDestroy();

    PIXI.Ticker.shared.remove(this.update, this);

    this.onAfterDestroy();
  }
}
