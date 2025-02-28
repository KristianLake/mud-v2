import { ICommandProcessor } from './ICommandProcessor';
import { ICommandService } from './ICommandService';
import { CommandParser } from './CommandParser';
import { logger } from '../../../utils/logger';

/**
 * Processes command input and returns responses
 */
export class CommandProcessor implements ICommandProcessor {
  /**
   * Constructor for the CommandProcessor
   * @param commandService Command service to execute commands
   */
  constructor(private commandService: ICommandService) {
    logger.debug('CommandProcessor initialized');
  }

  /**
   * Process a command input string
   * @param input The command input string
   * @returns Response message from the command processing
   */
  process(input: string): string {
    logger.debug(`Processing command input: ${input}`);
    
    if (!input.trim()) {
      return 'Please enter a command.';
    }
    
    const { command, args } = CommandParser.parse(input);
    
    if (!command) {
      return 'Please enter a valid command.';
    }
    
    if (!this.commandService.isValidCommand(command)) {
      return `Unknown command: ${command}. Type 'help' for a list of commands.`;
    }
    
    // Since commandService.executeCommand is async, we can't directly return its result
    // Instead, we return a message that the command is being processed
    // The actual results will be emitted through the event system
    this.commandService.executeCommand(`${command} ${args.join(' ')}`);
    
    return `Executing command: ${command}`;
  }
}
