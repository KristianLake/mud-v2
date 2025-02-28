import { ICommandPlugin } from '../ICommandPlugin';
import { ICommandRegistry } from '../ICommandRegistry';
import { ItemCommand } from '../commands/ItemCommand';
import { ItemStrategy } from '../strategies/ItemStrategy';
import { BaseCommandPlugin } from './BaseCommandPlugin';

export class ItemCommandPlugin extends BaseCommandPlugin implements ICommandPlugin {
    register(registry: ICommandRegistry): void {
        // Register different variations of ItemCommand with different arguments
        this.registerCommand(registry, new ItemCommand(new ItemStrategy('take', ['item'])));    // take <item>
        this.registerCommand(registry, new ItemCommand(new ItemStrategy('drop', ['item'])));    // drop <item>
        this.registerCommand(registry, new ItemCommand(new ItemStrategy('use', ['item'])));     // use <item>
        this.registerCommand(registry, new ItemCommand(new ItemStrategy('use', ['item', 'target']))); // use <item> on <target>
    }
}
