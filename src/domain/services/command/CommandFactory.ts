import { ICommandFactory } from './ICommandFactory';
import { ICommand } from './ICommand';
import { ICommandStrategy } from './strategies/ICommandStrategy';
import { BasicStrategy } from './strategies/BasicStrategy';
import { MovementStrategy } from './strategies/MovementStrategy';
import { ItemStrategy } from './strategies/ItemStrategy';
import { NPCStrategy } from './strategies/NPCStrategy';
import { QuestStrategy } from './strategies/QuestStrategy';

// Import commands
import { LookCommand } from './commands/LookCommand';
import { MoveCommand } from './commands/MoveCommand';
import { InventoryCommand } from './commands/InventoryCommand';
import { StatusCommand } from './commands/StatusCommand';
import { HelpCommand } from './commands/HelpCommand';
import { TalkCommand } from './commands/TalkCommand';
import { ItemCommand } from './commands/ItemCommand';
import { QuestCommand } from './commands/QuestCommand';
import { TradeCommand } from './commands/TradeCommand';

export class CommandFactory implements ICommandFactory {
  createCommand(commandName: string, args: string[] = []): ICommand | null {
    const lowerCommandName = commandName.toLowerCase();
    
    // Handle movement commands (including directional shortcuts)
    if (this.isMovementCommand(lowerCommandName)) {
      const direction = this.getDirectionFromCommand(lowerCommandName);
      const strategy = new MovementStrategy(direction);
      return new MoveCommand(strategy);
    }
    
    // Handle other commands
    switch (lowerCommandName) {
      case 'look':
      case 'l':
        return new LookCommand(new BasicStrategy());
        
      case 'inventory':
      case 'i':
        return new InventoryCommand(new BasicStrategy());
        
      case 'status':
      case 'st':
        return new StatusCommand(new BasicStrategy());
        
      case 'help':
      case 'h':
        return new HelpCommand(new BasicStrategy());
        
      case 'talk':
      case 't':
        return new TalkCommand(new NPCStrategy());
        
      case 'take':
      case 'get':
        const takeItemName = args.join(' ');
        return new ItemCommand(new ItemStrategy('take', takeItemName));
        
      case 'drop':
        const dropItemName = args.join(' ');
        return new ItemCommand(new ItemStrategy('drop', dropItemName));
        
      case 'quest':
      case 'q':
        return new QuestCommand(new QuestStrategy());
        
      case 'buy':
        const buyItemName = args.join(' ');
        return new TradeCommand(new ItemStrategy('buy', buyItemName));
        
      case 'sell':
        const sellItemName = args.join(' ');
        return new TradeCommand(new ItemStrategy('sell', sellItemName));
        
      case 'go':
        if (args.length > 0) {
          const direction = args[0].toLowerCase();
          if (this.isValidDirection(direction)) {
            return new MoveCommand(new MovementStrategy(direction));
          }
        }
        return null;
        
      default:
        return null;
    }
  }
  
  private isMovementCommand(command: string): boolean {
    return this.isValidDirection(command);
  }
  
  private isValidDirection(direction: string): boolean {
    const validDirections = ['north', 'east', 'south', 'west', 'up', 'down', 'n', 'e', 's', 'w', 'u', 'd'];
    return validDirections.includes(direction);
  }
  
  private getDirectionFromCommand(command: string): string {
    // Map direction shortcuts to full direction names
    const directionMap: Record<string, string> = {
      'n': 'north',
      'e': 'east',
      's': 'south',
      'w': 'west',
      'u': 'up',
      'd': 'down'
    };
    
    // If it's a shortcut, return the full direction name, otherwise return the command as is
    return directionMap[command] || command;
  }
}
