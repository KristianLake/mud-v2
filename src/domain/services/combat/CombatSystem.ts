import { ICombatSystem } from './ICombatSystem';
import { IEventService } from '../event/IEventService';
import { IStateService } from '../state/IStateService';
import { IDamageCalculator } from './DamageCalculator';
import { DamageCalculator } from './DamageCalculator';
import { ServiceTokens } from '../di/ServiceTokens';
import { Container } from '../di/Container';
import { BaseGameService } from '../BaseGameService';
import { logger } from '../../../utils/logger';

export class CombatSystem extends BaseGameService implements ICombatSystem {
  private stateService: IStateService;
  private damageCalculator: IDamageCalculator;

  constructor() {
    super();
    this.stateService = this.container.resolve<IStateService>(ServiceTokens.StateService);
    this.damageCalculator = new DamageCalculator(); // No need for DI
    this.initializeListeners();
  }

    private initializeListeners(): void {
        // Example: Listen for an attack command and initiate combat
        this.eventService.on('attack', (data: { target: string }) => {
            logger.debug('CombatSystem received attack event', { target: data.target });
            this.startCombat(data.target);
        });
    }

  startCombat(targetId: string): void {
    const gameState = this.stateService.getState();
    const player = {
      attack: gameState.playerStats.baseAttack,
      defense: gameState.playerStats.baseDefense,
      health: gameState.playerHealth,
    };
    const target = gameState.npcs[targetId];

    if (!target) {
      logger.warn(`Target not found: ${targetId}`);
      return;
    }

    if (!target.isHostile) {
        logger.warn(`Target is not hostile: ${targetId}`);
        return;
    }

    logger.info(`Starting combat with ${target.name}`);
    this.eventService.emit('combatStart', { target: target.name });

    // Basic combat loop (turn-based)
    while (player.health > 0 && target.stats.health > 0) {
      // Player attacks target
      const playerDamage = this.damageCalculator.calculateDamage(player.attack, target.stats.defense);
      target.stats.health -= playerDamage;
      logger.info(`Player attacks ${target.name} for ${playerDamage} damage`);
      this.eventService.emit('combatRound', {
        attacker: 'player',
        target: target.name,
        damage: playerDamage,
      });

      if (target.stats.health <= 0) {
        logger.info(`${target.name} defeated!`);
        this.eventService.emit('combatEnd', { winner: 'player', target: target.name });
        break;
      }

      // Target attacks player
      const targetDamage = this.damageCalculator.calculateDamage(target.stats.attack, player.defense);
      gameState.playerHealth -= targetDamage;
      logger.info(`${target.name} attacks player for ${targetDamage} damage`);
      this.eventService.emit('combatRound', {
        attacker: target.name,
        target: 'player',
        damage: targetDamage,
      });

      if (gameState.playerHealth <= 0) {
        logger.info('Player defeated!');
        this.eventService.emit('combatEnd', { winner: target.name, target: 'player' });
        break;
      }
    }

    // Update game state after combat
    this.stateService.updateState({ playerHealth: gameState.playerHealth });
  }
}
