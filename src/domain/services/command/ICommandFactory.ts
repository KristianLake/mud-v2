import { ICommand } from './ICommand';

export interface ICommandFactory {
  createCommand(commandName: string, args: string[]): ICommand | null;
}
