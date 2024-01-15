import { FormInputControl } from '../../form-control.interface.ts';
import { CheckboxChangeEvent } from '../checkboxes.interfaces.ts';

export enum CheckboxLabelLocation {
  Right,
  Left,
}

export interface CheckboxCheckState {
  checked: boolean;
  partial: boolean;
}

export interface CheckboxProps extends FormInputControl<unknown, CheckboxChangeEvent> {
  checked?: boolean;
  partial?: boolean;
  labelLocation?: CheckboxLabelLocation;
}

export interface CheckboxRef {
  setPartiallyChecked: (partiallyChecked: boolean) => void;
}
