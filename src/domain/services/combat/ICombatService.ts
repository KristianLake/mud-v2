import { INPC } from '../../entities/interfaces/INPC';

/**
 * Interface for combat service
 * Follows Interface Segregation with focused methods
 */
export interface ICombatService {
  /**
   * Start combat with an NPC
   */
  startCombat(npcId: string): boolean;
  
  /**
   * Attack current target
   */
  attack(): boolean;
  
  /**
   * End combat
   */
  endCombat(victory?: boolean): void;
  
  /**
   * Check if player is in combat
   */
  isInCombat(): boolean;
  
  /**
   * Get current combat target
   */
  getCurrentTarget(): INPC | undefined;
  
  /**
   * Check if player can flee
   */
  canFlee(): boolean;
  
  /**
   * Attempt to flee from combat
   */
  flee(): boolean;
  
  /**
   * Use an item in combat
   */
  useItem(itemId: string): boolean;
  
  /**
   * Get player's combat stats
   */
  getPlayerCombatStats(): {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
  };
  
  /**
   * Get target's combat stats
   */
  getTargetCombatStats(): {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
  } | undefined;
}
