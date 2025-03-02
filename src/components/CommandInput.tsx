import React, { useState, KeyboardEvent, ChangeEvent } from 'react';

interface CommandInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit: (command: string) => void;
}

export const CommandInput: React.FC<CommandInputProps> = ({ 
  value, 
  onChange, 
  onSubmit 
}) => {
  const [command, setCommand] = useState<string>(value || '');
  
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
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCommand(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };
  
  return (
    <div className="flex">
      <input
        type="text"
        value={command}
        onChange={handleChange}
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
