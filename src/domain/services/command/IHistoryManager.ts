import { ICommand } from './ICommand';
import { IHistoryState } from './IHistoryState';

// NOTE: This interface is used by both CommandHistory and HistoryStateManager,
//       but the implementations are different.  This should be refactored.

export interface IHistoryManager {
    addCommand(command: ICommand): void;
    getHistory(): ICommand[] | IHistoryState[];
    undo(): ICommand | IHistoryState | null;
    redo(): ICommand | IHistoryState | null;
    clear(): void;
}
