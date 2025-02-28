import { ICommand } from './ICommand';
import { GameState } from '../../core/GameStateFactory';
import { IEventService } from '../event/IEventService';
import { logger } from '../../../utils/logger';

/**
 * Abstract base class for commands
 * Provides common functionality for all commands
 */
export abstract class BaseCommand implements ICommand {
  /**
   * Constructor for BaseCommand
   * @param eventService Event service for emitting events
   */
  constructor(protected eventService: IEventService) {}

  /**
   * Execute the command (must be implemented by derived classes)
   * @param state Current game state
   * @param args Command arguments
   */
  abstract execute(state: GameState, ...args: string[]): Promise<void>;

  /**
   * Get the primary name of the command (must be implemented by derived classes)
   */
  abstract getName(): string;

  /**
   * Get command description (must be implemented by derived classes)
   */
  abstract getDescription(): string;

  /**
   * Get command aliases, defaults to empty array
   * @returns Array of command aliases
   */
  getAliases(): string[] {
    return [];
  }

  /**
   * Get command usage examples, defaults to basic usage
   * @returns Array of usage examples
   */
  getUsage(): string[] {
    return [`${this.getName()}`];
  }

  /**
   * Helper to log and emit a message
   * @param messageText Message text to display
   * @param messageType Type of message (info, error, success)
   */
  protected sendMessage(messageText: string, messageType: 'info' | 'error' | 'success' = 'info'): void {
    logger.debug(`Command ${this.getName()} sending message: ${messageText}`);
    this.eventService.emit('message:add', {
      text: messageText,
      type: messageType,
      source: this.getName()
    });
  }

  /**
   * Helper to emit an error message
   * @param errorText Error message text
   */
  protected sendError(errorText: string): void {
    this.sendMessage(errorText, 'error');
  }

  /**
   * Helper to emit a success message
   * @param successText Success message text
   */
  protected sendSuccess(successText: string): void {
    this.sendMessage(successText, 'success');
  }
}
