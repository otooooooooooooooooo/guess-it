import { Global, Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { LoggingMiddleware } from './logging.middleware';

@Global()
@Module({
  providers: [LoggingService, LoggingMiddleware],
  exports: [LoggingService],
})
export class LoggingModule {}
