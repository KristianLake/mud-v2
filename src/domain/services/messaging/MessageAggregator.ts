import { IMessageBus } from './IMessageBus';
import { IMessageHandler } from './IMessageHandler';
import { MessageBus } from './MessageBus';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../../utils/logger';

// NOTE: This class seems unnecessary as message aggregation can be handled
//       within MessageService or by individual subscribers.  It should likely
//       be removed.  Keeping it temporarily to satisfy the "continue" instruction.

export class MessageAggregator extends BaseGameService {
    private messageBus: IMessageBus;

    constructor() {
        super();
        this.messageBus = this.container.resolve<IMessageBus>(ServiceTokens.MessageBus);
    }

    // Aggregates messages from multiple sources.
    aggregateMessages(sources: string[], handler: IMessageHandler): void {
        sources.forEach(source => {
            this.messageBus.subscribe(source, handler);
            logger.debug(`Subscribed to messages from source: ${source}`);
        });
    }

    // Removes a message source.
    removeSource(source: string, handler: IMessageHandler): void {
        this.messageBus.unsubscribe(source, handler);
        logger.debug(`Unsubscribed from messages from source: ${source}`);
    }
}
