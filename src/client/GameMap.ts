import { OtbmManager } from "../core/otbm/OtbmManager";
import { OtbmNodeTypes } from "../core/common/enums";
import { OtbmNodeTileArea } from "../core/otbm/OtbmNodeTileArea";
import { Tile } from "./Tile";
import { Position } from "../core/structures/Position";
import { Viewport } from "pixi-viewport";
import { game } from "./Game";

export class GameMap {
  tileSize = 32;
  tiles = new Map<symbol, Tile>();
  mapWidth!: number;
  mapHeight!: number;
  viewport!: Viewport;

  static VIEWPORT_WIDTH = 15 * 32;
  static VIEWPORT_HEIGHT = 11 * 32;

  static fromOtbm(otbm: OtbmManager) {
    const gameMap = new GameMap();
    gameMap.loadFromOtbm(otbm);
    return gameMap;
  }

  constructor() {
    this.viewport = new Viewport({
      screenWidth: GameMap.VIEWPORT_WIDTH,
      screenHeight: GameMap.VIEWPORT_HEIGHT,
      worldWidth: 55 * 32, // 55 sqm width
      worldHeight: 55 * 32, // 55 sqm height
      events: game.app.renderer.events,
    });

    // Canvas dimensions are set in PIXI.Application initialization in Game.ts
    // Only set CSS display size here
    game.app.canvas.style.width = `${GameMap.VIEWPORT_WIDTH * 1.5}px`;
    game.app.canvas.style.height = `${GameMap.VIEWPORT_HEIGHT * 1.5}px`;

    // add the viewport to the stage
    game.app.stage.addChild(this.viewport);

    this.viewport.drag({ wheel: false });
    this.viewport.plugins.pause("drag");
    this.viewport.decelerate();
  }

  loadFromOtbm(otbm: OtbmManager) {
    const { mapHeight, mapWidth, nodes } = otbm.header;
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;

    const mapData = nodes.find((n) => n.type === OtbmNodeTypes.MapData);
    for (const nodeTileArea of (mapData!.features as OtbmNodeTileArea[]).filter(
      (n) => n.type === OtbmNodeTypes.TileArea,
    )) {
      for (const nodeTile of nodeTileArea.tiles) {
        const { x, y, z, tileId, flags, items } = nodeTile;

        if (x <= this.mapWidth && y <= this.mapHeight) {
          const tile = new Tile(new Position(x, y, z), tileId, flags, items);
          this.setTile([x, y, z], tile);
        }
      }
    }
  }

  setTile(coords: number[], tile: Tile) {
    this.tiles.set(Symbol.for(String(coords)), tile);
  }

  getTile(coords: number[]) {
    return this.tiles.get(Symbol.for(String(coords)));
  }

  render(position: Position) {
    const zRange = position.z <= 7 ? [7, 0] : [14, 8];
    const yRange = [position.y - 7, position.y + 7];
    const xRange = [position.x - 9, position.x + 9];

    this.viewport.removeChildren();
    for (let z = zRange[0]; z >= zRange[1]; z--) {
      for (let y = yRange[0] + 7 - z; y <= yRange[1] + 7 - z; y++) {
        for (let x = xRange[0] + 7 - z; x <= xRange[1] + 7 - z; x++) {
          const tile = this.getTile([x, y, z]);
          if (tile) {
            const gameObjects = tile.draw();
            if (gameObjects.length > 0) {
              this.viewport.addChild(...gameObjects);
            }
          }
        }
      }
    }
  }
}
