import { ICommand } from './ICommand';

/**
 * Interface for a registry of available commands
 */
export interface ICommandRegistry {
  /**
   * Register a command handler
   * @param commandName Name of the command
   * @param handler Function or object to handle the command
   */
  registerCommand(commandName: string, handler: Function | ICommand): void;
  
  /**
   * Get a command handler by name
   * @param commandName Name of the command
   * @returns Command handler or undefined if not found
   */
  getCommand(commandName: string): Function | ICommand | undefined;
  
  /**
   * Check if a command exists
   * @param commandName Name of the command to check
   * @returns True if the command exists
   */
  hasCommand(commandName: string): boolean;
  
  /**
   * Get all available command names
   * @returns Array of command names
   */
  getAvailableCommands(): string[];
  
  /**
   * Resolve an alias to its primary command name
   * @param alias Alias to resolve
   * @returns Primary command name or null if not an alias
   */
  resolveAlias(alias: string): string | null;
}
