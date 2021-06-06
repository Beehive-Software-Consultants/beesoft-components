import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { generateNumberArray, padNumber } from '../../common-functions';
import TemplateOutlet, { TemplateFunction } from '../../common/template-outlet/template-outlet.component';
import { TimeConstraints } from './date-time-types';
import { DateTimeActionType, DateTimeReducerAction } from './date-time.reducer';

export interface DateTimeTimeSelectorProps {
  viewDate: Date;
  showDateSelector: boolean;
  locale: string;
  viewTemplate?: TimeSelectorTemplate;
  timeConstraints?: TimeConstraints;
  dispatcher: React.Dispatch<DateTimeReducerAction>;
}

export interface DateTimeTimeSelectorTemplateProps {
  viewDate: Date;
  showDateSelector: boolean;
  locale: string;
  timeConstraints?: TimeConstraints;
  currentHour: number;
  currentMinute: number;
  currentMeridian: number;
  dateString: string;
  increaseHour: () => void;
  decreaseHour: () => void;
  increaseMinute: () => void;
  decreaseMinute: () => void;
  changeMeridian: () => void;
  onDateClicked: () => void;
}

export type TimeSelectorTemplate = TemplateFunction<DateTimeTimeSelectorTemplateProps>;

export default function DateTimeTimeSelector({
  viewDate,
  showDateSelector,
  locale,
  viewTemplate,
  timeConstraints,
  dispatcher,
}: DateTimeTimeSelectorProps) {
  const hours = useRef<string[]>(['12', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']);
  const minutes = useRef<string[]>(generateNumberArray(0, 59, (value) => padNumber(value, 2, '0')));
  const ampm = useRef<string[]>(['AM', 'PM']);

  const getMeridianHour = (hour: number) => (hour > 11 ? hour - 12 : hour);

  const [currentHour, setCurrentHour] = useState(getMeridianHour(viewDate.getHours()));
  const [currentMinute, setCurrentMinute] = useState(viewDate.getMinutes());
  const [currentMeridian, setCurrentMeridian] = useState(viewDate.getHours() <= 12 ? 0 : 1);
  const dateString = useRef<string>(viewDate.toLocaleDateString(locale));

  const increaseHour = () => {
    const incrementAmount = timeConstraints?.hours?.step || 1;
    const nextHour = currentHour < 11 ? currentHour + incrementAmount : 0;
    setCurrentHour(nextHour);
    setCurrentTime(nextHour, currentMinute, currentMeridian);
  };

  const decreaseHour = () => {
    const decrementAmount = timeConstraints?.hours?.step || 1;
    const nextHour = currentHour > 0 ? currentHour - decrementAmount : 11;
    setCurrentHour(nextHour);
    setCurrentTime(nextHour, currentMinute, currentMeridian);
  };

  const increaseMinute = () => {
    const incrementAmount = timeConstraints?.minutes?.step || 1;
    const nextMinute =
      currentMinute + incrementAmount < (timeConstraints?.minutes?.max || 59)
        ? currentMinute + incrementAmount
        : timeConstraints?.minutes?.min || 0;
    setCurrentMinute(nextMinute);
    setCurrentTime(currentHour, nextMinute, currentMeridian);
  };

  const decreaseMinute = () => {
    const decrementAmount = timeConstraints?.minutes?.step || 1;
    const nextMinute =
      currentMinute - decrementAmount >= (timeConstraints?.minutes?.min || 0)
        ? currentMinute - decrementAmount
        : (timeConstraints?.minutes?.max || 60) - decrementAmount;
    setCurrentMinute(nextMinute);
    setCurrentTime(currentHour, nextMinute, currentMeridian);
  };

  const changeMeridian = () => {
    const nextMeridian = currentMeridian === 0 ? 1 : 0;
    setCurrentMeridian(nextMeridian);
    setCurrentTime(currentHour, currentMinute, nextMeridian);
  };

  const setCurrentTime = (hour: number, minute: number, meridian: number) => {
    const correctHour = meridian === 1 ? hour + 12 : hour;
    viewDate.setHours(correctHour, minute);

    dispatcher({
      type: DateTimeActionType.SetSelectedDate,
      selectedDate: viewDate,
    });
    dispatcher({
      type: DateTimeActionType.SetViewDate,
      viewDate: viewDate,
    });
  };

  const onDateClicked = () => {
    dispatcher({
      type: DateTimeActionType.DaySelector,
    });
  };

  const templateProps: DateTimeTimeSelectorTemplateProps = {
    viewDate,
    showDateSelector,
    locale,
    timeConstraints,
    currentHour,
    currentMinute,
    currentMeridian,
    dateString: dateString.current,
    increaseHour,
    decreaseHour,
    increaseMinute,
    decreaseMinute,
    changeMeridian,
    onDateClicked,
  };

  const defaultTemplate = (
    props: DateTimeTimeSelectorTemplateProps,
    children?: React.ReactNode | React.ReactNodeArray
  ) => (
    <div className="flex flex-row justify-center p-2" style={{ minWidth: '15rem' }}>
      {children}
    </div>
  );

  const template = viewTemplate || defaultTemplate;

  return (
    <TemplateOutlet props={templateProps} template={template}>
      <div className="w-full grid grid-cols-4 gap-4">
        {showDateSelector && (
          <div
            className="text-center cursor-pointer hover:bg-gray-300 dark:text-white dark:hover:bg-white dark:hover:text-black col-span-4"
            onClick={onDateClicked}
          >
            {dateString.current}
          </div>
        )}
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={increaseHour}>
            <FontAwesomeIcon icon={['fas', 'chevron-up']} />
          </button>
        </div>
        <div>&nbsp;</div>
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={increaseMinute}>
            <FontAwesomeIcon icon={['fas', 'chevron-up']} />
          </button>
        </div>
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={changeMeridian}>
            <FontAwesomeIcon icon={['fas', 'chevron-up']} />
          </button>
        </div>
        <div className="text-center">{hours.current[currentHour]}</div>
        <div className="text-center">:</div>
        <div className="text-center">{minutes.current[currentMinute]}</div>
        <div className="text-center">{ampm.current[currentMeridian]}</div>
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={decreaseHour}>
            <FontAwesomeIcon icon={['fas', 'chevron-down']} />
          </button>
        </div>
        <div>&nbsp;</div>
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={decreaseMinute}>
            <FontAwesomeIcon icon={['fas', 'chevron-down']} />
          </button>
        </div>
        <div className="text-center cursor-pointer">
          <button className="focus:outline-none" onClick={changeMeridian}>
            <FontAwesomeIcon icon={['fas', 'chevron-down']} />
          </button>
        </div>
      </div>
    </TemplateOutlet>
  );
}
