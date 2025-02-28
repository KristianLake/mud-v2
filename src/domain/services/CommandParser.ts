import { logger } from '../../utils/logger';

export class CommandParser {
  private static readonly validCommands = [
    'move', 'go', 'north', 'south', 'east', 'west', 'up', 'down',
    'look', 'examine', 'inspect',
    'inventory', 'inv', 'i',
    'take', 'pickup', 'get', 'drop', 
    'talk', 'speak', 'chat',
    'buy', 'sell', 'trade',
    'status', 'stats',
    'help',
    'quit'
  ];

  // Extract command and arguments from user input
  static parse(input: string): { command: string, args: string[] } {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      return { command: '', args: [] };
    }

    const parts = trimmedInput.split(' ');
    let command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Normalize direction commands to 'move' command
    if (['north', 'south', 'east', 'west', 'up', 'down'].includes(command)) {
      return {
        command: 'move',
        args: [command]
      };
    }

    // Normalize synonyms
    command = CommandParser.normalizeCommand(command);

    return { command, args };
  }

  // Normalize command aliases to standard commands
  private static normalizeCommand(command: string): string {
    switch (command) {
      case 'go':
        return 'move';
      case 'pickup':
      case 'get':
        return 'take';
      case 'speak':
      case 'chat':
        return 'talk';
      case 'inv':
      case 'i':
        return 'inventory';
      case 'stats':
        return 'status';
      case 'examine':
      case 'inspect':
        return 'look';
      default:
        return command;
    }
  }

  // Validate if the command is recognized
  static isValidCommand(command: string): boolean {
    return CommandParser.validCommands.includes(command);
  }
}
