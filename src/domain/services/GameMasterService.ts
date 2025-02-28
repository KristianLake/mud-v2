import { logger } from '../../utils/logger';
import { GameState } from '../../types';

export class GameMasterService {
  private static instance: GameMasterService | null = null;
  private gameState: GameState;

  private constructor(initialState: GameState) {
    this.gameState = JSON.parse(JSON.stringify(initialState));
    logger.info('GameMasterService initialized with initial state');
  }

  public static async getInstance(initialState: GameState): Promise<GameMasterService> {
    if (!GameMasterService.instance) {
      GameMasterService.instance = new GameMasterService(initialState);
    }
    return GameMasterService.instance;
  }

  public async processCommand(command: string): Promise<string> {
    logger.debug(`GameMasterService processing command: ${command}`);
    
    // Basic command processing
    if (command.toLowerCase() === 'look') {
      return this.handleLookCommand();
    } 
    else if (['north', 'south', 'east', 'west'].includes(command.toLowerCase()) || 
             command.toLowerCase().startsWith('go ')) {
      const direction = command.toLowerCase().startsWith('go ') 
        ? command.toLowerCase().substring(3) 
        : command.toLowerCase();
      return this.handleMovementCommand(direction);
    }
    else if (command.toLowerCase() === 'inventory' || command.toLowerCase() === 'i') {
      return this.handleInventoryCommand();
    }
    else if (command.toLowerCase().startsWith('examine ') || command.toLowerCase().startsWith('look at ')) {
      const target = command.toLowerCase().startsWith('examine ') 
        ? command.toLowerCase().substring(8) 
        : command.toLowerCase().substring(8);
      return this.handleExamineCommand(target);
    }
    else if (command.toLowerCase().startsWith('talk to ') || command.toLowerCase().startsWith('speak to ')) {
      const npcName = command.toLowerCase().startsWith('talk to ') 
        ? command.toLowerCase().substring(8) 
        : command.toLowerCase().substring(9);
      return this.handleTalkCommand(npcName);
    }
    
    return `You try to ${command}, but nothing happens.`;
  }

  private handleLookCommand(): string {
    const currentRoom = this.gameState.rooms[this.gameState.playerLocation];
    
    if (!currentRoom) {
      logger.error('Current room not found', { playerLocation: this.gameState.playerLocation });
      return 'Error: Room not found';
    }
    
    // Create a description of the room
    return `${currentRoom.name}\n\n${currentRoom.description}\n\nExits: ${Object.keys(currentRoom.exits).join(', ')}\n\n${
      currentRoom.npcs && currentRoom.npcs.length > 0 
        ? `You see:\n${currentRoom.npcs.map(npc => `- ${npc.name}`).join('\n')}\n\n` 
        : ''
    }${
      currentRoom.items && currentRoom.items.length > 0
        ? `Items:\n${currentRoom.items.map(item => `- ${item.name}`).join('\n')}`
        : ''
    }`;
  }

  private handleMovementCommand(direction: string): string {
    const currentRoom = this.gameState.rooms[this.gameState.playerLocation];
    
    if (!currentRoom.exits[direction]) {
      return `You cannot go ${direction} from here.`;
    }
    
    // Get the new room ID
    const newRoomId = currentRoom.exits[direction];
    const newRoom = this.gameState.rooms[newRoomId];
    
    if (!newRoom) {
      logger.error('New room not found', { newRoomId });
      return 'Error: Destination room not found';
    }
    
    // Update the player's location
    this.gameState.playerLocation = newRoomId;
    
    logger.debug('State after movement', { 
      from: currentRoom.id, 
      to: this.gameState.playerLocation,
      newRoom: newRoom.name
    });
    
    return `You move ${direction}.\n\n${newRoom.name}\n\n${newRoom.description}\n\nExits: ${Object.keys(newRoom.exits).join(', ')}\n\n${
      newRoom.npcs && newRoom.npcs.length > 0 
        ? `You see:\n${newRoom.npcs.map(npc => `- ${npc.name}`).join('\n')}\n\n` 
        : ''
    }${
      newRoom.items && newRoom.items.length > 0
        ? `Items:\n${newRoom.items.map(item => `- ${item.name}`).join('\n')}`
        : ''
    }`;
  }

  private handleInventoryCommand(): string {
    if (this.gameState.playerInventory.length === 0) {
      return "Your inventory is empty.";
    }
    
    return `Inventory:\n${this.gameState.playerInventory.map(item => `- ${item.name}`).join('\n')}\n\nGold: ${this.gameState.playerGold}`;
  }

  private handleExamineCommand(target: string): string {
    // Check inventory items
    const inventoryItem = this.gameState.playerInventory.find(
      item => item.name.toLowerCase() === target
    );
    
    if (inventoryItem) {
      return `${inventoryItem.name}: ${inventoryItem.description}`;
    }
    
    // Check room items
    const currentRoom = this.gameState.rooms[this.gameState.playerLocation];
    const roomItem = currentRoom.items.find(
      item => item.name.toLowerCase() === target
    );
    
    if (roomItem) {
      return `${roomItem.name}: ${roomItem.description}`;
    }
    
    // Check NPCs
    const npc = currentRoom.npcs.find(
      npc => npc.name.toLowerCase() === target
    );
    
    if (npc) {
      return `${npc.name}: ${npc.description}`;
    }
    
    return `You don't see any ${target} here.`;
  }

  private handleTalkCommand(npcName: string): string {
    const currentRoom = this.gameState.rooms[this.gameState.playerLocation];
    const npc = currentRoom.npcs.find(
      npc => npc.name.toLowerCase() === npcName.toLowerCase()
    );
    
    if (!npc) {
      return `There is no ${npcName} here to talk to.`;
    }
    
    // Return the greeting dialogue
    if (npc.dialogue.greeting) {
      return `${npc.name} says: "${npc.dialogue.greeting}"`;
    }
    
    return `${npc.name} doesn't seem to have anything to say.`;
  }

  public getState(): GameState {
    return JSON.parse(JSON.stringify(this.gameState));
  }
}
