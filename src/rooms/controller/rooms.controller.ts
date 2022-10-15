import { Controller, Get, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RoomsService } from '../service/rooms.service';
import {
  CreateRoomParams,
  GuessResultDto,
  RoomCredentialsDto,
  SetReadyParams,
  SubmitGuessParams,
} from '../helpers/rooms.dto';
import { getSwaggerSummary } from '../../exceptions/exceptions.swagger-summary';
import { CustomExceptionType } from '../../exceptions/exceptions.types';
import { config } from '../../config/config';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @ApiOperation({
    description: 'Create a new room',
  })
  @ApiResponse({ type: RoomCredentialsDto })
  @Post()
  createRoom(@Query() createRoomParams: CreateRoomParams): RoomCredentialsDto {
    return this.roomsService.createRoom({
      maxPlayers: createRoomParams.maxPlayers,
      gameDurationSeconds: createRoomParams.gameDurationSeconds,
      disableHints: createRoomParams.disableHints,
    });
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

  @ApiOperation({
    description: 'Submit a guess for a word',
  })
  @ApiResponse({ type: GuessResultDto })
  @ApiResponse(getSwaggerSummary(CustomExceptionType.WRONG_KEY))
  @ApiResponse(getSwaggerSummary(CustomExceptionType.WRONG_ID))
  @ApiResponse(getSwaggerSummary(CustomExceptionType.GAME_NOT_STARTED))
  @ApiResponse(getSwaggerSummary(CustomExceptionType.ALREADY_GUESSED))
  @Post('/guess')
  submitGuess(@Query() submitGuessParams: SubmitGuessParams): GuessResultDto {
    return this.roomsService.submitGuess(
      submitGuessParams.id,
      submitGuessParams.key,
      submitGuessParams.guess,
    );
  }
}
