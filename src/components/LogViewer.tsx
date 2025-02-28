import React from 'react';
import { useGameContext } from '../context/GameContext';

const LogViewer: React.FC = () => {
  const { logs } = useGameContext();

  return (
    <div className="log-viewer">
      <h3>Log Viewer</h3>
      <ul>
        {logs.map((log, index) => (
          <li key={index}>{log.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default LogViewer;
