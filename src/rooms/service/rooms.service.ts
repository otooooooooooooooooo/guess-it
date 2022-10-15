import { Injectable } from '@nestjs/common';
import { GameRoom, GameRoomOptions, RoomKey } from '../helpers/rooms.game-room';
import { RoomDestroyer } from '../helpers/rooms.interfaces';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from '../helpers/rooms.user';
import { LoggingService } from '../../logging/logging.service';
import { GuessResultDto, RoomCredentialsDto } from '../helpers/rooms.dto';

@Injectable()
export class RoomsService {
  private readonly activeRoomsRecord: { [key: string]: GameRoom } = {};
  private readonly roomDestroyer: RoomDestroyer = (gameRoom: GameRoom) => {
    this.deleteRoom(gameRoom.key);
  };

  constructor(private readonly loggingService: LoggingService) {}

  createRoom(gameRoomOptions: GameRoomOptions): RoomCredentialsDto {
    return this.getNewRoomCredentials(gameRoomOptions);
  }

  private getNewRoomCredentials(
    gameRoomOptions: GameRoomOptions,
  ): RoomCredentialsDto {
    const newRoom: GameRoom = new GameRoom(
      this.roomDestroyer.bind(this),
      this.loggingService,
      gameRoomOptions,
    );
    this.activeRoomsRecord[newRoom.key.toString()] = newRoom;
    return {
      key: newRoom.key,
      willDeleteAfterSeconds: newRoom.deactivationTimeSeconds,
    };
  }

  private getRoom(key: RoomKey): GameRoom | undefined {
    if (key) return this.activeRoomsRecord[key.toString()];
  }

  private deleteRoom(key: RoomKey): void {
    delete this.activeRoomsRecord[key.toString()];
    this.loggingService.info('Inactive room deleted', {
      key: key,
    });
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

  submitGuess(id: string, key: string, guess: string): GuessResultDto {
    const room: GameRoom = this.getRoom(key);
    if (!room)
      throw new CustomException(CustomExceptionType.WRONG_KEY, { key: key });
    return {
      isCorrect: room.guess(id, guess),
    };
  }
}
