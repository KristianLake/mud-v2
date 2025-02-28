import { IEntity } from '../../entities/interfaces/IEntity';
import { IRepository } from '../IRepository';
import { logger } from '../../../utils/logger';

/**
 * Base repository implementation for entities
 * Follows Open-Closed principle by allowing extension
 */
export abstract class BaseRepository<T extends IEntity> implements IRepository<T> {
  protected entities: Map<string, T> = new Map();
  
  constructor(protected readonly entityName: string) {
    logger.debug(`${entityName}Repository initialized`);
  }
  
  /**
   * Get an entity by ID
   */
  getById(id: string): T | undefined {
    const entity = this.entities.get(id);
    
    if (!entity) {
      logger.debug(`${this.entityName} with id '${id}' not found`);
    }
    
    return entity;
  }
  
  /**
   * Get all entities
   */
  getAll(): T[] {
    return Array.from(this.entities.values());
  }
  
  /**
   * Check if an entity exists
   */
  exists(id: string): boolean {
    return this.entities.has(id);
  }
  
  /**
   * Add or update an entity
   */
  save(entity: T): void {
    const isNewEntity = !this.entities.has(entity.id);
    this.entities.set(entity.id, entity);
    
    logger.debug(
      isNewEntity
        ? `${this.entityName} '${entity.id}' added`
        : `${this.entityName} '${entity.id}' updated`
    );
  }
  
  /**
   * Remove an entity
   */
  remove(id: string): boolean {
    const result = this.entities.delete(id);
    
    if (result) {
      logger.debug(`${this.entityName} '${id}' removed`);
    } else {
      logger.debug(`Attempted to remove non-existent ${this.entityName} '${id}'`);
    }
    
    return result;
  }
  
  /**
   * Get the count of entities
   */
  count(): number {
    return this.entities.size;
  }
  
  /**
   * Clear all entities
   */
  clear(): void {
    this.entities.clear();
    logger.debug(`All ${this.entityName} entities cleared`);
  }
  
  /**
   * Initialize with a collection of entities
   */
  initialize(entities: T[]): void {
    this.clear();
    
    for (const entity of entities) {
      this.entities.set(entity.id, entity);
    }
    
    logger.debug(`${this.entityName}Repository initialized with ${entities.length} entities`);
  }
}
