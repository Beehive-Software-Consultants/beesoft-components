import { throttle, debounce } from 'lodash-es';
import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { bindDocumentClickListener, unbindDocumentClickListener } from '../../common-event-handlers';
import { getAllElementStyleValues, getElementByCssStylesRecursive, isEventOutsideTarget } from '../../common-functions';
import { MarkupEvents, TypeOrArray } from '../../common-interfaces';
import BeeSoftTransition from '../../common/beesoft-transition/beesoft-transition.component';
import { DomElementAlignment, DomHandler, DomTargetPosition } from '../../dom-handler';
import { getTargetElement } from '../overlay-functions.ts';

interface OverlayPanelDimensions {
  left: number;
  top: number;
  width: number;
}

export interface OverlayPanelProps {
  visible: boolean;
  target?: React.MouseEvent<Element, MouseEvent> | HTMLElement | Element | null;
  targetPosition?: DomTargetPosition;
  elementAlignment?: DomElementAlignment;
  shouldTargetCloseOverlay?: boolean;
  shouldMatchTargetWidth?: boolean;
  shouldScrollCloseOverlay?: boolean;
  shouldCheckZIndex?: boolean;
  /**
   * When set to true this will cause the overlay panel to adjust itself, relative to its target, to remain on the
   * screen.
   */
  shouldRemainOnScreen?: boolean;
  unmountWhenHidden?: boolean;
  transitionDuration?: number;
  showTransitionOptions?: string;
  hideTransitionOptions?: string;
  shown?: () => void;
  hidden?: () => void;
  isClickedWithin?: () => void;
  children: TypeOrArray<ReactNode>;
}

