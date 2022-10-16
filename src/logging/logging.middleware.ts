import { Injectable, NestMiddleware } from '@nestjs/common';
import uuid = require('uuid');
import { LoggingService } from './logging.service';

/**
 * Middleware that logs http requests and responses
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: any, res: any, next: () => void): any {
    const requestId = uuid.v1(); //generate unique id for request
    this.logInfoLogFromRequest(req, requestId);
    this.setOnCloseLogger(res, requestId);
    next();
  }

  private logInfoLogFromRequest(req, requestId: string) {
    this.loggingService.info(
      'Request info',
      LoggingMiddleware.constructLogMessageFromRequest(req, requestId),
    );
  }

  private setOnCloseLogger(res, requestId: string) {
    res.on('close', () => {
      this.loggingService.info(
        'Response info',
        LoggingMiddleware.constructMessageFromResponse(res, requestId),
      );
    });
  }

  private static constructMessageFromResponse(res, requestId: string): object {
    return {
      requestId: requestId,
      responseStatus: res.statusMessage,
    };
  }

  private static constructLogMessageFromRequest(
    req: Request,
    id: string,
  ): object {
    return {
      id: id,
      endpoint: req.url,
      method: req.method,
      body: req.method !== 'POST' ? req.body : {},
    };
  }
}
