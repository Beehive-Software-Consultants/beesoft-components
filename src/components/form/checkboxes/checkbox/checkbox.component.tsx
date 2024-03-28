import { usePropertyChanged, useStateRefInitial } from '@beesoft/common';
import cx from 'classnames';
import { ChangeEvent, forwardRef, Ref, useEffect, useId, useImperativeHandle } from 'react';
import { FocusRingStyle, useFocusRingStyle } from '../../../../common/hooks/style/use-focus-ring-style.ts';
import { useShouldAnimate } from '../../../../common/hooks/use-animation.ts';
import { Label } from '../../../common/label/label.component.tsx';
import { SelectionLabelLocation } from '../../form-generic.interfaces.ts';
import { CheckboxCheckState, CheckboxProps, CheckboxRef } from './checkbox.props.ts';

const CheckboxComponent = (props: CheckboxProps, ref: Ref<CheckboxRef>) => {
  const {
    name,
    label,
    value,
    readOnly = false,
    checked = false,
    partial = false,
    labelLocation = SelectionLabelLocation.Right,
    className,
    useAnimation,
    onChange,
  } = props;

  const [checkedState, setCheckedState, checkedStateRef] = useStateRefInitial<CheckboxCheckState>({
    checked: false,
    partial: false,
  });

  const checkedProperty = usePropertyChanged(checked);
  const partialProperty = usePropertyChanged(partial);

  const id = useId();
  const useAnimationState = useShouldAnimate(useAnimation);

  useEffect(() => {
    if (checkedState.initial) {
      setCheckedState({
        checked: partial ? true : checked,
        partial,
      });
    } else {
      const newChecked = !checkedProperty.changed ? checkedState.value.checked : checked;
      const newPartial = !partialProperty.changed ? checkedState.value.partial : partial;

      setCheckedState({
        checked: newPartial ? true : newChecked,
        partial: newPartial,
      });
    }
  }, [checked, partial]);

  const handleChangeEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const checkedValue = checkedStateRef.current?.value.partial === true ? true : event.target.checked;
    setCheckedState({
      checked: checkedValue,
      partial: false,
    });

    onChange?.({
      originalEvent: event,
      name: name || event.target.name,
      value,
      checked: checkedValue,
    });
  };

  const setPartiallyChecked = (partiallyChecked: boolean) => {
    const state: CheckboxCheckState = {
      checked: partiallyChecked ? true : checkedStateRef.current?.value.checked || false,
      partial: partiallyChecked,
    };

    setCheckedState(state);
  };

  const setChecked = (checked: boolean) => {
    setCheckedState({
      checked,
      partial: false,
    });
  };

  useImperativeHandle(ref, () => ({
    setPartiallyChecked,
    setChecked,
  }));

  const wrapperStyles = cx(
    'bc-checkbox-wrapper bsc-flex bsc-items-center',
    {
      'bc-read-only bsc-pointer-events-none bsc-text-gray-2 dark:bsc-text-mono-light-3': readOnly,
    },
    className
  );

  const labelStyles = cx('bc-checkbox-label bsc-cursor-pointer', {
    'bsc-ml-2': labelLocation === SelectionLabelLocation.Right,
    'bsc-mr-2': labelLocation === SelectionLabelLocation.Left,
  });

  const focusStyles = useFocusRingStyle(FocusRingStyle.FocusWithin);
  const checkboxStyles = cx(
    'bc-checkbox-outer bsc-relative bsc-rounded *:bsc-block *:bsc-size-[21px]',
    {
      'bsc-checkbox-animate': !readOnly && useAnimationState,
      'bc-read-only bsc-checkbox-no-animate': readOnly || (!readOnly && !useAnimationState),
    },
    focusStyles
  );

  const innerCheckboxStyles = cx(
    'bc-checkbox-inner bsc-relative bsc-m-0 bsc-cursor-pointer bsc-appearance-none bsc-rounded bsc-border-none bsc-bg-mono-light-1 bsc-p-0 bsc-outline-none dark:bsc-bg-mono-dark-1 dark:checked:bsc-bg-mono-light-1',
    {
      '[transition:box-shadow_0.3s]': useAnimationState,
      'bsc-checkbox': !readOnly,
      'bc-read-only bsc-checkbox-read-only': readOnly,
    }
  );

  const svgStyles = cx(
    'bc-checkbox-svg bsc-pointer-events-none bsc-absolute bsc-left-0 bsc-top-0 bsc-stroke-mono-light-1 bsc-stroke-2 [stroke-linecap:round] [stroke-linejoin:round] [transform:scale(0)_translateZ(0)] dark:bsc-stroke-mono-dark-3',
    {
      'bsc-fill-primary-1 dark:bsc-fill-mono-light-1': !readOnly,
      'bc-read-only bsc-fill-primary-4 dark:bsc-fill-mono-light-3': readOnly,
    }
  );

  return (
    <div className={wrapperStyles}>
      {label && labelLocation === SelectionLabelLocation.Left && (
        <Label label={label} htmlFor={id} readOnly={readOnly} className={labelStyles} />
      )}
      <label className={checkboxStyles}>
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checkedState.value.checked}
          onChange={handleChangeEvent}
          className={innerCheckboxStyles}
        />
        <svg viewBox="0 0 21 21" className={svgStyles}>
          {!checkedState.value.partial ? (
            <polyline points="5 10.75 8.5 14.25 16 6" />
          ) : (
            <polyline points="6 10.5 16 10.5" />
          )}
        </svg>
      </label>
      {label && labelLocation === SelectionLabelLocation.Right && (
        <Label label={label} htmlFor={id} readOnly={readOnly} className={labelStyles} />
      )}
    </div>
  );
};

const Checkbox = forwardRef(CheckboxComponent);
export { Checkbox };
