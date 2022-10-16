import { Module } from '@nestjs/common';
import { RoomsController } from './controller/rooms.controller';
import { RoomsService } from './service/rooms.service';
import { RoomsGateway } from './gateway/rooms.gateway';
import { WordsModule } from '../words/words.module';
import { ImagesModule } from '../images/images.module';
import { RoomsFactory } from './factory/rooms.factory';

@Module({
  imports: [WordsModule, ImagesModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, RoomsFactory],
})
export class RoomsModule {}
