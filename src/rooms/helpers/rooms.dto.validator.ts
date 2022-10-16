import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ async: false })
class CustomWordConstraint implements ValidatorConstraintInterface {
  validate(word: string, _: ValidationArguments): boolean {
    //TODO a-z A-Z , ' ', '-'
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
