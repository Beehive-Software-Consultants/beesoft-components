import { ReactNode } from 'react';
import { TypeOrArray } from '../../common-interfaces.ts';

export interface MediaQueryProps {
  /**
   * The media query for mobile devices.
   *
   * Default: `screen and (max-width: 640px)`
   */
  mobileQuery?: string;
  /**
   * The media query for tablet devices.
   *
   * Default: `screen and (min-width: 641px and max-width: 768px)`
   */
  tabletQuery?: string;
  /**
   * The media query for desktop devices.
   *
   * Default: `screen and (min-width: 1024px)`
   */
  desktopQuery?: string;
  /**
   * Markup to use when a device is a mobile phone.
   */
  mobileMarkup?: TypeOrArray<ReactNode>;
  /**
   * Markup to use when a device is anything other than a mobile phone.
   */
  aboveMobileMarkup?: TypeOrArray<ReactNode>;
  /**
   * Markup to use when a device is a tablet.
   */
  tabletMarkup?: TypeOrArray<ReactNode>;
  /**
   * Markup to use when a device is a desktop.
   */
  desktopMarkup?: TypeOrArray<ReactNode>;
}
