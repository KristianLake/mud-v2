import React, { useState, useEffect } from 'react';
import { PlayerStats, Item } from '../types';
import { logger, LogEntry } from '../utils/logger';

interface PlayerStatusProps {
  playerStats?: PlayerStats;
  inventory?: Item[];
  onCommandExecute: (command: string) => void;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({ 
  playerStats, 
  inventory = [], 
  onCommandExecute 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions'|'logs'>('actions');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const togglePanel = () => setIsOpen(!isOpen);

  const handleCommand = (command: string) => {
    onCommandExecute(command);
    setIsOpen(false); // Close panel after executing a command
  };

  // Capture logs for the log viewer
  useEffect(() => {
    // Function to update logs from logger
    const updateLogs = () => {
      try {
        // Make sure logger methods are available before calling
        if (typeof logger.getRecentLogs === 'function') {
          const recentLogs = logger.getRecentLogs(100);
          if (recentLogs && recentLogs.length) {
            setLogs(recentLogs);
          }
        } else {
          // Fallback if method isn't available yet
          console.warn('Logger.getRecentLogs not available');
          setLogs([]);
        }
      } catch (error) {
        console.error('Error retrieving logs:', error);
        setLogs([]);
      }
    };

    // Initialize logs
    updateLogs();

    // Set up interval to periodically refresh logs
    const intervalId = setInterval(updateLogs, 1000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Clear logs
  const handleClearLogs = () => {
    if (typeof logger.clearLogs === 'function') {
      logger.clearLogs();
      setLogs([]);
    }
  };

  return (
    <div className="absolute bottom-4 right-4">
      {/* Toggle button */}
      <button 
        onClick={togglePanel}
        className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-lg"
        title="Player Status"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </button>

      {/* Status panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 bg-gray-800 border border-gray-700 rounded shadow-lg p-3 text-white">
          {/* Tabs */}
          <div className="flex mb-3 border-b border-gray-700">
            <button 
              className={`flex-1 pb-2 ${activeTab === 'actions' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400'}`}
              onClick={() => setActiveTab('actions')}
            >
              Player Actions
            </button>
            <button 
              className={`flex-1 pb-2 ${activeTab === 'logs' ? 'text-blue-300 border-b-2 border-blue-300' : 'text-gray-400'}`}
              onClick={() => setActiveTab('logs')}
            >
              System Logs
            </button>
          </div>

          {/* Actions Tab */}
          {activeTab === 'actions' && (
            <>
              {/* Player stats button */}
              <button
                onClick={() => handleCommand('stats')}
                className="w-full text-left mb-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Check Stats
              </button>

              {/* Inventory button */}
              <button
                onClick={() => handleCommand('inventory')}
                className="w-full text-left mb-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                View Inventory ({inventory.length} items)
              </button>

              {/* Equipment button */}
              <button
                onClick={() => handleCommand('equipment')}
                className="w-full text-left mb-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Check Equipment
              </button>

              {/* Quests button */}
              <button
                onClick={() => handleCommand('quests')}
                className="w-full text-left mb-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded"
              >
                Quest Log
              </button>

              {/* Health display */}
              {playerStats && (
                <div className="mt-4 pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span>Health:</span>
                    <span>{playerStats.health}/{playerStats.maxHealth}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${(playerStats.health / playerStats.maxHealth) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Level {playerStats.level}</span>
                    <span>{playerStats.experience}/{playerStats.nextLevelExp} XP</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(playerStats.experience / playerStats.nextLevelExp) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="h-64 overflow-y-auto text-xs">
              {logs.length === 0 ? (
                <div className="text-center p-4 text-gray-400">No logs available</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 pb-1 border-b border-gray-700">
                    <div className="flex justify-between">
                      <span className={`
                        ${log.level === 'error' ? 'text-red-400' : ''}
                        ${log.level === 'warn' ? 'text-yellow-400' : ''}
                        ${log.level === 'info' ? 'text-blue-400' : ''}
                        ${log.level === 'debug' ? 'text-gray-400' : ''}
                      `}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="mt-1 break-words">{log.message}</div>
                  </div>
                ))
              )}
              <div className="sticky bottom-0 right-0 mt-2">
                <button 
                  onClick={handleClearLogs}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  Clear Logs
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlayerStatus;
