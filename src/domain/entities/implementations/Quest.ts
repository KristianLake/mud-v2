import { IQuest, IQuestObjective, IQuestReward } from '../interfaces/IQuest';

/**
 * Implementation of Quest entity
 * Single Responsibility: Models a quest in the game
 */
export class Quest implements IQuest {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly objectives: IQuestObjective[];
  public readonly rewards: IQuestReward[];
  public readonly isCompleted: boolean;

  constructor(params: IQuest) {
    this.id = params.id;
    this.name = params.name;
    this.description = params.description;
    this.objectives = [...params.objectives];
    this.rewards = [...params.rewards];
    this.isCompleted = params.isCompleted;
  }

  /**
   * Check if all objectives are completed
   */
  areAllObjectivesCompleted(): boolean {
    if (this.objectives.length === 0) return false;
    return this.objectives.every(obj => obj.isCompleted);
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    if (this.objectives.length === 0) return 0;
    
    const completedCount = this.objectives.filter(obj => obj.isCompleted).length;
    return Math.round((completedCount / this.objectives.length) * 100);
  }

  /**
   * Create a copy with an updated objective
   */
  withUpdatedObjective(index: number, updates: Partial<IQuestObjective>): Quest {
    if (index < 0 || index >= this.objectives.length) {
      return this;
    }

    const newObjectives = [...this.objectives];
    newObjectives[index] = {
      ...newObjectives[index],
      ...updates
    };

    return new Quest({
      ...this,
      objectives: newObjectives
    });
  }

  /**
   * Create a copy with completed status
   */
  withCompleted(isCompleted: boolean): Quest {
    return new Quest({
      ...this,
      isCompleted
    });
  }

  /**
   * Get the next incomplete objective
   */
  getNextIncompleteObjective(): IQuestObjective | null {
    return this.objectives.find(obj => !obj.isCompleted) || null;
  }
}
