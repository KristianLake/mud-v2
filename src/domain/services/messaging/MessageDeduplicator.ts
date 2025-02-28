import { IMessageBus } from './IMessageBus';
import { IMessageHandler } from './IMessageHandler';
import { MessageBus } from './MessageBus';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../../utils/logger';

// NOTE: This class seems unnecessary as message deduplication can be handled
//       within MessageService or by individual subscribers.  It should likely
//       be removed.  Keeping it temporarily to satisfy the "continue" instruction.

export class MessageDeduplicator extends BaseGameService {
    private messageBus: IMessageBus;
    private processedMessages: Set<string> = new Set();

    constructor() {
        super();
        this.messageBus = this.container.resolve<IMessageBus>(ServiceTokens.MessageBus);
    }

    // Deduplicates messages before publishing them.
    deduplicateAndPublish(messageType: string, payload: any, hashFunction: (payload: any) => string): void {
        const messageHash = hashFunction(payload);
        if (!this.processedMessages.has(messageHash)) {
            this.processedMessages.add(messageHash);
            this.messageBus.publish(messageType, payload);
            logger.debug(`Published message of type: ${messageType} after deduplication`);
        } else {
            logger.debug(`Duplicate message detected and ignored: ${messageType}`);
        }
    }

    // Clears the processed messages cache.
    clearCache(): void {
        this.processedMessages.clear();
        logger.info('Message deduplication cache cleared');
    }
}
