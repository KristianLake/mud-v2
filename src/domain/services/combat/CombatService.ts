import { BaseGameService } from '../BaseGameService';
import { ICombatService } from './ICombatService';
import { IStateService } from '../state/IStateService';
import { IEntityService } from '../entity/IEntityService';
import { IEventService } from '../event/IEventService';
import { IMessageService } from '../messaging/IMessageService';
import { INPC } from '../../entities/interfaces/INPC';
import { NPC } from '../../entities/implementations/NPC';

/**
 * Service for managing combat
 * Single Responsibility: Handles combat mechanics
 */
export class CombatService extends BaseGameService implements ICombatService {
  private inCombat = false;
  private currentTargetId: string | null = null;
  private turnCount = 0;
  private canFleeValue = true;
  
  constructor(
    stateService: IStateService,
    entityService: IEntityService,
    eventService: IEventService,
    messageService: IMessageService
  ) {
    super(
      stateService,
      entityService,
      eventService,
      messageService,
      'CombatService'
    );
  }
  
  /**
   * Initialize the service
   */
  protected async onInitialize(): Promise<void> {
    // No async initialization needed
    return Promise.resolve();
  }
  
  /**
   * Clean up the service
   */
  protected async onDispose(): Promise<void> {
    // End any active combat
    if (this.inCombat) {
      this.endCombat();
    }
    
    return Promise.resolve();
  }
  
  /**
   * Start combat with an NPC
   */
  startCombat(npcId: string): boolean {
    // Check if already in combat
    if (this.inCombat) {
      this.messageService.addWarningMessage("You're already in combat!");
      return false;
    }
    
    // Get the NPC
    const npc = this.entityService.getNPC(npcId);
    if (!npc) {
      this.messageService.addErrorMessage("That character doesn't exist.");
      return false;
    }
    
    // Check if NPC is in the same room
    const currentRoomId = this.stateService.getState().playerLocation;
    if (npc.currentRoomId !== currentRoomId) {
      this.messageService.addWarningMessage(`${npc.name} is not here.`);
      return false;
    }
    
    // Check if NPC is hostile
    if (!npc.isHostile) {
      this.messageService.addWarningMessage(`${npc.name} is not hostile.`);
      return false;
    }
    
    // Start combat
    this.inCombat = true;
    this.currentTargetId = npcId;
    this.turnCount = 0;
    this.canFleeValue = true;
    
    // Emit event
    this.eventService.emit('combat:started', { npcId, npc });
    
    // Add message
    this.messageService.addCombatMessage(`You engage in combat with ${npc.name}!`);
    
    this.log('debug', `Started combat with NPC ${npcId}`);
    return true;
  }
  
  /**
   * Attack current target
   */
  attack(): boolean {
    if (!this.inCombat || !this.currentTargetId) {
      this.messageService.addWarningMessage("You're not in combat.");
      return false;
    }
    
    // Get the target
    const target = this.entityService.getNPC(this.currentTargetId);
    if (!target) {
      this.endCombat();
      this.messageService.addErrorMessage("Your target is gone.");
      return false;
    }
    
    // Get player stats
    const playerStats = this.getPlayerCombatStats();
    
    // Get target stats
    const targetHealth = target.health ?? target.stats?.health ?? 0;
    if (targetHealth <= 0) {
      this.endCombat(true);
      this.messageService.addCombatMessage(`${target.name} has been defeated!`);
      return true;
    }
    
    // Calculate player attack
    const playerAttack = this.calculateAttackDamage(
      playerStats.attack,
      this.getTargetCombatStats()?.defense ?? 0
    );
    
    // Calculate new target health
    const newTargetHealth = Math.max(0, targetHealth - playerAttack);
    
    // Update target with new health
    const updatedTarget = new NPC({
      ...target,
      health: newTargetHealth
    });
    
    // Update in entity service
    this.entityService.updateEntity('npc', updatedTarget);
    
    // Add message for player attack
    this.messageService.addCombatMessage(`You hit ${target.name} for ${playerAttack} damage!`);
    
    // Check if target is defeated
    if (newTargetHealth <= 0) {
      this.messageService.addCombatMessage(`${target.name} has been defeated!`);
      
      // Emit NPC defeated event
      this.eventService.emit('npc:defeated', { 
        npcId: target.id,
        npc: target
      });
      
      // End combat with victory
      this.endCombat(true);
      return true;
    }
    
    // Target's turn - only if still alive
    this.processCombatTurn();
    
    return true;
  }
  
  /**
   * End combat
   */
  endCombat(victory?: boolean): void {
    if (!this.inCombat) {
      return;
    }
    
    const targetId = this.currentTargetId;
    const target = targetId ? this.entityService.getNPC(targetId) : undefined;
    
    // Emit event
    this.eventService.emit('combat:ended', { 
      targetId,
      victory: !!victory
    });
    
    // Add message
    if (victory) {
      this.messageService.addCombatMessage(`Combat with ${target?.name || 'enemy'} has ended in victory!`);
    } else {
      this.messageService.addCombatMessage(`Combat has ended.`);
    }
    
    // Reset combat state
    this.inCombat = false;
    this.currentTargetId = null;
    this.turnCount = 0;
    
    this.log('debug', `Ended combat, victory: ${!!victory}`);
  }
  
  /**
   * Check if player is in combat
   */
  isInCombat(): boolean {
    return this.inCombat;
  }
  
  /**
   * Get current combat target
   */
  getCurrentTarget(): INPC | undefined {
    if (!this.currentTargetId) {
      return undefined;
    }
    
    return this.entityService.getNPC(this.currentTargetId);
  }
  
  /**
   * Check if player can flee
   */
  canFlee(): boolean {
    return this.canFleeValue;
  }
  
