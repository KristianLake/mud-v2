import { GameState } from '../domain/services/state/IStateService';
import { ICommand } from '../domain/services/command/ICommand';

// Interface for the Game Master
export interface IGameMaster {
  mount(instanceId: string): void;
  unmount(): void;
  processCommand(command: string): string;
  getGameState(): GameState;
  isGameMounted(): boolean;
  getInstanceId(): string | null;
  reset(): Promise<void>;
}
