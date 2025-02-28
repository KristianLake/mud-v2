import { ICommandRegistry } from './ICommandRegistry';
import { IStateService } from '../state/IStateService';
import { CommandParser } from './CommandParser';
import { IEventService } from '../event/IEventService';
import { EventTypes } from '../event/types';
import { logger } from '../../../utils/logger';

/**
 * Executes game commands
 */
export class CommandExecutor {
  /**
   * Constructor for CommandExecutor
   * @param commandRegistry Registry containing available commands
   * @param stateService Service for accessing game state
   * @param eventService Service for emitting events
   */
  constructor(
    private commandRegistry: ICommandRegistry,
    private stateService: IStateService,
    private eventService: IEventService
  ) {
    logger.debug('CommandExecutor initialized');
  }

  /**
   * Execute a command string
   * @param commandString The command string to execute
   * @returns Promise that resolves when execution is complete
   */
  async execute(commandString: string): Promise<void> {
    const { command, args } = CommandParser.parse(commandString);
    
    if (!command) {
      logger.warn('Attempted to execute empty command');
      return;
    }
    
    const handler = this.commandRegistry.getCommand(command);
    
    if (!handler) {
      logger.warn(`Unknown command: ${command}`);
      this.eventService.emit(EventTypes.COMMAND_ERROR, {
        message: `Unknown command: ${command}`,
        command
      });
      return;
    }
    
    logger.debug(`Executing command: ${command} with args: ${args.join(', ')}`);
    
    try {
      this.eventService.emit(EventTypes.COMMAND_EXECUTE, { command, args });
      
      // Execute the command
      if (typeof handler === 'function') {
        // Function handler
        await handler(this.stateService.getState(), ...args);
      } else if (typeof handler === 'object' && handler !== null && 'execute' in handler) {
        // Command object with execute method
        await handler.execute(this.stateService.getState(), ...args);
      } else {
        throw new Error(`Invalid command handler for ${command}`);
      }
      
      this.eventService.emit(EventTypes.COMMAND_COMPLETE, { command, args });
    } catch (error) {
      logger.error(`Error executing command ${command}`, error);
      this.eventService.emit(EventTypes.COMMAND_ERROR, {
        message: error instanceof Error ? error.message : String(error),
        command,
        error
      });
    }
  }
}
