import { logger } from '../../../utils/logger';

/**
 * Represents a point-in-time snapshot of application state
 * Single Responsibility: Only holds a snapshot with metadata
 */
export class StateSnapshot<T> {
  private readonly timestamp: number;
  private readonly state: T;
  private readonly label?: string;
  
  constructor(state: T, label?: string) {
    this.state = JSON.parse(JSON.stringify(state)); // Deep clone
    this.timestamp = Date.now();
    this.label = label;
    
    logger.debug('Created state snapshot', { 
      timestamp: this.timestamp,
      label: this.label 
    });
  }
  
  /**
   * Get the state from this snapshot
   */
  getState(): T {
    // Return a clone to prevent modification
    return JSON.parse(JSON.stringify(this.state));
  }
  
  /**
   * Get the timestamp when this snapshot was created
   */
  getTimestamp(): number {
    return this.timestamp;
  }
  
  /**
   * Get the label for this snapshot
   */
  getLabel(): string | undefined {
    return this.label;
  }
  
  /**
   * Convert snapshot to string for debugging
   */
  toString(): string {
    return `StateSnapshot(${this.label || 'unlabeled'} @ ${new Date(this.timestamp).toISOString()})`;
  }
}
