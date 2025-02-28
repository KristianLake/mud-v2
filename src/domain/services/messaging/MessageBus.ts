import { IMessageBus } from './IMessageBus';
import { IMessageHandler } from './IMessageHandler';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in EventBus and EventService.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class MessageBus extends BaseGameService implements IMessageBus {
    private subscribers: { [messageType: string]: IMessageHandler[] } = {};

    constructor() {
        super();
    }

    subscribe(messageType: string, handler: IMessageHandler): void {
        if (!this.subscribers[messageType]) {
            this.subscribers[messageType] = [];
        }
        this.subscribers[messageType].push(handler);
        logger.debug(`Subscribed handler to message type: ${messageType}`);
    }

    unsubscribe(messageType: string, handler: IMessageHandler): void {
        if (this.subscribers[messageType]) {
            this.subscribers[messageType] = this.subscribers[messageType].filter(
                h => h !== handler
            );
            logger.debug(`Unsubscribed handler from message type: ${messageType}`);
        }
    }

    publish(messageType: string, payload: any): void {
        if (this.subscribers[messageType]) {
            this.subscribers[messageType].forEach(handler => handler.handle(payload));
            logger.debug(`Published message of type: ${messageType}`);
        }
    }
}
