import { BeeSoftTheme, IToString } from './common-interfaces';

export function getElementByClassNameRecursive(element: Element, className: string): Element {
  if (typeof element.className === 'string' && element.className.includes(className)) {
    return element;
  }

  return element.parentElement ? getElementByClassNameRecursive(element.parentElement, className) : element;
}

export function getBrowserLanguage() {
  return window.navigator.languages ? window.navigator.languages[0] : window.navigator.language;
}

export function padNumber(value: number, padCount: number, padCharacter: string) {
  const missingLength = padCount - value.toString().length;
  let padString = '';
  for (let i = 0; i < missingLength; i++) {
    padString += padCharacter;
  }

  return padString + value.toString();
}

export function generateNumberArray<T>(
  startingNumber: number,
  endingNumber: number,
  convertFunction?: (value: number) => T
) {
  const numberArray: Array<T> = [];
  for (let current = startingNumber; current <= endingNumber; current++) {
    numberArray.push(convertFunction ? convertFunction(current) : forceAssert<T>(current));
  }

  return numberArray;
}

export function isEventOutsideTarget(event: Event, target: HTMLElement) {
  const eventElement = event.target as HTMLElement;

  if (eventElement) {
    return !target.isSameNode(eventElement) && !target.contains(eventElement);
  }

  return false;
}

export function isEventWithinTarget(event: Event, target: HTMLElement) {
  const testElement = event.target as HTMLElement;
  return testElement ? isElementWithinTarget(testElement, target) : false;
}

export function isElementWithinTarget(element: HTMLElement, target: HTMLElement) {
  return element.isSameNode(target) || element.contains(target);
}

export function elementHasAllStyles(element: HTMLElement, styles: Record<string, string | number>) {
  const styleEntries = Object.entries(styles);
  const elementStyles = getComputedStyle(element);
  for (let i = 0, length = styleEntries.length; i < length; i++) {
    const [style, value] = styleEntries[i];

    if (typeof value === 'string' && value.indexOf(',') > -1) {
      const values = value.split(',').map((item) => item.trim());
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (!values.includes(elementStyles[style])) {
        return false;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (elementStyles[style] !== value) {
        return false;
      }
    }
  }

  return true;
}

export function elementHasAnyStyle(element: HTMLElement, styles: Record<string, string | number>) {
  const styleEntries = Object.entries(styles);
  const elementStyles = getComputedStyle(element);
  for (let i = 0, length = styleEntries.length; i < length; i++) {
    const [style, value] = styleEntries[i];

    if (typeof value === 'string' && value.indexOf(',') > -1) {
      const values = value.split(',').map((item) => item.trim());
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (values.includes(elementStyles[style])) {
        return true;
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      if (elementStyles[style] === value) {
        return true;
      }
    }
  }

  return false;
}

export function getElementByCssStylesRecursive(
  element: HTMLElement,
  styles: Record<string, string | number>,
  matchAllStyles = false
): HTMLElement {
  if (matchAllStyles && elementHasAllStyles(element, styles)) {
    return element;
  } else if (!matchAllStyles && elementHasAnyStyle(element, styles)) {
    return element;
  }

  return element.parentElement ? getElementByCssStylesRecursive(element.parentElement, styles) : element;
}

export function getAllElementStyleValuesRecursive(
  element: HTMLElement,
  style: string,
  action: (styleValue: string) => boolean,
  currentValues: Array<string> = []
): Array<string> {
  const elementStyles = getComputedStyle(element);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  if (elementStyles[style] && action(elementStyles[style])) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    currentValues.push(elementStyles[style]);
  }

  return element.parentElement
    ? getAllElementStyleValuesRecursive(element.parentElement, style, action, currentValues)
    : currentValues;
}

export function getAllElementStyleValues(style: string, action: (styleValue: string) => boolean) {
  const allElements = Array.from(document.querySelectorAll('body *'));
  const foundStyles: Array<string> = [];

  for (let i = 0, length = allElements.length; i < length; i++) {
    const elementStyles = getComputedStyle(allElements[i]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (elementStyles[style] && action(elementStyles[style])) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      foundStyles.push(elementStyles[style]);
    }
  }

  return foundStyles;
}

export function isObject(object: unknown): object is Record<string, never> {
  return typeof object === 'object' && object !== null;
}

export function isPrimitive(item: unknown): item is string | number | Date | boolean | bigint {
  return (
    typeof item !== 'undefined' &&
    (typeof item === 'string' ||
      typeof item === 'number' ||
      typeof item === 'boolean' ||
      typeof item === 'bigint' ||
      item instanceof Date)
  );
}

export function containsToString(object: unknown): object is IToString {
  return (isObject(object) || isPrimitive(object)) && Object.prototype.hasOwnProperty.call(object, 'toString');
}

/**
 * Performs an assertion from one type to any other type.
 * @param value - The initial type to convert.
 * @returns {T} - The type to convert to.
 */
export function forceAssert<T>(value: unknown): T {
  return value as T;
}

export function applyBeeSoftTheme(theme: Record<string, unknown>) {
  const root = document.documentElement;
  Object.keys(theme).forEach((cssVar) => {
    root.style.setProperty(cssVar, theme[cssVar] as string);
  });
}

export function createBeeSoftTheme(theme: BeeSoftTheme) {
  return {
    '--theme-bsc-primary-1': theme.primary1,
    '--theme-bsc-primary-2': theme.primary2,
    '--theme-bsc-primary-3': theme.primary3,
    '--theme-bsc-primary-4': theme.primary4,
    '--theme-bsc-primary-5': theme.primary5,
    '--theme-bsc-gray-1': theme.gray1 || '#303030',
    '--theme-bsc-gray-2': theme.gray2 || '#5f5f5f',
    '--theme-bsc-gray-3': theme.gray3 || '#8f8f8f',
    '--theme-bsc-gray-4': theme.gray4 || '#bebebe',
    '--theme-bsc-gray-5': theme.gray5 || '#eee',
    '--theme-bsc-black': theme.black || '#000',
    '--theme-bsc-white': theme.white || '#fff',
    '--theme-bsc-mono-dark-1': theme.monoDark1 || '#222',
    '--theme-bsc-mono-dark-2': theme.monoDark2 || '#3c3c3c',
    '--theme-bsc-mono-dark-3': theme.monoDark3 || '#4e4e4e',
    '--theme-bsc-mono-light-1': theme.monoLight1 || '#fefefe',
    '--theme-bsc-mono-light-2': theme.monoLight2 || '#eee',
    '--theme-bsc-mono-light-3': theme.monoLight3 || '#ccc',
    '--theme-bsc-info': theme.info || '#2e7ff8',
    '--theme-bsc-success': theme.success || '#53ae0c',
    '--theme-bsc-warning': theme.warning || '#ff6914',
    '--theme-bsc-error': theme.error || '#f01616',
  };
}
