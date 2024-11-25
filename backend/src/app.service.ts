import { HttpException, Injectable } from '@nestjs/common';
import { PublicField, PublicFieldType, PublicGame } from '../../common/game';
import { FieldStatus, Game } from './models/game/interfaces';
import { GamesService } from './games/games.service';
import { EventsService } from './events/events.service';
import { ServerEvents } from '../../common/events';
import { RoomsService } from './rooms/rooms.service';

const games = new Map<string, Game>();

@Injectable()
export class AppService {
  constructor(
    private readonly gamesService: GamesService,
    private readonly eventsService: EventsService,
    private readonly roomsService: RoomsService,
  ) {}

  getGameByRoom(roomId: string): PublicGame {
    const game = games.get(roomId);

    if (!game) {
      throw new HttpException('Game not found', 404);
    }

    return this.gamesService.purifyGame(game);
  }

  setNewGame(roomId: string, side: number, diamondCount: number): PublicGame {
    const game = this.gamesService.genGame(side, diamondCount);

    this.gamesService.setGame(roomId, game);

    const pureGame = this.gamesService.purifyGame(game);

    this.eventsService.runServerEvents([
      {
        'game:status': {
          roomId,
          diamondCount,
          side,
          map: pureGame.map,
        },
      },
      {
        'game:next': {
          roomId,
        },
      },
      {
        'game:started': {
          roomId,
          diamondCount,
          side,
        },
      },
      {
        'game:stats': {
          roomId,
          stats: game.stats,
        },
      },
      {
        'room:stats': {
          roomId,
          stats: this.roomsService.getStats(roomId),
        },
      },
    ] as ServerEvents[]);

    return pureGame;
  }
}
