import { ICommandPlugin } from '../ICommandPlugin';
import { ICommandRegistry } from '../ICommandRegistry';
import { ICommand } from '../ICommand';
import { BaseGameService } from '../../BaseGameService';

export abstract class BaseCommandPlugin extends BaseGameService implements ICommandPlugin {
    abstract register(registry: ICommandRegistry): void;

    protected registerCommand(registry: ICommandRegistry, command: ICommand): void {
        registry.registerCommand(command);
    }
}
