import { ReactNode } from 'react';

export interface ActionButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface IconButtonProps {
  icon: ReactNode;
  onClick: () => void;
  tooltip: string;
}
