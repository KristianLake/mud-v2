import { BaseGameService } from '../BaseGameService';
import { IQuestService } from './IQuestService';
import { IStateService } from '../state/IStateService';
import { IEntityService } from '../entity/IEntityService';
import { IEventService } from '../event/IEventService';
import { IMessageService } from '../messaging/IMessageService';
import { IInventoryService } from '../inventory/IInventoryService';
import { IQuest, IQuestObjective, IQuestReward } from '../../entities/interfaces/IQuest';
import { Quest } from '../../entities/implementations/Quest';

/**
 * Service for managing quests
 * Single Responsibility: Handles quest operations
 */
export class QuestService extends BaseGameService implements IQuestService {
  constructor(
    stateService: IStateService,
    entityService: IEntityService,
    eventService: IEventService,
    messageService: IMessageService,
    private inventoryService: IInventoryService
  ) {
    super(
      stateService,
      entityService,
      eventService,
      messageService,
      'QuestService'
    );
  } 
  
  /**
   * Initialize the service
   */
  protected async onInitialize(): Promise<void> {
    // Subscribe to relevant events
    this.eventService.on('player:moved', this.handlePlayerMoved.bind(this));
    this.eventService.on('inventory:item:added', this.handleItemAdded.bind(this));
    this.eventService.on('npc:defeated', this.handleNPCDefeated.bind(this));
    
    return Promise.resolve();
  }
  
  /**
   * Clean up the service
   */
  protected async onDispose(): Promise<void> {
    // Unsubscribe from events
    this.eventService.off('player:moved', this.handlePlayerMoved.bind(this));
    this.eventService.off('inventory:item:added', this.handleItemAdded.bind(this));
    this.eventService.off('npc:defeated', this.handleNPCDefeated.bind(this));
    
    return Promise.resolve();
  }
  
  /**
   * Start a quest
   */
  startQuest(questId: string): boolean {
    // Check if quest exists
    const quest = this.entityService.getQuest(questId);
    if (!quest) {
      this.messageService.addErrorMessage("That quest doesn't exist.");
      return false;
    }
    
    // Check if quest is already active or completed
    if (this.isQuestActive(questId)) {
      this.messageService.addWarningMessage("You've already started that quest.");
      return false;
    }
    
    if (this.isQuestCompleted(questId)) {
      this.messageService.addWarningMessage("You've already completed that quest.");
      return false;
    }
    
    // Get current quest log
    const state = this.stateService.getState();
    const questLog = [...(state.questLog || [])];
    
    // Add quest to quest log
    questLog.push({
      ...quest,
      isCompleted: false
    });
    
    // Update state
    this.stateService.updateState({
      questLog
    });
    
    // Emit event
    this.eventService.emit('quest:started', { questId, quest });
    
    // Add message
    this.messageService.addMessage(`New quest started: ${quest.name}`, 'quest');
    
    this.log('debug', `Started quest ${questId}`);
    return true;
  }
  
  /**
   * Get all active quests
   */
  getActiveQuests(): IQuest[] {
    const state = this.stateService.getState();
    const questLog = state.questLog || [];
    
    return questLog
      .filter(quest => !quest.isCompleted)
      .map(questData => {
        const quest = this.entityService.getQuest(questData.id);
        return quest || questData;
      });
  }
  
  /**
   * Get all completed quests
   */
  getCompletedQuests(): IQuest[] {
    const state = this.stateService.getState();
    const questLog = state.questLog || [];
    
    return questLog
      .filter(quest => quest.isCompleted)
      .map(questData => {
        const quest = this.entityService.getQuest(questData.id);
        return quest || questData;
      });
  }
  
  /**
   * Get a quest by ID
   */
  getQuest(questId: string): IQuest | undefined {
    // Check in quest log first
    const state = this.stateService.getState();
    const questLog = state.questLog || [];
    
    const questInLog = questLog.find(q => q.id === questId);
    if (questInLog) {
      return questInLog;
    }
    
    // Otherwise check in entity service
    return this.entityService.getQuest(questId);
  }
  
  /**
   * Check if a quest is active
   */
  isQuestActive(questId: string): boolean {
    const state = this.stateService.getState();
    const questLog = state.questLog || [];
    
    return questLog.some(quest => quest.id === questId && !quest.isCompleted);
  }
  
