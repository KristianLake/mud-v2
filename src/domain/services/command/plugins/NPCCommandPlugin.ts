import { ICommandPlugin } from '../ICommandPlugin';
import { ICommandRegistry } from '../ICommandRegistry';
import { TalkCommand } from '../commands/TalkCommand';
import { AttackCommand } from '../commands/CombatCommand';
import { TradeCommand } from '../commands/TradeCommand';
import { NPCStrategy } from '../strategies/NPCStrategy';
import { BaseCommandPlugin } from './BaseCommandPlugin';

export class NPCCommandPlugin extends BaseCommandPlugin implements ICommandPlugin {
    register(registry: ICommandRegistry): void {
        this.registerCommand(registry, new TalkCommand(new NPCStrategy('talk', ['npc'])));       // talk to <npc>
        this.registerCommand(registry, new AttackCommand(new NPCStrategy('attack', ['npc'])));   // attack <npc>
        this.registerCommand(registry, new TradeCommand(new NPCStrategy('trade', ['npc'])));     // trade with <npc>
    }
}
