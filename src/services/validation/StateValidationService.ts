import { GameState, Room, NPC, Item } from '../../types';
import { logger } from '../../utils/logger';

/**
 * Service dedicated to state validation
 * Single Responsibility: Validate game state entities
 */
export class StateValidationService {
  validateItem(item: any): item is Item {
    if (!item || typeof item !== 'object') {
      logger.warn('Invalid item', { item });
      return false;
    }

    // Check required properties
    if (!item.id || !item.name) {
      logger.warn('Item missing required properties', { item });
      return false;
    }

    // Ensure isPortable is a boolean
    if (typeof item.isPortable !== 'boolean') {
      // Default to true for items that should be portable
      if (item.type === 'currency' || item.type === 'consumable' || item.type === 'equipment') {
        item.isPortable = true;
      } else {
        item.isPortable = false;
      }
      logger.warn('Item missing isPortable property, using default', { 
        item,
        defaultPortable: item.isPortable 
      });
    }

    return true;
  }

  validateInventoryItem(item: any): item is Item {
    if (!this.validateItem(item)) {
      return false;
    }

    // Check if item is equipped
    if (typeof item.equipped !== 'boolean') {
      // Default to not equipped if property is missing
      item.equipped = false;
      logger.warn('Item missing equipped property, defaulting to false', { item });
    }

    return true;
  }

  validateNPC(npc: any): npc is NPC {
    if (!npc || typeof npc !== 'object') {
      logger.warn('Invalid NPC reference', { npcId: npc });
      return false;
    }

    // Check required properties
    if (!npc.id || !npc.name || !npc.currentRoomId) {
      logger.warn('NPC missing required properties', { npc });
      return false;
    }

    return true;
  }

  validateRoom(room: any): room is Room {
    if (!room || typeof room !== 'object') {
      logger.warn('Invalid room', { room });
      return false;
    }

    // Check required properties
    if (!room.id || !room.name || !room.description) {
      logger.warn('Room missing required properties', { room });
      return false;
    }

    // Validate exits
    if (!room.exits || typeof room.exits !== 'object') {
      logger.warn('Room has invalid exits', { room });
      return false;
    }

    return true;
  }
}
