import { Item } from '../../types';
import { logger } from '../../utils/logger';

/**
 * Service dedicated to item filtering and validation
 * Single Responsibility: Filter and validate items
 */
export class ItemFilterService {
  filterTakeableItems(items: Item[]): Item[] {
    logger.debug('Filtering takeable items', {
      total: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        isPortable: i.isPortable
      }))
    });

    const takeableItems = items.filter(item => {
      // Validate item structure
      if (!this.validateItem(item)) {
        return false;
      }

      // Currency, consumable, and equipment should always be portable
      if (['currency', 'consumable', 'equipment'].includes(item.type)) {
        if (!item.isPortable) {
          logger.warn('Correcting portable status for item', {
            item: item.name,
            type: item.type
          });
          item.isPortable = true;
        }
      }

      return item.isPortable === true;
    });

    logger.debug('Takeable items filtered', {
      total: items.length,
      filtered: takeableItems.length,
      items: takeableItems.map(i => i.name)
    });

    return takeableItems;
  }

  filterDroppableItems(items: Item[]): Item[] {
    logger.debug('Filtering droppable items', {
      total: items.length,
      items: items.map(i => ({
        id: i.id,
        name: i.name,
        equipped: i.equipped
      }))
    });

    const droppableItems = items.filter(item => {
      // Validate item structure
      if (!this.validateItem(item)) {
        return false;
      }

      // Items must not be equipped to be droppable
      return item.equipped !== true;
    });

    logger.debug('Droppable items filtered', {
      total: items.length,
      filtered: droppableItems.length,
      items: droppableItems.map(i => i.name)
    });

    return droppableItems;
  }

  private validateItem(item: any): item is Item {
    // Basic structure validation
    if (!item || typeof item !== 'object') {
      logger.warn('Invalid item structure', { item });
      return false;
    }

    // Required properties
    if (!item.id || !item.name || !item.type) {
      logger.warn('Item missing required properties', { item });
      return false;
    }

    // Validate type
    if (!['currency', 'consumable', 'equipment', 'quest', 'misc'].includes(item.type)) {
      logger.warn('Invalid item type', { item });
      return false;
    }

    return true;
  }
}
