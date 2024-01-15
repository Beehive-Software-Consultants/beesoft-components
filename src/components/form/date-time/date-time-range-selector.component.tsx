import { addMonths, subMonths } from 'date-fns';
import { Dispatch } from 'react';
import { TypeOrArray } from '../../common-interfaces.ts';
import { MediaQuery } from '../../mobile/media-query/media-query.component.tsx';
import DateTimeCalendar from './date-time-calendar.component';
import DateTimeScroller from './date-time-scroller.component';
import { CalendarSelectionMode, DateScrollerType } from './date-time-types';
import { DateTimeActionType, DateTimeReducerAction } from './date-time.reducer';
import { useMediaQuery } from '@react-hook/media-query';

export interface DateTimeRangeSelectorProps {
  viewDate: Date;
  selectedStartDate?: Date;
  selectedEndDate?: Date;
  locale: Locale;
  onChange?: (value?: TypeOrArray<Date>) => void;
  dispatcher: Dispatch<DateTimeReducerAction>;
}

const DateTimeRangeSelector = ({
  viewDate,
  selectedStartDate,
  selectedEndDate,
  locale,
  onChange,
  dispatcher,
}: DateTimeRangeSelectorProps) => {
  const isMobile = useMediaQuery('screen and (max-device-width: 40rem)');

  const nextMonth = addMonths(viewDate, 1);

  const onDateSelected = (date: Date, options?: Record<string, unknown>) => {
    if (!options || !options.setEndDate) {
      dispatcher({
        type: DateTimeActionType.SetSelectedStartDate,
        selectedStartDate: date,
      });
    } else {
      dispatcher({
        type: DateTimeActionType.SetSelectedEndDate,
        selectedEndDate: date,
      });
      selectedStartDate && onChange?.([selectedStartDate, date]);
    }
  };

  const onMonthsClicked = () => {
    dispatcher({
      type: DateTimeActionType.MonthSelector,
    });
  };

  const getSelectorTitle = () =>
    !isMobile
      ? `${viewDate.toLocaleDateString(locale.code, { month: 'long' })} ${viewDate.toLocaleDateString(locale.code, {
          year: 'numeric',
        })} - ${nextMonth.toLocaleDateString(locale.code, {
          month: 'long',
        })} ${nextMonth.toLocaleDateString(locale.code, { year: 'numeric' })}`
      : `${viewDate.toLocaleDateString(locale.code, { month: 'long' })} ${viewDate.toLocaleDateString(locale.code, {
          year: 'numeric',
        })}`;

  const movePreviousMonth = () => {
    if (viewDate) {
      dispatcher({
        type: DateTimeActionType.SetViewDate,
        viewDate: subMonths(viewDate, 1),
      });
    }
  };

  const moveNextMonth = () => {
    if (viewDate) {
      dispatcher({
        type: DateTimeActionType.SetViewDate,
        viewDate: addMonths(viewDate, 1),
      });
    }
  };

  return (
    <div className="bc-dt-range-selector bsc-flex bsc-flex-col">
      <div className="bc-dt-range-scroller-wrapper bsc-flex-shrink">
        <DateTimeScroller
          title={getSelectorTitle()}
          scrollerType={DateScrollerType.Range}
          onTitleClicked={onMonthsClicked}
          onMovePrevious={movePreviousMonth}
          onMoveNext={moveNextMonth}
        />
      </div>
      <div className="bsc-flex-grow">
        <MediaQuery
          mobileMarkup={
            <div className="bc-dt-range-calendar bsc-px-2 bsc-py-1">
              <DateTimeCalendar
                viewDate={viewDate}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
                selectionMode={CalendarSelectionMode.Range}
                onDateSelected={onDateSelected}
                locale={locale}
                dispatcher={dispatcher}
              />
            </div>
          }
          aboveMobileMarkup={
            <div className="bc-dt-range-wrapper bsc-flex bsc-flex-row bsc-px-2 bsc-py-1">
              <div className="bc-dt-range-calendar-1 bsc-border-r bsc-border-solid bsc-border-gray-3 bsc-pr-4">
                <DateTimeCalendar
                  viewDate={viewDate}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  selectionMode={CalendarSelectionMode.Range}
                  onDateSelected={onDateSelected}
                  locale={locale}
                  dispatcher={dispatcher}
                />
              </div>
              <div className="bc-dt-range-calendar-2 bsc-pl-4">
                <DateTimeCalendar
                  viewDate={nextMonth}
                  selectedStartDate={selectedStartDate}
                  selectedEndDate={selectedEndDate}
                  selectionMode={CalendarSelectionMode.Range}
                  onDateSelected={onDateSelected}
                  locale={locale}
                  dispatcher={dispatcher}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default DateTimeRangeSelector;
