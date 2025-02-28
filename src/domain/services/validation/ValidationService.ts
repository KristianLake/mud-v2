import { GameState } from '../../../types';
import { IStateValidator } from '../state/IStateValidator';
import { logger } from '../../../utils/logger';

/**
 * Service responsible for validation only
 * Single Responsibility: Validate game state
 */
export class ValidationService implements IStateValidator {
  validate(state: GameState | null | undefined): boolean {
    if (!state) {
      logger.error('State validation failed: state is null or undefined');
      return false;
    }

    const errors = this.getValidationErrors(state);
    return errors.length === 0;
  }

  getValidationErrors(state: GameState | null | undefined): string[] {
    if (!state) {
      return ['State cannot be null or undefined'];
    }

    try {
      // Basic structure validation
      if (typeof state !== 'object') {
        return ['State must be an object'];
      }

      // Required properties validation
      const requiredProps = [
        'rooms',
        'npcs',
        'playerLocation',
        'playerInventory',
        'playerGold',
        'playerHealth',
        'timeOfDay',
        'questLog',
        'playerStats'
      ];

      const missingProps = requiredProps.filter(prop => !(prop in state));
      if (missingProps.length > 0) {
        return [`Missing required properties: ${missingProps.join(', ')}`];
      }

      // Validate rooms
      if (!state.rooms || typeof state.rooms !== 'object') {
        return ['Invalid rooms object'];
      }

      // Validate player location exists
      if (!state.rooms[state.playerLocation]) {
        return [`Invalid player location: ${state.playerLocation}`];
      }

      // Validate player stats
      const requiredStats = ['baseAttack', 'baseDefense', 'maxHealth'];
      const missingStats = requiredStats.filter(stat => !(stat in state.playerStats));
      if (missingStats.length > 0) {
        return [`Missing required player stats: ${missingStats.join(', ')}`];
      }

      // Validate room properties
      const roomErrors: string[] = [];
      Object.entries(state.rooms).forEach(([id, room]) => {
        if (!room || typeof room !== 'object') {
          roomErrors.push(`Invalid room object for ID: ${id}`);
          return;
        }

        if (!room.description || typeof room.description !== 'string') {
          roomErrors.push(`Missing or invalid description for room: ${id}`);
        }

        if (!Array.isArray(room.items)) {
          roomErrors.push(`Invalid items array for room: ${id}`);
        }

        if (!Array.isArray(room.npcs)) {
          roomErrors.push(`Invalid npcs array for room: ${id}`);
        }

        // Validate exits
        if (room.exits) {
          Object.entries(room.exits).forEach(([direction, targetId]) => {
            if (targetId !== null && !state.rooms[targetId]) {
              roomErrors.push(`Invalid exit target in room ${id}: ${targetId}`);
            }
          });
        }
      });

      if (roomErrors.length > 0) {
        return roomErrors;
      }

      // Validate NPCs
      const npcErrors: string[] = [];
      Object.entries(state.npcs).forEach(([id, npc]) => {
        if (!npc || typeof npc !== 'object') {
          npcErrors.push(`Invalid NPC object for ID: ${id}`);
          return;
        }

        if (!npc.currentRoomId || !state.rooms[npc.currentRoomId]) {
          npcErrors.push(`Invalid room reference for NPC ${id}: ${npc.currentRoomId}`);
        }

        if (!Array.isArray(npc.inventory)) {
          npcErrors.push(`Invalid inventory array for NPC ${id}`);
        }

        if (!Array.isArray(npc.dialogue)) {
          npcErrors.push(`Invalid dialogue array for NPC ${id}`);
        }
      });

      if (npcErrors.length > 0) {
        return npcErrors;
      }

      // Validate quest log
      if (!Array.isArray(state.questLog)) {
        return ['Invalid quest log: must be an array'];
      }

      // All validations passed
      return [];

    } catch (error) {
      logger.error('Error during state validation:', error);
      return ['Internal validation error'];
    }
  }
}
