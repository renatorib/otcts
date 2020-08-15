import { Position } from "../core/structures/Position";
import { game } from "./Game";
import {
  DatThingCategory,
  Direction,
  FrameGroupType,
} from "../core/common/enums";
import { transition } from "../core/common/helpers";
import { Outfit } from "../core/structures/Outfit";
import { Thing } from "./Thing";
import { Sprite } from "../core/spr/Sprite";
import { Cooldown } from "./Cooldown";
import { Point } from "../core/structures/Point";

export class Creature extends Thing {
  category = DatThingCategory.ThingCategoryCreature;
  outfit: Outfit = new Outfit();
  walking = false;
  walkAnimationPhase = 0;
  walkCooldown = new Cooldown();
  walkBlockCooldown = new Cooldown();
  direction: Direction = Direction.South;
  prevPosition: Position = new Position();
  nextPosition: Position = new Position();
  mount!: Creature;

  getFrameGroupType() {
    return this.walking ? FrameGroupType.Walking : FrameGroupType.Idle;
  }

  getLayersBlend(layers: Sprite[]) {
    if (layers.length === 1) return layers[0];

    const sprite = layers[0];
    const template = layers[1];

    sprite.colorize(
      template,
      this.outfit.bodyColor, // red = body
      this.outfit.legsColor, // green = legs
      this.outfit.feetColor, // blue = feet
      this.outfit.headColor // yellow = head
    );

    return sprite;
  }

  getPatterns() {
    let x: number | number[] = 0; // direction
    let z: number | number[] = 0; // mount
    let y: number | number[] = 0; // addons

    // outfit x pattern is based on creature direction
    // the x pattern index matches Direction enum values for the directions
    // creature is always rotated to east/west in the diagonal directions
    switch (this.direction) {
      case Direction.NorthEast:
      case Direction.SouthEast:
      case Direction.East:
        x = Direction.East;
        break;
      case Direction.NorthWest:
      case Direction.SouthWest:
      case Direction.West:
        x = Direction.West;
        break;
      case Direction.South:
      case Direction.North:
        x = this.direction;
        break;
    }

    // outfit z pattern is based on mounted or not
    // 0 = unmounted
    // 1 = mounted
    if (this.outfit.getMount() !== 0) {
      z = 1;
    }

    // outfit x pattern is based on addons
    // each y pattern index represents an addon part (that will overlap basic outfit), thats why we need an array
    // 0 = real outfit
    // 1 = addon 1 part
    // 2 = addon 2 part
    switch (this.outfit.getAddons()) {
      case 1:
        y = [0, 1];
        break;
      case 2:
        y = [0, 2];
        break;
      case 3:
        y = [0, 1, 2];
        break;
      default:
        y = 0;
    }

    return { x, z, y };
  }

  getDisplayDisplacement() {
    if (this.outfit.getMount() > 0) {
      return game.dat.getCreature(this.outfit.getMount()).getDisplacement();
    }

    return this.getThingType().getDisplacement();
  }

  getDisplayOffset() {
    if (this.walkCooldown.isNotExpired()) {
      const progress = this.walkCooldown.progress();
      if (this.position.equals(this.prevPosition)) {
        const xDiff = this.nextPosition.x - this.position.x;
        const yDiff = this.nextPosition.y - this.position.y;
        const x = transition(0, xDiff, progress);
        const y = transition(0, yDiff, progress);
        return new Point(x * 32, y * 32);
      } else if (this.position.equals(this.nextPosition)) {
        const xDiff = this.prevPosition.x - this.position.x;
        const yDiff = this.prevPosition.y - this.position.y;
        const x = transition(xDiff, 0, progress);
        const y = transition(yDiff, 0, progress);
        return new Point(x * 32, y * 32);
      }
    }

    return new Point(0, 0);
  }

  processSprite(sprite: Sprite) {
    this.mount = new Creature(0);
    this.mount.outfit.setId(this.outfit.getMount());
    this.mount.position = this.position;
    this.mount.walking = this.walking;
    this.mount.walkBlockCooldown = this.walkBlockCooldown;
    this.mount.walkCooldown = this.walkCooldown;
    this.mount.direction = this.direction;

    const mountSprite = this.mount.getSprite();
    mountSprite.blit(new Point(0, 0), sprite);
    return mountSprite;
  }

  walkTo(to: Position) {
    const currentTile = game.map.getTile(this.position.toCoords());
    const nextTile = game.map.getTile(to.toCoords());

    if (this.walking === true) return false;
    if (this.walkBlockCooldown.isNotExpired()) return false;
    if (!nextTile) return false;
    if (nextTile.isNotWalkable()) return false;

    this.walkCooldown.timeout(250);
    this.walking = true;
    this.direction = this.position.direction(to);
    this.prevPosition = this.position;
    this.nextPosition = to;

    if (this.direction > 3) {
      this.walkBlockCooldown.timeout(500);
    }

    currentTile?.removeCreature(this);
    nextTile.addCreature(this);
    currentTile?.draw();
    nextTile.draw();
  }

  onBeforeUpdate() {
    if (this.walking) {
      if (this.walkCooldown.isNotExpired()) {
      } else {
        this.walking = false;
      }
    }
  }

  getCurrentPhase() {
    if (this.walking) {
      return Math.round(
        transition(
          1,
          this.frameGroup.getAnimationPhases(),
          this.walkCooldown.progress()
        )
      );
    }

    return super.getCurrentPhase();
  }

  getThingType() {
    return game.dat.getCreature(this.outfit.getId());
  }
}
