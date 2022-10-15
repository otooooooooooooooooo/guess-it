import { Injectable } from '@nestjs/common';
import { GameRoom, RoomKey } from '../helpers/rooms.game-room';
import { RoomDestroyer } from '../helpers/rooms.interfaces';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from '../helpers/rooms.user';
import { LoggingService } from '../../logging/logging.service';

@Injectable()
export class RoomsService {
  private readonly activeRoomsRecord: { [key: string]: GameRoom } = {};
  private readonly roomDestroyer: RoomDestroyer = (gameRoom: GameRoom) => {
    this.deleteRoom(gameRoom.key);
  };

  constructor(private readonly loggingService: LoggingService) {}

  createRoom(): RoomKey {
    return this.getNewRoomKey();
  }

  private getNewRoomKey(): RoomKey {
    const newRoom: GameRoom = new GameRoom(
      this.roomDestroyer.bind(this),
      this.loggingService,
    );
    this.activeRoomsRecord[newRoom.key.toString()] = newRoom;
    return newRoom.key;
  }

  private getRoom(key: RoomKey): GameRoom | undefined {
    if (key) return this.activeRoomsRecord[key.toString()];
  }

  private deleteRoom(key: RoomKey): void {
    delete this.activeRoomsRecord[key.toString()];
  }

  joinRoom(user: WebsocketUser, key: RoomKey): void {
    const room: GameRoom = this.getRoom(key);
    if (!room) {
      user.disconnect('Room not found.');
      return;
    }
    if (!room.join(user)) user.disconnect('Can not join room.');
  }

  setReady(id: string, key: string): void {
    const room: GameRoom = this.getRoom(key);
    if (!room)
      throw new CustomException(CustomExceptionType.WRONG_KEY, { key: key });
    room.setReady(id);
  }
}
