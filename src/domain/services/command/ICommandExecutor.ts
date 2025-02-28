import { ICommand } from './ICommand';

export interface ICommandExecutor {
  executeCommand(command: ICommand): string;
}
