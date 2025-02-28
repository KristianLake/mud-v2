import { BasicStrategy } from './BasicStrategy';

export class ItemStrategy extends BasicStrategy {
  constructor(commandName: string, args: string[]) {
    super(commandName, args);
  }

  execute(): string {
    return `Handling item: ${this.getArgs().join(' ')}`;
  }
}
