import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { GamesService } from '../games/games.service';
import { UsersService } from '../users/users.service';
import { RoomsService } from '../rooms/rooms.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoomsService, UsersService, GamesService, EventsService],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
