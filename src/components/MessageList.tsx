import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { useGameContext } from '../context/GameContext';

interface MessageListProps {
  messages: Message[];
  onMessageAction?: (command: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onMessageAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { gameMaster, gameState } = useGameContext();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Get CSS class based on message type
  const getMessageClass = (type: Message['type']) => {
    switch (type) {
      case 'system':
        return 'text-blue-300';
      case 'player':
        return 'text-green-300';
      case 'error':
        return 'text-red-400';
      case 'command':
        return 'text-yellow-300';
      case 'ambient':
        return 'text-purple-300 italic';
      case 'npc':
        return 'text-orange-300 font-semibold';
      case 'inventory':
        return 'text-teal-300';
      case 'quest':
        return 'text-indigo-300';
      default:
        return 'text-gray-300';
    }
  };
  
  // Get button style based on action style
  const getButtonStyle = (style?: string) => {
    switch (style) {
      case 'primary':
        return 'bg-blue-700 hover:bg-blue-600 text-white';
      case 'secondary':
        return 'bg-gray-700 hover:bg-gray-600 text-white';
      case 'danger':
        return 'bg-red-700 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-700 hover:bg-green-600 text-white';
      case 'info':
        return 'bg-indigo-700 hover:bg-indigo-600 text-white';
      case 'warning':
        return 'bg-yellow-700 hover:bg-yellow-600 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };
  
  // Extract available directions from room description
  const extractDirections = (content: string): string[] => {
    const exitsMatch = content.match(/Exits:\s+([a-z,\s]+)/i);
    if (!exitsMatch || !exitsMatch[1]) return [];
    
    return exitsMatch[1].split(/,\s*/).map(dir => dir.trim());
  };
  
  // Extract NPCs from room description
  const extractNPCs = (content: string): string[] => {
    const npcMatch = content.match(/You see:\s+(.*?)(?=\.|$)/i);
    if (!npcMatch || !npcMatch[1]) return [];
    
    return npcMatch[1].split(/,\s*/).map(npc => {
      const nameMatch = npc.match(/([^-]+)/);
      return nameMatch ? nameMatch[1].trim() : npc.trim();
    });
  };
  
  // Extract items from room description with multiple approaches
  const extractItems = (content: string): string[] => {
    // Try to find "Items:" section directly
    const itemsHeaderMatch = content.match(/Items:\s+(.*?)(?=\.|$|You see)/i);
    if (itemsHeaderMatch && itemsHeaderMatch[1]) {
      return itemsHeaderMatch[1].split(/,\s*/).map(item => item.trim());
    }
    
    // Alternative: Find items using a more generic pattern
    const itemsRegex = /\b(Gold Coin|Loaf of Bread|Sword|Shield|Potion|Key|Map|Scroll|Gem|Amulet|Ring|Book|Dagger|Staff|Wand)\b/gi;
    const matches = content.match(itemsRegex);
    
    return matches ? [...new Set(matches)].map(match => match.trim()) : [];
  };
  
  // Get items from the game state for the current room
  const getItemsFromGameState = (): string[] => {
    if (!gameState?.playerLocation) return [];
    
    const currentRoom = gameState.rooms?.find(room => room.id === gameState.playerLocation);
    if (!currentRoom || !currentRoom.items || currentRoom.items.length === 0) return [];
    
    return currentRoom.items.map(itemId => {
      const item = gameState.items?.find(i => i.id === itemId);
      return item ? item.name : '';
    }).filter(Boolean);
  };
  
  // Handle action button click
  const handleActionClick = (command: string) => {
    if (onMessageAction) {
      onMessageAction(command);
    }
  };
  
  // Check if message might be a dialogue from an NPC
  const isNPCDialogue = (message: Message): boolean => {
    // Check if message starts with an NPC name followed by a colon
    return /^[A-Z][\w\s]+:\s/.test(message.content);
  };
  
  // Check if message might be related to trade
  const isTradeMessage = (message: Message): boolean => {
    return message.content.includes('shows you their wares') ||
           message.content.includes('buy') ||
           message.content.includes('sell');
  };
  
  // Generate trade buttons if needed
  const generateTradeButtons = (message: Message) => {
    // If in active trading according to game master
    if (gameMaster?.activeTrading) {
      const traderItems = gameMaster.getTraderItems?.() || [];
      const playerItems = gameMaster.getPlayerTradeItems?.() || [];
      
      return (
        <div className="mt-3 space-y-2">
          <div className="font-semibold text-yellow-300">For Sale:</div>
          <div className="flex flex-wrap gap-2">
            {traderItems.map((item, index) => (
              <button
                key={`buy-${index}`}
                onClick={() => handleActionClick(`buy ${item.name}`)}
                className={`px-3 py-1 text-sm rounded ${getButtonStyle('primary')}`}
                type="button"
              >
                Buy {item.name} ({item.price} gold)
              </button>
            ))}
            {traderItems.length === 0 && (
              <div className="text-gray-400">Nothing available to buy</div>
            )}
          </div>
          
          <div className="font-semibold text-yellow-300 mt-2">Your Items:</div>
          <div className="flex flex-wrap gap-2">
            {playerItems.map((item, index) => (
              <button
                key={`sell-${index}`}
                onClick={() => handleActionClick(`sell ${item.name}`)}
                className={`px-3 py-1 text-sm rounded ${getButtonStyle('secondary')}`}
                type="button"
              >
                Sell {item.name} ({item.price} gold)
              </button>
            ))}
            {playerItems.length === 0 && (
              <div className="text-gray-400">Nothing available to sell</div>
            )}
          </div>
          
          <button
            onClick={() => handleActionClick(`end trade`)}
            className={`px-3 py-1 text-sm rounded ${getButtonStyle('danger')}`}
            type="button"
          >
            End Trade
          </button>
        </div>
      );
    }
    
    return null;
  };
  
  // Generate dialogue options if needed
  const generateDialogueOptions = (message: Message) => {
    if (isNPCDialogue(message) && gameMaster?.getConversation) {
      const conversation = gameMaster.getConversation();
      if (conversation && conversation.isActive) {
        // Get the latest dialogue
        const currentDialogue = conversation.dialogue[conversation.dialogue.length - 1];
        if (currentDialogue && currentDialogue.options) {
          return (
            <div className="flex flex-wrap gap-2 mt-2">
              {currentDialogue.options.map((option, optionIndex) => (
                <button
                  key={`option-${optionIndex}`}
                  onClick={() => handleActionClick(`select dialogue ${option.id}`)}
                  className={`px-3 py-1 text-sm rounded ${getButtonStyle('info')}`}
                  type="button"
                >
                  {option.text}
                </button>
              ))}
            </div>
          );
        }
      }
    }
    
    return null;
  };
  
  // Determine if a message likely contains a room description
  const isRoomDescription = (message: Message): boolean => {
    return message.type === 'system' && 
           (message.content.includes('Exits:') || 
            message.content.includes('You see:') || 
            message.content.includes('Items:'));
  };
  
  return (
    <div className="message-list space-y-3 pb-4">
      {messages.map((message, index) => {
        let directions: string[] = [];
        let npcs: string[] = [];
        let items: string[] = [];
        let itemsFromState: string[] = [];
        
        // Only process room descriptions for interactive elements
        if (isRoomDescription(message)) {
          directions = extractDirections(message.content);
          npcs = extractNPCs(message.content);
          items = extractItems(message.content);
          
          // Try to get items from game state as a fallback
          if (items.length === 0) {
            itemsFromState = getItemsFromGameState();
            items = itemsFromState;
          } else {
            // Make sure items from game state are also included
            itemsFromState = getItemsFromGameState();
            const combinedItems = new Set([...items, ...itemsFromState]);
            items = Array.from(combinedItems);
          }
          
          console.log("Room Description Content:", message.content);
          console.log("Extracted directions:", directions);
          console.log("Extracted NPCs:", npcs);
          console.log("Extracted items from text:", items);
          console.log("Items from game state:", itemsFromState);
        }
        
        // Determine if this is an NPC dialogue that needs dialogue options
        const dialogueOptions = generateDialogueOptions(message);
        
        // Check if this is a trade-related message that needs buying/selling options
        const tradeOptions = isTradeMessage(message) ? generateTradeButtons(message) : null;
        
        return (
          <div 
            key={index} 
            className={`message p-2 rounded ${getMessageClass(message.type)}`}
          >
            <div className="mb-1 whitespace-pre-line">{message.content}</div>
            
            {/* Render action buttons if present in the message */}
            {message.actions && message.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {message.actions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={() => handleActionClick(action.command)}
                    className={`px-3 py-1 text-sm rounded ${getButtonStyle(action.style)}`}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
            
            {/* Auto-generated direction buttons */}
            {isRoomDescription(message) && directions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-gray-400 text-sm mr-2">Go:</span>
                {directions.map((dir, dirIndex) => (
                  <button
                    key={`dir-${dirIndex}`}
                    onClick={() => handleActionClick(`go ${dir}`)}
                    className={`px-3 py-1 text-sm rounded ${getButtonStyle('primary')}`}
                    type="button"
                  >
                    {dir}
                  </button>
                ))}
              </div>
            )}
            
            {/* Auto-generated NPC interaction buttons */}
            {isRoomDescription(message) && npcs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-gray-400 text-sm mr-2">NPCs:</span>
                {npcs.map((npc, npcIndex) => (
                  <React.Fragment key={`npc-${npcIndex}`}>
                    <button
                      onClick={() => handleActionClick(`talk to ${npc}`)}
                      className={`px-3 py-1 text-sm rounded ${getButtonStyle('secondary')}`}
                      type="button"
                    >
                      Talk to {npc}
                    </button>
                    <button
                      onClick={() => handleActionClick(`examine ${npc}`)}
                      className={`px-3 py-1 text-sm rounded ${getButtonStyle('info')}`}
                      type="button"
                    >
                      Examine {npc}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Auto-generated item interaction buttons */}
            {isRoomDescription(message) && items.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-gray-400 text-sm mr-2">Items:</span>
                {items.map((item, itemIndex) => (
                  <React.Fragment key={`item-${itemIndex}`}>
                    <button
                      onClick={() => handleActionClick(`examine ${item}`)}
                      className={`px-3 py-1 text-sm rounded ${getButtonStyle('info')}`}
                      type="button"
                    >
                      Examine {item}
                    </button>
                    <button
                      onClick={() => handleActionClick(`take ${item}`)}
                      className={`px-3 py-1 text-sm rounded ${getButtonStyle('success')}`}
                      type="button"
                    >
                      Take {item}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Dialogue options */}
            {dialogueOptions}
            
            {/* Trade options */}
            {tradeOptions}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
