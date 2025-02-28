import React from 'react';
import { IconButtonProps } from './types';
import { useLifecycleLogging } from '../../hooks/useLifecycleLogging';

const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, tooltip }) => {
  useLifecycleLogging("IconButton", { icon, onClick, tooltip });

  return (
    <button
      onClick={onClick}
      className="icon-button"
      title={tooltip}
    >
      {icon}
    </button>
  );
};

export default IconButton;
