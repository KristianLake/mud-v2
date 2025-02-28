import { logger } from '../../../utils/logger';

/**
 * Utility class for parsing command strings
 */
export class CommandParser {
  /**
   * Parse a command string into command name and arguments
   * @param commandString Raw command string
   * @returns Object containing command name and arguments array
   */
  static parse(commandString: string): { command: string; args: string[] } {
    const trimmed = commandString.trim();
    
    if (!trimmed) {
      return { command: '', args: [] };
    }
    
    // Handle quoted arguments
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];
      
      if (char === '"' && (i === 0 || trimmed[i-1] !== '\\')) {
        inQuotes = !inQuotes;
        continue;
      }
      
      if (char === ' ' && !inQuotes) {
        if (current) {
          parts.push(current);
          current = '';
        }
        continue;
      }
      
      current += char;
    }
    
    if (current) {
      parts.push(current);
    }
    
    const command = parts.shift() || '';
    const args = parts;
    
    logger.debug(`Parsed command: "${command}" with args: ${JSON.stringify(args)}`);
    
    return { command: command.toLowerCase(), args };
  }

  /**
   * Helper function to split a string into words, preserving quoted sections
   * @param text Text to split
   * @returns Array of words
   */
  static splitIntoWords(text: string): string[] {
    // Use regular expression to split on spaces while preserving quoted segments
    const matches = text.match(/[^\s"]+|"([^"]*)"/g) || [];
    
    // Remove quotes from the quoted segments
    return matches.map(part => {
      if (part.startsWith('"') && part.endsWith('"')) {
        return part.substring(1, part.length - 1);
      }
      return part;
    });
  }

  /**
   * Check if a string is a valid command name
   * @param commandName String to check
   * @returns True if valid command name
   */
  static isValidCommandName(commandName: string): boolean {
    // Command names should be alphanumeric with optional hyphens, at least 1 character
    return /^[a-z0-9-]+$/i.test(commandName);
  }
}
