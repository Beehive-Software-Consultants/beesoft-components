import { TypeOrArray } from '@beesoft/common';

export enum FormGroupItemOrientation {
  Vertical,
  Horizontal,
}

export interface GroupChangeEvent {
  name: string;
  value: TypeOrArray<unknown>;
}

export enum SelectionLabelLocation {
  Right,
  Left,
}