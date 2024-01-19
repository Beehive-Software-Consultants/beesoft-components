import cx from 'classnames';
import { ChangeEvent, forwardRef, Ref, useEffect, useId, useImperativeHandle, useState } from 'react';
import { useBeeSoftContext } from '../../../../common/hooks/use-beesoft-context.ts';
import { useStateRef } from '../../../../common/hooks/use-state-ref.ts';
import { Label } from '../../../common/label/label.component.tsx';
import { CheckboxCheckState, CheckboxLabelLocation, CheckboxProps, CheckboxRef } from './checkbox.props.ts';

const CheckboxComponent = (props: CheckboxProps, ref: Ref<CheckboxRef>) => {
  const {
    name,
    label,
    value,
    readOnly = false,
    checked = false,
    partial = false,
    labelLocation = CheckboxLabelLocation.Right,
    className,
    onChange,
  } = props;

  const [useAnimation, setUseAnimation] = useState(true);

  const [checkedState, setCheckedState, checkedStateRef] = useStateRef<CheckboxCheckState>({
    checked: false,
    partial: false,
  });

  const id = useId();
  const beeSoftContext = useBeeSoftContext();

  useEffect(() => {
    if (beeSoftContext && beeSoftContext.useAnimations !== undefined) {
      setUseAnimation(beeSoftContext.useAnimations);
    }
  }, [beeSoftContext]);

  useEffect(() => {
    setCheckedState({
      checked,
      partial: false,
    });
  }, [checked]);

  useEffect(() => {
    setCheckedState({
      checked: partial ? true : checkedState.checked,
      partial,
    });
  }, [partial]);

  const handleChangeEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const checkedValue = checkedStateRef.current?.partial === true ? true : event.target.checked;
    setCheckedState({
      checked: checkedValue,
      partial: false,
    });

    onChange?.({
      originalEvent: event,
      value,
      checked: checkedValue,
      partial: false,
    });
  };

  const setPartiallyChecked = (partiallyChecked: boolean) => {
    const state: CheckboxCheckState = {
      checked: partiallyChecked ? true : checkedStateRef.current?.checked || false,
      partial: partiallyChecked,
    };

    setCheckedState(state);

    onChange?.({
      ...state,
      value,
    });
  };

  useImperativeHandle(ref, () => ({
    setPartiallyChecked,
  }));

  const wrapperStyles = cx(
    'bc-checkbox-wrapper bsc-flex bsc-items-center',
    {
      'bsc-pointer-events-none bsc-text-gray-2 dark:bsc-text-mono-light-3': readOnly,
    },
    className
  );

  const labelStyles = cx('bc-checkbox-label bsc-cursor-pointer', {
    'bsc-ml-2': labelLocation === CheckboxLabelLocation.Right,
    'bsc-mr-2': labelLocation === CheckboxLabelLocation.Left,
  });

  const checkboxStyles = cx(
    'bc-checkbox-outer bsc-relative bsc-rounded *:bsc-block *:bsc-size-[21px] focus-within:bsc-ring focus-within:bsc-ring-offset-2 dark:bsc-ring-mono-light-1 dark:bsc-ring-offset-mono-dark-1',
    {
      'bsc-checkbox-animate': !readOnly && useAnimation,
      'bsc-checkbox-no-animate': readOnly || (!readOnly && !useAnimation),
    }
  );

  const innerCheckboxStyles = cx(
    'bc-checkbox bsc-relative bsc-m-0 bsc-cursor-pointer bsc-appearance-none bsc-rounded bsc-border-none bsc-bg-mono-light-1 bsc-p-0 bsc-outline-none dark:bsc-bg-mono-dark-1 dark:checked:bsc-bg-mono-light-1',
    {
      '[transition:box-shadow_0.3s]': useAnimation,
      'bsc-checkbox-border dark:bsc-checkbox-border-dark bsc-checkbox-border-hover dark:bsc-checkbox-border-hover-dark bsc-checkbox-border-checked dark:bsc-checkbox-border-checked-dark':
        !readOnly,
      'bsc-checkbox-border-read-only dark:bsc-checkbox-border-dark-read-only bsc-checkbox-border-checked-read-only dark:bsc-checkbox-border-checked-dark-read-only':
        readOnly,
    }
  );

  const svgStyles = cx(
    'bc-checkbox-svg bsc-pointer-events-none bsc-absolute bsc-left-0 bsc-top-0 bsc-stroke-mono-light-1 bsc-stroke-2 [stroke-linecap:round] [stroke-linejoin:round] [transform:scale(0)_translateZ(0)] dark:bsc-stroke-mono-dark-3',
    {
      'bsc-fill-primary-1 dark:bsc-fill-mono-light-1': !readOnly,
      'bsc-fill-primary-4 dark:bsc-fill-mono-light-3': readOnly,
    }
  );

  return (
    <div className={wrapperStyles}>
      {label && labelLocation === CheckboxLabelLocation.Left && (
        <Label label={label} htmlFor={id} readOnly={readOnly} className={labelStyles} />
      )}
      <label className={checkboxStyles}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checkedState.checked}
          onChange={handleChangeEvent}
          className={innerCheckboxStyles}
        />
        <svg viewBox="0 0 21 21" className={svgStyles}>
          {!checkedState.partial ? <polyline points="5 10.75 8.5 14.25 16 6" /> : <polyline points="6 10.5 16 10.5" />}
        </svg>
      </label>
      {label && labelLocation === CheckboxLabelLocation.Right && (
        <Label label={label} htmlFor={id} readOnly={readOnly} className={labelStyles} />
      )}
    </div>
  );
};

const Checkbox = forwardRef(CheckboxComponent);
export { Checkbox };