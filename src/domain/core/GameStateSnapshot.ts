import { GameState } from '../../types';

/**
 * Immutable snapshot of game state
 * Single Responsibility: Store a point-in-time copy of game state
 */
export class GameStateSnapshot {
  private state: GameState;
  private timestamp: Date;
  private id: string;

  /**
   * Create a new game state snapshot
   * @param state Game state to snapshot
   */
  constructor(state: GameState) {
    this.state = this.deepClone(state);
    this.timestamp = new Date();
    this.id = `snapshot-${this.timestamp.getTime()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get the state from the snapshot
   * @returns Deep copy of the state
   */
  getState(): GameState {
    return this.deepClone(this.state);
  }

  /**
   * Get the timestamp of when the snapshot was created
   * @returns Copy of the timestamp
   */
  getTimestamp(): Date {
    return new Date(this.timestamp);
  }

  /**
   * Get the unique ID of this snapshot
   * @returns Snapshot ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Create a deep clone of an object
   * @param object Object to clone
   * @returns Deep clone of the object
   */
  private deepClone<T>(object: T): T {
    return JSON.parse(JSON.stringify(object));
  }
}
