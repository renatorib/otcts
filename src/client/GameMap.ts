import { OtbmManager } from "../core/otbm/OtbmManager";
import { OtbmNodeTypes } from "../core/common/enums";
import { OtbmNodeTileArea } from "../core/otbm/OtbmNodeTileArea";
import { Tile } from "./Tile";
import { Position } from "../core/structures/Position";
import { Viewport } from "pixi-viewport";

export class GameMap {
  tileSize = 32;
  tiles = new Map<Symbol, Tile>();
  mapWidth!: number;
  mapHeight!: number;

  static fromOtbm(otbm: OtbmManager) {
    const gameMap = new GameMap();
    gameMap.loadFromOtbm(otbm);
    return gameMap;
  }

  loadFromOtbm(otbm: OtbmManager) {
    const { mapHeight, mapWidth, nodes } = otbm.header;
    this.mapHeight = mapHeight;
    this.mapWidth = mapWidth;

    const mapData = nodes.find((n) => n.type === OtbmNodeTypes.MapData);
    for (const nodeTileArea of (mapData!.features as OtbmNodeTileArea[]).filter(
      (n) => n.type === OtbmNodeTypes.TileArea
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

  render(position: Position, viewport: Viewport) {
    const zRange = position.z <= 7 ? [7, 0] : [14, 8];
    const yRange = [position.y - 6, position.y + 6];
    const xRange = [position.x - 8, position.x + 8];

    viewport.removeChildren();
    for (let z = zRange[0]; z >= zRange[1]; z--) {
      for (let y = yRange[0]; y <= yRange[1]; y++) {
        for (let x = xRange[0]; x <= xRange[1]; x++) {
          const tile = this.getTile([x, y, z]);
          if (tile) {
            const gameObjects = tile.draw();
            if (gameObjects.length > 0) {
              viewport.addChild(...gameObjects);
            }
          }
        }
      }
    }
  }
}
