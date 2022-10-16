import { CustomExceptionType } from './exceptions.types';

/**
 * Custom exception class which will be filtered by custom filter
 */
export class CustomException extends Error {
  constructor(
    public readonly type: CustomExceptionType,
    public readonly body: any,
  ) {
    super(type);
  }
}
