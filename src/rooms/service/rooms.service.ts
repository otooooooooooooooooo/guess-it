import { Injectable } from '@nestjs/common';
import { Room, RoomKey, RoomOptions } from '../helpers/rooms.room';
import { RoomDestroyer } from '../helpers/rooms.interfaces';
import { CustomException } from '../../exceptions/exceptions.custom-exception';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { WebsocketUser } from '../helpers/rooms.user';
import { LoggingService } from '../../logging/logging.service';
import { GuessResultDto, RoomCredentialsDto } from '../helpers/rooms.dto';
import { RoomsFactory } from '../factory/rooms.factory';
import {
  ConnectionErrorPayload,
  ConnectionErrorReason,
  RoomEvent,
} from '../helpers/rooms.events';

@Injectable()
export class RoomsService {
  private readonly activeRoomsRecord: { [key: string]: Room } = {};
  /**
   * room destroyer which will be notified when room is deactivated and
   * will delete it from memory
   * @param gameRoom
   */
  private readonly roomDestroyer: RoomDestroyer = (gameRoom: Room) => {
    this.deleteRoom(gameRoom.key);
  };

  constructor(
    private readonly loggingService: LoggingService,
    private readonly gameRoomsFactory: RoomsFactory,
  ) {}

  createRoom(gameRoomOptions: RoomOptions): RoomCredentialsDto {
    return this.getNewRoomCredentials(gameRoomOptions);
  }

  private getNewRoomCredentials(
    gameRoomOptions: RoomOptions,
  ): RoomCredentialsDto {
    const newRoom: Room = this.gameRoomsFactory.create(
      this.roomDestroyer.bind(this),
      gameRoomOptions,
    );
    this.activeRoomsRecord[newRoom.key.toString()] = newRoom;
    return {
      key: newRoom.key,
      willDeleteAfterSeconds: newRoom.deactivationTimeSeconds,
    };
  }

  private getRoom(key: RoomKey): Room | undefined {
    if (key) return this.activeRoomsRecord[key.toString()];
  }

  private deleteRoom(key: RoomKey): void {
    delete this.activeRoomsRecord[key.toString()];
    this.loggingService.info('Inactive room deleted', {
      key: key,
    });
  }

  joinRoom(user: WebsocketUser, key: RoomKey): void {
    const room: Room = this.getRoom(key);
    if (!room) {
      user.emit(RoomEvent.CONNECTION_ERROR, {
        reason: ConnectionErrorReason.WRONG_KEY,
      } as ConnectionErrorPayload);
      user.disconnect();
      return;
    }
    room.join(user);
  }

  setReady(id: string, key: string): void {
    const room: Room = this.getRoom(key);
    if (!room)
      throw new CustomException(CustomExceptionType.WRONG_KEY, { key: key });
    room.setReady(id);
  }

  /**
   *
   * @param id
   * @param key
   * @param guess formatted guess
   */
  submitGuess(id: string, key: string, guess: string): GuessResultDto {
    const room: Room = this.getRoom(key);
    if (!room)
      throw new CustomException(CustomExceptionType.WRONG_KEY, { key: key });
    return {
      isCorrect: room.guess(id, guess),
    };
  }

  /**
   *
   * @param id
   * @param key
   * @param word formatted word
   */
  addCustomWord(id: string, key: string, word: string): void {
    const room: Room = this.getRoom(key);
    if (!room)
      throw new CustomException(CustomExceptionType.WRONG_KEY, { key: key });
    room.addCustomWord(id, word);
  }
}
