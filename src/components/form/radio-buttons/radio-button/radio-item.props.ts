import { ChangeEvent } from 'react';
import { ComponentAnimationProps } from '../../../component-interfaces.ts';
import { SelectionLabelLocation } from '../../form-generic.interfaces.ts';

export interface RadioItemProps extends ComponentAnimationProps {
  id: string;
  name: string;
  label: string;
  value: string;
  checked?: boolean;
  labelLocation?: SelectionLabelLocation;
  readOnly?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}
