import React from 'react';

export interface ContentEditableInputProps {
  value?: string;
  leftElement?: JSX.Element;
  rightElement?: JSX.Element;
  className?: string;
  leftElementClassName?: string;
  rightElementClassName?: string;
  onFocus?: (event: React.FocusEvent) => void;
  onInput?: (event: React.FormEvent) => void;
  onLeftElementClick?: (event: React.MouseEvent) => void;
  onRightElementClick?: (event: React.MouseEvent) => void;
}

export default function ContentEditableInput({
  value,
  leftElement,
  rightElement,
  className,
  leftElementClassName,
  rightElementClassName,
  onFocus,
  onInput,
  onLeftElementClick,
  onRightElementClick
}: ContentEditableInputProps) {
  const onLeftElementClicked = (event: React.MouseEvent) => {
    if (onLeftElementClick) {
      onLeftElementClick(event);
    }
  };

  const onRightElementClicked = (event: React.MouseEvent) => {
    if (onRightElementClick) {
      onRightElementClick(event);
    }
  };

  const onFocused = (event: React.FocusEvent) => {
    if (onFocus) {
      onFocus(event);
    }
  };

  const onInputed = (event: React.FormEvent) => {
    if (onInput) {
      onInput(event);
    }
  };

  return (
    <div className={`w-full flex flex-row shadow-sm border border-solid border-gray-300 rounded-md p-2 ${className}`}>
      <div className={`flex-shrink ${leftElementClassName}`} onClick={onLeftElementClicked}>{leftElement}</div>
      <div className="flex-grow focus:outline-none"
           contentEditable={true}
           suppressContentEditableWarning={true}
           onFocus={onFocused}
           onInput={onInputed}>
        {value}
      </div>
      <div className={`flex-shrink ${rightElementClassName}`} onClick={onRightElementClicked}>{rightElement}</div>
    </div>
  );
}
