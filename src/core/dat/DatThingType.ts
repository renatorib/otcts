import { DatThingAttr, DatThingCategory, FrameGroupType, GameFeature } from "../common/enums";
import { Client } from "../structures/Client";
import { FileInput } from "../file/FileInput";
import { FileOutput } from "../file/FileOutput";
import { Color } from "../structures/Color";
import { Size } from "../structures/Size";
import { Point } from "../structures/Point";
import { MarketData } from "../structures/MarketData";
import { Light } from "../structures/Light";

import { Animator } from "./Animator";
import { DatThingTypeAttributes } from "./DatThingTypeAttributes";
import { FrameGroup } from "./FrameGroup";

export class DatThingType {
  static maskColors = [Color.red, Color.green, Color.blue, Color.yellow];

  private category!: DatThingCategory;
  private id: number = 0;
  private null: boolean = true;
  private attribs: DatThingTypeAttributes = new DatThingTypeAttributes();

  private displacement: Point = new Point();
  private elevation: number = 0;

  private frameGroups: FrameGroup[] = [];

  serialize(
    fin: FileOutput,
    category: DatThingCategory,
    client: Client,
    clientAttributeTranslator: any, // TODO: type
  ) {
    for (let clientAttrString in clientAttributeTranslator) {
      if (clientAttributeTranslator.hasOwnProperty(clientAttrString)) {
        let clientDatAttr = parseInt(clientAttrString);
        let thingAttr = parseInt(clientAttributeTranslator[clientDatAttr]);
        if (!this.hasAttr(thingAttr)) continue;

        fin.addU8(clientDatAttr);
        switch (thingAttr) {
          case DatThingAttr.ThingAttrDisplacement: {
            if (client.getClientVersion() >= 755) {
              fin.addU16(this.displacement.x);
              fin.addU16(this.displacement.y);
            }
            break;
          }
          case DatThingAttr.ThingAttrLight: {
            const light: Light = this.attribs.get(thingAttr);
            fin.addU16(light.intensity);
            fin.addU16(light.color);
            break;
          }
          case DatThingAttr.ThingAttrMarket: {
            const market: MarketData = this.attribs.get(thingAttr);
            fin.addU16(market.category);
            fin.addU16(market.tradeAs);
            fin.addU16(market.showAs);
            fin.addString(market.name);
            fin.addU16(market.restrictVocation);
            fin.addU16(market.requiredLevel);
            break;
          }
          case DatThingAttr.ThingAttrUsable:
          case DatThingAttr.ThingAttrElevation:
          case DatThingAttr.ThingAttrGround:
          case DatThingAttr.ThingAttrWritable:
          case DatThingAttr.ThingAttrWritableOnce:
          case DatThingAttr.ThingAttrMinimapColor:
          case DatThingAttr.ThingAttrCloth:
          case DatThingAttr.ThingAttrLensHelp:
            fin.addU16(this.attribs.get(thingAttr));
            break;
          default:
            break;
        }
      }
    }
    fin.addU8(DatThingAttr.ThingLastAttr);

    let hasFrameGroups =
      category == DatThingCategory.ThingCategoryCreature &&
      client.getFeature(GameFeature.GameIdleAnimations);
    if (hasFrameGroups) fin.addU8(this.frameGroups.length);

    for (let frameGroupType in this.frameGroups) {
      if (hasFrameGroups) fin.addU8(Number(frameGroupType));

      const frameGroup = this.frameGroups[frameGroupType];
      fin.addU8(frameGroup.size.width());
      fin.addU8(frameGroup.size.height());

      if (frameGroup.size.width() > 1 || frameGroup.size.height() > 1)
        fin.addU8(frameGroup.realSize);

      fin.addU8(frameGroup.layers);
      fin.addU8(frameGroup.numPatternX);
      fin.addU8(frameGroup.numPatternY);
      if (client.getClientVersion() >= 755) fin.addU8(frameGroup.numPatternZ);
      fin.addU8(frameGroup.animationPhases);

      if (client.getFeature(GameFeature.GameEnhancedAnimations)) {
        if (frameGroup.animationPhases > 1 && frameGroup.animator != null) {
          frameGroup.animator.serialize(fin);
        }
      }

      for (let i2 = 0; i2 < frameGroup.spritesIndex.length; i2++) {
        if (client.getFeature(GameFeature.GameSpritesU32)) fin.addU32(frameGroup.spritesIndex[i2]);
        else fin.addU16(frameGroup.spritesIndex[i2]);
      }
    }
  }

