// import * as PIXI from "pixi.js";
import { Direction } from "../core/common/enums";
import { Cooldown } from "./Cooldown";

export class LocalPlayer {
  states = 0;
  vocation = 0;
  blessings = 0;
  walkLock = new Cooldown();

  skillsLevel = [];
  skillsBaseLevel = [];
  skillsLevelPercent = [];

  health = -1;
  maxHealth = -1;
  freeCapacity = -1;
  totalCapacity = -1;
  experience = -1;
  level = -1;
  levelPercent = -1;
  magicLevel = -1;
  magicLevelPercent = -1;
  baseMagicLevel = -1;
  soul = -1;
  stamina = -1;
  baseSpeed = -1;
  regenerationTime = -1;
  offlineTrainingTime = -1;

  constructor() {}

  canWalk(_direction: Direction) {
    if (this.walkLock.isNotExpired()) return false;
    //
    // do the walk
    //
  }
}
