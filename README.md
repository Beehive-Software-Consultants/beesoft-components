# BeeSoft Components

A library of components for the React framework styled using tailwind css. This library is currently a beta so please report any issues found or make suggestions.

#### `Install`
> npm install beesoft-components

or

> yarn add beesoft-components

## Date/Time Component

This is the main component in the library currently; it has the ability to select not only a date but also time. Below are the current component properties (currently all of them are optional). 

| Name        | Type       | Description |
| ----------- | ---------- | ----------- |
| **value** | `string or Date` | Sets the value of the component can either be a date object or a string in a local or ISO format. |
| **label** | `string` | Sets the label for the component. |
| **locale** | `string` | Allows the locale settings to be overridden, if this is not set then the users locale settings will be used. |
| **dateSelection** | `DateSelectionType` | Allows the component to be set in 3 modes Date/Time, Date Only and Time Only (`default Date/Time`). |
| **timeConstraints** | `TimeConstraints` | Allows the time selection component to determine how the increment/decrement the values (currently only minute works). |
| **onChange** | `function (value: Date)` | Returns the value selected by the user (even though this optional it is recommended to be set). |

