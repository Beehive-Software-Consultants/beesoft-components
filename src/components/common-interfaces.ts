/**
 * Allows a component to have its markup overridden.
 */
export interface MarkupEvents {
  markupCreated?: (element: Element) => void;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface IToString {
  toString(): string;
}

export interface IDisposable {
  dispose: () => void;
}

export interface BeeSoftTheme {
  primary1: string;
  primary2: string;
  primary3: string;
  primary4: string;
  primary5: string;
  gray1?: string;
  gray2?: string;
  gray3?: string;
  gray4?: string;
  gray5?: string;
  black?: string;
  white?: string;
  monoDark1?: string;
  monoDark2?: string;
  monoDark3?: string;
  monoLight1?: string;
  monoLight2?: string;
  monoLight3?: string;
  info?: string;
  success?: string;
  warning?: string;
  error?: string;
}

export type TypeOrArray<T> = T | Array<T>;
export type JsonDataItem = Record<string, unknown>;
export type JsonData = Array<JsonDataItem>;