  /**
   * Check if a quest is completed
   */
  isQuestCompleted(questId: string): boolean {
    const state = this.stateService.getState();
    const questLog = state.questLog || [];
    
    return questLog.some(quest => quest.id === questId && quest.isCompleted);
  }
  
  /**
   * Update a quest objective
   */
  updateQuestObjective(questId: string, objectiveIndex: number, isCompleted: boolean): boolean {
    // Check if quest is active
    if (!this.isQuestActive(questId)) {
      return false;
    }
    
    // Get current quest log
    const state = this.stateService.getState();
    const questLog = [...(state.questLog || [])];
    
    // Find quest in quest log
    const questIndex = questLog.findIndex(quest => quest.id === questId);
    if (questIndex === -1) {
      return false;
    }
    
    // Check if objective index is valid
    const quest = questLog[questIndex];
    if (objectiveIndex < 0 || objectiveIndex >= quest.objectives.length) {
      this.log('error', `Invalid objective index ${objectiveIndex} for quest ${questId}`);
      return false;
    }
    
    // Create updated quest with modified objective
    const updatedObjectives = [...quest.objectives];
    updatedObjectives[objectiveIndex] = {
      ...updatedObjectives[objectiveIndex],
      isCompleted
    };
    
    const updatedQuest = new Quest({
      ...quest,
      objectives: updatedObjectives
    });
    
    // Update quest in quest log
    questLog[questIndex] = updatedQuest;
    
    // Update state
    this.stateService.updateState({
      questLog
    });
    
    // Emit event
    this.eventService.emit('quest:objective:updated', { 
      questId, 
      objectiveIndex,
      isCompleted,
      quest: updatedQuest
    });
    
    // Add message
    const objective = updatedQuest.objectives[objectiveIndex];
    if (isCompleted) {
      this.messageService.addMessage(`Quest objective completed: ${objective.description}`, 'quest');
    }
    
    // Check if all objectives are completed
    if (isCompleted && this.areAllObjectivesCompleted(questId)) {
      this.messageService.addMessage(`All objectives completed for quest: ${updatedQuest.name}!`, 'quest');
      
      // Notify that quest can be completed
      this.eventService.emit('quest:ready:complete', { 
        questId, 
        quest: updatedQuest
      });
    }
    
    this.log('debug', `Updated objective ${objectiveIndex} for quest ${questId}`);
    return true;
  }
  
  /**
   * Check if all objectives are completed for a quest
   */
  areAllObjectivesCompleted(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (!quest) {
      return false;
    }
    
    return quest.objectives.every(objective => objective.isCompleted);
  }
  
  /**
   * Complete a quest
   */
  completeQuest(questId: string): boolean {
    // Check if quest is active
    if (!this.isQuestActive(questId)) {
      return false;
    }
    
    // Check if all objectives are completed
    if (!this.areAllObjectivesCompleted(questId)) {
      this.messageService.addWarningMessage("You haven't completed all objectives for this quest yet.");
      return false;
    }
    
    // Get current quest log
    const state = this.stateService.getState();
    const questLog = [...(state.questLog || [])];
    
    // Find quest in quest log
    const questIndex = questLog.findIndex(quest => quest.id === questId);
    if (questIndex === -1) {
      return false;
    }
    
    // Get the quest
    const quest = questLog[questIndex];
    
    // Create updated quest with completed status
    const updatedQuest = new Quest({
      ...quest,
      isCompleted: true
    });
    
    // Update quest in quest log
    questLog[questIndex] = updatedQuest;
    
    // Update state
    this.stateService.updateState({
      questLog
    });
    
    // Award quest rewards
    this.awardQuestRewards(questId);
    
    // Emit event
    this.eventService.emit('quest:completed', { 
      questId, 
      quest: updatedQuest
    });
    
    // Add message
    this.messageService.addMessage(`Quest completed: ${updatedQuest.name}!`, 'quest');
    
    this.log('debug', `Completed quest ${questId}`);
    return true;
  }
  
