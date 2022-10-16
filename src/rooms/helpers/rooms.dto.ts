//Events

import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { defaultSettings, RoomKey } from './rooms.room';
import { Transform, Type } from 'class-transformer';

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

  @ApiPropertyOptional({
    description: 'If passed true, custom words will be used',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  customWords?: boolean | undefined;
}

export abstract class CredentialsBaseParams {
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

export class SetReadyParams extends CredentialsBaseParams {}

export class SubmitGuessParams extends CredentialsBaseParams {
  @ApiProperty({
    description:
      'Your guess for hidden word. Whitespaces can be replaced with %20',
  })
  @IsNotEmpty()
  guess: string;
}

export class AddCustomWordParams extends CredentialsBaseParams {
  @ApiProperty({
    description:
      'Custom word to add to list. length 2-50, only latin characters with hyphens or spaces allowed',
  })
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  word: string;
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
