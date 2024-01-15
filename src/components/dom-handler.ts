import { WindowSize } from './common-interfaces';

export enum DomTargetPosition {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

export enum DomElementAlignment {
  TopLeft,
  TopRight,
  BottomLeft,
  BottomRight,
}

export interface DomOffScreenLocation {
  left: boolean;
  top: boolean;
  right: boolean;
  bottom: boolean;
}

export interface DomElementPosition {
  top: number;
  left: number;
}

export class DomHandler {
  public static positionToTarget(target: HTMLElement, position = DomTargetPosition.BottomLeft): DomElementPosition {
    const targetRectangle = target.getBoundingClientRect();
    let top = 0;
    let left = 0;
    const scrollTop = window.scrollY;

    switch (position) {
      case DomTargetPosition.BottomLeft:
        top = targetRectangle.top + targetRectangle.height + scrollTop;
        left = targetRectangle.left;
        break;
      case DomTargetPosition.TopLeft:
        top = targetRectangle.top + scrollTop;
        left = targetRectangle.left;
        break;
      case DomTargetPosition.BottomRight:
        top = targetRectangle.top + targetRectangle.height + scrollTop;
        left = targetRectangle.left + targetRectangle.width;
        break;
      case DomTargetPosition.TopRight:
        top = targetRectangle.top + scrollTop;
        left = targetRectangle.left + targetRectangle.width;
    }

    return {
      top,
      left,
    };
  }

  public static positionElementToTarget(
    element: HTMLElement,
    target: HTMLElement,
    elementAlignment = DomElementAlignment.TopLeft,
    targetPosition = DomTargetPosition.BottomLeft
  ): DomElementPosition {
    let { left, top } = DomHandler.positionToTarget(target, targetPosition);
    const elementRectangle = element.getBoundingClientRect();

    switch (elementAlignment) {
      case DomElementAlignment.TopLeft:
        // top left is the default
        break;
      case DomElementAlignment.TopRight:
        left = left - elementRectangle.width;
        break;
      case DomElementAlignment.BottomLeft:
        top = top - elementRectangle.height;
        break;
      case DomElementAlignment.BottomRight:
        top = top - elementRectangle.height;
        left = left - elementRectangle.width;
        break;
    }

    return {
      top,
      left,
    };
  }

  public static canPositionElementOnScreenWithTarget(element: HTMLElement, target: HTMLElement) {
    const screen = DomHandler.getScreenDimensions();
    const rectangle = element.getBoundingClientRect();

    const bottomLeft = DomHandler.positionElementToTarget(
      element,
      target,
      DomElementAlignment.TopLeft,
      DomTargetPosition.BottomLeft
    );
    if (bottomLeft.left + rectangle.width < screen.width && bottomLeft.top + rectangle.height < screen.height) {
      return true;
    }

    const bottomRight = DomHandler.positionElementToTarget(
      element,
      target,
      DomElementAlignment.TopRight,
      DomTargetPosition.BottomRight
    );
    if (bottomRight.left >= 0 && bottomLeft.top + rectangle.height < screen.height) {
      return true;
    }

    const topLeft = DomHandler.positionElementToTarget(
      element,
      target,
      DomElementAlignment.BottomLeft,
      DomTargetPosition.TopLeft
    );
    if (topLeft.left + rectangle.width < screen.width && topLeft.top >= 0) {
      return true;
    }

    const topRight = DomHandler.positionElementToTarget(
      element,
      target,
      DomElementAlignment.BottomRight,
      DomTargetPosition.TopRight
    );
    return topRight.left >= 0 && topRight.top >= 0;
  }

  public static canPositionElementOnScreen(element: HTMLElement) {
    const screen = DomHandler.getScreenDimensions();
    const rectangle = element.getBoundingClientRect();

    return rectangle.width <= screen.width && rectangle.height <= screen.height;
  }

  public static positionElementToTargetOnScreen(
    element: HTMLElement,
    target: HTMLElement,
    elementAlignment = DomElementAlignment.TopLeft,
    targetPosition = DomTargetPosition.BottomLeft
  ): DomElementPosition {
    const { left, top } = DomHandler.positionElementToTarget(element, target, elementAlignment, targetPosition);
    const elementRectangle = element.getBoundingClientRect();
    const location = DomHandler.determineOffScreenLocation(elementRectangle);

    if (location) {
      if (elementAlignment === DomElementAlignment.TopLeft && targetPosition === DomTargetPosition.BottomLeft) {
        // this is the default setting...the only places the overlay could be off-screen would be right and bottom
        if (location.right && !location.bottom) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.TopRight,
            DomTargetPosition.BottomRight
          );
        } else if (location.bottom && !location.right) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.BottomLeft,
            DomTargetPosition.TopLeft
          );
        } else if (location.right && location.bottom) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.BottomRight,
            DomTargetPosition.TopRight
          );
        }
      } else if (
        elementAlignment === DomElementAlignment.TopRight &&
        targetPosition === DomTargetPosition.BottomRight
      ) {
        if (location.left && !location.bottom) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.TopLeft,
            DomTargetPosition.BottomLeft
          );
        } else if (location.bottom && !location.left) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.BottomRight,
            DomTargetPosition.TopRight
          );
        } else if (location.left && location.bottom) {
          return DomHandler.positionElementToTarget(
            element,
            target,
            DomElementAlignment.BottomLeft,
            DomTargetPosition.TopLeft
          );
        }
      }
    }

    return {
      top,
      left,
    };
  }

  public static determineOffScreenLocation(rectangle: DOMRect) {
    const windowSize = DomHandler.getScreenDimensions();
    const location: DomOffScreenLocation = {
      left: rectangle.left < 0,
      top: rectangle.top < 0,
      right: rectangle.left + rectangle.width > windowSize.width,
      bottom: rectangle.top + rectangle.height > windowSize.height,
    };

    return location.left || location.top || location.right || location.bottom ? location : undefined;
  }

  public static getScreenDimensions(): WindowSize {
    return {
      width: window.innerWidth,
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    };
  }
}
