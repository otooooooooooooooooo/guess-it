/**
 * Custom exception types which are wrapped as custom http exceptions
 * by custom exceptions filter
 */
export enum CustomExceptionType {
  GAME_ALREADY_STARTED = 'Game in progress',
  WRONG_KEY = 'Wrong room key',
  WRONG_ID = 'Wrong client id',
  GAME_NOT_STARTED = 'Game not started',
  ALREADY_GUESSED = 'Already guessed',
  NOT_CUSTOM_MODE = 'Not custom mode',
  DUPLICATE_WORD = 'Duplicate word',
}
