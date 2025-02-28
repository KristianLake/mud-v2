/**
 * Function signature for state change listeners
 */
export type StateChangeListener<T> = (state: T) => void;

/**
 * State change event data
 */
export interface StateChangeEvent {
  previousState: any;
  currentState: any;
}

/**
 * State save event data
 */
export interface StateSaveEvent {
  state: any;
}

/**
 * State load event data
 */
export interface StateLoadEvent {
  state: any;
}

/**
 * State reset event data
 */
export interface StateResetEvent {
  state: any;
}

/**
 * State revert event data
 */
export interface StateRevertEvent {
  steps: number;
  state: any;
}
