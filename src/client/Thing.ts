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

  getElapsedTime() {
    return game.clock.elapsed();
  }

  getCurrentPhase() {
    return this.frameGroup.animator
      ? this.frameGroup.animator.getCurrentPhase(this.getElapsedTime())
      : 0;
  }

  getSprite(): Sprite {
    return this.getPhaseSprite(this.getCurrentPhase());
  }

  processSprite(sprite: Sprite) {
    return sprite;
  }

  getDisplayTexture(): PIXI.Texture {
    const phase = this.getCurrentPhase();
    const frameGroupType = this.getFrameGroupType();
    const { x, y, z } = this.getPatterns();

    // create texture object for sprite phase and cache it
    // (since always will be the same for the same phase)
    const cacheKeys = { phase, frameGroupType, x, y, z };

    if (!this.textures.has(cacheKeys)) {
      const sprite = this.processSprite(this.getSprite());
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

  getDisplayDisplacement(): Point {
    return this.dat.getDisplacement();
  }

  getDisplayOffset(): Point {
    return new Point(0, 0);
  }

  getDisplayPosition(): Point {
    const tileSize = 32;
    const width = this.frameGroup.getWidth();
    const height = this.frameGroup.getHeight();
    const displacement = this.getDisplayDisplacement();
    const displayOffset = this.getDisplayOffset();

    const point = new Point(
      -((width - 1) * tileSize) - this.elevation - displacement.x,
      -((height - 1) * tileSize) - this.elevation - displacement.y
    );

    return point.add(displayOffset);
  }

  onBeforeDraw() {}
  onAfterDraw() {}
  onBeforeUpdate() {}
  onAfterUpdate() {}
  onBeforeDestroy() {}
  onAfterDestroy() {}

  update() {
    this.onBeforeUpdate();

    if (this.canBeDeleted()) {
      this.destroy();
    } else {
      const position = this.getDisplayPosition();
      const texture = this.getDisplayTexture();

      if (this.display.texture !== texture) {
        this.display.texture = texture;
      }

      if (
        this.display.position.x !== position.x ||
        this.display.position.y !== position.y
      ) {
        this.display.position.set(position.x, position.y);
      }
    }

    this.onAfterUpdate();
  }

  draw() {
    if (!this.drawn) {
      this.onBeforeDraw();

      /* Look on item */
      /* this.display.interactive = true;
      this.display.on("rightdown", (event: any) => {
        event.data.originalEvent.preventDefault();
        event.data.originalEvent.stopPropagation();
        console.log(event);
      }); */

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

    this.display.destroy();
    PIXI.Ticker.shared.remove(this.update, this);

    this.onAfterDestroy();
  }

  canBeDeleted() {
    return false;
  }
}
