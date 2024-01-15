import cx from 'classnames';
import { forwardRef, Ref, useImperativeHandle, useRef } from 'react';
import { ButtonProps, ButtonRef } from './button.props.ts';

const ButtonComponent = (props: ButtonProps, ref: Ref<ButtonRef>) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    buttonType,
    type = 'button',
    disabled = false,
    form,
    fullWidth = false,
    onClick,
    className,
    children,
  } = props;

  const handleOnClick = () => {
    onClick?.();
  };

  const click = () => {
    buttonRef.current?.click();
  };

  useImperativeHandle(ref, () => ({
    click,
  }));

  const buttonStyles = cx(
    'max-sm:bsc-p-4 md:bsc-p-2 dark:bsc-bg-mono-light-1 dark:hover:bsc-bg-mono-light-2 dark:bsc-text-mono-dark-1',
    {
      'bsc-w-full': fullWidth,
      'bsc-bg-gray-3 bsc-text-gray-2': disabled,
      'bsc-bg-primary-1 bsc-text-white hover:bsc-bg-primary-2': buttonType === 'primary',
      'bsc-bg-primary-2 bsc-text-white hover:bsc-bg-primary-3': buttonType === 'secondary',
      'bsc-bg-info bsc-text-white': buttonType === 'info',
      'bsc-bg-success bsc-text-white': buttonType === 'success',
      'bsc-bg-warning bsc-text-white': buttonType === 'warning',
      'bsc-bg-error bsc-text-white': buttonType === 'error',
    },
    className
  );

  return (
    <button
      ref={buttonRef}
      type={type}
      onClick={handleOnClick}
      disabled={disabled}
      form={form}
      className={buttonStyles}
    >
      {children}
    </button>
  );
};

const Button = forwardRef(ButtonComponent);

export { Button };
