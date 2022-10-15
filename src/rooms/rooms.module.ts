import { Module } from '@nestjs/common';
import { RoomsController } from './controller/rooms.controller';
import { RoomsService } from './service/rooms.service';
import { RoomsGateway } from './gateway/rooms.gateway';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
})
export class RoomsModule {}
