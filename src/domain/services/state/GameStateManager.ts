import { GameState, Direction } from '../../../types';
import { StateManager } from './StateManager';
import { logger } from '../../../utils/logger';

export class GameStateManager extends StateManager<GameState> {
  constructor(initialState: GameState) {
    super(initialState);
  }

  // Game-specific state methods
  getAvailableExits(): Direction[] {
    const state = this.getState();
    const currentRoom = state.rooms[state.playerLocation];
    
    return Object.entries(currentRoom.exits)
      .filter(([_, roomId]) => roomId !== null)
      .map(([direction]) => direction as Direction);
  }

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

    this.updateState({ playerLocation: nextRoomId });
    return true;
  }
}
