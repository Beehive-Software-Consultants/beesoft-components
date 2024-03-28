import { MakeRequired } from '@beesoft/common';
import { ChangeEvent } from 'react';
import { ComponentAnimationProps } from '../../../component-interfaces.ts';
import { FormInputControlData } from '../../form-control.interface.ts';
import { FormGroupItemOrientation, SelectionLabelLocation } from '../../form-generic.interfaces.ts';

export interface RadioChangeEvent {
  name: string;
  value: unknown;
  originalEvent?: ChangeEvent<HTMLInputElement>;
}

export interface RadioButtonProps
  extends MakeRequired<FormInputControlData<string, RadioChangeEvent>, 'name'>,
    ComponentAnimationProps {
  labelLocation?: SelectionLabelLocation;
  orientation?: FormGroupItemOrientation;
}
