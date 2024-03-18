import cx from 'classnames';
import { ChangeEvent } from 'react';
import { useShouldAnimate } from '../../../../common/hooks/use-animation.ts';
import { Label } from '../../../common/label/label.component.tsx';
import { SelectionLabelLocation } from '../../form-generic.interfaces.ts';
import { RadioItemProps } from './radio-item.props.ts';

const RadioItem = ({
  id,
  name,
  label,
  value,
  checked = false,
  labelLocation = SelectionLabelLocation.Right,
  readOnly = false,
  useAnimation,
  onChange,
}: RadioItemProps) => {
  const useAnimationState = useShouldAnimate(useAnimation);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
  };

  const wrapperStyles = cx('bc-radio-item-wrapper bsc-flex bsc-items-center', {
    'bc-read-only': readOnly,
  });
  const radioStyles = cx('bc-radio-outer bsc-relative *:bsc-size-[21px]');

  return (
    <div className={wrapperStyles}>
      {labelLocation === SelectionLabelLocation.Left && <Label label={label} htmlFor={id} readOnly={readOnly} />}
      <label className={radioStyles}>
        <input
          id={id}
          name={name}
          value={value}
          type="radio"
          checked={checked}
          onChange={handleOnChange}
          className="bc-radio-inner bsc-hidden"
        />
        <svg width={21} height={21} viewBox="0 0 30 30" preserveAspectRatio="xMidYMid meet">
          <circle cx={15} cy={15} r={13} fill="none" stroke="#000" strokeWidth={1} />
        </svg>
      </label>
      {labelLocation === SelectionLabelLocation.Right && <Label label={label} htmlFor={id} readOnly={readOnly} />}
    </div>
  );
};

export { RadioItem };
