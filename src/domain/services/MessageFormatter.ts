import { Message } from '../../types';
import { BaseGameService } from './BaseGameService';

// This class is likely unnecessary as the MessageService handles message formatting.
// Keeping it to avoid breaking the "continue" instruction, but it should be reviewed
// and likely removed.

export class MessageFormatter extends BaseGameService {
    formatMessage(message: Message): string {
        // Basic formatting (you can expand on this)
        return `[${message.type}] ${message.sender ? message.sender + ': ' : ''}${message.text}`;
    }

    formatMessages(messages: Message[]): string[] {
        return messages.map(this.formatMessage);
    }
}
