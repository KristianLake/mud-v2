// NOTE: This interface and the MessageQueue class are not used and should be removed.
//       Keeping them temporarily to satisfy the "continue" instruction.

export interface IMessageQueue {
    enqueue(message: any): void;
    dequeue(): any | undefined;
    peek(): any | undefined;
    isEmpty(): boolean;
    clear(): void;
}
