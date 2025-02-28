/**
 * Types for event system
 */

/**
 * Generic callback type for event subscribers
 */
export type EventCallback<T> = (data: T) => void;

/**
 * Common event types
 */
export enum EventTypes {
  // State events
  STATE_CHANGED = 'state:changed',
  STATE_RESET = 'state:reset',
  STATE_LOADED = 'state:loaded',
  STATE_SAVED = 'state:saved',
  
  // Command events
  COMMAND_EXECUTED = 'command:executed',
  COMMAND_FAILED = 'command:failed',
  
  // Player events
  PLAYER_MOVE = 'player:move',
  PLAYER_INVENTORY_CHANGED = 'player:inventory:changed',
  PLAYER_STATS_CHANGED = 'player:stats:changed',
  
  // Game events
  GAME_STARTED = 'game:started',
  GAME_ENDED = 'game:ended',
  GAME_PAUSED = 'game:paused',
  GAME_RESUMED = 'game:resumed',
  
  // UI events
  MESSAGE_RECEIVED = 'ui:message:received',
  ERROR_OCCURRED = 'ui:error:occurred'
}

/**
 * Event data types for specific events
 */
export interface StateChangedEvent {
  previousState: any;
  currentState: any;
  changedProps?: string[];
}

export interface CommandExecutedEvent {
  command: string;
  args: string[];
  success: boolean;
  result?: any;
}

export interface PlayerMoveEvent {
  from: string;
  to: string;
  direction: string;
}

export interface MessageEvent {
  text: string;
  type: 'info' | 'error' | 'success' | 'warning';
  timestamp: number;
}