const OverlayPanel = ({
  visible,
  target,
  targetPosition = DomTargetPosition.BottomLeft,
  elementAlignment = DomElementAlignment.TopLeft,
  shouldTargetCloseOverlay = true,
  shouldMatchTargetWidth = false,
  shouldScrollCloseOverlay = false,
  shouldCheckZIndex = false,
  shouldRemainOnScreen = false,
  unmountWhenHidden = false,
  transitionDuration = 400,
  showTransitionOptions = 'cubic-bezier(0, 0, 0.2, 1)',
  hideTransitionOptions = 'linear',
  shown,
  hidden,
  isClickedWithin,
  markupCreated,
  children,
}: OverlayPanelProps & MarkupEvents) => {
  const [zIndex, setZIndex] = useState(-1);
  const [visibility, setVisibility] = useState(visible);
  const [dimensionsChangedFlag, setDimensionsChangedFlag] = useState(false);

  const dimensionsChangedRef = useRef(false);
  const displayZIndex = useRef(100);
  const panelDimensions = useRef<OverlayPanelDimensions>({
    left: 0,
    top: 0,
    width: 0,
  });
  const finalTarget = useRef<HTMLElement>();
  const panelRef = useRef<HTMLElement>();
  const scrollerPanelRef = useRef<HTMLElement | Document>();
  const listenerRef = useRef<(event: MouseEvent) => void>();
  const scrollListenerRef = useRef<(event: Event) => void>();

  const resizeObserver = useRef<ResizeObserver>();

  useEffect(() => {
    if (shouldRemainOnScreen === true) {
      resizeObserver.current = new ResizeObserver(resizeCallback);
    }

    return () => {
      if (shouldRemainOnScreen === true) {
        if (panelRef.current) {
          resizeObserver.current?.unobserve(panelRef.current);
        }

        resizeObserver.current?.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (target) {
      finalTarget.current = getTargetElement(target);

      if (shouldScrollCloseOverlay) {
        scrollerPanelRef.current = getElementByCssStylesRecursive(finalTarget.current, {
          overflow: 'scroll, auto',
          overflowX: 'scroll, auto',
          overflowY: 'scroll, auto',
        });

        if ((scrollerPanelRef.current as HTMLElement).tagName.toLowerCase() === 'html') {
          scrollerPanelRef.current = document;
        }
      }
    }

    if (shouldCheckZIndex) {
      const parentZIndex = getAllElementStyleValues('zIndex', (styleValue) => {
        const elementZIndex = parseInt(styleValue);

        return elementZIndex >= 100;
      }).map((item) => parseInt(item));
      if (parentZIndex.length > 0) {
        displayZIndex.current = Math.max(...parentZIndex) + 1;
      }
    }

    if (visible !== undefined) {
      setVisibility(visible);
    }
  }, [target, visible, shouldScrollCloseOverlay, shouldCheckZIndex]);

  const resizeCallback = (entries: Array<ResizeObserverEntry>) => {
    if (panelRef.current) {
      const windowSize = DomHandler.getScreenDimensions();
      const overlayElement = entries[entries.length - 1].target as HTMLElement;
      const overlayRectangle = overlayElement.getBoundingClientRect();
      const offScreenLocation = DomHandler.determineOffScreenLocation(overlayRectangle);

      if (offScreenLocation) {
        if (
          finalTarget.current &&
          DomHandler.canPositionElementOnScreenWithTarget(overlayElement, finalTarget.current)
        ) {
          const newDimensions = DomHandler.positionElementToTargetOnScreen(
            panelRef.current,
            finalTarget.current,
            elementAlignment,
            targetPosition
          );

          panelDimensions.current = {
            ...panelDimensions.current,
            ...newDimensions,
          };
        } else {
          // this section simply keeps the overlay panel on the screen
          if (offScreenLocation.right) {
            panelDimensions.current.left = windowSize.width - overlayRectangle.width;
          } else if (offScreenLocation.left) {
            panelDimensions.current.left = 0;
          }

          if (offScreenLocation.bottom) {
            panelDimensions.current.top = windowSize.height - overlayRectangle.height;
          } else if (offScreenLocation.top) {
            panelDimensions.current.top = 0;
          }
        }

        onDimensionsChanged();
      }
    }
  };

  const onDimensionsChanged = debounce(() => {
    dimensionsChangedRef.current = !dimensionsChangedRef.current;
    setDimensionsChangedFlag(dimensionsChangedRef.current);
  }, 20);

  const onEntering = () => {
    setZIndex(displayZIndex.current);
  };

  const onEntered = () => {
    if (!panelRef.current) return;

    shown?.();

    let otherElements: Array<HTMLElement> | undefined = undefined;
    if (!shouldTargetCloseOverlay && finalTarget.current) {
      otherElements = [finalTarget.current];
    }

    const clickListener = (clickedWithin: boolean) => {
      if (clickedWithin) {
        isClickedWithin?.();
      } else {
        setVisibility(false);
      }
    };

    listenerRef.current = bindDocumentClickListener(panelRef.current, clickListener, otherElements);

    if (shouldScrollCloseOverlay) {
      scrollListenerRef.current = throttle(
        (event: Event) => panelRef.current && isEventOutsideTarget(event, panelRef.current) && setVisibility(false),
        100,
        { leading: true }
      );
      if (scrollerPanelRef.current) {
        scrollerPanelRef.current.addEventListener('scroll', scrollListenerRef.current);
      }
    }
  };

  const onExit = () => {
    if (scrollerPanelRef.current && scrollListenerRef.current) {
      scrollerPanelRef.current.removeEventListener('scroll', scrollListenerRef.current);
      scrollListenerRef.current = undefined;
    }

    if (listenerRef.current) {
      unbindDocumentClickListener(listenerRef.current);
    }
  };

  const onExited = () => {
    setZIndex(-1);

    hidden?.();
  };

  const onMarkupCreated = (element: HTMLElement) => {
    if (shouldRemainOnScreen === true && panelRef.current) {
      resizeObserver.current?.unobserve(panelRef.current);
    }

    panelRef.current = element;
    markupCreated?.(element);

    if (finalTarget.current) {
      const position = DomHandler.positionElementToTarget(
        panelRef.current,
        finalTarget.current,
        elementAlignment,
        targetPosition
      );

      panelDimensions.current = {
        ...position,
        width: finalTarget.current.offsetWidth,
      };

      if (
        shouldRemainOnScreen === true &&
        (DomHandler.canPositionElementOnScreenWithTarget(panelRef.current, finalTarget.current) ||
          DomHandler.canPositionElementOnScreen(panelRef.current))
      ) {
        resizeObserver.current?.observe(panelRef.current);
      }
    }
  };

  const baseStyles: CSSProperties = useMemo(() => {
    const styles: CSSProperties = {
      top: `${panelDimensions.current.top}px`,
      left: `${panelDimensions.current.left}px`,
      zIndex,
    };

    if (shouldMatchTargetWidth) {
      styles['width'] = `${panelDimensions.current.width}px`;
    }

    return styles;
  }, [dimensionsChangedFlag, zIndex, shouldMatchTargetWidth]);

  return (
    <BeeSoftTransition
      start={visibility}
      timeout={transitionDuration}
      showTransitionOptions={showTransitionOptions}
      hideTransitionOptions={hideTransitionOptions}
      onEntering={onEntering}
      onEntered={onEntered}
      onExit={onExit}
      onExited={onExited}
      unmountOnExit={unmountWhenHidden}
    >
      {({ state, defaultStyle, transitionStyles }) => (
        <div
          className="bsc-fixed bsc-border bsc-border-solid bsc-bg-white bsc-shadow dark:bsc-border-mono-light-1 dark:bsc-bg-mono-dark-1 dark:bsc-text-mono-light-1"
          style={{
            ...baseStyles,
            ...defaultStyle,
            ...transitionStyles[state],
          }}
          ref={(element) => element && onMarkupCreated(element as HTMLElement)}
        >
          {children}
        </div>
      )}
    </BeeSoftTransition>
  );
};

export default OverlayPanel;
