import { Direction } from "../common/enums";

export class Position {
  constructor(
    public x: number = 0,
    public y: number = 0,
    public z: number = 0
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static angle = (from: Position, to: Position): number => {
    if (from.x === to.x && from.y === to.y) return 0;

    const angleRad = Math.atan((from.y - to.y) / (from.x - to.x));

    return (angleRad * 180) / Math.PI;
  };

  static distance = (from: Position, to: Position): number => {
    const xAbs = Math.abs(from.x - to.x);
    const yAbs = Math.abs(from.y - to.y);
    return Math.sqrt(Math.pow(xAbs, 2) + Math.pow(yAbs, 2));
  };

  static direction = (from: Position, to: Position): Direction => {
    const angle = Math.abs(Position.angle(from, to));

    const x = from.x - to.x;
    const y = from.y - to.y;

    if (angle > 25 && angle < 65) {
      if (x > 0 && y > 0) return Direction.NorthWest;
      if (x < 0 && y < 0) return Direction.SouthEast;
      if (x < 0 && y > 0) return Direction.NorthEast;
      if (x > 0 && y < 0) return Direction.SouthWest;
    }
    if (angle <= 30) {
      if (x > 0) return Direction.West;
      if (x < 0) return Direction.East;
    }
    if (angle >= 60) {
      if (y < 0) return Direction.South;
      if (y > 0) return Direction.North;
    }

    // just in case
    return Direction.South;
  };

  static fromCoords(coords: number[]) {
    return new Position(coords[0], coords[1], coords[2]);
  }

  toCoords() {
    return [this.x, this.y, this.z];
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  setZ(z: number) {
    this.z = z;
    return this;
  }

  set(x: number, y: number, z: number) {
    x != null && this.setX(x);
    y != null && this.setY(y);
    z != null && this.setZ(z);
    return this;
  }

  add(x: number, y: number, z: number) {
    x != null && this.setX(this.x + x);
    y != null && this.setY(this.y + y);
    z != null && this.setZ(this.z + z);
    return this;
  }

  equals(other: Position) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  clone() {
    return new Position(this.x, this.y, this.z);
  }

  angle(target: Position) {
    return Position.angle(this, target);
  }

  distance(target: Position) {
    return Position.distance(this, target);
  }

  direction(target: Position) {
    return Position.direction(this, target);
  }
}
