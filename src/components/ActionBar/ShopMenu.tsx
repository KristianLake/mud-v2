import React from 'react';
import { useGameContext } from '../../context/GameContext';

const ShopMenu: React.FC = () => {
  const { gameState } = useGameContext();

  return (
    <div className="shop-menu">
      {/* Render shop menu content here */}
      {gameState?.currentShop?.items && gameState.currentShop.items.length > 0 ? (
        <ul>
          {gameState.currentShop.items.map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      ) : (
        <p>No items in this shop.</p>
      )}
    </div>
  );
};

export default ShopMenu;
