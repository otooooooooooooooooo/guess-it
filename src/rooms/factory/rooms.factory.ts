import { Injectable } from '@nestjs/common';
import { Room, RoomOptions } from '../helpers/rooms.room';
import { LoggingService } from '../../logging/logging.service';
import { WordsService } from '../../words/service/words.service';
import { ImagesService } from 'images/service/images.service';
import { RoomDestroyer } from '../helpers/rooms.interfaces';

@Injectable()
export class RoomsFactory {
  constructor(
    private readonly loggingService: LoggingService,
    private readonly wordsService: WordsService,
    private readonly imagesService: ImagesService,
  ) {}

  create(roomDestroyer: RoomDestroyer, gameRoomOptions: RoomOptions): Room {
    return new Room(
      roomDestroyer,
      this.loggingService,
      this.wordsService,
      this.imagesService,
      gameRoomOptions,
    );
  }
}
