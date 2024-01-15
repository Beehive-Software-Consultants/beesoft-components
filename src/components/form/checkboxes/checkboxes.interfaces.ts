import { SyntheticEvent } from 'react';

export interface CheckboxChangeEvent {
  value: unknown;
  checked: boolean;
  partial: boolean;
  originalEvent?: SyntheticEvent<HTMLInputElement, Event>;
}
