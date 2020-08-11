import { Thing } from "./Thing";
import { DatThingCategory } from "../core/common/enums";
import { game } from "./Game";

export class Effect extends Thing {
  category = DatThingCategory.ThingCategoryEffect;

  constructor(clientId: number) {
    super(clientId);

    setTimeout(() => {
      game.map.getTile(this.position.toCoords())?.removeEffect(this);
    }, this.frameGroup.getAnimator()?.getDuration());
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
