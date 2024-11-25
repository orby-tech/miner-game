import type { PublicField } from "./game";

export type ServerEvents = {
  "room:population": {
    roomId: string;
    users: string[];
  };
  "room:joined": {
    roomId: string;
    userName: string;
  };
  "room:left": {
    roomId: string;
    userName: string;
  };
  "game:status": {
    roomId: string;
    diamondCount: number;
    side: number;
    map: PublicField[][];
  };
  "game:started": {
    roomId: string;
    side: number;
    diamondCount: number;
  };
  "game:finished": {
    roomId: string;
    winner: string;
  };
  "game:next": {
    roomId: string;
    nextPlayer: string;
  };
  "game:diamond-found": {
    roomId: string;
    userName: string;
  };
  "game:stats": {
    roomId: string;
    stats: Record<string, number>;
  };
  "room:stats": {
    roomId: string;
    stats: Record<string, number>;
  };
};

export type ClientEvents = {
  "user:present": {
    userName: string;
  };
  "room:join": {
    roomId: string;
    userName: string;
  };
  "room:leave": {
    roomId: string;
    userName: string;
  };
  "game:open": {
    roomId: string;
    x: number;
    y: number;
    userName: string;
  };
};
