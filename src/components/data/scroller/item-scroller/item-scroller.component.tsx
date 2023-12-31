import { useState } from 'react';
import { ItemScrollerProps } from './item-scroller.props.ts';

const ItemScroller = ({
  data,
  surroundingPages = 1,
  pageSize = 50,
  minimumItemsPerPage = 15,
  styles,
  className,
  children,
}: ItemScrollerProps) => {
  const [renderPages, setRenderPages] = useState();
};

export { ItemScroller };
