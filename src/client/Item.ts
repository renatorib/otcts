import { DatThingCategory, FrameGroupType, FluidsColor } from "../core/common/enums";
import { Thing } from "./Thing";
import { game } from "./Game";
import { draggable } from "./dnd";

export class Item extends Thing {
  count: number = 1;
  category = DatThingCategory.ThingCategoryItem;

  setCount(count: number) {
    this.count = count;
  }

  getCount() {
    return this.count;
  }

  getPatterns() {
    const thingType = this.getThingType();
    const frameGroup = thingType.getFrameGroup(FrameGroupType.Idle);

    let x = 0;
    let y = 0;
    let z = 0;

    if (
      thingType.isStackable() &&
      frameGroup.getNumPatternX() === 4 &&
      frameGroup.getNumPatternY() === 2
    ) {
      if (this.getCount() <= 0) {
        [x, y] = [0, 0];
      } else if (this.getCount() < 5) {
        [x, y] = [this.getCount() - 1, 0];
      } else if (this.getCount() < 10) {
        [x, y] = [0, 1];
      } else if (this.getCount() < 25) {
        [x, y] = [1, 1];
      } else if (this.getCount() < 50) {
        [x, y] = [2, 1];
      } else {
        [x, y] = [3, 1];
      }
    } else if (thingType.isHangable()) {
      // TODO: fix
      [x, y] = [0, 0];
    } else if (thingType.isSplash() || thingType.isFluidContainer()) {
      // TODO: fix
      let color = FluidsColor.Transparent;

      x = (color % 4) % frameGroup.getNumPatternX();
      y = (color / 4) % frameGroup.getNumPatternY();
    } else {
      x = this.position.x % frameGroup.getNumPatternX();
      y = this.position.y % frameGroup.getNumPatternY();
      z = this.position.z % frameGroup.getNumPatternZ();
    }

    return { x, y, z };
  }

  getThingType() {
    return game.dat.getItem(this.clientId);
  }

  onAfterDraw() {
    if (!this.dat.isNotMoveable() || this.dat.isPickupable()) {
      draggable("item", this.display);
    }
  }
}
