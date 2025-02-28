import { BasicStrategy } from './BasicStrategy';

export class QuestStrategy extends BasicStrategy {
  constructor(commandName: string, args: string[]) {
    super(commandName, args);
  }

  execute(): string {
    return `Quest information for: ${this.getArgs().join(' ') || 'all quests'}`;
  }
}