  unserialize(
    clientId: number,
    category: DatThingCategory,
    fin: FileInput,
    client: Client,
    clientTranslationArray: any[],
  ) {
    this.null = false;
    this.id = clientId;
    this.category = category;

    let count = 0;
    let attr = -1;
    let done = false;
    for (let i = 0; i < DatThingAttr.ThingLastAttr; ++i) {
      count++;
      attr = fin.getU8();
      if (attr == DatThingAttr.ThingLastAttr) {
        done = true;
        break;
      }

      attr = clientTranslationArray[attr];
      switch (attr) {
        case DatThingAttr.ThingAttrDisplacement: {
          this.displacement = new Point(0, 0);
          if (client.getClientVersion() >= 755) {
            this.displacement.x = fin.getU16();
            this.displacement.y = fin.getU16();
          } else {
            this.displacement.x = 8;
            this.displacement.y = 8;
          }
          this.attribs.set(attr, true);
          break;
        }
        case DatThingAttr.ThingAttrLight: {
          let light = new Light();
          light.intensity = fin.getU16();
          light.color = fin.getU16();
          this.attribs.set(attr, light);
          break;
        }
        case DatThingAttr.ThingAttrMarket: {
          let market = new MarketData();
          market.category = fin.getU16();
          market.tradeAs = fin.getU16();
          market.showAs = fin.getU16();
          market.name = fin.getString();
          market.restrictVocation = fin.getU16();
          market.requiredLevel = fin.getU16();
          this.attribs.set(attr, market);
          break;
        }
        case DatThingAttr.ThingAttrElevation: {
          this.elevation = fin.getU16();
          this.attribs.set(attr, this.elevation);
          break;
        }
        case DatThingAttr.ThingAttrUsable:
        case DatThingAttr.ThingAttrGround:
        case DatThingAttr.ThingAttrWritable:
        case DatThingAttr.ThingAttrWritableOnce:
        case DatThingAttr.ThingAttrMinimapColor:
        case DatThingAttr.ThingAttrCloth:
        case DatThingAttr.ThingAttrLensHelp:
          this.attribs.set(attr, fin.getU16());
          break;
        default:
          this.attribs.set(attr, true);
          break;
      }
    }

    if (!done)
      console.error(
        `corrupt data (id: ${this.id}, category: ${this.category}, count: ${count}, lastAttr: ${attr})`,
      );

    let hasFrameGroups =
      category == DatThingCategory.ThingCategoryCreature &&
      client.getFeature(GameFeature.GameIdleAnimations);
    let groupCount = hasFrameGroups ? fin.getU8() : 1;

    for (let i = 0; i < groupCount; ++i) {
      let frameGroupType =
        category == DatThingCategory.ThingCategoryCreature
          ? FrameGroupType.Walking
          : FrameGroupType.Idle;
      if (hasFrameGroups) frameGroupType = fin.getU8();

      const frameGroup = new FrameGroup();

      let width = fin.getU8();
      let height = fin.getU8();
      frameGroup.size = new Size(width, height);
      if (width > 1 || height > 1) {
        frameGroup.realSize = fin.getU8();
        frameGroup.exactSize = Math.min(frameGroup.realSize, Math.max(width * 32, height * 32));
      } else frameGroup.exactSize = 32;

      frameGroup.layers = fin.getU8();
      frameGroup.numPatternX = fin.getU8();
      frameGroup.numPatternY = fin.getU8();
      if (client.getClientVersion() >= 755) frameGroup.numPatternZ = fin.getU8();
      else frameGroup.numPatternZ = 1;

      let groupAnimationsPhases = fin.getU8();
      frameGroup.animationPhases = groupAnimationsPhases;

      if (groupAnimationsPhases > 1 && client.getFeature(GameFeature.GameEnhancedAnimations)) {
        frameGroup.animator = new Animator();
        frameGroup.animator.unserialize(groupAnimationsPhases, fin);
      }

      let totalSprites =
        frameGroup.size.area() *
        frameGroup.layers *
        frameGroup.numPatternX *
        frameGroup.numPatternY *
        frameGroup.numPatternZ *
        groupAnimationsPhases;

      if (totalSprites > 4096)
        console.error(
          "a thing type has more than 4096 sprites",
          totalSprites,
          frameGroup.size.area(),
          frameGroup.layers,
          frameGroup.numPatternX,
          frameGroup.numPatternY,
          frameGroup.numPatternZ,
          groupAnimationsPhases,
        );

      frameGroup.spritesIndex = [];
      for (let i = 0; i < totalSprites; i++) {
        frameGroup.spritesIndex[i] = client.getFeature(GameFeature.GameSpritesU32)
          ? fin.getU32()
          : fin.getU16();
      }

      //console.log('spr', this.spritesIndex);

      this.frameGroups[frameGroupType] = frameGroup;
    }
  }

  getId(): number {
    return this.id;
  }

  getCategory(): DatThingCategory {
    return this.category;
  }

  isNull(): boolean {
    return this.null;
  }

