/**
 * Service tokens for dependency injection
 * Provides unique identifiers for services
 */
export const ServiceTokens = {
  // Core services
  StateService: Symbol('StateService'),
  MessageService: Symbol('MessageService'),
  CommandService: Symbol('CommandService'),
  EventService: Symbol('EventService'),
  
  // Game services
  MovementService: Symbol('MovementService'),
  InventoryService: Symbol('InventoryService'),
  DialogueService: Symbol('DialogueService'),
  QuestService: Symbol('QuestService'),
  CombatService: Symbol('CombatService'),
  EntityService: Symbol('EntityService'),
  
  // Validators
  StateValidator: Symbol('StateValidator'),
  CommandValidator: Symbol('CommandValidator'),
  
  // Repositories
  ItemRepository: Symbol('ItemRepository'),
  NPCRepository: Symbol('NPCRepository'),
  RoomRepository: Symbol('RoomRepository'),
  QuestRepository: Symbol('QuestRepository'),
  
  // Factories
  StateServiceFactory: Symbol('StateServiceFactory'),
  EntityFactory: Symbol('EntityFactory'),
  
  // Other
  GameMasterAgent: Symbol('GameMasterAgent'),
  AudioSystem: Symbol('AudioSystem'),
  EnvironmentSystem: Symbol('EnvironmentSystem'),
  
  // Added missing token
  CommandRegistry: Symbol('CommandRegistry')
};
