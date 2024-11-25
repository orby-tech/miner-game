import { Injectable } from '@nestjs/common';
import { ClientEvents, ServerEvents } from '../../../common/events';
import { User, UsersService } from '../users/users.service';
import { GamesService } from '../games/games.service';
import { RoomsService } from '../rooms/rooms.service';

// TODO: Split into separate files by ClientEvents and ServerEvents

@Injectable()
export class EventsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly gamesService: GamesService,
    private readonly roomsService: RoomsService,
  ) {}

  runClientEvents(client: any, events: ClientEvents[]) {
    for (const event of events) {
      console.log('Event:', event);
      this.runClientEvent(client, event);
    }
  }

  private async runClientEvent(client: any, event: ClientEvents) {
    const eventKey = Object.keys(event)[0] as keyof ClientEvents;

    const actions: Record<keyof ClientEvents, () => void | Promise<void>> = {
      'user:present': () =>
        this.usersService.addUser(event['user:present'].userName, client),
      'game:open': () => {
        const eventBody = event['game:open'];
        const room = this.roomsService.getRoom(eventBody.roomId);
        if (!room) {
          console.error('Room not found');
          return;
        }

        const isDimond = this.gamesService.openField(
          eventBody.roomId,
          eventBody.x,
          eventBody.y,
          eventBody.userName,
        );

        this.roomsService.setLastStep(
          eventBody.roomId,
          eventBody.userName,
          isDimond,
        );

        if (isDimond) {
          this.gamesService.addStats(eventBody.roomId, eventBody.userName);
        }

        const isGameFinished = this.gamesService.isGameFinished(
          eventBody.roomId,
        );

        this.runServerEvents(
          [
            {
              'game:status': {
                roomId: eventBody.roomId,
              },
            },
            {
              'game:next': {
                roomId: eventBody.roomId,
              },
            },
            ...(isDimond
              ? [
                  {
                    'game:diamond-found': {
                      roomId: eventBody.roomId,
                      userName: eventBody.userName,
                    },
                  },
                  {
                    'game:stats': {
                      roomId: eventBody.roomId,
                      stats: this.gamesService.getStats(eventBody.roomId),
                    },
                  },
                  {
                    'room:stats': {
                      roomId: eventBody.roomId,
                      stats: this.roomsService.getStats(eventBody.roomId),
                    },
                  },
                ]
              : []),
            ,
            ...(isGameFinished
              ? [
                  {
                    'game:finished': {
                      roomId: eventBody.roomId,
                      winner: this.gamesService.getWinner(eventBody.roomId),
                    },
                  },
                ]
              : []),
          ].filter((x) => x) as ServerEvents[],
        );
      },
      'room:join': () => {
        const usersInRoom = this.usersService.getUsersByRoom(
          event['room:join'].roomId,
        );

        if (usersInRoom.length >= 2) {
          console.error('Room is full');
          return;
        }

        this.usersService.setUserRoom(
          client,
          event['room:join'].roomId,
          event['room:join'].userName,
        );

        this.runServerEvents([
          {
            'room:joined': {
              roomId: event['room:join'].roomId,
              userName: event['room:join'].userName,
            },
          },
          {
            'game:next': {
              roomId: event['room:join'].roomId,
            },
          },
        ] as ServerEvents[]);
      },
      'room:leave': () => {
        this.usersService.setUserRoom(client, undefined);
      },
    }; // TODO: Split into separate methods

    const action = actions[eventKey];

    if (!action) {
      throw new Error(`Unknown event: ${eventKey}`);
    }

    await action();
  }

  runServerEvents(events: ServerEvents[]) {
    for (const event of events) {
      console.log('Event:', event);
      this.runServerEvent(event);
    }
  }

  runServerEvent(event: ServerEvents) {
    const eventKey = Object.keys(event)[0] as keyof ServerEvents;

    const actions: Record<keyof ServerEvents, () => void> = {
      'room:joined': () => {
        const actionBody = event['room:joined'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'room:joined': {
                  roomId: actionBody.roomId,
                  userName: actionBody.userName,
                },
              },
            ]),
          );
        }

        const user = users.find((user) => user.name === actionBody.userName);

        if (!user) {
          throw new Error('User not found');
        }

        this.sendPopulation(user.client, actionBody.roomId, users);

        this.sendGameStatus(user.client, actionBody.roomId);

        this.sendStats(user.client, actionBody.roomId);
      },
      'game:status': () => {
        const actionBody = event['game:status'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          this.sendGameStatus(user.client, actionBody.roomId);
        }
      },
      'room:left': () => {
        throw new Error('Not implemented');
        // TODO: Implement room left event
      },
      'game:started': () => {
        const actionBody = event['game:started'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'game:started': {
                  roomId: actionBody.roomId,
                  side: actionBody.side,
                  diamondCount: actionBody.diamondCount,
                },
              },
            ]),
          );
        }
      },
      'game:finished': () => {
        const actionBody = event['game:finished'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'game:finished': {
                  roomId: actionBody.roomId,
                  winner: actionBody.winner,
                },
              },
            ]),
          );
        }
      },
      'game:next': () => {
        const actionBody = event['game:next'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        if (users.length < 2) {
          console.log('Not enough players');
          return;
        }

        const room = this.roomsService.getRoom(actionBody.roomId);

        if (!room) {
          console.error('Room not found');
          return;
        }

        const prevPlayer = room.lastStep;
        const isFound = room.lastStepFoundStatus;

        let nextPlayer;
        if (isFound) {
          nextPlayer = users.find((user) => user.name === prevPlayer);
          if (!nextPlayer) {
            nextPlayer = users[0];
          }
        } else {
          nextPlayer = users.find((user) => user.name !== prevPlayer);
          if (!nextPlayer) {
            nextPlayer = users[0];
          }
        }

        for (const user of users) {
          this.sendGameNext(user.client, actionBody.roomId, nextPlayer.name);
        }
      },
      'game:diamond-found': () => {
        const actionBody = event['game:diamond-found'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'game:diamond-found': {
                  roomId: actionBody.roomId,
                  userName: actionBody.userName,
                },
              },
            ]),
          );
        }
      },
      'game:stats': () => {
        const actionBody = event['game:stats'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'game:stats': {
                  roomId: actionBody.roomId,
                  stats: actionBody.stats,
                },
              },
            ]),
          );
        }
      },
      'room:stats': () => {
        const actionBody = event['room:stats'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          user.client.send(
            JSON.stringify([
              {
                'room:stats': {
                  roomId: actionBody.roomId,
                  stats: actionBody.stats,
                },
              },
            ]),
          );
        }
      },
      'room:population': () => {
        const actionBody = event['room:population'];
        const users = this.usersService.getUsersByRoom(actionBody.roomId);
        for (const user of users) {
          this.sendPopulation(user.client, actionBody.roomId, users);
        }
      },
    };

    const action = actions[eventKey];

    if (!action) {
      throw new Error(`Unknown event: ${eventKey}`);
    }

    action();
  }

  removeUser(client: any) {
    this.usersService.removeUser(client);
  }

  sendPopulation(client: any, roomId: string, users: User[]) {
    const roomPopulation = users.map((user) => user.name);

    client.send(
      JSON.stringify([
        {
          'room:population': {
            roomId,
            users: roomPopulation,
          },
        },
      ]),
    );
  }

  sendGameStatus(client: any, roomId: string) {
    const game = this.gamesService.getGameByRoom(roomId);
    if (!game) {
      console.error('Game not found');
      return;
    }

    const pureGame = this.gamesService.purifyGame(game);

    client.send(
      JSON.stringify([
        {
          'game:status': {
            roomId,
            diamondCount: pureGame.diamondCount,
            side: pureGame.side,
            map: pureGame.map,
          },
        },
      ]),
    );
  }

  sendStats(client: any, roomId: string) {
    const gameStats = this.gamesService.getStats(roomId);
    const roomStats = this.roomsService.getStats(roomId);

    client.send(
      JSON.stringify([
        {
          'game:stats': {
            roomId,
            stats: gameStats,
          },
        },
        {
          'room:stats': {
            roomId,
            stats: roomStats,
          },
        },
      ]),
    );
  }

  sendGameNext(client: any, roomId: string, nextPlayer: string) {
    client.send(
      JSON.stringify([
        {
          'game:next': {
            roomId,
            nextPlayer,
          },
        },
      ]),
    );
  }
}
