import { ICommandRegistry } from './ICommandRegistry';
import { ICommand } from './ICommand';
import { logger } from '../../../utils/logger';

/**
 * Registry for managing available commands
 */
export class CommandRegistry implements ICommandRegistry {
  private commands: Map<string, Function | ICommand> = new Map();
  private aliases: Map<string, string> = new Map();

  constructor() {
    logger.debug('CommandRegistry initialized');
  }

  /**
   * Register a command handler
   * @param commandName Primary name of the command
   * @param handler Handler function or command object
   */
  registerCommand(commandName: string, handler: Function | ICommand): void {
    const normalizedName = commandName.toLowerCase();
    this.commands.set(normalizedName, handler);
    logger.debug(`Registered command: ${normalizedName}`);
    
    // If it's a command object with aliases, register those too
    if (typeof handler === 'object' && handler !== null && 'getAliases' in handler) {
      const aliases = handler.getAliases();
      aliases.forEach(alias => {
        const normalizedAlias = alias.toLowerCase();
        this.aliases.set(normalizedAlias, normalizedName);
        logger.debug(`Registered alias: ${normalizedAlias} -> ${normalizedName}`);
      });
    }
  }

  /**
   * Get a command handler by name or alias
   * @param commandName Command name or alias
   * @returns Command handler or undefined if not found
   */
  getCommand(commandName: string): Function | ICommand | undefined {
    const normalizedName = commandName.toLowerCase();
    
    // Check if it's a direct command
    if (this.commands.has(normalizedName)) {
      return this.commands.get(normalizedName);
    }
    
    // Check if it's an alias
    if (this.aliases.has(normalizedName)) {
      const primaryName = this.aliases.get(normalizedName);
      return primaryName ? this.commands.get(primaryName) : undefined;
    }
    
    return undefined;
  }

  /**
   * Check if a command exists
   * @param commandName Command name or alias to check
   * @returns True if the command exists
   */
  hasCommand(commandName: string): boolean {
    const normalizedName = commandName.toLowerCase();
    return this.commands.has(normalizedName) || this.aliases.has(normalizedName);
  }

  /**
   * Get all available command names
   * @returns Array of command names
   */
  getAvailableCommands(): string[] {
    return Array.from(this.commands.keys());
  }

  /**
   * Get a mapped command name from an alias
   * @param alias The alias to look up
   * @returns The primary command name or null if not found
   */
  resolveAlias(alias: string): string | null {
    const normalizedAlias = alias.toLowerCase();
    return this.aliases.has(normalizedAlias) 
      ? this.aliases.get(normalizedAlias) || null 
      : null;
  }
}
