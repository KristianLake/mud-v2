import { ICommandPlugin } from '../ICommandPlugin';
import { ICommandRegistry } from '../ICommandRegistry';
import { MoveCommand } from '../commands/MoveCommand';
import { MovementStrategy } from '../strategies/MovementStrategy';
import { BaseCommandPlugin } from './BaseCommandPlugin';

export class MovementCommandPlugin extends BaseCommandPlugin implements ICommandPlugin {
  register(registry: ICommandRegistry): void {
    // Register different movement commands for each direction
    this.registerCommand(registry, new MoveCommand(new MovementStrategy('move', ['north'])));
    this.registerCommand(registry, new MoveCommand(new MovementStrategy('move', ['south'])));
    this.registerCommand(registry, new MoveCommand(new MovementStrategy('move', ['east'])));
    this.registerCommand(registry, new MoveCommand(new MovementStrategy('move', ['west'])));
  }
}