  hasAttr(attr: DatThingAttr): boolean {
    return this.attribs.has(attr);
  }

  getDisplacement(): Point {
    return this.displacement;
  }

  getDisplacementX(): number {
    return this.getDisplacement().x;
  }

  getDisplacementY(): number {
    return this.getDisplacement().y;
  }

  getElevation(): number {
    return this.elevation;
  }

  getFrameGroups(): FrameGroup[] {
    return this.frameGroups;
  }

  getFrameGroup(frameGroupType: FrameGroupType): FrameGroup {
    return this.frameGroups[frameGroupType];
  }

  getGroundSpeed(): number {
    return this.attribs.get(DatThingAttr.ThingAttrGround);
  }

  getMaxTextLength(): number {
    return this.attribs.has(DatThingAttr.ThingAttrWritableOnce)
      ? this.attribs.get(DatThingAttr.ThingAttrWritableOnce)
      : this.attribs.get(DatThingAttr.ThingAttrWritable);
  }

  getLight(): Light {
    return this.attribs.get(DatThingAttr.ThingAttrLight);
  }

  getMinimapColor(): number {
    return this.attribs.get(DatThingAttr.ThingAttrMinimapColor);
  }

  getLensHelp(): number {
    return this.attribs.get(DatThingAttr.ThingAttrLensHelp);
  }

  getClothSlot(): number {
    return this.attribs.get(DatThingAttr.ThingAttrCloth);
  }

  getMarketData(): MarketData {
    return this.attribs.get(DatThingAttr.ThingAttrMarket);
  }

  isGround(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrGround);
  }

  isGroundBorder(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrGroundBorder);
  }

  isOnBottom(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrOnBottom);
  }

  isOnTop(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrOnTop);
  }

  isContainer(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrContainer);
  }

  isStackable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrStackable);
  }

  isForceUse(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrForceUse);
  }

  isMultiUse(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrMultiUse);
  }

  isWritable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrWritable);
  }

  isChargeable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrChargeable);
  }

  isWritableOnce(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrWritableOnce);
  }

  isFluidContainer(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrFluidContainer);
  }

  isSplash(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrSplash);
  }

  isNotWalkable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrNotWalkable);
  }

  isNotMoveable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrNotMoveable);
  }

  blockProjectile(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrBlockProjectile);
  }

  isNotPathable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrNotPathable);
  }

  isPickupable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrPickupable);
  }

  isHangable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrHangable);
  }

  isHookSouth(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrHookSouth);
  }

  isHookEast(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrHookEast);
  }

  isRotateable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrRotateable);
  }

  hasLight(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrLight);
  }

  isDontHide(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrDontHide);
  }

  isTranslucent(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrTranslucent);
  }

  hasDisplacement(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrDisplacement);
  }

  hasElevation(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrElevation);
  }

  isLyingCorpse(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrLyingCorpse);
  }

  isAnimateAlways(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrAnimateAlways);
  }

  hasMiniMapColor(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrMinimapColor);
  }

  hasLensHelp(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrLensHelp);
  }

  isFullGround(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrFullGround);
  }

  isIgnoreLook(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrLook);
  }

  isCloth(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrCloth);
  }

  isMarketable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrMarket);
  }

  isUsable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrUsable);
  }

  isWrapable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrWrapable);
  }

  isUnwrapable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrUnwrapable);
  }

  isTopEffect(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrTopEffect);
  }

  isNotPreWalkable(): boolean {
    return this.attribs.has(DatThingAttr.ThingAttrNotPreWalkable);
  }

  setPathable(v: boolean) {
    if (v == true) this.attribs.remove(DatThingAttr.ThingAttrNotPathable);
    else this.attribs.set(DatThingAttr.ThingAttrNotPathable, true);
  }

  getBestTextureDimension(w: number, h: number, count: number): Size {
    const MAX = 32;

    let k = 1;
    while (k < w) k <<= 1;
    w = k;

    k = 1;
    while (k < h) k <<= 1;
    h = k;

    let numSprites = w * h * count;
    /*
        assert(numSprites <= MAX*MAX);
        assert(w <= MAX);
        assert(h <= MAX);
        */
    let bestDimension = new Size(MAX, MAX);
    for (let i = w; i <= MAX; i <<= 1) {
      for (let j = h; j <= MAX; j <<= 1) {
        let candidateDimension = new Size(i, j);
        if (candidateDimension.area() < numSprites) continue;
        if (
          candidateDimension.area() < bestDimension.area() ||
          (candidateDimension.area() == bestDimension.area() &&
            candidateDimension.width() + candidateDimension.height() <
              bestDimension.width() + bestDimension.height())
        )
          bestDimension = candidateDimension;
      }
    }

    return bestDimension;
  }
}
