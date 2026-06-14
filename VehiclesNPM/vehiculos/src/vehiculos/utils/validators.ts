import { ValidatorConstraintInterface, ValidationArguments, ValidatorConstraint } from "class-validator";

@ValidatorConstraint({ name: 'MaxYear', async: false })
export class MaxYearConstraint implements ValidatorConstraintInterface {
  validate(year: number, args: ValidationArguments) {
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    return year <= (currentYear + 1);
  }

  defaultMessage(args: ValidationArguments) {
    // here you can provide default error message if validation failed
    return 'El año no debe ser mayor al próximo año.';
  }
}