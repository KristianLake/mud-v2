import { IEventService } from '../event/IEventService';
import { StateChanges, StateChangeEvent } from './types';
import { StateDiffer } from './StateDiffer';
import { logger } from '../../../utils/logger';

/**
 * Emits detailed events for state changes
 * Single Responsibility: Only handles event emission for state changes
 */
export class StateEventEmitter {
  constructor(private eventService: IEventService) {
    logger.debug('StateEventEmitter initialized');
  }
  
  /**
   * Emit state change event with detailed change information
   * @param previousState Previous state
   * @param currentState Current state
   */
  emitStateChanged<T>(previousState: T, currentState: T): void {
    // Get changes between states
    const changes = StateDiffer.diff(
      previousState as Record<string, any>, 
      currentState as Record<string, any>
    );
    
    // Skip if no changes (avoids unnecessary events)
    if (!StateDiffer.hasChanges(changes)) {
      logger.debug('No state changes detected, skipping event');
      return;
    }
    
    // Create state change event
    const changeEvent: StateChangeEvent<T> = {
      previousState,
      currentState,
      changes,
      timestamp: Date.now()
    };
    
    // Emit state changed event
    this.eventService.emit('state:changed', changeEvent);
    
    // Emit specific events for changed properties
    this.emitDetailedStateEvents(changes, currentState);
    
    logger.debug('State change event emitted', {
      addedCount: changes.added.length,
      removedCount: changes.removed.length,
      updatedCount: changes.updated.length
    });
  }
  
  /**
   * Emit state reset event
   * @param state State after reset
   */
  emitStateReset<T>(state: T): void {
    this.eventService.emit('state:reset', {
      state,
      timestamp: Date.now()
    });
    
    logger.debug('State reset event emitted');
  }
  
  /**
   * Emit state saved event
   */
  emitStateSaved(): void {
    this.eventService.emit('state:saved', {
      timestamp: Date.now()
    });
    
    logger.debug('State saved event emitted');
  }
  
  /**
   * Emit state loaded event
   * @param state Loaded state
   */
  emitStateLoaded<T>(state: T): void {
    this.eventService.emit('state:loaded', {
      state,
      timestamp: Date.now()
    });
    
    logger.debug('State loaded event emitted');
  }
  
  /**
   * Emit detailed events for each state property that changed
   * @param changes State changes
   * @param currentState Current state
   */
  private emitDetailedStateEvents<T>(
    changes: StateChanges, 
    currentState: T
  ): void {
    const state = currentState as Record<string, any>;
    
    // Emit events for added properties
    changes.added.forEach(prop => {
      this.eventService.emit(`state:property:added`, {
        property: prop,
        value: state[prop],
        timestamp: Date.now()
      });
    });
    
    // Emit events for removed properties
    changes.removed.forEach(prop => {
      this.eventService.emit(`state:property:removed`, {
        property: prop,
        timestamp: Date.now()
      });
    });
    
    // Emit events for updated properties
    changes.updated.forEach(prop => {
      this.eventService.emit(`state:property:updated`, {
        property: prop,
        value: state[prop],
        timestamp: Date.now()
      });
      
      // Emit specific event for this property
      this.eventService.emit(`state:${prop}:changed`, {
        value: state[prop],
        timestamp: Date.now()
      });
    });
  }
}
