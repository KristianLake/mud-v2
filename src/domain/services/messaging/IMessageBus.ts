import { IMessageHandler } from './IMessageHandler';

// NOTE: This interface seems to duplicate functionality in IEventBus and IEventService.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export interface IMessageBus {
    subscribe(messageType: string, handler: IMessageHandler): void;
    unsubscribe(messageType: string, handler: IMessageHandler): void;
    publish(messageType: string, payload: any): void;
}
