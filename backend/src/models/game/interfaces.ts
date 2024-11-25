// Field enum

export enum FieldType {
  Empty = 'Empty',
  Diamond = 'Diamond',
}

export enum FieldStatus {
  Closed = 'Closed',
  Opened = 'Opened',
}

export type Field = {
  type: FieldType;
  status: FieldStatus;
  value?: number;
  openerName: string;
};

export type Game = {
  diamondCount: number;
  side: number;
  map: Field[][];
  stats: Record<string, number>;
};