  /**
   * Award quest rewards
   */
  awardQuestRewards(questId: string): boolean {
    const quest = this.getQuest(questId);
    if (!quest) {
      return false;
    }
    
    // Get current state
    const state = this.stateService.getState();
    
    // Process each reward
    for (const reward of quest.rewards) {
      switch (reward.type) {
        case 'item':
          if (reward.target) {
            // Add item to inventory
            this.inventoryService.addItem(reward.target);
            
            // Get item details for message
            const item = this.entityService.getItem(reward.target);
            if (item) {
              this.messageService.addMessage(`Received reward: ${item.name}`, 'quest');
            }
          }
          break;
          
        case 'gold':
          if (reward.count) {
            // Add gold to player
            const currentGold = state.playerStats?.gold || 0;
            const newGold = currentGold + reward.count;
            
            this.stateService.updateState({
              playerStats: {
                ...state.playerStats,
                gold: newGold
              }
            });
            
            this.messageService.addMessage(`Received reward: ${reward.count} gold`, 'quest');
          }
          break;
          
        case 'xp':
          if (reward.count) {
            // Add XP to player
            const currentXP = state.playerStats?.xp || 0;
            const level = state.playerStats?.level || 1;
            const newXP = currentXP + reward.count;
            
            // Check for level up
            const xpNeeded = level * 100; // Simple formula: 100 XP per level
            const newLevel = newXP >= xpNeeded ? level + 1 : level;
            
            this.stateService.updateState({
              playerStats: {
                ...state.playerStats,
                xp: newXP,
                level: newLevel
              }
            });
            
            this.messageService.addMessage(`Received reward: ${reward.count} XP`, 'quest');
            
            if (newLevel > level) {
              this.messageService.addMessage(`You leveled up to level ${newLevel}!`, 'quest');
              this.eventService.emit('player:leveled', { oldLevel: level, newLevel });
            }
          }
          break;
          
        default:
          this.log('warn', `Unknown reward type: ${reward.type}`);
          break;
      }
    }
    
    // Emit rewards given event
    this.eventService.emit('quest:rewards:given', { 
      questId, 
      rewards: quest.rewards
    });
    
    return true;
  }
  
  /**
   * Track progress for collect item objective
   */
  trackItemCollectionProgress(itemId: string): void {
    // Get active quests
    const activeQuests = this.getActiveQuests();
    
    // Check each quest for item collection objectives
    for (const quest of activeQuests) {
      quest.objectives.forEach((objective, index) => {
        // Check if this is a collect objective for the specified item
        if (objective.type === 'collect' && 
            objective.target === itemId && 
            !objective.isCompleted) {
          // Update the objective
          this.updateQuestObjective(quest.id, index, true);
        }
      });
    }
  }
  
  /**
   * Track progress for defeat NPC objective
   */
  trackNPCDefeatProgress(npcId: string): void {
    // Get active quests
    const activeQuests = this.getActiveQuests();
    
    // Check each quest for NPC defeat objectives
    for (const quest of activeQuests) {
      quest.objectives.forEach((objective, index) => {
        // Check if this is a defeat objective for the specified NPC
        if (objective.type === 'defeat' && 
            objective.target === npcId && 
            !objective.isCompleted) {
          // Update the objective
          this.updateQuestObjective(quest.id, index, true);
        }
      });
    }
  }
  
  /**
   * Track progress for visit room objective
   */
  trackRoomVisitProgress(roomId: string): void {
    // Get active quests
    const activeQuests = this.getActiveQuests();
    
    // Check each quest for room visit objectives
    for (const quest of activeQuests) {
      quest.objectives.forEach((objective, index) => {
        // Check if this is an explore objective for the specified room
        if (objective.type === 'explore' && 
            objective.target === roomId && 
            !objective.isCompleted) {
          // Update the objective
          this.updateQuestObjective(quest.id, index, true);
        }
      });
    }
  }
  
  /**
   * Handle player moved event
   */
  private handlePlayerMoved(data: { oldRoomId: string; newRoomId: string }): void {
    // Track room visit objectives
    this.trackRoomVisitProgress(data.newRoomId);
  }
  
  /**
   * Handle item added event
   */
  private handleItemAdded(data: { itemId: string }): void {
    // Track item collection objectives
    this.trackItemCollectionProgress(data.itemId);
    this.log('debug', `Processed item added event for item ${data.itemId}`);
  }
  
  /**
   * Handle NPC defeated event
   */
  private handleNPCDefeated(data: { npcId: string }): void {
    // Track NPC defeat objectives
    this.trackNPCDefeatProgress(data.npcId);
    this.log('debug', `Processed NPC defeated event for NPC ${data.npcId}`);
  }
}
