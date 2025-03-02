import { Game, GameState } from '../domain/core/Game';
import { logger } from '../utils/logger';

export interface Quest {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  canComplete: boolean;
  objectives: {
    id: string;
    description: string;
    isCompleted: boolean;
    type: string;
    target?: string;
  }[];
  rewards: {
    type: string;
    value: number;
    description: string;
  }[];
}

export interface TradeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface Conversation {
  npcId: string;
  isActive: boolean;
  dialogue: {
    id: string;
    text: string;
    options: {
      id: string;
      text: string;
      action?: string;
    }[];
  }[];
}

export class GameMasterAgent {
  private game: Game;
  private activeConversation: Conversation | null = null;
  private activeTrading: string | null = null;
  
  constructor(initialState?: Partial<GameState>) {
    this.game = new Game(initialState);
    logger.debug('GameMasterAgent initialized');
    
    // Add sample quests
    this.addSampleQuests();
  }
  
  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.game.getState();
  }
  
  /**
   * Process a command from the player
   * @param command Command string from player
   * @returns Response message
   */
  processCommand(command: string): string {
    logger.debug(`GameMasterAgent processing command: ${command}`);
    return this.game.processCommand(command);
  }
  
  /**
   * Move the player in a direction
   * @param direction Direction to move
   * @returns True if movement was successful
   */
  movePlayer(direction: string): boolean {
    return this.game.movePlayer(direction);
  }
  
  /**
   * Take an item from the current room
   * @param itemId ID of the item to take
   * @returns True if the item was taken successfully
   */
  takeItem(itemId: string): boolean {
    return this.game.takeItem(itemId);
  }
  
  /**
   * Drop an item from inventory into the current room
   * @param itemId ID of the item to drop
   * @returns True if the item was dropped successfully
   */
  dropItem(itemId: string): boolean {
    return this.game.dropItem(itemId);
  }
  
  /**
   * Start a conversation with an NPC
   * @param npcId ID of the NPC to talk to
   * @returns True if conversation was started successfully
   */
  startConversation(npcId: string): boolean {
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    if (!npc) {
      logger.error(`Cannot start conversation - NPC ${npcId} not found`);
      return false;
    }
    
    // Check if NPC is in current room
    const currentRoomId = state.playerLocation;
    const currentRoom = state.rooms[currentRoomId];
    
    if (!currentRoom || !currentRoom.npcs || !currentRoom.npcs.includes(npcId)) {
      logger.error(`Cannot start conversation - NPC ${npcId} not in current room`);
      return false;
    }
    
    // Create conversation state
    this.activeConversation = {
      npcId,
      isActive: true,
      dialogue: [
        {
          id: 'greeting',
          text: npc.dialogue.greeting,
          options: [
            { id: 'ask_about_town', text: 'Tell me about this place' },
            { id: 'ask_about_self', text: 'Who are you?' },
            { id: 'ask_about_quests', text: 'Do you have any tasks for me?' },
            { id: 'end_conversation', text: 'Goodbye' }
          ]
        }
      ]
    };
    
    logger.debug(`Started conversation with NPC ${npcId}`);
    return true;
  }
  
  /**
   * End the current conversation
   */
  endConversation(): void {
    this.activeConversation = null;
    logger.debug('Ended conversation');
  }
  
  /**
   * Get the current conversation
   */
  getConversation(): Conversation | null {
    return this.activeConversation;
  }
  
  /**
   * Select a dialogue option in conversation
   * @param optionId ID of the selected option
   * @returns Response text
   */
  selectDialogueOption(optionId: string): string {
    if (!this.activeConversation) {
      return "You're not in a conversation.";
    }
    
    const npcId = this.activeConversation.npcId;
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    if (!npc) {
      this.activeConversation = null;
      return "That character is no longer available.";
    }
    
    // Find current dialogue
    const currentDialogue = this.activeConversation.dialogue[this.activeConversation.dialogue.length - 1];
    
    // Find selected option
    const selectedOption = currentDialogue.options.find(option => option.id === optionId);
    
    if (!selectedOption) {
      return "That's not a valid choice.";
    }
    
    // Handle common options
    if (optionId === 'end_conversation') {
      this.activeConversation = null;
      return "You end the conversation.";
    }
    
    if (optionId === 'ask_about_town') {
      const response = npc.dialogue.aboutTown || "I don't know much about this place.";
      return response;
    }
    
    if (optionId === 'ask_about_self') {
      const response = npc.dialogue.aboutSelf || "I'd rather not talk about myself.";
      return response;
    }
    
    if (optionId === 'ask_about_quests') {
      // Check if NPC has quests
      if (npc.questIds && npc.questIds.length > 0) {
        const questId = npc.questIds[0]; // Just get the first quest for simplicity
        const quest = state.quests?.find(q => q.id === questId);
        
        if (quest && !quest.isActive && !quest.isCompleted) {
          return `I do have a task for you. ${quest.description} Would you like to help?`;
        } else if (quest && quest.isActive && !quest.isCompleted) {
          // Check if quest can be completed
          if (this.canCompleteQuest(quest.id)) {
            return "Have you completed my task? Great! Let me see what you've found.";
          } else {
            return "How is that task coming along? Remember, I need you to " + quest.objectives[0].description;
          }
        } else if (quest && quest.isCompleted) {
          return "Thank you for your help earlier. I don't have any more tasks for you right now.";
        }
      }
      
      return "I don't have any tasks for you at the moment.";
    }
    
    if (optionId === 'accept_quest') {
      const questId = npc.questIds && npc.questIds[0];
      if (questId) {
        this.acceptQuest(questId);
        return "Excellent! I knew I could count on you. Come back when you're done.";
      }
      return "I'm sorry, there seems to be a misunderstanding.";
    }
    
    if (optionId === 'complete_quest') {
      const questId = npc.questIds && npc.questIds[0];
      if (questId && this.canCompleteQuest(questId)) {
        this.completeQuest(questId);
        return "Well done! Here's your reward. Thank you for your help.";
      }
      return "You haven't completed all the objectives yet.";
    }
    
    // Execute option action if specified
    if (selectedOption.action) {
      return this.executeAction(selectedOption.action);
    }
    
    return "I don't have anything else to say about that.";
  }
  
  /**
   * Execute a dialogue action
   * @param action Action to execute
   * @returns Response text
   */
  private executeAction(action: string): string {
    // Simple action handler
    if (action === 'trade') {
      return this.startTrading(this.activeConversation?.npcId || '');
    }
    
    if (action.startsWith('give_item:')) {
      const itemId = action.split(':')[1];
      this.game.addItemToInventory(itemId);
      return `Here, take this. It might be useful.`;
    }
    
    if (action.startsWith('goto_dialogue:')) {
      const dialogueId = action.split(':')[1];
      return `Let's talk about ${dialogueId}`;
    }
    
    return "I don't know how to do that.";
  }
  
  /**
   * Start trading with an NPC
   * @param npcId ID of the NPC to trade with
   * @returns Response message
   */
  startTrading(npcId: string): string {
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    if (!npc) {
      logger.error(`Cannot start trading - NPC ${npcId} not found`);
      return "That trader is not available.";
    }
    
    // Check if NPC is in current room
    const currentRoomId = state.playerLocation;
    const currentRoom = state.rooms[currentRoomId];
    
    if (!currentRoom || !currentRoom.npcs || !currentRoom.npcs.includes(npcId)) {
      logger.error(`Cannot start trading - NPC ${npcId} not in current room`);
      return "That trader is not here.";
    }
    
    // Check if NPC can trade
    if (!npc.canTrade) {
      return `${npc.name} doesn't want to trade with you.`;
    }
    
    // Set active trading
    this.activeTrading = npcId;
    
    return `${npc.name} shows you their wares. What would you like to buy or sell?`;
  }
  
  /**
   * End trading
   * @returns Response message
   */
  endTrading(): string {
    if (!this.activeTrading) {
      return "You're not trading with anyone.";
    }
    
    const npcId = this.activeTrading;
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    this.activeTrading = null;
    
    return npc ? `You stop trading with ${npc.name}.` : "Trading ended.";
  }
  
  /**
   * Get items available for purchase from the current trader
   * @returns List of trade items
   */
  getTraderItems(): TradeItem[] {
    if (!this.activeTrading) {
      return [];
    }
    
    const npcId = this.activeTrading;
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    if (!npc || !npc.inventory) {
      return [];
    }
    
    return npc.inventory.map(itemId => {
      const item = state.items[itemId];
      return {
        id: itemId,
        name: item.name,
        description: item.description,
        price: item.value || 10,
        quantity: 1
      };
    });
  }
  
  /**
   * Get player items available for sale
   * @returns List of trade items
   */
  getPlayerTradeItems(): TradeItem[] {
    const state = this.getState();
    
    if (!state.inventory || state.inventory.length === 0) {
      return [];
    }
    
    return state.inventory
      .filter(itemId => {
        const item = state.items[itemId];
        return item && item.isCarryable; // Only sellable items
      })
      .map(itemId => {
        const item = state.items[itemId];
        return {
          id: itemId,
          name: item.name,
          description: item.description,
          price: Math.floor((item.value || 10) * 0.7), // Sell for less than buy price
          quantity: 1
        };
      });
  }
  
  /**
   * Buy an item from the current trader
   * @param itemName Name of the item to buy
   * @returns True if purchase was successful
   */
  buyItem(itemName: string): boolean {
    if (!this.activeTrading) {
      logger.debug(`Cannot buy - not trading with anyone`);
      return false;
    }
    
    const npcId = this.activeTrading;
    const state = this.getState();
    const npc = state.npcs[npcId];
    
    if (!npc || !npc.inventory) {
      logger.debug(`Cannot buy - NPC ${npcId} has no inventory`);
      return false;
    }
    
    // Find the item by name
    const itemId = npc.inventory.find(id => 
      state.items[id] && state.items[id].name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!itemId) {
      logger.debug(`Cannot buy - item ${itemName} not found in NPC inventory`);
      return false;
    }
    
    const item = state.items[itemId];
    const itemPrice = item.value || 10;
    
    // Check if player has enough gold
    const playerGold = state.playerStats.gold || 0;
    
    if (playerGold < itemPrice) {
      logger.debug(`Cannot buy - not enough gold (has ${playerGold}, needs ${itemPrice})`);
      return false;
    }
    
    // Add item to player inventory
    if (!this.game.addItemToInventory(itemId)) {
      logger.debug(`Cannot buy - failed to add item to inventory`);
      return false;
    }
    
    // Remove item from NPC inventory
    const updatedNpcInventory = [...npc.inventory.filter(id => id !== itemId)];
    const updatedNpc = { ...npc, inventory: updatedNpcInventory };
    
    // Update NPC in game state
    const updatedNpcs = { ...state.npcs, [npcId]: updatedNpc };
    
    // Update player gold
    const updatedPlayerStats = {
      ...state.playerStats,
      gold: playerGold - itemPrice
    };
    
    // Update game state
    this.game.setState({
      npcs: updatedNpcs,
      playerStats: updatedPlayerStats
    });
    
    logger.debug(`Player bought item ${itemId} for ${itemPrice} gold`);
    return true;
  }
  
  /**
   * Sell an item to the current trader
   * @param itemName Name of the item to sell
   * @returns True if sale was successful
   */
  sellItem(itemName: string): boolean {
    if (!this.activeTrading) {
      logger.debug(`Cannot sell - not trading with anyone`);
      return false;
    }
    
    const state = this.getState();
    
    if (!state.inventory || state.inventory.length === 0) {
      logger.debug(`Cannot sell - player inventory is empty`);
      return false;
    }
    
    // Find the item by name
    const itemId = state.inventory.find(id => 
      state.items[id] && state.items[id].name.toLowerCase() === itemName.toLowerCase()
    );
    
    if (!itemId) {
      logger.debug(`Cannot sell - item ${itemName} not found in player inventory`);
      return false;
    }
    
    const item = state.items[itemId];
    const sellPrice = Math.floor((item.value || 10) * 0.7); // Sell for less than buy price
    
    // Remove item from player inventory
    if (!this.game.removeItemFromInventory(itemId)) {
      logger.debug(`Cannot sell - failed to remove item from inventory`);
      return false;
    }
    
    // Update player gold
    const playerGold = state.playerStats.gold || 0;
    const updatedPlayerStats = {
      ...state.playerStats,
      gold: playerGold + sellPrice
    };
    
    // Update game state
    this.game.setState({
      playerStats: updatedPlayerStats
    });
    
    // Add item to NPC inventory (optional - we could just make it disappear)
    const npcId = this.activeTrading;
    const npc = state.npcs[npcId];
    
    if (npc && npc.inventory) {
      const updatedNpcInventory = [...npc.inventory, itemId];
      const updatedNpc = { ...npc, inventory: updatedNpcInventory };
      const updatedNpcs = { ...state.npcs, [npcId]: updatedNpc };
      
      this.game.setState({
        npcs: updatedNpcs
      });
    }
    
    logger.debug(`Player sold item ${itemId} for ${sellPrice} gold`);
    return true;
  }
  
  /**
   * Add sample quests to the game
   */
  private addSampleQuests(): void {
    const state = this.getState();
    
    // Sample quest data
    const quests: Quest[] = [
      {
        id: 'quest1',
        name: 'Lost Item',
        description: 'Find and return a valuable coin that was lost in the South Gate area.',
        isActive: false,
        isCompleted: false,
        canComplete: false,
        objectives: [
          {
            id: 'obj1',
            description: 'Find the valuable coin',
            isCompleted: false,
            type: 'item',
            target: 'ValuableCoin'
          }
        ],
        rewards: [
          {
            type: 'gold',
            value: 50,
            description: '50 gold'
          },
          {
            type: 'experience',
            value: 100,
            description: '100 experience points'
          }
        ]
      }
    ];
    
    // Add the quest item to the game world
    const questItems = {
      'ValuableCoin': {
        id: 'ValuableCoin',
        name: 'Valuable Coin',
        description: 'An ancient coin with strange markings. Someone might be looking for this.',
        location: 'room4', // South Gate
        isCarryable: true,
        value: 20
      }
    };
    
    // Add the item to the South Gate room
    const southGate = state.rooms['room4'];
    if (southGate) {
      const roomItems = southGate.items || [];
      if (!roomItems.includes('ValuableCoin')) {
        const updatedRoomItems = [...roomItems, 'ValuableCoin'];
        const updatedRoom = {
          ...southGate,
          items: updatedRoomItems
        };
        
        const updatedRooms = {
          ...state.rooms,
          'room4': updatedRoom
        };
        
        // Update items and rooms
        this.game.setState({
          items: { ...state.items, ...questItems },
          rooms: updatedRooms,
          quests // Add quests to game state
        });
      }
    }
    
    // Add quest giver to the NPC
    const merchant = state.npcs['Merchant'];
    if (merchant) {
      const updatedMerchant = {
        ...merchant,
        questIds: ['quest1'],
        hasQuest: true,
        dialogue: {
          ...merchant.dialogue,
          aboutQuests: "I lost a valuable coin somewhere near the South Gate. Could you help me find it?"
        }
      };
      
      const updatedNpcs = {
        ...state.npcs,
        'Merchant': updatedMerchant
      };
      
      this.game.setState({
        npcs: updatedNpcs
      });
    }
    
    logger.debug('Added sample quests to the game');
  }
  
  /**
   * Accept a quest by name
   * @param questName Name of the quest to accept
   * @returns True if quest was accepted successfully
   */
  acceptQuest(questName: string): boolean {
    const state = this.getState();
    
    if (!state.quests) {
      logger.debug(`Cannot accept quest - no quests in game state`);
      return false;
    }
    
    // Find the quest by name (case insensitive)
    const quest = state.quests.find(q => 
      q.name.toLowerCase() === questName.toLowerCase()
    );
    
    if (!quest) {
      logger.debug(`Cannot accept quest - quest "${questName}" not found`);
      return false;
    }
    
    // Check if quest is already active or completed
    if (quest.isActive) {
      logger.debug(`Cannot accept quest - quest "${questName}" already active`);
      return false;
    }
    
    if (quest.isCompleted) {
      logger.debug(`Cannot accept quest - quest "${questName}" already completed`);
      return false;
    }
    
    // Update quest status
    const updatedQuest = {
      ...quest,
      isActive: true
    };
    
    // Update quests in game state
    const updatedQuests = state.quests.map(q => 
      q.id === quest.id ? updatedQuest : q
    );
    
    this.game.setState({
      quests: updatedQuests
    });
    
    logger.debug(`Accepted quest "${questName}"`);
    return true;
  }
  
  /**
   * Check if a quest can be completed
   * @param questId ID of the quest to check
   * @returns True if all quest objectives are completed
   */
  canCompleteQuest(questId: string): boolean {
    const state = this.getState();
    
    if (!state.quests) {
      return false;
    }
    
    // Find the quest
    const quest = state.quests.find(q => q.id === questId);
    
    if (!quest || !quest.isActive || quest.isCompleted) {
      return false;
    }
    
    // Check all objectives
    return quest.objectives.every(obj => obj.isCompleted);
  }
  
  /**
   * Complete a quest by name
   * @param questName Name of the quest to complete
   * @returns True if quest was completed successfully
   */
  completeQuest(questName: string): boolean {
    const state = this.getState();
    
    if (!state.quests) {
      logger.debug(`Cannot complete quest - no quests in game state`);
      return false;
    }
    
    // Find the quest by name (case insensitive)
    const quest = state.quests.find(q => 
      q.name.toLowerCase() === questName.toLowerCase()
    );
    
    if (!quest) {
      logger.debug(`Cannot complete quest - quest "${questName}" not found`);
      return false;
    }
    
    // Check if quest is active and all objectives are completed
    if (!quest.isActive) {
      logger.debug(`Cannot complete quest - quest "${questName}" not active`);
      return false;
    }
    
    if (quest.isCompleted) {
      logger.debug(`Cannot complete quest - quest "${questName}" already completed`);
      return false;
    }
    
    if (!this.canCompleteQuest(quest.id)) {
      logger.debug(`Cannot complete quest - not all objectives completed`);
      return false;
    }
    
    // Update quest status
    const updatedQuest = {
      ...quest,
      isActive: false,
      isCompleted: true
    };
    
    // Update quests in game state
    const updatedQuests = state.quests.map(q => 
      q.id === quest.id ? updatedQuest : q
    );
    
    // Award quest rewards
    this.awardQuestRewards(quest);
    
    // Update game state
    this.game.setState({
      quests: updatedQuests
    });
    
    logger.debug(`Completed quest "${questName}"`);
    return true;
  }
  
  /**
   * Award rewards for completing a quest
   * @param quest The completed quest
   */
  private awardQuestRewards(quest: Quest): void {
    const state = this.getState();
    
    // Process each reward
    for (const reward of quest.rewards) {
      if (reward.type === 'gold') {
        // Add gold to player
        const updatedPlayerStats = {
          ...state.playerStats,
          gold: (state.playerStats.gold || 0) + reward.value
        };
        
        this.game.setState({
          playerStats: updatedPlayerStats
        });
        
        logger.debug(`Awarded ${reward.value} gold for quest "${quest.name}"`);
      }
      
      if (reward.type === 'experience') {
        // Add experience to player
        const currentExp = state.playerStats.experience || 0;
        const newExp = currentExp + reward.value;
        
        // Simple level calculation (100 exp per level)
        const newLevel = Math.floor(newExp / 100) + 1;
        const levelUp = newLevel > (state.playerStats.level || 1);
        
        const updatedPlayerStats = {
          ...state.playerStats,
          experience: newExp,
          level: newLevel
        };
        
        this.game.setState({
          playerStats: updatedPlayerStats
        });
        
        logger.debug(`Awarded ${reward.value} experience for quest "${quest.name}"`);
        
        if (levelUp) {
          logger.debug(`Player leveled up to level ${newLevel}`);
        }
      }
      
      if (reward.type === 'item') {
        // Add item to player inventory
        const itemId = reward.target || '';
        if (itemId && state.items[itemId]) {
          this.game.addItemToInventory(itemId);
          logger.debug(`Awarded item ${itemId} for quest "${quest.name}"`);
        }
      }
    }
  }
  
  /**
   * Check if a quest-related item was collected
   * @param itemId ID of the item to check
   * @returns True if the item is needed for an active quest
   */
  checkQuestItemCollected(itemId: string): boolean {
    const state = this.getState();
    
    if (!state.quests) {
      return false;
    }
    
    // Get active quests
    const activeQuests = state.quests.filter(q => q.isActive && !q.isCompleted);
    
    // Check if any quest needs this item
    for (const quest of activeQuests) {
      for (const objective of quest.objectives) {
        if (!objective.isCompleted && 
            objective.type === 'item' && 
            objective.target === itemId) {
          
          // Mark objective as completed
          this.updateQuestObjective(quest.id, objective.id);
          
          logger.debug(`Quest item collected: ${itemId} for quest ${quest.name}`);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Update a quest objective
   * @param questId ID of the quest
   * @param objectiveId ID of the objective
   * @returns True if objective was updated
   */
  private updateQuestObjective(questId: string, objectiveId: string): boolean {
    const state = this.getState();
    
    if (!state.quests) {
      return false;
    }
    
    // Find the quest
    const questIndex = state.quests.findIndex(q => q.id === questId);
    
    if (questIndex === -1) {
      return false;
    }
    
    const quest = state.quests[questIndex];
    
    // Find the objective
    const objectiveIndex = quest.objectives.findIndex(o => o.id === objectiveId);
    
    if (objectiveIndex === -1) {
      return false;
    }
    
    // Update the objective
    const updatedObjectives = [...quest.objectives];
    updatedObjectives[objectiveIndex] = {
      ...updatedObjectives[objectiveIndex],
      isCompleted: true
    };
    
    // Check if all objectives are completed
    const allCompleted = updatedObjectives.every(o => o.isCompleted);
    
    // Update the quest
    const updatedQuest = {
      ...quest,
      objectives: updatedObjectives,
      canComplete: allCompleted
    };
    
    // Update quests in game state
    const updatedQuests = [...state.quests];
    updatedQuests[questIndex] = updatedQuest;
    
    this.game.setState({
      quests: updatedQuests
    });
    
    logger.debug(`Updated quest objective ${objectiveId} for quest ${questId}`);
    return true;
  }
  
  /**
   * Subscribe to game events
   * @param eventName Name of the event
   * @param callback Callback function
   */
  on(eventName: string, callback: Function): void {
    this.game.on(eventName, callback);
  }
  
  /**
   * Unsubscribe from game events
   * @param eventName Name of the event
   * @param callback Callback function
   */
  off(eventName: string, callback: Function): void {
    this.    game.off(eventName, callback);
  }
}