  /**
   * Attempt to flee from combat
   */
  flee(): boolean {
    if (!this.inCombat || !this.currentTargetId) {
      this.messageService.addWarningMessage("You're not in combat.");
      return false;
    }
    
    if (!this.canFlee()) {
      this.messageService.addWarningMessage("You can't flee from this combat!");
      return false;
    }
    
    // 70% chance to flee successfully
    const fleeSuccess = Math.random() < 0.7;
    
    if (fleeSuccess) {
      const target = this.entityService.getNPC(this.currentTargetId);
      this.messageService.addCombatMessage(`You successfully flee from ${target?.name || 'the enemy'}!`);
      
      // End combat
      this.endCombat();
      
      // Emit flee event
      this.eventService.emit('combat:fled', { 
        targetId: this.currentTargetId,
        success: true
      });
      
      return true;
    } else {
      this.messageService.addCombatMessage(`You failed to flee!`);
      
      // Emit flee event
      this.eventService.emit('combat:fled', { 
        targetId: this.currentTargetId,
        success: false
      });
      
      // Target gets a free attack
      this.processCombatTurn();
      
      return false;
    }
  }
  
  /**
   * Use an item in combat
   */
  useItem(itemId: string): boolean {
    if (!this.inCombat) {
      this.messageService.addWarningMessage("You're not in combat.");
      return false;
    }
    
    // Get the item
    const state = this.stateService.getState();
    const inventory = state.playerInventory || [];
    
    if (!inventory.includes(itemId)) {
      this.messageService.addWarningMessage("You don't have that item.");
      return false;
    }
    
    const item = this.entityService.getItem(itemId);
    if (!item) {
      this.messageService.addErrorMessage("That item doesn't exist.");
      return false;
    }
    
    // Check if item is usable in combat
    if (item.type !== 'consumable' && !item.properties?.effect) {
      this.messageService.addWarningMessage(`You can't use ${item.name} in combat.`);
      return false;
    }
    
    // Emit item used event
    this.eventService.emit('combat:item:used', { 
      itemId,
      item
    });
    
    // Apply item effects
    if (item.properties?.healthBonus) {
      const healthBonus = item.properties.healthBonus;
      
      // Update player health
      const playerStats = this.getPlayerCombatStats();
      const newHealth = Math.min(playerStats.health + healthBonus, playerStats.maxHealth);
      
      this.stateService.updateState({
        playerStats: {
          ...state.playerStats,
          health: newHealth
        }
      });
      
      this.messageService.addCombatMessage(`You used ${item.name} and restored ${healthBonus} health!`);
    }
    
    // Remove consumable from inventory
    if (item.type === 'consumable') {
      const newInventory = inventory.filter(id => id !== itemId);
      this.stateService.updateState({
        playerInventory: newInventory
      });
    }
    
    // Target still gets their turn
    this.processCombatTurn();
    
    return true;
  }
  
  /**
   * Get player's combat stats
   */
  getPlayerCombatStats(): {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
  } {
    const state = this.stateService.getState();
    const playerStats = state.playerStats || {};
    
    return {
      health: playerStats.health || 100,
      maxHealth: playerStats.maxHealth || 100,
      attack: playerStats.attack || 10,
      defense: playerStats.defense || 5
    };
  }
  
  /**
   * Get target's combat stats
   */
  getTargetCombatStats(): {
    health: number;
    maxHealth: number;
    attack: number;
    defense: number;
  } | undefined {
    const target = this.getCurrentTarget();
    if (!target) {
      return undefined;
    }
    
    const stats = target.stats || {};
    
    return {
      health: target.health ?? stats.health ?? 50,
      maxHealth: stats.health ?? 50,
      attack: stats.attack ?? 8,
      defense: stats.defense ?? 3
    };
  }
  
  /**
   * Process a combat turn (enemy attack)
   */
  private processCombatTurn(): void {
    if (!this.inCombat || !this.currentTargetId) {
      return;
    }
    
    // Get the target
    const target = this.entityService.getNPC(this.currentTargetId);
    if (!target) {
      this.endCombat();
      return;
    }
    
    // Increment turn count
    this.turnCount++;
    
    // Target attacks player
    const targetStats = this.getTargetCombatStats();
    const playerStats = this.getPlayerCombatStats();
    
    if (!targetStats) {
      return;
    }
    
    // Calculate target attack
    const targetAttack = this.calculateAttackDamage(
      targetStats.attack,
      playerStats.defense
    );
    
    // Calculate new player health
    const newPlayerHealth = Math.max(0, playerStats.health - targetAttack);
    
    // Update player health
    const state = this.stateService.getState();
    this.stateService.updateState({
      playerStats: {
        ...state.playerStats,
        health: newPlayerHealth
      }
    });
    
    // Add message for target attack
    this.messageService.addCombatMessage(`${target.name} hits you for ${targetAttack} damage!`);
    
    // Check if player is defeated
    if (newPlayerHealth <= 0) {
      this.messageService.addCombatMessage(`You have been defeated!`);
      
      // Emit player defeated event
      this.eventService.emit('player:defeated', { 
        targetId: target.id,
        target
      });
      
      // End combat with defeat
      this.endCombat(false);
    }
  }
  
  /**
   * Calculate attack damage based on attack and defense values
   */
  private calculateAttackDamage(attack: number, defense: number): number {
    // Base damage
    let damage = attack;
    
    // Reduce by defense (minimum 1)
    damage = Math.max(1, damage - (defense / 2));
    
    // Add some randomness (+/- 20%)
    const randomFactor = 0.8 + (Math.random() * 0.4); // 0.8 to 1.2
    damage = Math.round(damage * randomFactor);
    
    return damage;
  }
}
