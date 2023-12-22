import { CSSProperties, ReactNode } from 'react';
import { JsonData, TypeOrArray } from '../../../common-interfaces.ts';

export interface ItemScrollerProps {
  /**
   * The data to display in the scroller.
   */
  data: JsonData;
  /**
   * When scrolling this determines the number of pages to surround the current page with; for example 1 would put a
   * page above and below the current page.
   */
  surroundingPages?: number;
  /**
   * The number of items to display per page.
   */
  pageSize?: number;
  /**
   * The minimum number of items needed to make a page; if the remaining items are less, then they are added to the
   * previous page.
   */
  minimumItemsPerPage?: number;
  /**
   * Style properties to set on the top scroller element.
   */
  styles?: CSSProperties;
  /**
   * The CSS classes to apply to the scroller.
   */
  className?: string;
  /**
   * The child render function called when rendering a page.
   */
  children: ItemScrollerRenderFunction;
}

export type ItemScrollerRenderFunction = (data: JsonData, page: number) => TypeOrArray<ReactNode>;
