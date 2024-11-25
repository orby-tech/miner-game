import { Injectable } from '@nestjs/common';
import { Field, FieldStatus, FieldType, Game } from '../models/game/interfaces';
import { PublicGame, PublicField, PublicFieldType } from '../../../common/game';
import { RoomsService } from '../rooms/rooms.service';

@Injectable()
export class GamesService {
  games = new Map<string, Game>();

  constructor(private readonly roomsService: RoomsService) {}

  getGameByRoom(roomId: string): Game {
    console.log('Games:', this.games);
    return this.games.get(roomId);
  }

  genNewGame(roomId: string, side: number, diamondCount: number): Game {
    const game = this.genGame(side, diamondCount);
    this.games.set(roomId, game);
    return game;
  }

  genGame(side: number, diamondCount: number): Game {
    const map = this.getEmptyMap(side);

    const filledMap = this.fillMapWithDiamonds(map, diamondCount);

    const markedMap = this.fillMapWithDiamondsMarkers(filledMap);

    return {
      diamondCount,
      side,
      map: markedMap,
      stats: {},
    };
  }

  getWinner(roomId: string): string {
    const game = this.getGameByRoom(roomId);

    if (!game) {
      throw new Error('Game not found');
    }

    const winners = Object.entries(game.stats).sort((a, b) => b[1] - a[1]);
    console.log('Winners:', winners);
    return winners[0]?.[0];
  }

  addStats(roomId: string, name: string): void {
    const game = this.getGameByRoom(roomId);

    if (!game) {
      throw new Error('Game not found');
    }

    if (!game.stats[name]) {
      game.stats[name] = 0;
    }

    game.stats[name]++;

    this.games.set(roomId, game);

    this.roomsService.addStats(roomId, name);
  }

  getStats(roomId: string): Record<string, number> {
    const game = this.getGameByRoom(roomId);

    if (!game) {
      return {};
    }

    return game.stats;
  }

  openField(roomId: string, x: number, y: number, openerName: string): boolean {
    const game = this.getGameByRoom(roomId);

    if (!game) {
      throw new Error('Game not found');
    }

    const field = game.map[x][y];

    if (field.status === FieldStatus.Opened) {
      return;
    }

    field.status = FieldStatus.Opened;
    field.openerName = openerName;

    this.games.set(roomId, game);

    return field.type === FieldType.Diamond;
  }

  isGameFinished(roomId: string): boolean {
    const game = this.getGameByRoom(roomId);

    if (!game) {
      throw new Error('Game not found');
    }

    return game.map.every((row) =>
      row.every((field) => field.status === FieldStatus.Opened),
    );
  }

  setGame(roomId: string, game: Game): void {
    this.games.set(roomId, game);
  }

  fillMapWithDiamondsMarkers = (map: Field[][]): Field[][] => {
    const side = map.length;
    for (let x = 0; x < side; x++) {
      for (let y = 0; y < side; y++) {
        if (map[x][y].type === FieldType.Diamond) {
          continue;
        }

        let value = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (x + i < 0 || x + i >= side || y + j < 0 || y + j >= side) {
              continue;
            }

            if (map[x + i][y + j].type === FieldType.Diamond) {
              value++;
            }
          }
        }

        map[x][y].value = value;
      }
    }

    return map;
  };

  fillMapWithDiamonds(map: Field[][], diamondCount: number): Field[][] {
    let count = 0;
    while (count < diamondCount) {
      const x = Math.floor(Math.random() * map.length);
      const y = Math.floor(Math.random() * map.length);

      if (map[x][y].type === FieldType.Empty) {
        map[x][y].type = FieldType.Diamond;
        count++;
      }
    }

    return map;
  }

  getEmptyMap(side: number): Field[][] {
    return Array.from({ length: side }, () =>
      Array.from(
        { length: side },
        () =>
          ({
            type: FieldType.Empty,
            status: FieldStatus.Closed,
            openerName: '',
          }) as Field,
      ),
    );
  }

  purifyGame(game: Game): PublicGame {
    return {
      diamondCount: game.diamondCount,
      side: game.side,
      map: game.map.map((row) =>
        row.map(
          (field): PublicField =>
            field.status === FieldStatus.Closed
              ? {
                  type: PublicFieldType.Hidden,
                }
              : {
                  type: field.type as unknown as PublicFieldType,
                  openerName: field.openerName,
                  value: field.value,
                },
        ),
      ),
    };
  }
}
