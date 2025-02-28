import { BaseCommand } from '../BaseCommand';
import { ICommandStrategy } from '../strategies/ICommandStrategy';
import { TradeService } from '../../TradeService';

export class TradeCommand extends BaseCommand {
  private tradeService: TradeService;

  constructor(strategy: ICommandStrategy) {
    super(strategy);
    this.tradeService = new TradeService();
  }

  execute(args?: string[]): string {
    if (!args || args.length === 0) {
      return "What would you like to trade? Try 'buy from [npc]' or 'sell to [npc]'.";
    }

    const action = args[0].toLowerCase();
    
    if (action === 'buy' && args[1]?.toLowerCase() === 'from' && args[2]) {
      const npcId = args[2];
      if (args.length > 3 && args[3]) {
        // Buy specific item: buy [item] from [npc]
        const itemId = args[3];
        return this.tradeService.buyItem(itemId, npcId);
      } else {
        // List items for sale: buy from [npc]
        this.tradeService.listItemsForSale(npcId);
        return '';
      }
    } 
    else if (action === 'sell' && args[1]?.toLowerCase() === 'to' && args[2]) {
      const npcId = args[2];
      if (args.length > 3 && args[3]) {
        // Sell specific item: sell [item] to [npc]
        const itemId = args[3];
        return this.tradeService.sellItem(itemId, npcId);
      } else {
        // List items to sell: sell to [npc]
        this.tradeService.listItemsToSell(npcId);
        return '';
      }
    }
    
    return "I'm not sure how to do that. Try 'buy from [npc]' or 'sell to [npc]'.";
  }
}
