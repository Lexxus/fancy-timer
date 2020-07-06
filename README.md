# fancy-timer
Digital countdown timer, clock and more

## Demo with code examples

https://lexxus.github.io/fancy-timer/

## Install

```
npm i fancy-timer
```

## Usage

Firstly apply CSS file in the `<head>` tag.

```html
<link href="css/fancy-timer.css" rel="stylesheet" type="text/css" media="screen"/>
```

Then apply this CSS classes to a container element.
```html
<div id="container" class="ft ft-light"></div>
```

If you want to use dark theme replace class `ft-light` to `ft-dark`.

### Simple time count
This example just counts seconds from start.

```typescript
import { FancyTimer } from 'fancy-timer';

const container = document.getElementById('container');
const ft = new FancyTimer(container, { value: 0, direction: 1 });
```

### Countdown timer with warning
This example setup the countdown timer for 5 minutes (300 seconds).
When one minute left it enables warning mode.
On finish it calls a callback function.

![timer](/docs/img/warn-timer.png)

```typescript
import { FancyTimer, IFancyTimerOptions } from 'fancy-timer';

const container = document.getElementById('container');
const options: IFancyTimerOptions {
  value: 300,
  direction: -1,
  warn: {
    secondsLeft: 60
  },
  onWarning() {
    console.log('Warning!');
  },
  onFinish() {
    console.log('Finish!');
  }
};
const ft = new FancyTimer(container, { value: 300, direction: -1 });
```

### New Year countdown
This example set the countdown timer to New Year with the captions.

![New Year Timer](/docs/img/light-theme.png)

![Dark Theme](/docs/img/dark-theme.png)

```typescript
import { FancyTimer, IFancyTimerOptions } from 'fancy-timer';

const nextYear = new Date().getFullYear() + 1;
const options: IFancyTimerOptions {
  value: new Date(`${nextYear}-01-01`),
  captions: {
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds'
  },
  showDays: 3
};

// initialize the timer
const ft = new FancyTimer(document.getElementById('container'), options);

// Start the timer
ft.start(-1);
```
## Options

```typescript
interface IFancyTimerOptions {
  // if number: the value is in seconds;
  // if Date: initial value setup as the seconds after or before the date;
  // if string: it tryes to parse the value as time in format "HH:mm:ss"
  //  and setup initial value as the seconds after of before the specified time today,
  //  if parsing is failed, initial value set to 0.
  value: number | Date | string;

  // 1 - the timer moves forward
  // -1 - the timer moves backward
  // 0 - the timer is stoped
  direction?: 1 | 0 | -1;

  // captions to add below the numbers
  captions?: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };

  // quantity of digits for days, allowed values from 0 to 6
  // default - 0, noe days display
  showDays?: number;

  // if true the digits transition anumation moves from bottom to up
  reverseAnimation?: boolean;

  // apply CSS class if specified seconds left in countdown mode
  // className by default 'ft-warn'
  warn?: {
    secondsLeft: number;
    className?: string;
  };

  // callback function to call when the timer reached zero
  onFinish?: () => void;

  // callback function to call when warning mode is activated
  onWarning?: () => void;
}
```

## Methods

```typescript
FancyTimer.start(direction?: 1 | 0 | -1)
```
Start the timer in specified direction: 1 - forward, -1 - backward.
If `direction` is 0 or omitted, using current `direction` property value.

```typescript
FancyTimer.stop()
```
Stop the timer.

```typescript
FancyTimer.update(value: number, force = false)
```
Update displaying time.
`value` is in seconds.
If `force = true` it means the timer updates immetiately without animation.
This method is not updating any option, so after call `start` method the timer will display an actual `value` property.

```typescript
FancyTimer.updateOptions(options: IFancyTimerOptions)
```
This method allows to update all options except `captions` and `showDays`.
If some options are not specified they will be set as `undefined` (except `value`, `captions`, `showDays`).

```typescript
FancyTimer.setValue(value?: number | Date | string)
```
This method is very handy if need to update only `value` property.
