import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { ClientEvents } from '../../../common/events';
import { EventsService } from './events.service';

@WebSocketGateway({
  path: '/api/ws',
  transports: ['websocket'],
  driver: 'ws',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(private readonly eventsService: EventsService) {}

  afterInit() {
    console.log('WebSocket initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected');

    client.on('message', (message) => {
      try {
        const messageString = message.toString('utf8');

        const events: ClientEvents[] = JSON.parse(messageString);

        // TODO: Add strict type checking

        console.log('Events:', events);

        this.eventsService.runClientEvents(client, events);
      } catch (e) {
        console.log('Error parsing message:', e);

        // TODO: Send error message to client
        client.send('Error parsing message');
        return e;
      }
    });
  }

  handleDisconnect(client: any) {
    console.log('Client disconnected');

    this.eventsService.removeUser(client);
  }
}
