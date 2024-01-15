import { ButtonHTMLAttributes } from 'react';

export type ButtonType = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  buttonType?: ButtonType;
  fullWidth?: boolean;
  onClick?: () => void;
}

export interface ButtonRef {
  click: () => void;
}
