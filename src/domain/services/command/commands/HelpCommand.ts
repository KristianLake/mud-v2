import { BaseCommand } from '../BaseCommand';
import { GameState } from '../../../core/GameStateFactory';
import { IEventService } from '../../event/IEventService';
import { ICommandRegistry } from '../ICommandRegistry';
import { logger } from '../../../../utils/logger';

/**
 * Command to display help information
 */
export class HelpCommand extends BaseCommand {
  constructor(
    eventService: IEventService,
    private commandRegistry: ICommandRegistry
  ) {
    super(eventService);
    logger.debug('HelpCommand initialized');
  }

  /**
   * Execute the help command
   * @param state Current game state
   * @param args Command arguments
   */
  async execute(state: GameState, ...args: string[]): Promise<void> {
    logger.debug(`Executing help command with args: ${args.join(', ')}`);
    
    // If a specific command is requested, show help for that command
    if (args.length > 0 && args[0].trim()) {
      const commandName = args[0].toLowerCase();
      await this.showCommandHelp(commandName);
      return;
    }
    
    // Otherwise show general help
    await this.showGeneralHelp();
  }

  /**
   * Show help for a specific command
   * @param commandName Name of the command to show help for
   */
  private async showCommandHelp(commandName: string): Promise<void> {
    const command = this.commandRegistry.getCommand(commandName);
    
    if (!command) {
      this.sendError(`Unknown command: ${commandName}`);
      return;
    }
    
    // If it's a command object with help methods
    if (typeof command === 'object' && command !== null) {
      if ('getName' in command && 'getDescription' in command && 'getUsage' in command) {
        const name = command.getName();
        const description = command.getDescription();
        const usage = command.getUsage().join('\n');
        const aliases = 'getAliases' in command ? command.getAliases().join(', ') : '';
        
        let helpText = `Command: ${name}\n\n${description}\n\nUsage:\n${usage}`;
        
        if (aliases) {
          helpText += `\n\nAliases: ${aliases}`;
        }
        
        this.sendMessage(helpText);
        return;
      }
    }
    
    // Fallback for function handlers or objects without help methods
    this.sendMessage(`${commandName}: No detailed help available.`);
  }

  /**
   * Show general help with list of available commands
   */
  private async showGeneralHelp(): Promise<void> {
    const commands = this.commandRegistry.getAvailableCommands();
    
    if (commands.length === 0) {
      this.sendMessage('No commands are currently available.');
      return;
    }
    
    let helpText = 'Available commands:\n\n';
    
    // Get descriptions for commands that are objects with getDescription
    for (const commandName of commands) {
      const command = this.commandRegistry.getCommand(commandName);
      
      if (typeof command === 'object' && command !== null && 'getDescription' in command) {
        helpText += `${commandName} - ${command.getDescription()}\n`;
      } else {
        helpText += `${commandName}\n`;
      }
    }
    
    helpText += '\nType "help <command>" for more information about a specific command.';
    
    this.sendMessage(helpText);
  }

  getName(): string {
    return 'help';
  }

  getDescription(): string {
    return 'Display help information about available commands';
  }

  getAliases(): string[] {
    return ['?', 'commands'];
  }

  getUsage(): string[] {
    return [
      'help - Show list of all commands',
      'help <command> - Show detailed help for a specific command'
    ];
  }
}
