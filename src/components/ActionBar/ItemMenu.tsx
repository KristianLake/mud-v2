import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { Item } from '../../domain/entities/Item';

const ItemMenu: React.FC = () => {
  const { gameState, executeCommand } = useGameContext();

  const handleItemAction = (action: string, itemId: string) => {
    // Log the action for debugging
    console.log(`Executing item action: ${action} ${itemId}`);
    executeCommand(`${action} ${itemId}`);
  };

  const isEquippable = (item: Item) => {
    // Check if the item is equippable based on its type
    return item.type === 'weapon' || item.type === 'armor' || item.type === 'shield' || 
           item.type === 'helmet' || item.type === 'accessory';
  };

  const isEquipped = (itemId: string) => {
    // Check if the item is already equipped
    return gameState?.equippedItems?.includes(itemId) || false;
  };

  // Get items in the current room
  const roomItems = React.useMemo(() => {
    if (!gameState?.playerLocation) return [];
    
    const currentRoom = gameState.rooms?.find(room => room.id === gameState.playerLocation);
    if (!currentRoom || !currentRoom.items || currentRoom.items.length === 0) return [];
    
    return currentRoom.items.map(itemId => 
      gameState.items?.find(item => item.id === itemId)
    ).filter(Boolean);
  }, [gameState?.playerLocation, gameState?.rooms, gameState?.items]);

  return (
    <div className="item-menu p-2">
      <h3 className="text-sm font-semibold mb-2">Inventory:</h3>
      {gameState?.inventory && gameState.inventory.length > 0 ? (
        <ul className="space-y-2">
          {gameState.inventory.map((item) => (
            <li key={item.id} className="bg-gray-800 p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-200">{item.name}</span>
                <div className="flex space-x-1">
                  <button
                    className="bg-red-800 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs"
                    onClick={() => handleItemAction('drop', item.id)}
                    title="Drop item"
                  >
                    Drop
                  </button>
                  
                  {isEquippable(item) && (
                    <button
                      className={`${isEquipped(item.id) ? 'bg-green-700 hover:bg-green-600' : 'bg-blue-700 hover:bg-blue-600'} text-white px-2 py-0.5 rounded text-xs`}
                      onClick={() => handleItemAction(isEquipped(item.id) ? 'unequip' : 'equip', item.id)}
                      title={isEquipped(item.id) ? "Unequip item" : "Equip item"}
                    >
                      {isEquipped(item.id) ? 'Unequip' : 'Equip'}
                    </button>
                  )}
                  
                  {item.type === 'consumable' && (
                    <button
                      className="bg-purple-700 hover:bg-purple-600 text-white px-2 py-0.5 rounded text-xs"
                      onClick={() => handleItemAction('use', item.id)}
                      title="Use item"
                    >
                      Use
                    </button>
                  )}
                  
                  <button
                    className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-0.5 rounded text-xs"
                    onClick={() => handleItemAction('examine', item.id)}
                    title="Examine item"
                  >
                    Look
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">No items in inventory.</p>
      )}
      
      {/* Room Items Section */}
      {roomItems && roomItems.length > 0 && (
        <>
          <h3 className="text-sm font-semibold mb-2 mt-4">Items in Room:</h3>
          <ul className="space-y-2">
            {roomItems.map((item) => item && (
              <li key={item.id} className="bg-gray-700 p-2 rounded">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-amber-100">{item.name}</span>
                  <div className="flex space-x-1">
                    <button
                      className="bg-green-800 hover:bg-green-700 text-white px-2 py-0.5 rounded text-xs"
                      onClick={() => handleItemAction('take', item.id)}
                      title="Take item"
                    >
                      Take
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-0.5 rounded text-xs"
                      onClick={() => handleItemAction('examine', item.id)}
                      title="Examine item"
                    >
                      Look
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ItemMenu;
