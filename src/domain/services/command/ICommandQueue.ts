import { ICommand } from './ICommand';
import { BaseGameService } from '../BaseGameService';

// NOTE: This interface and the CommandQueue class are not used and should be removed.
//       Keeping them temporarily to satisfy the "continue" instruction.

export interface ICommandQueue {
    enqueue(command: ICommand): void;
    dequeue(): ICommand | undefined;
    peek(): ICommand | undefined;
    isEmpty(): boolean;
    clear(): void;
}
