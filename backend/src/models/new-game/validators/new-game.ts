import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { NewGameDto } from '../dtos/new-game';

@ValidatorConstraint({ name: 'customText', async: false })
export class IsOddValidation implements ValidatorConstraintInterface {
  validate(count: number) {
    return count % 2 === 1;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `${args.property} should be odd`;
  }
}

@ValidatorConstraint({ name: 'DiamondCount', async: false })
export class DiamondCountValidation implements ValidatorConstraintInterface {
  validate(count: number, args: ValidationArguments) {
    return count <= (args.object as NewGameDto).side ** 2;
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return `${args.property} should be less than or equal to quare of ${(args.object as NewGameDto).side}`;
  }
}
