import { GameState } from '../../types';
import { GameStateSnapshot } from './GameStateSnapshot';
import { logger } from '../../utils/logger';

/**
 * Manages history of game state snapshots
 * Single Responsibility: Track state history and provide undo/redo functionality
 */
export class GameStateHistory {
  private snapshots: GameStateSnapshot[] = [];
  private currentIndex: number = -1;
  private maxSnapshots: number;

  /**
   * Create a new game state history
   * @param maxSnapshots Maximum number of snapshots to keep (default: 50)
   */
  constructor(maxSnapshots: number = 50) {
    this.maxSnapshots = maxSnapshots;
  }

  /**
   * Add a new state snapshot to history
   * @param state Current game state
   * @returns The created snapshot
   */
  addSnapshot(state: GameState): GameStateSnapshot {
    // If we're not at the end of the history, truncate forward history
    if (this.currentIndex < this.snapshots.length - 1) {
      this.snapshots = this.snapshots.slice(0, this.currentIndex + 1);
    }

    // Create new snapshot
    const snapshot = new GameStateSnapshot(state);
    
    // Add to history
    this.snapshots.push(snapshot);
    this.currentIndex = this.snapshots.length - 1;
    
    // Trim history if needed
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
      this.currentIndex--;
    }
    
    logger.debug('Added state snapshot to history', { 
      snapshotId: snapshot.getId(),
      historySize: this.snapshots.length,
      currentIndex: this.currentIndex
    });
    
    return snapshot;
  }

  /**
   * Get the previous state (undo)
   * @returns Previous state or null if at beginning of history
   */
  undo(): GameState | null {
    if (this.currentIndex <= 0) {
      logger.debug('Cannot undo: at beginning of history');
      return null;
    }
    
    this.currentIndex--;
    const snapshot = this.snapshots[this.currentIndex];
    
    logger.debug('Undo operation', { 
      snapshotId: snapshot.getId(),
      currentIndex: this.currentIndex
    });
    
    return snapshot.getState();
  }

  /**
   * Get the next state (redo)
   * @returns Next state or null if at end of history
   */
  redo(): GameState | null {
    if (this.currentIndex >= this.snapshots.length - 1) {
      logger.debug('Cannot redo: at end of history');
      return null;
    }
    
    this.currentIndex++;
    const snapshot = this.snapshots[this.currentIndex];
    
    logger.debug('Redo operation', { 
      snapshotId: snapshot.getId(),
      currentIndex: this.currentIndex
    });
    
    return snapshot.getState();
  }

  /**
   * Get the current snapshot
   * @returns Current snapshot or null if history is empty
   */
  getCurrentSnapshot(): GameStateSnapshot | null {
    if (this.currentIndex < 0 || this.snapshots.length === 0) {
      return null;
    }
    
    return this.snapshots[this.currentIndex];
  }

  /**
   * Check if undo is available
   * @returns True if undo is available
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns True if redo is available
   */
  canRedo(): boolean {
    return this.currentIndex < this.snapshots.length - 1;
  }

  /**
   * Get the number of snapshots in history
   * @returns Number of snapshots
   */
  getSnapshotCount(): number {
    return this.snapshots.length;
  }

  /**
   * Clear the history
   */
  clear(): void {
    this.snapshots = [];
    this.currentIndex = -1;
    logger.debug('Cleared state history');
  }
}
