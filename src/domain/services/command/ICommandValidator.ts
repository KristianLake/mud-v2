import { ICommand } from './ICommand';
import { IValidationRule } from './validation/IValidationRule';

export interface ICommandValidator {
  validate(command: ICommand): boolean;
  addValidationRule(rule: IValidationRule): void;
}
