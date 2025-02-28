import { BaseCommand } from '../BaseCommand';
import { ICommandStrategy } from '../strategies/ICommandStrategy';

export class InventoryCommand extends BaseCommand {
  constructor(strategy: ICommandStrategy) {
    super(strategy);
  }

  execute(): string {
    return this.strategy.execute();
  }
}
