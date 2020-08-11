import { Animator } from "./Animator";
import { Size } from "../structures/Size";
import { FrameGroupType } from "../common/enums";

export class FrameGroup {
  size: Size = new Size();
  animator: Animator | null = null;
  animationPhases: number = 0;
  exactSize: number = 0;
  realSize: number = 0;
  numPatternX: number = 0;
  numPatternY: number = 0;
  numPatternZ: number = 0;
  layers: number = 0;
  spritesIndex: number[] = [];

  isAnimated() {
    return this.getAnimationPhases() > 1;
  }

  isPatterned() {
    return (
      this.getNumPatternX() > 1 ||
      this.getNumPatternY() > 1 ||
      this.getNumPatternZ() > 1
    );
  }

  isLarge() {
    return this.getWidth() > 1 || this.getHeight() > 1;
  }

  getSize(): Size {
    return this.size;
  }

  getWidth(): number {
    return this.size.width();
  }

  getHeight(): number {
    return this.size.height();
  }

  getRealSize(): number {
    return this.realSize;
  }

  getLayers(): number {
    return this.layers;
  }

  getNumPatternX(): number {
    return this.numPatternX;
  }

  getNumPatternY(): number {
    return this.numPatternY;
  }

  getNumPatternZ(): number {
    return this.numPatternZ;
  }

  getAnimationPhases(): number {
    return this.animationPhases;
  }

  getAnimator(): Animator | null {
    return this.animator;
  }

  getSprites(): number[] {
    return this.spritesIndex;
  }

  getSprite(index: number): number {
    return this.spritesIndex[index];
  }

  getSpriteIndex({
    xPattern = 0,
    yPattern = 0,
    zPattern = 0,
    a = 1,
    h = 1,
    w = 1,
    l = 1,
  }: {
    xPattern?: number;
    yPattern?: number;
    zPattern?: number;
    a?: number;
    h?: number;
    w?: number;
    l?: number;
  }): number {
    const animationPhaseIndex = a % this.animationPhases;
    const layerIndex = l % this.layers;
    const heightIndex = h % this.size.height();
    const widthIndex = w % this.size.width();

    // prettier-ignore
    const index =
      (((((animationPhaseIndex
        * this.numPatternZ + zPattern)
        * this.numPatternY + yPattern) 
        * this.numPatternX + xPattern) 
        * this.layers + layerIndex) 
        * this.size.height() + heightIndex)
        * this.size.width() + widthIndex;

    if (index > this.spritesIndex.length) {
      throw new Error(
        "[FrameGroup::getSpriteIndex] index value offset spritesIndex"
      );
    }

    return index;
  }

  /* getTextureIndex(l: number, x: number, y: number, z: number) {
    return (
      ((l * this.numPatternZ + z) * this.numPatternY + y) * this.numPatternX + x
    );
  } */
}
