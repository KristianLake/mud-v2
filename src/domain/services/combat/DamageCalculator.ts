import { BaseGameService } from '../BaseGameService';

// NOTE: This interface and the DamageCalculator class are very basic and should
//       likely be expanded with more sophisticated combat mechanics.

export interface IDamageCalculator {
    calculateDamage(attack: number, defense: number): number;
}
export class DamageCalculator extends BaseGameService implements IDamageCalculator {
    calculateDamage(attack: number, defense: number): number {
        // Super basic damage calculation (can be expanded)
        const damage = Math.max(0, attack - defense);
        return damage;
    }
}
