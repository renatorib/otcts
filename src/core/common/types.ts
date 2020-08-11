export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

export type OtbmAttributes = {
  text?: string;
  spawnFile?: string;
  houseFile?: string;
  houseDoorId?: number;
  description?: string;
  depotId?: number;
  flags?: number;
  runeCharges?: number;
  count?: number;
  tileId?: number;
  actionId?: number;
  destination?: {
    x: number;
    y: number;
    z: number;
  };
};

export type OtbmTileFlags = {
  protection: boolean;
  deprecated: boolean;
  noPvp: boolean;
  noLogout: boolean;
  pvpZone: boolean;
  refresh: boolean;
};
