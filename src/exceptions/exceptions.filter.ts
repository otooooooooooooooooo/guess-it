import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { CustomException } from './exceptions.custom-exception';
import { CustomExceptionType } from './exceptions.types';
import { LoggingService } from '../logging/logging.service';

export type HttpSummary = {
  message: string;
  status: number;
  error: CustomExceptionType;
};

@Catch(CustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  /**
   * should cover all enum cases of CustomErrorType
   * @private
   */
  private static readonly ErrorTypeToHttpMap: Map<
    CustomExceptionType,
    { message: string; status: number }
  > = new Map<CustomExceptionType, { message: string; status: number }>([
    [
      CustomExceptionType.WRONG_KEY,
      {
        status: 432,
        message: 'Provided room key is incorrect',
      },
    ],
    [
      CustomExceptionType.WRONG_ID,
      {
        status: 433,
        message: 'You are not participant of the room',
      },
    ],
    [
      CustomExceptionType.GAME_ALREADY_STARTED,
      {
        status: 434,
        message: 'Game had already started',
      },
    ],
    [
      CustomExceptionType.GAME_NOT_STARTED,
      {
        status: 435,
        message: 'Game has not started yet',
      },
    ],
    [
      CustomExceptionType.ALREADY_GUESSED,
      {
        status: 436,
        message: 'You have already guessed the word',
      },
    ],
    [
      CustomExceptionType.NOT_CUSTOM_MODE,
      {
        status: 437,
        message: 'Game mode is not custom words',
      },
    ],
    [
      CustomExceptionType.DUPLICATE_WORD,
      {
        status: 438,
        message: 'Custom word already exists',
      },
    ],
  ]);

  catch(exception: CustomException, host: ArgumentsHost): any {
    this.loggingService.error(exception.type, exception.body);
    const httpSummary: HttpSummary = CustomExceptionFilter.getHttpSummary(
      exception.type,
    );
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(httpSummary.status)
      .json({
        statusCode: httpSummary.status,
        message: httpSummary.message,
        error: httpSummary.error,
      });
  }

  static getHttpSummary(errorType: CustomExceptionType): HttpSummary {
    return {
      ...(CustomExceptionFilter.ErrorTypeToHttpMap.get(errorType) || {
        message: 'Undocumented error',
        status: 450,
      }),
      error: errorType,
    };
  }
}
