import { ICommandStrategy } from './ICommandStrategy';

export class BasicStrategy implements ICommandStrategy {
  private commandName: string;
  private args: string[];

  constructor(commandName: string, args: string[]) {
    this.commandName = commandName;
    this.args = args;
  }

  getName(): string {
    return this.commandName;
  }

  getArgs(): string[] {
    return this.args;
  }

  execute(): string {
    return '';
  }
}
