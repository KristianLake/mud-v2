import { ICommandService } from './ICommandService';
import { IStateService } from '../state/IStateService';
import { ICommandRegistry } from './ICommandRegistry';
import { IEventService } from '../event/IEventService';
import { logger } from '../../../utils/logger';

/**
 * Service for executing game commands
 * Implements the ICommandService interface
 */
export class CommandService implements ICommandService {
  private commandHistory: string[] = [];
  
  constructor(
    private stateService: IStateService,
    private commandRegistry: ICommandRegistry,
    private eventService: IEventService
  ) {
    logger.debug('CommandService initialized');
  }

  /**
   * Execute a command string
   * @param commandString The command to execute
   * @returns Promise that resolves when the command execution is complete
   */
  async executeCommand(commandString: string): Promise<void> {
    if (!commandString.trim()) {
      return;
    }
    
    // Add to history
    this.commandHistory.push(commandString);
    
    // Parse the command string
    const [commandName, ...args] = commandString.trim().split(/\s+/);
    const normalizedCommand = commandName.toLowerCase();
    
    logger.debug(`Executing command: ${normalizedCommand} with args: ${args.join(', ')}`);
    
    // Emit command execution event
    this.eventService.emit('command:execute', { command: normalizedCommand, args });
    
    // Get the command handler
    const handler = this.commandRegistry.getCommand(normalizedCommand);
    
    if (!handler) {
      logger.warn(`Unknown command: ${normalizedCommand}`);
      this.eventService.emit('command:error', { 
        message: `Unknown command: ${normalizedCommand}`,
        command: normalizedCommand
      });
      return;
    }
    
    try {
      // Execute the handler with the current state and arguments
      await handler(this.stateService.getState(), ...args);
      this.eventService.emit('command:complete', { command: normalizedCommand, args });
    } catch (error) {
      logger.error(`Error executing command ${normalizedCommand}`, error);
      this.eventService.emit('command:error', { 
        message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
        command: normalizedCommand,
        error
      });
    }
  }

  /**
   * Get the command history
   * @returns Array of previously executed commands
   */
  getCommandHistory(): string[] {
    return [...this.commandHistory];
  }

  /**
   * Check if a command is valid
   * @param commandString The command to validate
   * @returns True if the command is valid
   */
  isValidCommand(commandString: string): boolean {
    if (!commandString.trim()) return false;
    
    const [commandName] = commandString.trim().split(/\s+/);
    return this.commandRegistry.hasCommand(commandName.toLowerCase());
  }

  /**
   * Get available commands
   * @returns Array of available command names
   */
  getAvailableCommands(): string[] {
    return this.commandRegistry.getAvailableCommands();
  }

  /**
   * Register new command handlers
   * @param commandName The name of the command
   * @param handler The handler function for the command
   */
  registerCommand(commandName: string, handler: Function): void {
    this.commandRegistry.registerCommand(commandName, handler);
  }
}
