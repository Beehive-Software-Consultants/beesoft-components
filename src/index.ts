// components
import { BeeSoftProvider } from './common/contexts/beesoft.context.tsx';
import {
  SelectionLabelLocation,
  FormGroupItemOrientation,
  GroupChangeEvent,
} from './components/form/form-generic.interfaces.ts';
import { Button } from './components/navigation/buttons/button/button.component.tsx';
import { Checkbox } from './components/form/checkboxes/checkbox/checkbox.component.tsx';
import { CheckboxGroup } from './components/form/checkboxes/checkbox-group/checkbox-group.component.tsx';
import ContentEditableInput from './components/form/inputs/content-editable-input/content-editable-input.component';
import { DateTime } from './components/form/date-time/date-time.component';
import FormattedInput from './components/form/inputs/formatted-input/formatted-input.component';
import { MediaQuery } from './components/mobile/media-query/media-query.component.tsx';
import { MobileOverlayPanel } from './components/mobile/overlay/mobile-overlay-panel.component.tsx';
import OverlayPanel from './components/overlay/overlay-panel/overlay-panel.component';

// functions
import { createBeeSoftTheme, applyBeeSoftTheme } from './components/common-functions';

// types
import { CheckboxChangeEvent } from './components/form/checkboxes/checkboxes.interfaces.ts';
import { CheckboxRef } from './components/form/checkboxes/checkbox/checkbox.props.ts';
import { DateFormatType, DateSelectionType } from './components/form/date-time/date-time-types';
import { DateTimeInputTemplateProps } from './components/form/date-time/date-time.props.ts';
import { DateTimeScrollerTemplateProps } from './components/form/date-time/date-time-scroller.component';
import { DateTimeCalendarTemplateProps } from './components/form/date-time/date-time-calendar.component';

// styles
import './index.css';

export {
  BeeSoftProvider,
  Button,
  Checkbox,
  CheckboxGroup,
  ContentEditableInput,
  DateTime,
  FormattedInput,
  MediaQuery,
  MobileOverlayPanel,
  OverlayPanel,

  // functions
  applyBeeSoftTheme,
  createBeeSoftTheme,

  // types to be used as values
  FormGroupItemOrientation,
  SelectionLabelLocation,
  DateFormatType,
  DateSelectionType,
};

export type {
  CheckboxChangeEvent,
  GroupChangeEvent,
  CheckboxRef,
  DateTimeInputTemplateProps,
  DateTimeScrollerTemplateProps,
  DateTimeCalendarTemplateProps,
};
