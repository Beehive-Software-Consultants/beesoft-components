import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import { addMonths, endOfMonth, startOfMonth } from 'date-fns';
import React, { ReactNode, useEffect, useReducer, useRef, useState } from 'react';
import { getBrowserLanguage } from '../../common-functions';
import TemplateOutlet, { TemplateFunction } from '../../common/template-outlet/template-outlet.component';
import OverlayPanel from '../../overlay/overlay-panel/overlay-panel.component';
import { FormInputControl } from '../form-control.interface';
import ContentEditableInput from '../input/content-editable-input/content-editable-input.component';
import { FormattedInputDefaultFormats } from '../input/formatted-input/formats/input-format.enums';
import FormattedInput from '../input/formatted-input/formatted-input.component';
import { DateTimeCalendarTemplate } from './date-time-calendar.component';
import { DateTimeContext, DateTimeContextProps } from './date-time-context';
import DateTimeDaySelector from './date-time-day-selector.component';
import {
  createDefaultColors,
  getDateFormatByLocale,
  isDateBetween,
  loadLocale,
  parseDate,
  parseDateRange,
  uses24HourTimeByLocale,
} from './date-time-functions';
import DateTimeMonthSelector from './date-time-month-selector.component';
import DateTimeRangeSelector from './date-time-range-selector.component';
import { DateTimeScrollerTemplate } from './date-time-scroller.component';
import DateTimeTimeSelector from './date-time-time-selector.component';
import {
  CalendarIconPosition,
  DateFormatType,
  DateSelectionType,
  DateTimeColors,
  TimeConstraints,
  TimeFormatType,
} from './date-time-types';
import DateTimeYearSelector from './date-time-year-selector.component';
import reducer, { DateTimeActionType, DateTimeState } from './date-time.reducer';

export interface DateTimeProps extends FormInputControl<string | Date | Array<Date>, Date | Array<Date>> {
  useDefaultDateValue?: boolean;
  useFormattedInput?: boolean;
  allowClear?: boolean;
  locale?: string;
  dateSelection?: DateSelectionType;
  dateFormat?: DateFormatType;
  timeConstraints?: TimeConstraints;
  icon?: JSX.Element;
  iconPosition?: CalendarIconPosition;
  inputElement?: HTMLElement;
  colors?: DateTimeColors;
  selectableDate?: (currentDate: Date) => boolean;
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
  iconElement?: JSX.Element;
}

export type DateTimeInputTemplate = TemplateFunction<DateTimeInputTemplateProps>;

