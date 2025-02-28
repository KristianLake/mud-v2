import React from 'react';
import { ActionButtonProps } from './types';
import { useLifecycleLogging } from '../../hooks/useLifecycleLogging';

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, disabled }) => {
  useLifecycleLogging("ActionButton", { label, onClick, disabled });

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`action-button ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
