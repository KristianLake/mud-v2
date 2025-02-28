/**
 * Interface for processing command input
 */
export interface ICommandProcessor {
  /**
   * Process a command input string
   * @param input The command input string
   * @returns Response message from processing the command
   */
  process(input: string): string;
}
