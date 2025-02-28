import { IEnvironmentService } from './IEnvironmentService';
import { IEventService } from '../event/IEventService';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { MessageService } from '../../../services/MessageService';
import { logger } from '../../../utils/logger';

// NOTE: This class seems to duplicate functionality in EnvironmentService and MessageService.
//       It should likely be removed or significantly refactored.  Keeping it
//       temporarily to satisfy the "continue" instruction.

export class MessageManager extends BaseGameService {
    private environmentService: IEnvironmentService;
    private messageService: MessageService;

    constructor() {
        super();
        this.environmentService = this.container.resolve<IEnvironmentService>(ServiceTokens.EnvironmentService);
        this.messageService = this.container.resolve<MessageService>(ServiceTokens.MessageService);
        this.initializeListeners();
    }

    private initializeListeners(): void {
        // Example: Listen for environment-related events and send messages
        this.eventService.on('environmentChange', (data: { description: string }) => {
            logger.debug('MessageManager received environmentChange event', { description: data.description });
            this.sendMessage(data.description);
        });
    }

    // Sends a message related to the environment.
    sendMessage(message: string): void {
        this.messageService.addMessage(message, 'environment');
    }
}
