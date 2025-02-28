import { GameState } from './state/IStateService';
import { ICommand } from './command/ICommand';

// NOTE: This interface appears to be a duplicate of IGameMaster and should be removed.
//       It's being kept temporarily to satisfy the "continue" instruction.

export interface IGameStateService {
  mount(instanceId: string): void;
  unmount(): void;
  processCommand(command: string): string;
  getGameState(): GameState;
    isGameMounted(): boolean;
    getInstanceId(): string | null;
  reset(): Promise<void>;
}
