import { FileInput } from "../file/FileInput";
import { Sprite } from "./Sprite";
import { Client } from "../structures/Client";
import { GameFeature } from "../common/enums";
import { Size } from "../structures/Size";
import { FileOutput } from "../file/FileOutput";

export class SprManager {
  public static SPRITE_SIZE = 32;
  public static SPRITE_DATA_SIZE = SprManager.SPRITE_SIZE * SprManager.SPRITE_SIZE * 4;

  private signature = 0;
  private spritesCount = 0;
  private spritesOffset = 0;
  private sprFile!: FileInput | null;
  private sprites: Sprite[] = [];

  constructor(public client: Client) {}

  static fromUrl = async (url: string, clientVersion: number = 1200) => {
    const fin = await FileInput.fromUrl(url);
    if (fin) return SprManager.fromFileInput(fin, clientVersion);
    return new SprManager(new Client(clientVersion));
  };

  static fromFileInput = (fin: FileInput, clientVersion: number = 1200) => {
    const spr = new SprManager(new Client(clientVersion));
    spr.setSprFile(fin);
    return spr;
  };

  setSprFile(sprFile: FileInput): boolean {
    this.sprFile = sprFile;
    this.signature = 0;
    this.spritesCount = 0;
    this.spritesOffset = 0;
    try {
      this.signature = sprFile.getU32();
      this.spritesCount = this.client.getFeature(GameFeature.GameSpritesU32)
        ? sprFile.getU32()
        : sprFile.getU16();
      this.spritesOffset = sprFile.tell();
      return true;
    } catch {
      console.error("Failed to preload sprites");
      this.sprFile = null;
      return false;
    }
  }

  loadSprite(id: number): boolean {
    if (!this.sprFile) {
      return false;
    }

    if (typeof this.sprites[id] !== "undefined") {
      return true;
    }

    try {
      this.sprFile.seek((id - 1) * 4 + this.spritesOffset);
      const spriteAddress = this.sprFile.getU32();
      if (spriteAddress === 0) return false;
      this.sprFile.seek(spriteAddress);
      const sprite = new Sprite(new Size(SprManager.SPRITE_SIZE, SprManager.SPRITE_SIZE));
      sprite.readFromSpr(this.sprFile, this.client);
      this.sprites[id] = sprite;
      return true;
    } catch {
      return false;
    }
  }

  loadSprFromBuffer(buffer: ArrayBuffer) {
    return this.loadSpr(new FileInput(buffer));
  }

  loadSpr(sprFile: FileInput): boolean {
    // it may take a while (seriously, like 3sec or more)
    // it is recommended to use loadSprite(id) manually on demand

    this.setSprFile(sprFile);

    if (!this.sprFile) {
      return false;
    }

    for (let id = 1; id <= this.spritesCount; id++) {
      this.loadSprite(id);
    }

    return true;
  }

  saveSpr(): FileOutput {
    const sprFile = new FileOutput();

    sprFile.addU32(this.signature);
    if (this.client.getFeature(GameFeature.GameSpritesU32)) sprFile.addU32(this.getSpritesCount());
    else sprFile.addU16(this.getSpritesCount());

    const spritesOffset = sprFile.tell();
    for (let i = 0; i < this.sprites.length; i++) {
      sprFile.addU32(0);
    }

    for (let i = 0; i < this.sprites.length; i++) {
      if (this.sprites[i]) {
        const sprite = this.sprites[i];

        const spriteAddress = sprFile.tell();
        sprFile.setU32(spritesOffset + 4 * i, spriteAddress);

        sprite.writeToSpr(sprFile, this.client);
      }
    }

    return sprFile;
  }

  getSignature(): number {
    return this.signature;
  }

  setSignature(value: number) {
    return (this.signature = value);
  }

  getSprites(): Sprite[] {
    return this.sprites;
  }

  getSprite(index: number): Sprite {
    if (!this.sprites[index]) this.loadSprite(index);
    return this.sprites[index];
  }

  getSpritesCount(): number {
    return this.sprites.length;
  }
}
