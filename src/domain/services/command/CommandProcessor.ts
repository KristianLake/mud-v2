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
    
    try {
      if (!this.commandService.isValidCommand(command)) {
        return `Unknown command: ${command}. Type 'help' for a list of commands.`;
      }
      
      // Execute the command immediately and synchronously to get a response
      this.commandService.executeCommand(`${command} ${args.join(' ')}`);
      
      // Return a more informative response based on the command
      return `Command "${command}" executed successfully.`;
    } catch (error) {
      logger.error(`Error processing command: ${input}`, error);
      return `Error executing command: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
}
