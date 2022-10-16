import { Module } from '@nestjs/common';
import { WordsService } from './service/words.service';

@Module({
  providers: [WordsService],
  exports: [WordsService],
})
export class WordsModule {}
