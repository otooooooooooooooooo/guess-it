import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BadRequestException } from '@nestjs/common';

@ValidatorConstraint({ async: false })
class CustomWordConstraint implements ValidatorConstraintInterface {
  /**
   *
   * @param word formatted word - Special symbols replaced with spaces and uppercase
   * @param _
   */
  validate(word: string, _: ValidationArguments): boolean {
    const regexString = '^([A-Z0-9]+)([A-Z0-9 ]|-)*([A-Z0-9]+)$';
    if (!new RegExp(regexString).test(word))
      throw new BadRequestException(`Word should match regex ${regexString}`);
    return true;
  }
}

export function IsValidWord() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidWord',
      target: object.constructor,
      propertyName: propertyName,
      validator: CustomWordConstraint,
    });
  };
}
