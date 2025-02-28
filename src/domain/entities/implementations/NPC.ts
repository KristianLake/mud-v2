import { INPC, INPCDialogue, INPCStats, IDialogueOption } from '../interfaces/INPC';
import { IItem } from '../interfaces/IItem';

/**
 * Implementation of NPC entity
 * Single Responsibility: Models an NPC in the game
 */
export class NPC implements INPC {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly dialogue: INPCDialogue;
  public readonly inventory: IItem[];
  public readonly isHostile?: boolean;
  public readonly isMerchant?: boolean;
  public readonly isQuestGiver?: boolean;
  public readonly stats?: INPCStats;
  public readonly currentRoomId?: string;
  
  private _health?: number;

  constructor(params: INPC) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.dialogue = params.dialogue;
    this.inventory = params.inventory;
    this.isHostile = params.isHostile;
    this.isMerchant = params.isMerchant;
    this.isQuestGiver = params.isQuestGiver;
    this.stats = params.stats;
    this.currentRoomId = params.currentRoomId;
    this._health = params.health;
  }

  /**
   * Get NPC's current health
   */
  get health(): number | undefined {
    return this._health;
  }

  /**
   * Check if NPC is alive
   */
  isAlive(): boolean {
    if (this._health === undefined || this.stats?.health === undefined) {
      return true; // NPCs without health tracking are always "alive"
    }
    return this._health > 0;
  }

  /**
   * Get a random greeting
   */
  getRandomGreeting(): string {
    const { greeting } = this.dialogue;
    if (!greeting.length) return "Hello.";
    const randomIndex = Math.floor(Math.random() * greeting.length);
    return greeting[randomIndex];
  }

  /**
   * Get a random farewell
   */
  getRandomFarewell(): string {
    const { farewell } = this.dialogue;
    if (!farewell.length) return "Goodbye.";
    const randomIndex = Math.floor(Math.random() * farewell.length);
    return farewell[randomIndex];
  }

  /**
   * Get dialogue for a specific topic
   */
  getTopicDialogue(topic: string): string | null {
    const topicDialogue = this.dialogue.topics?.[topic];
    if (!topicDialogue || !topicDialogue.length) return null;
    
    const randomIndex = Math.floor(Math.random() * topicDialogue.length);
    return topicDialogue[randomIndex];
  }

  /**
   * Create a copy of the NPC with new properties
   */
  withHealth(health: number): NPC {
    return new NPC({
      ...this,
      health
    });
  }

  /**
   * Create a copy of the NPC with a new room location
   */
  withRoom(roomId: string): NPC {
    return new NPC({
      ...this,
      currentRoomId: roomId
    });
  }
}
