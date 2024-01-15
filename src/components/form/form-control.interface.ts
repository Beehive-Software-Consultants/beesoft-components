import React from 'react';

export interface FormInputControl<V = unknown, C = undefined> {
  label?: string;
  name?: string;
  value?: V;
  readOnly?: boolean;
  placeholder?: string;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  onInput?: (event: React.FormEvent) => void;
  onChange?: (value?: C extends undefined ? V : C) => void;
  className?: string;
}
