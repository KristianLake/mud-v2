import { IEventService } from './event/IEventService';
import { IStateService } from './state/IStateService';
import { ServiceTokens } from './di/ServiceTokens';
import { Container } from './di/Container';
import { BaseGameService } from './BaseGameService';
import { logger } from '../../utils/logger';

export class PlayerStats extends BaseGameService {
    private stateService: IStateService;

    constructor() {
        super();
        this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    }

    // Increases a specific player stat by a given amount.
    increaseStat(statName: keyof GameState['playerStats'], amount: number): void {
        const gameState = this.stateService.getState();
        const currentStatValue = gameState.playerStats[statName];

        if (typeof currentStatValue !== 'number') {
            logger.error(`Invalid stat for increase: ${statName}`);
            return;
        }

        const updatedStats = { ...gameState.playerStats, [statName]: currentStatValue + amount };
        this.stateService.updateState({ playerStats: updatedStats });
        logger.info(`Increased player stat ${statName} by ${amount}`);
    }

    // Decreases a specific player stat by a given amount.
    decreaseStat(statName: keyof GameState['playerStats'], amount: number): void {
        const gameState = this.stateService.getState();
        const currentStatValue = gameState.playerStats[statName];

        if (typeof currentStatValue !== 'number') {
            logger.error(`Invalid stat for decrease: ${statName}`);
            return;
        }

        const updatedStats = { ...gameState.playerStats, [statName]: currentStatValue - amount };
        this.stateService.updateState({ playerStats: updatedStats });
        logger.info(`Decreased player stat ${statName} by ${amount}`);
    }

    // Retrieves the current value of a specific player stat.
    getStat(statName: keyof GameState['playerStats']): number | undefined {
        const gameState = this.stateService.getState();
        const statValue = gameState.playerStats[statName];

        if (typeof statValue !== 'number') {
            logger.error(`Invalid stat requested: ${statName}`);
            return undefined;
        }

        return statValue;
    }
}
