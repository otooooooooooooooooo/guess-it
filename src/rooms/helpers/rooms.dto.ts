//Events

import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
