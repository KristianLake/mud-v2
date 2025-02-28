import { logger } from '../utils/logger';
import { initialState as defaultInitialState } from '../data/initialState';

/**
 * Game master agent that coordinates game state and interactions
 */
export class GameMasterAgent {
  private static instance: GameMasterAgent | null = null;
  private mountedInstances: Map<string, boolean> = new Map();
  private state: any;
  private instanceId: string;
  private stateChangeListeners: (() => void)[] = [];

  constructor() {
    this.instanceId = `gm-${Math.random().toString(36).slice(2)}`;
    this.state = {}; // Initialize with empty state until initialize is called
    logger.debug('GameMasterAgent instance created');
  }

  /**
   * Initialize the agent with state
   * @param state Initial game state
   */
  public async initialize(state: any): Promise<void> {
    logger.debug('Initializing GameMasterAgent with state');
    if (!state) {
      logger.warn('No state provided, using default initial state');
      this.state = JSON.parse(JSON.stringify(defaultInitialState));
    } else {
      this.state = JSON.parse(JSON.stringify(state));
    }
    logger.debug('GameMasterAgent initialized successfully');
  }

  /**
   * Process a command
   * @param command Command to process
   * @returns Response from command
   */
  public processCommand(command: string): string {
    logger.debug(`Processing command: ${command}`);
    
    // Simple command processing for now
    if (command.toLowerCase() === 'look') {
      const currentRoom = this.getCurrentRoom();
      if (currentRoom) {
        return this.generateRoomDescription(currentRoom);
      }
      return "You see nothing special.";
    }
    
    return `You typed: ${command}`;
  }

  /**
   * Get current room
   * @returns Current room
   */
  private getCurrentRoom() {
    // Access playerLocation directly from state instead of player.currentRoomId
    const currentRoomId = this.state.playerLocation;
    if (!currentRoomId) {
      logger.error('Current room ID is undefined in game state');
      return null;
    }
    
    // Find the room in the rooms object by its id
    return this.state.rooms[currentRoomId];
  }

  /**
   * Generate room description
   * @param room Room to describe
   * @returns Room description
   */
  private generateRoomDescription(room: any): string {
    let description = `You are in ${room.name}. ${room.description}\n`;
    
    // Add exits
    if (room.exits && Object.keys(room.exits).length > 0) {
      description += "\nExits: ";
      description += Object.keys(room.exits).join(", ");
    } else {
      description += "\nThere are no obvious exits.";
    }
    
    // Add NPCs
    const npcsInRoom = room.npcs ? room.npcs
      .map((npcId: string) => this.state.npcs[npcId])
      .filter(Boolean)
      : [];
    
    if (npcsInRoom.length > 0) {
      description += "\n\nYou see: ";
      description += npcsInRoom
        .map((npc: any) => npc.name)
        .join(", ");
    }
    
    // Add items
    const itemsInRoom = room.items ? room.items
      .map((itemId: string) => this.state.items[itemId])
      .filter(Boolean)
      : [];
    
    if (itemsInRoom.length > 0) {
      description += "\n\nItems: ";
      description += itemsInRoom
        .map((item: any) => item.name)
        .join(", ");
    }
    
    return description;
  }

  /**
   * Mount this instance
   * @param instanceId Instance ID for tracking
   */
  public mount(instanceId: string): void {
    this.mountedInstances.set(instanceId, true);
    logger.info(`GameMasterAgent mounted with instance ID: ${instanceId}`);
  }

  /**
   * Unmount this instance
   * @param instanceId Instance ID for tracking
   */
  public unmount(instanceId: string): void {
    this.mountedInstances.delete(instanceId);
    logger.debug(`GameMasterAgent unmounted instance ID: ${instanceId}`);
  }

  /**
   * Subscribe to state changes
   * @param listener Function to call when state changes
   */
  public onStateChange(listener: () => void): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Unsubscribe from state changes
   * @param listener Function to remove from listeners
   */
  public offStateChange(listener: () => void): void {
    this.stateChangeListeners = this.stateChangeListeners.filter(l => l !== listener);
  }

  /**
   * Notify listeners of state change
   */
  private notifyStateChange(): void {
    this.stateChangeListeners.forEach(listener => listener());
  }

  /**
   * Get state
   * @returns Current game state
   */
  public getState(): any {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Update state
   * @param newState New state
   */
  public updateState(newState: any): void {
    this.state = JSON.parse(JSON.stringify(newState));
    this.notifyStateChange();
  }

  /**
   * Reset state
   * @returns Reset game state
   */
  public resetState(): any {
    this.state = JSON.parse(JSON.stringify(defaultInitialState));
    this.notifyStateChange();
    return this.getState();
  }
}
