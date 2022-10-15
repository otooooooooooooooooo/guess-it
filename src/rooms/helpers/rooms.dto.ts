//Events

import { IsBoolean, IsNotEmpty, IsOptional, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { defaultSettings, RoomKey } from './rooms.game-room';
import { Transform, Type } from 'class-transformer';
import {
  ApiModelProperty,
  ApiResponseModelProperty,
} from '@nestjs/swagger/dist/decorators/api-model-property.decorator';

export class CreateRoomParams {
  @ApiPropertyOptional({
    description: `Max amount of players in a room. Defaults to ${defaultSettings.maxPlayers}`,
  })
  @IsOptional()
  @Min(2)
  @Max(30)
  @Type(() => Number)
  maxPlayers?: number | undefined;

  @ApiPropertyOptional({
    description: `Duration of each game. Defaults to ${defaultSettings.gameDurationSeconds}`,
  })
  @IsOptional()
  @Min(15)
  @Max(180)
  @Type(() => Number)
  gameDurationSeconds?: number | undefined;

  @ApiPropertyOptional({
    description: 'If passed true, will disable hints in game',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  disableHints?: boolean | undefined;
}

export class SetReadyParams {
  @ApiProperty({
    description: 'Client id provided through socket',
  })
  @IsNotEmpty()
  id: string;
  @ApiProperty({
    description: 'Room key',
  })
  @IsNotEmpty()
  key: string;
}

export class SubmitGuessParams extends SetReadyParams {
  @ApiProperty({
    description:
      'Your guess for hidden word. Whitespaces can be replaced with %20',
  })
  @IsNotEmpty()
  guess: string;
}

export class RoomCredentialsDto {
  @ApiProperty()
  key: RoomKey;
  @ApiProperty()
  willDeleteAfterSeconds: number;
}

export class GuessResultDto {
  @ApiProperty()
  isCorrect: boolean;
}
