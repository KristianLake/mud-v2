import { ICommand } from '../ICommand';

export interface IValidationRule {
  validate(command: ICommand): boolean;
}
