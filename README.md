<p align="center"><img src="demo.gif" /></p>

Tibia Client powered by html5 canvas (webgl), implemented in TypeScript.  
Aimed to be 100% compatible with outdated Tibia.dat/spr and TFS protocol.

## Map Renderer

#### General

|                    |                                                      |
| ------------------ | ---------------------------------------------------- |
| :heavy_check_mark: | Tile elevation                                       |
| :heavy_check_mark: | Sync animations (global timer)                       |
| :x:                | Stackpos / order                                     |
| :x:                | Contextual floor visibility change                   |
| :x:                | Contextual menu on right click (look, use, use with) |
| :x:                | Light shaders                                        |

#### Item

|                    |                          |
| ------------------ | ------------------------ |
| :heavy_check_mark: | Draw                     |
| :heavy_check_mark: | Sprite patterns          |
| :heavy_check_mark: | Sprite animations        |
| :heavy_check_mark: | Sprite bigger than 32x32 |
| :heavy_check_mark: | Stackable sprites        |
| :x:                | Hangable sprites         |
| :x:                | Fluid & splash sprites   |

#### Creature

|                    |                          |
| ------------------ | ------------------------ |
| :heavy_check_mark: | Draw                     |
| :heavy_check_mark: | Colored outfits & addons |
| :heavy_check_mark: | Walking animations       |
| :heavy_check_mark: | Mounts                   |

#### Effect

|                    |                                     |
| ------------------ | ----------------------------------- |
| :heavy_check_mark: | Draw                                |
| :x:                | Sprite patterns                     |
| :heavy_check_mark: | Sprite animations                   |
| :x:                | Remove game object on animation end |

#### Missile

|     |                   |
| --- | ----------------- |
| :x: | Draw              |
| :x: | Sprite patterns   |
| :x: | Sprite directions |
| :x: | Sprite animations |

#### Text

|     |                           |
| --- | ------------------------- |
| :x: | Creature names            |
| :x: | Creature health/mana bars |
| :x: | Damage numbers/efffect    |
| :x: | Log/screen messages       |

## UI

|     |                |
| --- | -------------- |
| :x: | Panels/Windows |
| :x: | Dialogs        |

## Input

...

## Protocol

...

## Minimap

...
