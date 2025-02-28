import { ErrorBoundary } from './components/ErrorBoundary';
import GameInterface from './components/GameInterface';
import { GameProvider } from './context/GameContext';
import { logger } from './utils/logger';

// Set up logging
if (import.meta.env.MODE === 'development') {
  logger.setMinLevel(0); // Debug level in development
} else {
  logger.setMinLevel(1); // Info level in production
}

// App entry point
function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <div className="h-screen w-screen bg-gray-900 text-white">
          <GameInterface />
        </div>
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
