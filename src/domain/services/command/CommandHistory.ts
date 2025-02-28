import { ICommand } from './ICommand';
import { IHistoryManager } from './IHistoryManager';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class CommandHistory extends BaseGameService implements IHistoryManager {
    private history: ICommand[] = [];
    private currentIndex: number = -1; // Points to the current command in history

    constructor() {
        super();
    }

    addCommand(command: ICommand): void {
        // If we've undone some commands and add a new one, discard the undone commands
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        this.history.push(command);
        this.currentIndex = this.history.length - 1;
        logger.debug(`Added command to history: ${command.getName()}`);
    }

    getHistory(): ICommand[] {
        return this.history;
    }

    undo(): ICommand | null {
        if (this.currentIndex >= 0) {
            const command = this.history[this.currentIndex];
            this.currentIndex--;
            logger.debug(`Undoing command: ${command.getName()}`);
            return command;
        }
        logger.warn('No commands to undo');
        return null;
    }

    redo(): ICommand | null {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            const command = this.history[this.currentIndex];
            logger.debug(`Redoing command: ${command.getName()}`);
            return command;
        }
        logger.warn('No commands to redo');
        return null;
    }

    clear(): void {
        this.history = [];
        this.currentIndex = -1;
        logger.info('Command history cleared');
    }
}
