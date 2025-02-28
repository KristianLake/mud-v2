import { logger } from '../../../utils/logger';

export class AmbientMessageManager {
    private ambientMessages: string[] = [];

    constructor() {
        this.ambientMessages = [
            "A gentle breeze whispers through the trees.",
            "The distant sound of a babbling brook fills the air.",
            "Sunlight filters through the canopy, creating dappled patterns on the forest floor."
        ];
    }

    async initialize(): Promise<void> {
        logger.debug('Initializing AmbientMessageManager');
        // No specific initialization logic needed for now, but keep the method for future use
        return Promise.resolve();
    }

    getAmbientMessage(): string {
        if (this.ambientMessages.length === 0) {
            logger.warn("No ambient messages available.");
            return "Silence.";
        }

        const randomIndex = Math.floor(Math.random() * this.ambientMessages.length);
        return this.ambientMessages[randomIndex];
    }

    addAmbientMessage(message: string): void {
        this.ambientMessages.push(message);
        logger.info(`Added new ambient message: ${message}`);
    }

    removeAmbientMessage(message: string): void {
        const index = this.ambientMessages.indexOf(message);
        if (index > -1) {
            this.ambientMessages.splice(index, 1);
            logger.info(`Removed ambient message: ${message}`);
        } else {
            logger.warn(`Ambient message not found: ${message}`);
        }
    }
}
