import { GameState } from '../../core/GameStateFactory';

/**
 * Interface for individual commands in the game
 */
export interface ICommand {
  /**
   * Execute the command with provided arguments
   * @param state Current game state
   * @param args Command arguments
   * @returns Promise that resolves when command execution is complete
   */
  execute(state: GameState, ...args: string[]): Promise<void>;

  /**
   * Get the name of the command (primary invocation name)
   * @returns Command name
   */
  getName(): string;

  /**
   * Get array of alternate names (aliases) for the command
   * @returns Array of command aliases
   */
  getAliases(): string[];

  /**
   * Get description of the command for help text
   * @returns Command description
   */
  getDescription(): string;

  /**
   * Get usage examples for the command
   * @returns Array of example usages
   */
  getUsage(): string[];
}
