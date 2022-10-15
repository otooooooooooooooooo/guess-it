import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { config } from '../../config/config';
import { RoomsService } from '../service/rooms.service';
import { ClientIdPayload, RoomEvent } from '../helpers/rooms.events';
import { WebsocketUser } from '../helpers/rooms.user';

@WebSocketGateway({ cors: config.CORS, namespace: 'rooms' })
export class RoomsGateway implements OnGatewayConnection {
  constructor(private readonly roomsService: RoomsService) {}

  handleConnection(client: any, ...args: any[]): any {
    const { key, username }: { key: string; username: string } =
      client.handshake.query;

    if (!key) {
      client.disconnect('Room key not provided.');
      return;
    }

    const id: string = client.id;

    client.emit(RoomEvent.CLIENT_ID, { id: id } as ClientIdPayload);

    this.roomsService.joinRoom(new WebsocketUser(id, username, client), key);
  }
}
