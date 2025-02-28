import { BaseCommand } from '../BaseCommand';
import { GameState } from '../../../core/GameStateFactory';
import { IEventService } from '../../event/IEventService';
import { logger } from '../../../../utils/logger';

/**
 * Command to look at the current room or a specific object
 */
export class LookCommand extends BaseCommand {
  constructor(eventService: IEventService) {
    super(eventService);
    logger.debug('LookCommand initialized');
  }

  /**
   * Execute the look command
   * @param state Current game state
   * @param args Command arguments
   */
  async execute(state: GameState, ...args: string[]): Promise<void> {
    logger.debug(`Executing look command with args: ${args.join(', ')}`);
    
    // If no arguments, look at the current room
    if (args.length === 0) {
      await this.lookAtRoom(state);
      return;
    }
    
    // Otherwise, look at a specific target
    const target = args.join(' ').toLowerCase();
    await this.lookAtTarget(state, target);
  }

  /**
   * Look at the current room
   * @param state Current game state
   */
  private async lookAtRoom(state: GameState): Promise<void> {
    const currentRoomId = state.player.currentRoom;
    const room = state.world.rooms[currentRoomId];
    
    if (!room) {
      this.sendError('You are in an unknown location.');
      return;
    }
    
    let description = `${room.name}\n\n${room.description}`;
    
    // Add exits
    if (room.exits && Object.keys(room.exits).length > 0) {
      description += '\n\nExits:';
      for (const [direction, exit] of Object.entries(room.exits)) {
        description += ` ${direction}`;
      }
    } else {
      description += '\n\nThere are no obvious exits.';
    }
    
    // Add items in the room
    if (room.items && room.items.length > 0) {
      description += '\n\nYou see:';
      for (const itemId of room.items) {
        const item = state.world.items[itemId];
        if (item) {
          description += `\n- ${item.name}`;
        }
      }
    }
    
    // Add NPCs in the room
    if (room.npcs && room.npcs.length > 0) {
      description += '\n\nPresent here:';
      for (const npcId of room.npcs) {
        const npc = state.world.npcs[npcId];
        if (npc) {
          description += `\n- ${npc.name}`;
        }
      }
    }
    
    this.sendMessage(description);
  }

  /**
   * Look at a specific target (item, NPC, etc.)
   * @param state Current game state
   * @param target Target to look at
   */
  private async lookAtTarget(state: GameState, target: string): Promise<void> {
    const currentRoomId = state.player.currentRoom;
    const room = state.world.rooms[currentRoomId];
    
    if (!room) {
      this.sendError('You are in an unknown location.');
      return;
    }
    
    // Check if it's an exit
    if (room.exits && room.exits[target]) {
      const exitRoomId = room.exits[target];
      const exitRoom = state.world.rooms[exitRoomId];
      
      if (exitRoom) {
        this.sendMessage(`You look ${target} and see ${exitRoom.name}.`);
      } else {
        this.sendMessage(`You look ${target} but can't see what's there.`);
      }
      return;
    }
    
    // Check if it's an item in the room
    if (room.items) {
      for (const itemId of room.items) {
        const item = state.world.items[itemId];
        if (item && item.name.toLowerCase() === target) {
          this.sendMessage(item.description || `You see ${item.name}.`);
          return;
        }
      }
    }
    
    // Check if it's an NPC in the room
    if (room.npcs) {
      for (const npcId of room.npcs) {
        const npc = state.world.npcs[npcId];
        if (npc && npc.name.toLowerCase() === target) {
          this.sendMessage(npc.description || `You see ${npc.name}.`);
          return;
        }
      }
    }
    
    // Check if it's an item in the player's inventory
    if (state.player.inventory) {
      for (const itemId of state.player.inventory) {
        const item = state.world.items[itemId];
        if (item && item.name.toLowerCase() === target) {
          this.sendMessage(item.description || `You see ${item.name}.`);
          return;
        }
      }
    }
    
    // If we get here, the target wasn't found
    this.sendMessage(`You don't see any "${target}" here.`);
  }

  getName(): string {
    return 'look';
  }

  getDescription(): string {
    return 'Look at your surroundings or a specific object';
  }

  getAliases(): string[] {
    return ['l', 'examine', 'x'];
  }

  getUsage(): string[] {
    return [
      'look - Look at the current room',
      'look <direction> - Look in a specific direction',
      'look <object> - Look at a specific object or NPC'
    ];
  }
}
