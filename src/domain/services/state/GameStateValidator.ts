import { IStateValidator } from './IStateValidator';
import { GameState } from '../../../types';
import { logger } from '../../../utils/logger';

/**
 * Validator for game state structure
 * Single Responsibility: Validate game state structure
 */
export class GameStateValidator implements IStateValidator {
  /**
   * Get validation errors for a state
   * @param state State to validate
   * @returns Array of error messages
   */
  getValidationErrors(state: any): string[] {
    const errors: string[] = [];

    // Check if state is an object
    if (!state || typeof state !== 'object') {
      errors.push('State must be an object');
      return errors;
    }

    // Check required top-level properties
    const requiredProperties = [
      'playerLocation',
      'playerInventory',
      'playerGold',
      'playerHealth',
      'timeOfDay',
      'questLog',
      'playerStats',
      'rooms',
      'npcs',
      'items'
    ];

    for (const prop of requiredProperties) {
      if (!(prop in state)) {
        errors.push(`Missing required property: ${prop}`);
      }
    }

    // Check playerStats required properties
    if (state.playerStats && typeof state.playerStats === 'object') {
      const requiredStats = ['maxHealth', 'baseAttack', 'baseDefense'];
      for (const stat of requiredStats) {
        if (!(stat in state.playerStats)) {
          errors.push(`Missing required player stat: ${stat}`);
        }
      }
    }

    // Validate rooms structure if present
    if (state.rooms && typeof state.rooms === 'object') {
      // Check player location exists in rooms
      if (state.playerLocation && !(state.playerLocation in state.rooms)) {
        errors.push(`Invalid playerLocation: ${state.playerLocation} not found in rooms`);
      }

      // Validate room properties
      Object.entries(state.rooms).forEach(([id, room]: [string, any]) => {
        if (!room || typeof room !== 'object') {
          errors.push(`Invalid room object for ID: ${id}`);
          return;
        }

        // Check required room properties
        const requiredRoomProps = ['id', 'name', 'description', 'exits', 'items', 'npcs'];
        for (const prop of requiredRoomProps) {
          if (!(prop in room)) {
            errors.push(`Room ${id} missing required property: ${prop}`);
          }
        }

        // Validate exits structure
        if (room.exits && typeof room.exits !== 'object') {
          errors.push(`Room ${id} has invalid exits (should be an object)`);
        }

        // Validate items array
        if (!Array.isArray(room.items)) {
          errors.push(`Room ${id} has invalid items (should be an array)`);
        }

        // Validate npcs array
        if (!Array.isArray(room.npcs)) {
          errors.push(`Room ${id} has invalid npcs (should be an array)`);
        }
      });
    }

    // Validate playerInventory is an array
    if (state.playerInventory && !Array.isArray(state.playerInventory)) {
      errors.push('playerInventory must be an array');
    }

    // Validate playerGold is a number
    if (state.playerGold !== undefined && typeof state.playerGold !== 'number') {
      errors.push('playerGold must be a number');
    }

    // Validate playerHealth is a number
    if (state.playerHealth !== undefined && typeof state.playerHealth !== 'number') {
      errors.push('playerHealth must be a number');
    }

    logger.debug('Validation results', { hasErrors: errors.length > 0, errors });
    return errors;
  }

  /**
   * Check if a state change is valid
   * @param currentState Current state
   * @param newState New state
   * @returns True if the change is valid
   */
  isValidChange(currentState: any, newState: any): boolean {
    const errors = this.getValidationErrors(newState);
    return errors.length === 0;
  }
}
