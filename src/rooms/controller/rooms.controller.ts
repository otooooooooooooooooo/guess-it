import { Controller, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomsService } from '../service/rooms.service';
import { RoomKey } from '../helpers/rooms.game-room';
import { SetReadyParams } from '../helpers/rooms.dto';
import { getSwaggerSummary } from '../../exceptions/exceptions.swagger-summary';
import { CustomExceptionType } from '../../exceptions/exceptions.types';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({
    description: 'Create a new room',
  })
  @Post()
  createRoom(): RoomKey {
    return this.roomsService.createRoom();
  }

  @ApiOperation({
    description: 'Set ready for game',
  })
  @ApiResponse(getSwaggerSummary(CustomExceptionType.WRONG_KEY))
  @ApiResponse(getSwaggerSummary(CustomExceptionType.WRONG_ID))
  @ApiResponse(getSwaggerSummary(CustomExceptionType.GAME_ALREADY_STARTED))
  @Put('/ready')
  setReady(@Query() setReadyParams: SetReadyParams): void {
    this.roomsService.setReady(setReadyParams.id, setReadyParams.key);
  }
}
