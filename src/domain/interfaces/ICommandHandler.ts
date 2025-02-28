import { ICommand } from '../services/command/ICommand';

export interface ICommandHandler {
  handle(command: ICommand): void;
}
