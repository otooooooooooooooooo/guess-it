import { transports, createLogger, LoggerOptions } from 'winston';
import { Injectable } from '@nestjs/common';

const options: LoggerOptions = {
  transports: [new transports.Console()],
};

@Injectable()
export class LoggingService {
  private readonly logger = createLogger(options);

  info(title: string, body?: any): void {
    this.logger.info(title, body);
  }

  error(title: string, body?: any): void {
    this.logger.error(title, body);
  }
}
