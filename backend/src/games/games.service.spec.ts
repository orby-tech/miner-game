import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { FieldType, Game } from '../models/game/interfaces';
import { RoomsService } from '../rooms/rooms.service';

describe('GamesService', () => {
  let service: GamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, GamesService],
    }).compile();

    service = module.get<GamesService>(GamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGameByRoom', () => {
    let game: Game;

    beforeEach(() => {
      game = service.genNewGame('test', 5, 5);
    });

    it('should be generated new game', () => {
      expect(game).toBeDefined();

      expect(game.side).toBe(5);
      expect(game.diamondCount).toBe(5);
      expect(game.map.length).toBe(5);
    });

    it('should equal map in games storage', () => {
      const gameFromMap = service.getGameByRoom('test');
      expect(gameFromMap).toBeDefined();
      expect(gameFromMap).toEqual(game);
    });

    it('should contain 5 diamonds', () => {
      const diamondsCount = game.map
        .map(
          (row) =>
            row.filter((field) => field.type === FieldType.Diamond).length,
        )
        .reduce((acc, count) => acc + count, 0);
      expect(diamondsCount).toBe(5);
    });

    it('should contain another fields with value 0-8', () => {
      const notDiamondFields = game.map
        .map((row) => row.filter((field) => field.type !== FieldType.Diamond))
        .reduce((acc, fields) => acc.concat(fields), []);

      notDiamondFields.forEach((field) => {
        expect(field.value).toBeGreaterThanOrEqual(0);
        expect(field.value).toBeLessThanOrEqual(8);
      });
    });

    it('should contain all fields with status Closed', () => {
      game.map.forEach((row) => {
        row.forEach((field) => {
          expect(field.status).toBe('Closed');
        });
      });
    });
  });
});
