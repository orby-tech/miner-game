import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesService } from './games/games.service';
import { EventsGateway } from './events/events.gateway';
import { EventsService } from './events/events.service';
import { RoomsService } from './rooms/rooms.service';
import { UsersService } from './users/users.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    GamesService,
    EventsGateway,
    EventsService,
    RoomsService,
    UsersService,
  ],
})
export class AppModule {}
