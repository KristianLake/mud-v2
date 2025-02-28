import { logger } from '../../../utils/logger';

export class CombatLogger {
    logCombatEvent(message: string, context?: any): void {
        logger.info(`[Combat] ${message}`, context);
    }

    logAttack(attacker: string, defender: string, damage: number): void {
        logger.info(`[Attack] ${attacker} attacks ${defender} for ${damage} damage.`);
    }

    logDefense(defender: string, attackType: string): void {
        logger.info(`[Defense] ${defender} defends against ${attackType}.`);
    }

    logDamage(target: string, damage: number, source: string): void {
        logger.info(`[Damage] ${target} takes ${damage} damage from ${source}.`);
    }

    logHeal(target: string, amount: number, source: string): void {
        logger.info(`[Heal] ${target} heals for ${amount} from ${source}.`);
    }

    logStatusEffect(target: string, effect: string, duration: number): void {
        logger.info(`[Status Effect] ${target} is affected by ${effect} for ${duration} turns.`);
    }

    logDeath(target: string): void {
        logger.warn(`[Death] ${target} has died.`);
    }

    logCombatStart(attacker: string, defender: string): void {
        logger.info(`[Combat Start] ${attacker} engages ${defender} in combat.`);
    }

    logCombatEnd(winner: string, loser: string): void {
        logger.info(`[Combat End] ${winner} defeats ${loser}.`);
    }
}
