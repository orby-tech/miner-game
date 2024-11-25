// Field enum

export enum PublicFieldType {
  Empty = "Empty",
  Diamond = "Diamond",
  Hidden = "Hidden",
}

export type PublicField = {
  type: PublicFieldType;
  openerName?: string;
  value?: number;
};

export type PublicGame = {
  diamondCount: number;
  side: number;
  map: PublicField[][];
};
