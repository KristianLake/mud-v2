import { StateContainer } from './StateContainer';
import { GameState, Direction } from '../../../types';
import { logger } from '../../../utils/logger';
import { EventEmitter } from '../../../utils/EventEmitter';
import { IStateContainer } from './IStateContainer';

/**
 * Game state container implementing SOLID principles
 * Single Responsibility: Manage game state and state-related events
 */
export class GameStateContainer extends StateContainer<GameState> implements IStateContainer {
  private availableExitsCache: Direction[] = [];
  private lastPlayerLocation: string | null = null;
  private eventEmitter: EventEmitter;

  constructor(initialState: GameState) {
    super(initialState);
    this.eventEmitter = new EventEmitter();
    this.lastPlayerLocation = initialState.playerLocation;
    this.updateAvailableExits();

    // Listen for state changes
    this.subscribe((newState) => {
      this.checkStateChanges(newState);
    });

    logger.info('GameStateContainer initialized', {
      initialLocation: initialState.playerLocation,
      initialRoom: {
        id: initialState.rooms[initialState.playerLocation].id,
        name: initialState.rooms[initialState.playerLocation].name,
        exits: initialState.rooms[initialState.playerLocation].exits
      }
    });
  }

  /**
   * Check for state changes and emit appropriate events
   */
  private checkStateChanges(newState: GameState): void {
    const currentRoom = newState.rooms[newState.playerLocation];
    
    // Check for location change
    if (this.lastPlayerLocation !== newState.playerLocation) {
      const oldRoom = this.lastPlayerLocation ? newState.rooms[this.lastPlayerLocation] : null;
      
      logger.info('Player location changed', {
        from: oldRoom ? {
          id: this.lastPlayerLocation,
          room: oldRoom.name,
          exits: oldRoom.exits
        } : null,
        to: {
          id: newState.playerLocation,
          room: currentRoom.name,
          exits: currentRoom.exits
        }
      });
      
      // Update last location after logging
      this.lastPlayerLocation = newState.playerLocation;
      
      // Force exits update on location change
      this.updateAvailableExits(newState, true);
    } else {
      // Check for exit changes even if location hasn't changed
      this.updateAvailableExits(newState, false);
    }
  }

  /**
   * Update available exits and notify listeners if changed
   */
  private updateAvailableExits(state: GameState = this.getState(), forceUpdate: boolean = false): void {
    const currentRoom = state.rooms[state.playerLocation];
    
    // Get available exits
    const exits = Object.entries(currentRoom.exits)
      .filter(([_, roomId]) => roomId !== null)
      .map(([direction]) => direction as Direction);

    // Update if changed or forced
    if (forceUpdate || JSON.stringify(exits) !== JSON.stringify(this.availableExitsCache)) {
      logger.info('Available exits updated', {
        location: state.playerLocation,
        room: currentRoom.name,
        exits: {
          old: this.availableExitsCache,
          new: exits,
          changed: this.availableExitsCache.filter(e => !exits.includes(e))
            .concat(exits.filter(e => !this.availableExitsCache.includes(e)))
        },
        allExits: currentRoom.exits
      });
      
      // Update cache and notify
      this.availableExitsCache = exits;
      this.notifyExitsChanged(exits);
    }
  }

  /**
   * Notify listeners of exit changes
   */
  private notifyExitsChanged(exits: Direction[]): void {
    this.eventEmitter.emit('exitsChanged', {
      type: 'exitsChanged',
      payload: exits,
      timestamp: Date.now()
    });
  }

  /**
   * Get currently available exits
   */
  getAvailableExits(): Direction[] {
    return [...this.availableExitsCache];
  }

  /**
   * Move player to a new location
   */
  movePlayer(direction: Direction): boolean {
    const state = this.getState();
    const currentRoom = state.rooms[state.playerLocation];
    const nextRoomId = currentRoom.exits[direction];

    if (!nextRoomId) {
      logger.warn('Move failed - no exit in direction', {
        from: state.playerLocation,
        direction,
        availableExits: currentRoom.exits
      });
      return false;
    }

    const nextRoom = state.rooms[nextRoomId];
    if (!nextRoom) {
      logger.error('Move failed - invalid destination room', {
        from: state.playerLocation,
        to: nextRoomId,
        direction
      });
      return false;
    }

    logger.info('Moving player', {
      direction,
      from: {
        id: state.playerLocation,
        name: currentRoom.name,
        exits: currentRoom.exits
      },
      to: {
        id: nextRoomId,
        name: nextRoom.name,
        exits: nextRoom.exits
      }
    });

    // Force immediate state update for movement
    this.setState({ playerLocation: nextRoomId }, true);
    
    // Force exits update after movement
    this.updateAvailableExits(this.getState(), true);
    
    return true;
  }

  // Event emitter methods
  on(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void): void {
    this.eventEmitter.off(event, handler);
  }

  // Override cleanup to also clean up event emitter
  cleanup(): void {
    super.cleanup();
    this.eventEmitter.cleanup();
  }
}