export default function DateTime({
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
  colors = createDefaultColors(),
  selectableDate,
  isValidDate,
  onChange,
  calendarTemplate,
  dateScrollerTemplate,
  inputTemplate,
}: DateTimeProps) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [dropDownTarget, setDropDownTarget] = useState<Element>();

  const isFormattedInput = useRef<boolean>();
  const inputElementChanged = useRef(false);
  const language = useRef<string>(locale || getBrowserLanguage());
  const loadedLocale = useRef<Locale>();
  const inputElementRef = useRef<HTMLElement>();
  const dropDownTargetRef = useRef<HTMLElement>();

  const contextProps = useRef<DateTimeContextProps>({
    calendarTemplate,
    dateScrollerTemplate,
    colors,
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
    }
  }, [value, loadedLocale.current]);

  useEffect(() => {
    if (dateSelection && loadedLocale.current && loadedLocale.current.code) {
      const dateFormatString = getDateFormatByLocale(loadedLocale.current.code);

      if (dateSelection === DateSelectionType.DateOnly) {
        if (dateFormatString === 'DD/MM/YYYY') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateDayMonthYear,
          });
        } else if (dateFormatString === 'MM/DD/YYYY') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateMonthDayYear,
          });
        } else if (dateFormatString === 'YYYY/MM/DD') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateYearMonthDay,
          });
        }
      } else if (dateSelection === DateSelectionType.TimeOnly) {
        if (uses24HourTimeByLocale(loadedLocale.current.code)) {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.Time24Hour,
          });
        } else {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.Time12Hour,
          });
        }
      } else if (dateSelection === DateSelectionType.DateRange) {
        if (dateFormatString === 'DD/MM/YYYY') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateRangeDayMonthYear,
          });
        } else if (dateFormatString === 'MM/DD/YYYY') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateRangeMonthDayYear,
          });
        } else if (dateFormatString === 'YYYY/MM/DD') {
          dispatcher({
            type: DateTimeActionType.SetInputFormat,
            inputFormat: FormattedInputDefaultFormats.DateRangeYearMonthDay,
          });
        }
      }
    }
  }, [dateSelection, loadedLocale.current]);

  useEffect(() => {
    if (inputElement) {
      inputElementRef.current = inputElement;
    }
  }, [inputElement]);

  const loadLocaleObject = (localeToLoad: string) => {
    loadLocale(localeToLoad)
      .then((locale) => {
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

  const onInput = (event: React.FormEvent) => {
    const dateString = (event.target as HTMLElement).innerText;
    onDateStringChange(dateString);
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

  const onCalendarClick = () => {
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
            <div className="bsc-flex">
              {allowClear && !readOnly && (
                <div>
                  <FontAwesomeIcon
                    className="bsc-cursor-pointer bsc-text-sm"
                    icon={['fas', 'times']}
                    size="sm"
                    onClick={onClearClick}
                  />
                </div>
              )}
              <div className="bsc-ml-2">
                {icon || (
                  <FontAwesomeIcon
                    className={!readOnly ? 'bsc-cursor-pointer' : undefined}
                    icon={['far', 'calendar-alt']}
                    onClick={!readOnly ? onCalendarClick : undefined}
                  />
                )}
              </div>
            </div>
          ),
        }
      : {
          leftElement: (
            <div className="bsc-flex">
              <div className="bsc-mr-2">
                {icon || (
                  <FontAwesomeIcon
                    className={!readOnly ? 'bsc-cursor-pointer' : undefined}
                    icon={['far', 'calendar-alt']}
                    onClick={!readOnly ? onCalendarClick : undefined}
                  />
                )}
              </div>
              {allowClear && !readOnly && (
                <div>
                  <FontAwesomeIcon
                    className="bsc-cursor-pointer bsc-text-sm"
                    icon={['fas', 'times']}
                    size="sm"
                    onClick={onClearClick}
                  />
                </div>
              )}
            </div>
          ),
        };

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

  const defaultTemplate = (props: DateTimeInputTemplateProps, children: ReactNode | Array<ReactNode>) => (
    <>{children}</>
  );

  const template = inputTemplate || defaultTemplate;

  const inputStyles = cx(
    'bsc-text-left',
    {
      [`${colors?.readOnlyInputBgColor || 'bsc-bg-gray-200'}`]: readOnly,
      [`${colors?.inputBgColor || 'bsc-bg-white'}`]: !readOnly,
    },
    `dark:bsc-bg-black ${colors?.inputBorderColor} bc-dt-input`,
    className
  );

  return (
    <DateTimeContext.Provider value={contextProps.current}>
      <div className="bc-date-time">
        {label && <label className="dark:bsc-text-white bc-dt-label">{label}</label>}
        <TemplateOutlet props={inputTemplateProps} template={template}>
          {useFormattedInput === false || state.inputFormat === undefined ? (
            <ContentEditableInput
              value={getValue()}
              readOnly={readOnly}
              className={inputStyles}
              onFocus={onFocus}
              onInput={onInput}
              onElementCreate={(element) => onInputElementCreated(element, false)}
              {...inputProps}
            />
          ) : (
            <FormattedInput
              value={getValue()}
              readOnly={readOnly}
              className={inputStyles}
              onFocus={onFocus}
              onChange={onFormatStringChange}
              onElementCreate={(element) => onInputElementCreated(element, true)}
              defaultFormat={state.inputFormat}
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
          unmountWhenHidden={true}
        >
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
        </OverlayPanel>
      </div>
    </DateTimeContext.Provider>
  );
}
