import { GameState } from '../../types';

// Interface Segregation Principle - Split into focused interfaces
export interface IGameStateService {
  getState(): GameState;
  setState(state: GameState): void;
  addStateListener(listener: () => void): void;
  removeStateListener(listener: () => void): void;
}

export interface IGameCommandService {
  processCommand(command: string): Promise<string>;
}

export interface IGameLifecycle {
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
  isInitialized(): boolean;
}

export interface IGameMasterService extends 
  IGameStateService,
  IGameCommandService,
  IGameLifecycle {}
