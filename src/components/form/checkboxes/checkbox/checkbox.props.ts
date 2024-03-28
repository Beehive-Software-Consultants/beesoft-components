import { ComponentAnimationProps } from '../../../component-interfaces.ts';
import { FormInputControl } from '../../form-control.interface.ts';
import { SelectionLabelLocation } from '../../form-generic.interfaces.ts';
import { CheckboxChangeEvent } from '../checkboxes.interfaces.ts';

export interface CheckboxCheckState {
  checked: boolean;
  partial: boolean;
}

export interface CheckboxProps extends FormInputControl<unknown, CheckboxChangeEvent>, ComponentAnimationProps {
  checked?: boolean;
  partial?: boolean;
  labelLocation?: SelectionLabelLocation;
}

export interface CheckboxRef {
  setPartiallyChecked: (partiallyChecked: boolean) => void;
  setChecked: (checked: boolean) => void;
}
