/**
 * Interface for the command service
 */
export interface ICommandService {
  /**
   * Execute a command string
   * @param commandString The command to execute
   * @returns Promise resolving when execution completes
   */
  executeCommand(commandString: string): Promise<void>;
  
  /**
   * Get command history
   * @returns Array of previously executed commands
   */
  getCommandHistory(): string[];
  
  /**
   * Check if a command is valid
   * @param commandString Command to validate
   * @returns True if valid
   */
  isValidCommand(commandString: string): boolean;
  
  /**
   * Get available commands
   * @returns Array of command names
   */
  getAvailableCommands(): string[];
  
  /**
   * Register a new command
   * @param commandName Command name
   * @param handler Command handler
   */
  registerCommand(commandName: string, handler: Function): void;
}
