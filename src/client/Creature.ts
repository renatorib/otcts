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

export class Creature extends Thing {
  category = DatThingCategory.ThingCategoryCreature;
  outfit: Outfit = new Outfit();
  walking = false;
  walkAnimationPhase = 0;
  walkCooldown = new Cooldown();
  walkBlockCooldown = new Cooldown();
  direction: Direction = Direction.South;
  prevPosition: Position = new Position();

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

  walkTo(to: Position) {
    const currentTile = game.map.getTile(this.position.toCoords());
    const nextTile = game.map.getTile(to.toCoords());

    if (this.walking === true) return false;
    if (this.walkBlockCooldown.isNotExpired()) return false;
    if (!nextTile) return false;
    if (nextTile.isNotWalkable()) return false;

    this.walkCooldown.timeout(250);
    this.walking = true;
    this.useVirtualPosition = true;
    this.direction = this.position.direction(to);
    this.prevPosition = this.position;

    if (this.direction > 3) {
      this.walkBlockCooldown.timeout(500);
    }

    currentTile?.removeCreature(this);
    nextTile.addCreature(this);

    setTimeout(() => {
      currentTile?.draw();
      nextTile.draw();
    }, 50);
  }

  onBeforeUpdate() {
    if (this.walking) {
      if (this.walkCooldown.isNotExpired()) {
        const progress = this.walkCooldown.progress();
        const x = transition(this.prevPosition.x, this.position.x, progress);
        const y = transition(this.prevPosition.y, this.position.y, progress);
        const z = this.prevPosition.z;
        this.virtualPosition.set(x, y, z);
      } else {
        this.walking = false;
        this.useVirtualPosition = false;
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
