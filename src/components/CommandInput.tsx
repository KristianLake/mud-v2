import React, { useState, KeyboardEvent } from 'react';

interface CommandInputProps {
  onSubmit: (command: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ onSubmit }) => {
  const [command, setCommand] = useState<string>('');
  
  const handleSubmit = () => {
    if (command.trim()) {
      onSubmit(command);
      setCommand('');
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };
  
  return (
    <div className="flex">
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a command..."
        className="flex-1 bg-gray-800 text-gray-200 border border-gray-700 rounded-l p-2 focus:outline-none focus:border-blue-500"
        autoFocus
      />
      <button
        onClick={handleSubmit}
        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-r"
      >
        Execute
      </button>
    </div>
  );
};

export default CommandInput;
