import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicFieldType } from '../../common/game';
import { GamesService } from './games/games.service';
import { EventsService } from './events/events.service';
import { UsersService } from './users/users.service';
import { RoomsService } from './rooms/rooms.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        RoomsService,
        UsersService,
        GamesService,
        AppService,
        EventsService,
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('Get game validators', () => {
    it('should return not exist error', () => {
      expect(
        appController.getGame({
          roomId: 'test1',
        }),
      ).rejects.toThrow('Game not found');
    });

    // TODO: add tests for validation of the room id
  });

  describe('Generate new game validators', () => {
    it('should generate new game', async () => {
      const game = await appController.genNewGame(
        {
          roomId: 'test',
        },
        {
          side: 5,
          diamondCount: 5,
        },
      );

      expect(game).toBeDefined();

      expect(game.side).toBe(5);
      expect(game.diamondCount).toBe(5);

      // Validate the map sides
      expect(game.map.length).toBe(5);

      for (let i = 0; i < 5; i++) {
        expect(game.map[i].length).toBe(5);
      }

      // expect all fields to be hidden
      game.map.forEach((row) => {
        row.forEach((field) => {
          expect(field.type).toBe(PublicFieldType.Hidden);
        });
      });
    });

    // TODO: add tests for validation of the room id, side and diamond count
  });

  // TODO: add tests for the modifiers of the game
});
