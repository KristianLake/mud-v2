import { StateChanges } from './types';
import { logger } from '../../../utils/logger';

/**
 * Compares state objects to detect changes
 * Single Responsibility: Only detects differences between states
 */
export class StateDiffer {
  /**
   * Compare two state objects and return a description of changes
   * @param oldState Previous state
   * @param newState New state
   * @returns Object describing changes
   */
  static diff<T extends Record<string, any>>(oldState: T, newState: T): StateChanges {
    logger.debug('Calculating state differences');
    
    const oldKeys = Object.keys(oldState);
    const newKeys = Object.keys(newState);
    
    // Find added keys
    const added = newKeys.filter(key => !oldKeys.includes(key));
    
    // Find removed keys
    const removed = oldKeys.filter(key => !newKeys.includes(key));
    
    // Find updated keys (present in both but with different values)
    const updated = oldKeys
      .filter(key => newKeys.includes(key))
      .filter(key => !this.areEqual(oldState[key], newState[key]));
    
    const changes: StateChanges = { added, removed, updated };
    
    logger.debug('State differences calculated', {
      addedCount: added.length,
      removedCount: removed.length,
      updatedCount: updated.length
    });
    
    return changes;
  }
  
  /**
   * Check if two values are deeply equal
   * @param a First value
   * @param b Second value
   * @returns True if values are equal
   */
  private static areEqual(a: any, b: any): boolean {
    // Handle primitive types
    if (a === b) return true;
    
    // Handle null/undefined
    if (a == null || b == null) return a === b;
    
    // Handle different types
    if (typeof a !== typeof b) return false;
    
    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
    }
    
    // Handle arrays
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      
      for (let i = 0; i < a.length; i++) {
        if (!this.areEqual(a[i], b[i])) return false;
      }
      
      return true;
    }
    
    // Handle objects
    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      
      // Check if they have the same number of properties
      if (keysA.length !== keysB.length) return false;
      
      // Check if they have the same properties with the same values
      return keysA.every(key => 
        keysB.includes(key) && this.areEqual(a[key], b[key])
      );
    }
    
    // Different values
    return false;
  }
  
  /**
   * Get a human-readable description of changes
   * @param changes State changes
   * @returns Description of changes
   */
  static getChangeDescription(changes: StateChanges): string {
    const parts: string[] = [];
    
    if (changes.added.length > 0) {
      parts.push(`Added: ${changes.added.join(', ')}`);
    }
    
    if (changes.removed.length > 0) {
      parts.push(`Removed: ${changes.removed.join(', ')}`);
    }
    
    if (changes.updated.length > 0) {
      parts.push(`Updated: ${changes.updated.join(', ')}`);
    }
    
    return parts.length > 0 
      ? parts.join('; ') 
      : 'No changes';
  }
  
  /**
   * Check if there are any changes
   * @param changes State changes
   * @returns True if any changes exist
   */
  static hasChanges(changes: StateChanges): boolean {
    return (
      changes.added.length > 0 || 
      changes.removed.length > 0 || 
      changes.updated.length > 0
    );
  }
}
