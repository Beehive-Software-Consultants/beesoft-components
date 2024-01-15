import cx from 'classnames';
import { addMonths, endOfMonth, startOfMonth } from 'date-fns';
import { debounce } from 'lodash-es';
import React, { ReactNode, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { getBrowserLanguage } from '../../common-functions';
import { TypeOrArray } from '../../common-interfaces.ts';
import TemplateOutlet, { TemplateFunction } from '../../common/template-outlet/template-outlet.component';
import { Calendar2LineIcon, CloseLineIcon } from '../../icons.ts';
import { MediaQuery } from '../../mobile/media-query/media-query.component.tsx';
import { MobileOverlayPanel } from '../../mobile/overlay/mobile-overlay-panel.component.tsx';
import OverlayPanel from '../../overlay/overlay-panel/overlay-panel.component';
import { FormInputControl } from '../form-control.interface';
import ContentEditableInput from '../inputs/content-editable-input/content-editable-input.component';
import FormattedInput from '../inputs/formatted-input/formatted-input.component';
import { DateTimeCalendarTemplate } from './date-time-calendar.component';
import { DateTimeContext, DateTimeContextProps } from './date-time-context';
import DateTimeDaySelector from './date-time-day-selector.component';
import { isDateBetween, loadLocale, parseDate, parseDateRange } from './date-time-functions';
import DateTimeMonthSelector from './date-time-month-selector.component';
import DateTimeRangeSelector from './date-time-range-selector.component';
import { DateTimeScrollerTemplate } from './date-time-scroller.component';
import DateTimeTimeSelector from './date-time-time-selector.component';
import {
  CalendarIconPosition,
  DateFormatType,
  DateSelectionType,
  TimeConstraints,
  TimeFormatType,
} from './date-time-types';
import DateTimeYearSelector from './date-time-year-selector.component';
import reducer, { DateTimeActionType, DateTimeState } from './date-time.reducer';
import useGetDateTimeFormat from './hooks/get-date-time-format.hook';

export interface DateTimeProps extends FormInputControl<string | TypeOrArray<Date>, TypeOrArray<Date>> {
  useDefaultDateValue?: boolean;
  useFormattedInput?: boolean;
  allowClear?: boolean;
  locale?: string;
  dateSelection?: DateSelectionType;
  dateFormat?: DateFormatType;
  timeConstraints?: TimeConstraints;
  icon?: React.JSX.Element;
  iconPosition?: CalendarIconPosition;
  inputElement?: HTMLElement;
  /**
   * If the passed function returns false then that date will not be selectable and will be marked with the error style.
   * @param {Date} currentDate - The date to test.
   * @returns {boolean} false indicates the date should not be selectable.
   */
  selectableDate?: (currentDate: Date) => boolean;
  /**
   * If the passed function returns false then the date will not be selected in the input.
   * @param {Date} selectedDate - The selected date to test.
   * @returns {boolean} false indicates the date is not valid.
   */
  isValidDate?: (selectedDate: Date) => boolean;
  calendarTemplate?: DateTimeCalendarTemplate;
  dateScrollerTemplate?: DateTimeScrollerTemplate;
  inputTemplate?: DateTimeInputTemplate;
}

export interface DateTimeInputTemplateProps {
  label?: string;
  readOnly: boolean;
  allowClear: boolean;
  getValue: () => string;
  onFocus: (event: FocusEvent) => void;
  onInput: (event: React.FormEvent) => void;
  iconPosition: CalendarIconPosition;
  iconElement?: React.JSX.Element;
}

export type DateTimeInputTemplate = TemplateFunction<DateTimeInputTemplateProps>;

const DateTime = ({
  value,
  readOnly = false,
  label,
  useDefaultDateValue = false,
  useFormattedInput = false,
  allowClear = false,
  locale,
  className,
  dateSelection = DateSelectionType.DateTime,
  dateFormat,
  timeConstraints,
  icon,
  iconPosition = CalendarIconPosition.Right,
  inputElement,
  selectableDate,
  isValidDate,
  onChange,
  calendarTemplate,
  dateScrollerTemplate,
  inputTemplate,
}: DateTimeProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [localeCode, setLocaleCode] = useState<string>();
  const [dropDownTarget, setDropDownTarget] = useState<Element>();

  const isFormattedInput = useRef<boolean>();
  const inputElementChanged = useRef(false);
  const language = useRef<string>(locale || getBrowserLanguage());
  const loadedLocale = useRef<Locale>();
  const inputElementRef = useRef<HTMLElement>();
  const dropDownTargetRef = useRef<HTMLElement>();

  const [inputFormat, use24HourTime] = useGetDateTimeFormat(dateSelection, localeCode);

  const contextProps = useRef<DateTimeContextProps>({
    calendarTemplate,
    dateScrollerTemplate,
  });

  useEffect(() => {
    if (language.current) {
      loadLocaleObject(language.current);
    }
  }, [language]);

  useEffect(() => {
    if (locale) {
      loadLocaleObject(locale);
    }
  }, [locale]);

  useEffect(() => {
    if (value) {
      const dateValue = getDateValue();

      dispatcher({
        type: DateTimeActionType.InitializeDates,
        initialDate: dateValue,
      });
    } else {
      dispatcher({
        type: DateTimeActionType.ClearDates,
      });
    }
  }, [value, loadedLocale.current]);

  useEffect(() => {
    if (use24HourTime) {
      dispatcher({
        type: DateTimeActionType.SetTimeFormat,
        timeFormat: use24HourTime ? TimeFormatType.TwentyFourHour : TimeFormatType.TwelveHour,
      });
    }
  }, [use24HourTime]);

  useEffect(() => {
    if (inputElement) {
      inputElementRef.current = inputElement;
    }
  }, [inputElement]);

  const loadLocaleObject = (localeToLoad: string) => {
    loadLocale(localeToLoad)
      .then((locale) => {
        setLocaleCode(locale.code);
        loadedLocale.current = locale;
        const defaultDate = getDateValue();

        if (value || useDefaultDateValue) {
          dispatcher({
            type: DateTimeActionType.InitializeDates,
            initialDate: !Array.isArray(defaultDate) ? defaultDate : defaultDate[0],
          });
        } else {
          dispatcher({
            type: DateTimeActionType.SetViewDate,
            viewDate: !Array.isArray(defaultDate) ? defaultDate : defaultDate[0],
          });
        }
      })
      .catch((error) => console.error(error));
  };

  const getDateValue = () => {
    const defaultDate = new Date();
    defaultDate.setHours(0, 0, 0, 0);

    return value
      ? typeof value === 'string'
        ? dateSelection !== DateSelectionType.DateRange
          ? parseDate(value, loadedLocale.current)
          : parseDateRange(value, loadedLocale.current)
        : value
      : defaultDate;
  };

  const initialState: DateTimeState = {
    currentSelector:
      dateSelection === DateSelectionType.TimeOnly
        ? DateTimeActionType.TimeSelector
        : dateSelection === DateSelectionType.DateTime || dateSelection === DateSelectionType.DateOnly
        ? DateTimeActionType.DaySelector
        : DateTimeActionType.DateRangeSelector,
    currentViewDate: new Date(),
    timeFormat: TimeFormatType.TwelveHour,
    dateInitialized: false,
  };

  const [state, dispatcher] = useReducer(reducer, initialState);

  const onFocus = () => {
    setDropDownElement();
    setSelectorOpen(true);
  };

  const onBlur = useMemo(
    () =>
      debounce(() => {
        setSelectorOpen(false);
      }, 250),
    []
  );

  const onCalendarClick = useMemo(
    () =>
      debounce(() => {
        onBlur.cancel();
      }, 5),
    [onBlur]
  );

  const onInput = (event: React.FormEvent) => {
    const dateString = (event.target as HTMLElement).innerText;
    onDateStringChange(dateString);
  };

  const isValidFormatString = (value?: string) => {
    if (value) {
      const dateValue = parseDate(value, loadedLocale.current);
      if (dateValue) {
        if (isValidDate) {
          return isValidDate(dateValue);
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  const onFormatStringChange = (formattedText?: string) => {
    onDateStringChange(formattedText || '');
  };

  const onDateStringChange = (dateString: string) => {
    const inputDate =
      dateSelection !== DateSelectionType.DateRange
        ? parseDate(dateString, loadedLocale.current)
        : parseDateRange(dateString, loadedLocale.current);

    if (inputDate) {
      if (!Array.isArray(inputDate)) {
        dispatcher({
          type: DateTimeActionType.SetSelectedDate,
          selectedDate: inputDate,
          viewDate: inputDate,
        });
      } else {
        if (
          !isDateBetween(
            inputDate[0],
            startOfMonth(state.currentViewDate),
            endOfMonth(addMonths(state.currentViewDate, 1))
          )
        ) {
          dispatcher({
            type: DateTimeActionType.SetViewDate,
            viewDate: inputDate[0],
          });
        }

        dispatcher({
          type: DateTimeActionType.SetSelectedDateRange,
          selectedStartDate: inputDate[0],
          selectedEndDate: inputDate[1],
        });
      }

      onChange?.(inputDate);
    } else if (dateString === '') {
      dispatcher({
        type: DateTimeActionType.ClearDates,
      });

      onChange?.();
    }
  };

  const onCalendarIconClick = () => {
    setDropDownElement();
    setSelectorOpen(!selectorOpen);
  };

  const onClearClick = () => {
    dispatcher({
      type: DateTimeActionType.ClearDates,
    });
    setSelectorOpen(false);

    onChange?.();
  };

  const onInputElementCreated = (element: HTMLElement, formattedInput: boolean) => {
    if (!inputElementRef.current || isFormattedInput.current !== formattedInput) {
      inputElementRef.current = element;
      isFormattedInput.current = formattedInput;
      inputElementChanged.current = true;
    }
  };

  const setDropDownElement = () => {
    if ((!dropDownTargetRef.current || inputElementChanged.current) && inputElementRef.current) {
      dropDownTargetRef.current = inputElementRef.current;
      setDropDownTarget(inputElementRef.current);
      inputElementChanged.current = false;
    }
  };

  const onDateTimeHidden = () => {
    setSelectorOpen(false);
    dispatcher({
      type:
        dateSelection === DateSelectionType.TimeOnly
          ? DateTimeActionType.TimeSelector
          : dateSelection === DateSelectionType.DateTime || dateSelection === DateSelectionType.DateOnly
          ? DateTimeActionType.DaySelector
          : DateTimeActionType.DateRangeSelector,
    });
  };

  const getDateTimeStyle = () => {
    switch (dateFormat) {
      case DateFormatType.Short:
        return 'short';
      case DateFormatType.Medium:
        return 'medium';
      case DateFormatType.Long:
        return 'long';
      default:
        return undefined;
    }
  };

  const getValue = (): string => {
    const dateStyle = getDateTimeStyle();

    switch (dateSelection) {
      case DateSelectionType.DateTime:
        return state.selectedDate
          ? dateStyle
            ? state.selectedDate.toLocaleString(loadedLocale.current?.code, {
                dateStyle,
                timeStyle: dateStyle,
              })
            : state.selectedDate.toLocaleString(loadedLocale.current?.code)
          : '';
      case DateSelectionType.DateOnly:
        return state.selectedDate
          ? dateStyle
            ? state.selectedDate.toLocaleDateString(loadedLocale.current?.code, {
                dateStyle,
              })
            : state.selectedDate.toLocaleDateString(loadedLocale.current?.code)
          : '';
      case DateSelectionType.TimeOnly:
        return state.selectedDate
          ? dateStyle
            ? state.selectedDate.toLocaleTimeString(loadedLocale.current?.code, {
                timeStyle: dateStyle,
                hour12: state.timeFormat === TimeFormatType.TwelveHour,
                hourCycle: state.timeFormat === TimeFormatType.TwentyFourHour ? 'h23' : undefined,
              })
            : state.selectedDate.toLocaleTimeString(loadedLocale.current?.code, {
                hour12: state.timeFormat === TimeFormatType.TwelveHour,
                hourCycle: state.timeFormat === TimeFormatType.TwentyFourHour ? 'h23' : undefined,
              })
          : '';
      case DateSelectionType.DateRange:
        return state.selectedStartDate && state.selectedEndDate
          ? dateStyle
            ? `${state.selectedStartDate.toLocaleDateString(loadedLocale.current?.code, {
                dateStyle,
              })} - ${state.selectedEndDate.toLocaleDateString(loadedLocale.current?.code, { dateStyle })}`
            : `${state.selectedStartDate.toLocaleDateString(
                loadedLocale.current?.code
              )} - ${state.selectedEndDate.toLocaleDateString(loadedLocale.current?.code)}`
          : '';
      default:
        return state.selectedDate
          ? dateStyle
            ? state.selectedDate.toLocaleString(loadedLocale.current?.code, {
                dateStyle,
                timeStyle: dateStyle,
              })
            : state.selectedDate.toLocaleString(loadedLocale.current?.code)
          : '';
    }
  };

  const canShowDateSelectors =
    dateSelection === DateSelectionType.DateTime ||
    dateSelection === DateSelectionType.DateOnly ||
    dateSelection === DateSelectionType.DateRange;

  const canShowTimeSelector =
    dateSelection === DateSelectionType.DateTime || dateSelection === DateSelectionType.TimeOnly;

  const inputProps =
    iconPosition === CalendarIconPosition.None
      ? {}
      : iconPosition === CalendarIconPosition.Right
      ? {
          rightElement: (
            <div className="bsc-flex bsc-text-black dark:bsc-text-mono-light-1">
              {allowClear && !readOnly && (
                <div>
                  <CloseLineIcon size={16} className="bsc-cursor-pointer bsc-text-sm" onClick={onClearClick} />
                </div>
              )}
              <div className="bsc-ml-2">
                {icon || (
                  <Calendar2LineIcon
                    size={16}
                    className={!readOnly ? 'bsc-cursor-pointer' : undefined}
                    onClick={!readOnly ? onCalendarIconClick : undefined}
                  />
                )}
              </div>
            </div>
          ),
          rightElementClassName: 'bsc-justify-center',
        }
      : {
          leftElement: (
            <div className="bsc-flex bsc-text-black dark:bsc-text-mono-light-1">
              <div className="bsc-mr-2">
                {icon || (
                  <Calendar2LineIcon
                    size={16}
                    className={!readOnly ? 'bsc-cursor-pointer' : undefined}
                    onClick={!readOnly ? onCalendarIconClick : undefined}
                  />
                )}
              </div>
              {allowClear && !readOnly && (
                <div>
                  <CloseLineIcon size={16} className="bsc-cursor-pointer bsc-text-sm" onClick={onClearClick} />
                </div>
              )}
            </div>
          ),
          leftElementClassName: 'bsc-justify-center',
        };

  const renderSelector = () => (
    <>
      {state.currentSelector === DateTimeActionType.DaySelector &&
        canShowDateSelectors &&
        state.dateInitialized &&
        loadedLocale.current && (
          <DateTimeDaySelector
            selectedDate={state.selectedDate}
            viewDate={state.currentViewDate}
            locale={loadedLocale.current}
            showTimeSelector={dateSelection === DateSelectionType.DateTime}
            selectableDate={selectableDate}
            isValidDate={isValidDate}
            dispatcher={dispatcher}
            onChange={onChange}
          />
        )}
      {state.currentSelector === DateTimeActionType.MonthSelector &&
        canShowDateSelectors &&
        state.dateInitialized &&
        loadedLocale.current && (
          <DateTimeMonthSelector
            viewDate={state.currentViewDate}
            locale={loadedLocale.current}
            dateSelection={dateSelection}
            dispatcher={dispatcher}
          />
        )}
      {state.currentSelector === DateTimeActionType.YearSelector &&
        canShowDateSelectors &&
        state.dateInitialized &&
        loadedLocale.current && (
          <DateTimeYearSelector
            viewDate={state.currentViewDate}
            locale={loadedLocale.current}
            dispatcher={dispatcher}
          />
        )}
      {state.currentSelector === DateTimeActionType.TimeSelector &&
        canShowTimeSelector &&
        state.dateInitialized &&
        loadedLocale.current && (
          <DateTimeTimeSelector
            viewDate={state.currentViewDate}
            showDateSelector={dateSelection === DateSelectionType.DateTime}
            locale={loadedLocale.current}
            timeFormat={state.timeFormat}
            timeConstraints={timeConstraints}
            onChange={onChange}
            dispatcher={dispatcher}
          />
        )}
      {state.currentSelector === DateTimeActionType.DateRangeSelector &&
        canShowDateSelectors &&
        state.dateInitialized &&
        loadedLocale.current && (
          <DateTimeRangeSelector
            viewDate={state.currentViewDate}
            selectedStartDate={state.selectedStartDate}
            selectedEndDate={state.selectedEndDate}
            locale={loadedLocale.current}
            onChange={onChange}
            dispatcher={dispatcher}
          />
        )}
    </>
  );

  const inputTemplateProps: DateTimeInputTemplateProps = {
    label,
    readOnly,
    allowClear,
    getValue,
    onFocus,
    onInput,
    iconPosition,
    iconElement: inputProps.rightElement || inputProps.leftElement,
  };

  const defaultTemplate = (_props: DateTimeInputTemplateProps, children: ReactNode | Array<ReactNode>) => (
    <>{children}</>
  );

  const template = inputTemplate || defaultTemplate;

  const inputStyles = cx(
    'bsc-text-left',
    {
      'bsc-bg-gray-2': readOnly,
      'bsc-bg-white': !readOnly,
    },
    `dark:bsc-bg-mono-dark-1 bc-dt-input`,
    className
  );

  return (
    <DateTimeContext.Provider value={contextProps.current}>
      <div className="bc-date-time">
        {label && <label className="bc-dt-label dark:bsc-text-mono-light-1">{label}</label>}
        <MediaQuery
          mobileMarkup={
            <>
              <ContentEditableInput
                value={getValue()}
                readOnly={readOnly}
                inputMode="none"
                className={inputStyles}
                onFocus={onFocus}
                onElementCreate={(element) => onInputElementCreated(element, false)}
                {...inputProps}
              />
              <MobileOverlayPanel
                visible={selectorOpen}
                target={dropDownTarget}
                hidden={onDateTimeHidden}
                unmountWhenHidden={true}
              >
                {renderSelector()}
              </MobileOverlayPanel>
            </>
          }
          aboveMobileMarkup={
            <>
              <TemplateOutlet props={inputTemplateProps} template={template}>
                {useFormattedInput === false ? (
                  <ContentEditableInput
                    value={getValue()}
                    readOnly={readOnly}
                    className={inputStyles}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onInput={onInput}
                    onElementCreate={(element) => onInputElementCreated(element, false)}
                    {...inputProps}
                  />
                ) : (
                  <FormattedInput
                    value={getValue()}
                    readOnly={readOnly}
                    className={inputStyles}
                    format={inputFormat}
                    isInputValid={isValidFormatString}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onChange={onFormatStringChange}
                    onElementCreate={(element) => onInputElementCreated(element, true)}
                    {...inputProps}
                  />
                )}
              </TemplateOutlet>
              <OverlayPanel
                visible={selectorOpen}
                target={dropDownTarget}
                shouldTargetCloseOverlay={false}
                shouldScrollCloseOverlay={true}
                shouldCheckZIndex={true}
                shouldRemainOnScreen={true}
                hidden={onDateTimeHidden}
                isClickedWithin={onCalendarClick}
                unmountWhenHidden={true}
              >
                {renderSelector()}
              </OverlayPanel>
            </>
          }
        />
      </div>
    </DateTimeContext.Provider>
  );
};

export default DateTime;
