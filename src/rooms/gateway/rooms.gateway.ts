import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets';
import { config } from '../../config/config';
import { RoomsService } from '../service/rooms.service';
import { WebsocketUser } from '../helpers/rooms.user';
import { LoggingService } from '../../logging/logging.service';

@WebSocketGateway({ cors: config.CORS, namespace: 'rooms' })
export class RoomsGateway implements OnGatewayConnection {
  constructor(
    private readonly roomsService: RoomsService,
    private readonly loggingService: LoggingService,
  ) {}

  /**
   * Socket connection query:
   * key (room key) - required
   * username - optional
   * @description Will connect automatically if joining room
   * was unsuccessful
   * @param client
   * @param args
   */
  handleConnection(client: any, ...args: any[]): any {
    const { key, username }: { key: string; username: string } =
      client.handshake.query;

    this.loggingService.info('Client connected', {
      id: client.id,
      key: key,
      username: username,
    });

    if (!key) {
      client.disconnect('Room key not provided.');
      return;
    }

    const id: string = client.id;

    this.roomsService.joinRoom(new WebsocketUser(id, username, client), key);
  }
}
