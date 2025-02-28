import { IHistoryManager } from './IHistoryManager';
import { IHistoryState } from './IHistoryState';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to conflate command history with general state history.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class HistoryStateManager extends BaseGameService implements IHistoryManager {
    private history: IHistoryState[] = [];
    private currentIndex: number = -1;

    constructor() {
        super();
    }

    addState(state: IHistoryState): void {
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        this.history.push(state);
        this.currentIndex = this.history.length - 1;
        logger.debug('Added state to history');
    }

    getHistory(): IHistoryState[] {
        return this.history;
    }

    undo(): IHistoryState | null {
        if (this.currentIndex >= 0) {
            const state = this.history[this.currentIndex];
            this.currentIndex--;
            logger.debug('Undoing to previous state');
            return state;
        }
        logger.warn('No state to undo to');
        return null;
    }

    redo(): IHistoryState | null {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const state = this.history[this.currentIndex];
            logger.debug('Redoing to next state');
            return state;
        }
        logger.warn('No state to redo to');
        return null;
    }

    clear(): void {
        this.history = [];
        this.currentIndex = -1;
        logger.info('State history cleared');
    }
}
