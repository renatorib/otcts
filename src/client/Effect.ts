import { Thing } from "./Thing";
import { DatThingCategory } from "../core/common/enums";
import { game } from "./Game";

export class Effect extends Thing {
  category = DatThingCategory.ThingCategoryEffect;
  startTime: number;

  constructor(clientId: number) {
    super(clientId);
    this.startTime = game.clock.elapsed();
  }

  getElapsedTime() {
    return game.clock.elapsed() - this.startTime;
  }

  expired() {
    const duration = this.frameGroup.animator?.getDuration() || 200;
    return this.getElapsedTime() >= duration;
  }

  canBeDeleted() {
    if (this.expired()) {
      return true;
    }

    return false;
  }

  getPatterns() {
    const x = 0; // TODO: understand pattern x in effects
    const y = 0; // TODO: understand pattern y in effects
    const z = 0; // z is always 0

    return { x, y, z };
  }

  getThingType() {
    return game.dat.getEffect(this.clientId);
  }
}
