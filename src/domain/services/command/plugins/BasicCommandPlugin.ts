import { ICommandPlugin } from '../ICommandPlugin';
import { ICommandRegistry } from '../ICommandRegistry';
import { LookCommand } from '../commands/LookCommand';
import { HelpCommand } from '../commands/HelpCommand';
import { StatusCommand } from '../commands/StatusCommand';
import { InventoryCommand } from '../commands/InventoryCommand';
import { BasicStrategy } from '../strategies/BasicStrategy';
import { BaseCommandPlugin } from './BaseCommandPlugin';

export class BasicCommandPlugin extends BaseCommandPlugin implements ICommandPlugin {
  register(registry: ICommandRegistry): void {
    this.registerCommand(registry, new LookCommand(new BasicStrategy('look', [])));
    this.registerCommand(registry, new HelpCommand(new BasicStrategy('help', [])));
    this.registerCommand(registry, new StatusCommand(new BasicStrategy('status', [])));
    this.registerCommand(registry, new InventoryCommand(new BasicStrategy('inventory', [])));
  }
}
