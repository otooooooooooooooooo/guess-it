import { CustomExceptionType } from './exceptions.types';

export class CustomException extends Error {
  constructor(
    public readonly type: CustomExceptionType,
    public readonly body: any,
  ) {
    super(type);
  }
}
