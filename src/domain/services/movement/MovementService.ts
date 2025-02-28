import { IMovementService } from './IMovementService';
import { IStateService } from '../state/IStateService';
import { IEntityService } from '../entity/IEntityService';
import { IEventService } from '../event/IEventService';
import { IMessageService } from '../messaging/IMessageService';
import { IRoom } from '../../entities/interfaces/IRoom';
import { Room } from '../../entities/implementations/Room';
import { logger } from '../../../utils/logger';

/**
 * Service for managing player movement
 * Single Responsibility: Handles player movement and location
 */
export class MovementService implements IMovementService {
  // Direction mappings for better UX
  private readonly DIRECTION_ALIASES: Record<string, string> = {
    'n': 'north',
    's': 'south',
    'e': 'east',
    'w': 'west',
    'u': 'up',
    'd': 'down',
    'nw': 'northwest',
    'ne': 'northeast',
    'sw': 'southwest',
    'se': 'southeast'
  };
  
  // Opposite directions for automatic exit creation
  private readonly OPPOSITE_DIRECTIONS: Record<string, string> = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'up': 'down',
    'down': 'up',
    'northwest': 'southeast',
    'northeast': 'southwest',
    'southwest': 'northeast',
    'southeast': 'northwest'
  };
  
  constructor(
    private readonly stateService: IStateService,
    private readonly entityService: IEntityService,
    private readonly eventService: IEventService,
    private readonly messageService: IMessageService
  ) {
    logger.debug('MovementService initialized');
    this.initialize();
  }
  
  /**
   * Initialize the service
   */
  private initialize(): void {
    // Ensure bidirectional room connections
    this.ensureBidirectionalExits();
    logger.debug('MovementService: Initialized bidirectional exits');
  }
  
  /**
   * Move player in a direction
   */
  move(direction: string): boolean {
    // Normalize direction (handle aliases)
    const normalizedDirection = this.normalizeDirection(direction);
    
    // Get current room
    const currentRoom = this.getCurrentRoom();
    if (!currentRoom) {
      this.messageService.addErrorMessage("You are in an unknown location!");
      return false;
    }
    
    // Check if direction is valid
    if (!this.isValidDirection(normalizedDirection)) {
      this.messageService.addErrorMessage(`You can't go ${normalizedDirection} from here.`);
      return false;
    }
    
    // Get destination room ID
    const destRoomId = currentRoom.exits[normalizedDirection];
    
    // Check if destination room exists
    const destRoom = this.entityService.getRoom(destRoomId);
    if (!destRoom) {
      this.messageService.addErrorMessage(`Error: Room ${destRoomId} not found!`);
      logger.error(`Destination room ${destRoomId} not found`);
      return false;
    }
    
    // Ensure bidirectional exit exists
    this.ensureBidirectionalExit(currentRoom, normalizedDirection, destRoom);
    
    // Save old room for event
    const oldRoomId = this.getCurrentRoomId();
    
    // Update player location
    this.stateService.updateState({
      playerLocation: destRoomId
    });
    
    // Emit event
    this.eventService.emit('player:moved', { 
      oldRoomId, 
      newRoomId: destRoomId,
      direction: normalizedDirection
    });
    
    // Add message
    this.messageService.addMessage('movement', `You go ${normalizedDirection} to ${destRoom.name}.`);
    
    // Automatically look around
    this.lookAround();
    
    logger.debug(`Player moved ${normalizedDirection} from ${oldRoomId} to ${destRoomId}`);
    return true;
  }
  
  /**
   * Get available exit directions from current room
   */
  getAvailableExits(): string[] {
    const currentRoom = this.getCurrentRoom();
    if (!currentRoom) {
      return [];
    }
    
    return Object.keys(currentRoom.exits);
  }
  
  /**
   * Get current room
   */
  getCurrentRoom(): IRoom | undefined {
    const roomId = this.getCurrentRoomId();
    if (!roomId) {
      logger.warn('getCurrentRoom: No current room ID found');
      return undefined;
    }
    return this.entityService.getRoom(roomId);
  }
  
  /**
   * Get current room ID
   */
  getCurrentRoomId(): string {
    const state = this.stateService.getState();
    return state.playerLocation;
  }
  
  /**
   * Check if a direction is valid from current room
   */
  isValidDirection(direction: string): boolean {
    const normalizedDirection = this.normalizeDirection(direction);
    const currentRoom = this.getCurrentRoom();
    
    if (!currentRoom) {
      return false;
    }
    
    return normalizedDirection in currentRoom.exits;
  }
  
  /**
   * Get room description
   */
  getRoomDescription(): string {
    const room = this.getCurrentRoom();
    if (!room) {
      return "You are in an unknown location.";
    }
    
    let description = `[ ${room.name} ] ${room.description}`;
    
    // Add exits
    const exits = this.getAvailableExits();
    if (exits.length > 0) {
      description += `\nExits: ${exits.join(', ')}`;
    } else {
      description += "\nThere are no obvious exits.";
    }
    
    // Add NPCs
    const npcs = this.entityService.getNPCsInRoom(room.id);
    if (npcs.length > 0) {
      description += "\nYou see:";
      npcs.forEach(npc => {
        description += `\n${npc.name} - ${npc.description}`;
      });
    }
    
    // Add items
    const items = this.entityService.getItemsInRoom(room.id);
    if (items.length > 0) {
      description += "\nItems in the room:";
      items.forEach(item => {
        description += `\n- ${item.name}`;
      });
    }
    
    return description;
  }
  
  /**
   * Teleport player to a specific room
   */
  teleport(roomId: string): boolean {
    // Check if room exists
    const destRoom = this.entityService.getRoom(roomId);
    if (!destRoom) {
      this.messageService.addErrorMessage("Invalid teleport destination!");
      return false;
    }
    
    // Save old room for event
    const oldRoomId = this.getCurrentRoomId();
    
    // Update player location
    this.stateService.updateState({
      playerLocation: roomId
    });
    
    // Emit event
    this.eventService.emit('player:teleported', { 
      oldRoomId, 
      newRoomId: roomId 
    });
    
    // Add message
    this.messageService.addMessage('movement', `You have been teleported to ${destRoom.name}.`);
    
    // Automatically look around
    this.lookAround();
    
    logger.debug(`Player teleported from ${oldRoomId} to ${roomId}`);
    return true;
  }
  
  /**
   * Look around the current room
   */
  lookAround(): void {
    const description = this.getRoomDescription();
    this.messageService.addMessage('movement', description);
    
    // Emit look event
    this.eventService.emit('player:looked', { 
      roomId: this.getCurrentRoomId(),
      description
    });
  }
  
  /**
   * Normalize direction input
   */
  private normalizeDirection(direction: string): string {
    const lowerDirection = direction.toLowerCase();
    return this.DIRECTION_ALIASES[lowerDirection] || lowerDirection;
  }
  
  /**
   * Ensure all rooms have bidirectional exits
   * This creates return paths for all exits where needed
   */
  private ensureBidirectionalExits(): void {
    // Get all rooms
    const allRooms = this.entityService.getAllRooms();
    
    // For each room, ensure each exit has a corresponding return exit
    allRooms.forEach(room => {
      Object.entries(room.exits).forEach(([direction, destRoomId]) => {
        const destRoom = this.entityService.getRoom(destRoomId);
        if (destRoom) {
          this.ensureBidirectionalExit(room, direction, destRoom);
        }
      });
    });
    
    logger.debug('Ensured all room exits are bidirectional');
  }
  
  /**
   * Ensure a specific exit has a corresponding return path
   */
  private ensureBidirectionalExit(sourceRoom: IRoom, direction: string, destRoom: IRoom): void {
    const oppositeDirection = this.OPPOSITE_DIRECTIONS[direction];
    
    // Skip if no opposite direction or if the destination already has a return path
    if (!oppositeDirection || destRoom.exits[oppositeDirection] === sourceRoom.id) {
      return;
    }
    
    // Create a new exit in the destination room pointing back to the source
    const updatedExits = { 
      ...destRoom.exits,
      [oppositeDirection]: sourceRoom.id
    };
    
    // Create updated room with new exit
    const updatedRoom = new Room({
      ...destRoom,
      exits: updatedExits
    });
    
    // Update room in entity service
    this.entityService.updateEntity('room', updatedRoom);
    
    logger.debug(`Added return path from ${destRoom.id} ${oppositeDirection} to ${sourceRoom.id}`);
  }
}
