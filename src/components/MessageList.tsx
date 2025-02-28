import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  onMessageAction?: (command: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onMessageAction }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
    
    // This is a simple extraction - in a real implementation, you'd want more robust parsing
    return npcMatch[1].split(/,\s*/).map(npc => {
      // Extract just the name before any description
      const nameMatch = npc.match(/([^-]+)/);
      return nameMatch ? nameMatch[1].trim() : npc.trim();
    });
  };
  
  // Extract items from room description
  const extractItems = (content: string): string[] => {
    const itemMatch = content.match(/Items:?\s+(.*?)(?=\.|$)/i);
    if (!itemMatch || !itemMatch[1]) return [];
    
    return itemMatch[1].split(/,\s*/).map(item => item.trim());
  };
  
  // Handle action button click
  const handleActionClick = (command: string) => {
    if (onMessageAction) {
      onMessageAction(command);
    }
  };
  
  return (
    <div className="message-list space-y-3 pb-4">
      {messages.map((message, index) => {
        // For system messages, check if they contain room descriptions
        // and add action buttons for directions, NPCs, and items
        let directions: string[] = [];
        let npcs: string[] = [];
        let items: string[] = [];
        
        if (message.type === 'system') {
          directions = extractDirections(message.content);
          npcs = extractNPCs(message.content);
          items = extractItems(message.content);
        }
        
        return (
          <div 
            key={index} 
            className={`message p-2 ${getMessageClass(message.type)}`}
          >
            <div className="mb-1">{message.content}</div>
            
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
            {message.type === 'system' && directions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {directions.map((dir, dirIndex) => (
                  <button
                    key={`dir-${dirIndex}`}
                    onClick={() => handleActionClick(`go ${dir}`)}
                    className={`px-3 py-1 text-sm rounded ${getButtonStyle('primary')}`}
                    type="button"
                  >
                    Go {dir}
                  </button>
                ))}
              </div>
            )}
            
            {/* Auto-generated NPC interaction buttons */}
            {message.type === 'system' && npcs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {npcs.map((npc, npcIndex) => (
                  <button
                    key={`npc-${npcIndex}`}
                    onClick={() => handleActionClick(`talk to ${npc}`)}
                    className={`px-3 py-1 text-sm rounded ${getButtonStyle('secondary')}`}
                    type="button"
                  >
                    Talk to {npc}
                  </button>
                ))}
              </div>
            )}
            
            {/* Auto-generated item interaction buttons */}
            {message.type === 'system' && items.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
