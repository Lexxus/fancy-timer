/**
 * Fancy Timer
 * Show countdown timer or realtime clock
 *
 * @author Oleksii Teterin <altmoc@gmail.com>
 * @version 1.0.0
 * @license ISC http://opensource.org/licenses/ISC
 * @date 2020-07-05
 * @host https://github.com/Lexxus/fancy-timer
 */

export type Direction = 1 | 0 | -1;

export interface ICaptions {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export interface IWarn {
  secondsLeft: number;
  className?: string;
}

export interface IFancyTimerOptions {
  // if number: the value is in seconds;
  // if Date: initial value setup as the seconds after or before the date;
  // if string: it tryes to parse the value as time in format "HH:mm:ss"
  //  and setup initial value as the seconds after of before the specified time today,
  //  if parsing is failed, initial value set to 0.
  value: number | Date | string;
  // 1 - the timer moves forward
  // -1 - the timer moves backward
  // 0 - the timer is stoped
  direction?: Direction;
  // captions to add below the numbers
  captions?: ICaptions;
  // quantity of digits for days, allowed values from 0 to 6
  // default - 0, noe days display
  showDays?: number;
  // if true the digits transition anumation moves from bottom to up
  reverseAnimation?: boolean;
  // apply CSS class if specified seconds left in countdown mode
  // className by default 'ft-warn'
  warn?: IWarn;
  // callback function to call when the timer reached zero
  onFinish?: () => void;
  // callback function to call when warning mode is activated
  onWarning?: () => void;
}

interface ITimerElement {
  seconds: HTMLElement;
  minutes: HTMLElement;
  hours: HTMLElement;
  days?: HTMLElement;
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const MAX_DAYS_DIGITS = 6;

const WARN_CLASS_NAME = 'ft-warn';
const REVERSE_CLASS_NAME = 'ft-reverse';

export class FancyTimer {
  private timestamp = 0;

  private value: number = 0;

  private direction: Direction = 0;

  private intervalId?: number;

  private element: ITimerElement;

  private container: Element;

  private warn?: IWarn;

  private reverse?: boolean;

  private onFinish?: () => void;

  private onWarning?: () => void;

  public constructor(containerEl: Element, options: IFancyTimerOptions) {
    const { captions, showDays = 0 } = options;

    this.container = containerEl;

    this.tick = this.tick.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);

    this.updateOptions(options);

    const seconds = createDigitsElement(captions?.seconds);
    const minutes = createDigitsElement(captions?.minutes);
    const hours = createDigitsElement(captions?.hours);
    const days = showDays > 0 && showDays <= MAX_DAYS_DIGITS ? createDigitsElement(captions?.days, showDays) : undefined;

    this.element = { seconds, minutes, hours, days };

    containerEl.innerHTML = '';

    if (days) {
      containerEl.appendChild(days);

      const spaceEl = document.createElement('span');
      spaceEl.className = 'ft-space';
      containerEl.appendChild(spaceEl);
    }

    containerEl.appendChild(hours);
    const delimEl = document.createElement('span');
    delimEl.className = 'ft-delimiter';
    containerEl.appendChild(delimEl);
    containerEl.appendChild(minutes);
    containerEl.appendChild(delimEl.cloneNode());
    containerEl.appendChild(seconds);

    const digits = containerEl.querySelectorAll('.ft-shifter');

    // set height to all digit elements
    // and subscribe them to the transitionend event
    digits.forEach((el) => {
      const height = (el as HTMLElement).offsetHeight;
      (el.parentElement as HTMLElement).style.height = `${height / 2}px`;
      el.addEventListener('transitionend', this.handleTransitionEnd);
    });

    this.showValue(this.value, true);

    // if direction is specified start the timer immediately
    if (this.direction) {
      this.start(this.direction);
    }
  }

  /**
   * Allow correctly destroy the timer.
   * Remove all related event listeners.
   */
  public destroy() {
    const digits = this.container.querySelectorAll('.ft-shifter');

    digits.forEach((el) => {
      el.removeEventListener('transitionend', this.handleTransitionEnd);
    });
  }

  /**
   * Start the timer.
   * @param direction - optional, in which direction to start. 1 - forward, -1 - backward (countdown).
   *  if not specified of greater that |1|, using this.direction property if it's not zero.
   */
  public start(direction?: Direction) {
    const dir = direction && Math.abs(direction) < 2 ? direction : this.direction;

    if (dir) {
      if (this.intervalId) {
        this.stop();
      }
      this.timestamp = Date.now();
      const { setInterval } = window;
      this.direction = dir;
      this.intervalId = setInterval(this.tick, 1000);
    }
  }

  /**
   * Stop the timer.
   * Reset the value property to actual value.
   */
  public stop() {
    window.clearInterval(this.intervalId);
    this.intervalId = 0;
    this.value = this.getActualValue();
  }

  /**
   * Apply a value to the timer.
   * @param value - value in seconds to apply.
   * @param force - optional, if true apply immediately without animation. Default false.
   */
  public showValue(value: number, force = false) {
    const days = Math.floor(value / DAY);
    let val = value % DAY;
    const hours = Math.floor(val / HOUR);
    val %= HOUR;
    const minutes = Math.floor(val / MINUTE);
    const seconds = (val % MINUTE);

    const el = this.element;

    if (el.days) {
      updateDigits(el.days, days, force, this.reverse);
    }
    updateDigits(el.hours, hours, force, this.reverse);
    updateDigits(el.minutes, minutes, force, this.reverse);
    updateDigits(el.seconds, seconds, force, this.reverse);
  }

  /**
   * Update options. This overwrite old options with the new values except captions & showDays.
   * @param options - new options.
   */
  public updateOptions({ value, direction, warn, reverseAnimation, onFinish, onWarning }: Partial<IFancyTimerOptions>) {
    this.direction = direction && Math.abs(direction) < 2 ? direction : this.direction;
    this.reverse = reverseAnimation;
    this.warn = warn;
    this.onFinish = onFinish;
    this.onWarning = onWarning;

    switch (typeof value) {
      case 'number':
        this.value = value;
        break;
      case 'object':
        if (value instanceof Date) {
          this.value = date2Seconds(value);
          if (this.value < 0) {
            this.value = Math.abs(this.value);
            this.direction = 1;
          } else {
            this.direction = -1
          }
        }
        break;
      case 'string':
        if (/^[012]?\d:[0-5]?\d:[0-5]?\d$/.test(value)) {
          const [ dateStr ] = new Date().toISOString().split('T');
          const date = new Date(`${dateStr}T${value}`);
          this.value = date2Seconds(date);
        }
        break;
    }

    if (this.reverse) {
      this.container.classList.add(REVERSE_CLASS_NAME);
    } else {
      this.container.classList.remove(REVERSE_CLASS_NAME)
    }
  }

  /**
   * Get actual value in seconds that depends on the time when timer has been started.
   * @returns actual value in seconds.
   */
  private getActualValue(): number {
    const delta = Math.round((Date.now() - this.timestamp) / 1000);
    return this.value + (delta * this.direction);
  }

  /**
   * Method that calls every second to update the timer.
   */
  private tick() {
    if (this.direction) {
      const value = this.getActualValue();

      if (value < 0) {
        this.stop();
        if (typeof this.onFinish === 'function') {
          this.onFinish();
        }
      } else {
        this.showValue(value);
      }
      if (this.warn) {
        const isWarn = this.direction < 0 && value >= 0 && this.warn.secondsLeft >= value;
        const className = this.warn.className || WARN_CLASS_NAME;
        const { classList } = this.container;
        const isWarnApplied = classList.contains(className);

        if (isWarn && !isWarnApplied) {
          classList.add(className);
          if (typeof this.onWarning === 'function') {
            this.onWarning();
          }
        } else if (!isWarn && isWarnApplied) {
          classList.remove(className);
        }
      }
    } else {
      this.stop();
    }
  }

  /**
   * Handler of 'transitionend' event.
   * Update a digit to the initial state with new value.
   * @param event
   */
  private handleTransitionEnd({ target }: Event) {
    const el = target as HTMLElement;
    const i0 = this.reverse ? 1 : 0;
    const i1 = this.reverse ? 0 : 1;

    el.children[i1].textContent = el.children[i0].textContent;
    el.classList.remove('ft-transit');
  }
}

/**
 * Convert a date into seconds relative to current date.
 * @param value - date to convert.
 * @returns seconds after or before specified date to the current date.
 *  Negative seconds mean it's before current date.
 */
function date2Seconds(value: Date): number {
  const time = value.getTime() || 0;
  return Math.round((time - Date.now()) / 1000);
}

/**
 * Create digits element with optinal caption.
 * @param caption - optional
 * @param digits - quantity of digits, default 2.
 * @returns Created element.
 */
function createDigitsElement(caption?: string, digits = 2): HTMLElement {
  const el = document.createElement('figure');

  el.className = 'ft-digits';
  el.innerHTML = createDigits(digits) +
    (caption ? `<figcaption class="ft-caption">${caption}</figcaption>` : '');

  return el;
}

/**
 * Create HTML for digits element.
 * @param count - count of the digits.
 * @returns HTML string of digit elements.
 */
function createDigits(count: number): string {
  let html = '';

  for (let i = 0; i < count; i++) {
    html += `<div class="ft-digit">` +
      '<ul class="ft-shifter"><li>0</li><li>0</li></ul>' +
    '</div>';
  }

  return html;
}

/**
 * Set value for a digits element and start transition if a digit is updated.
 * @param el - digits element to update.
 * @param value - value.
 * @param force - optionsl, if true update the digits immediately without transition animation. Default false.
 * @param reverse - optionsl, direction of the transition animation, if true transit in reverse direction. Default false.
 */
function updateDigits(el: HTMLElement, value: number, force?: boolean, reverse = false): void {
  const digits = el.querySelectorAll('.ft-digit');
  const i0 = reverse ? 1 : 0;
  const i1 = reverse ? 0 : 1;
  let str = value.toString();

  if (str.length < digits.length) {
    str = '0000'.substr(0, digits.length - str.length) + str;
  }

  digits.forEach((digit, i) => {
    const shifter = digit.firstElementChild as Element;
    const { children } = shifter;
    const { textContent } = children[i1];
    const char = str[i];

    if (textContent !== char) {
      if (force) {
        children[i1] .textContent = char;
      } else {
        children[i0].textContent = char;
        shifter.classList.add('ft-transit');
      }
    }
  });
}

export default FancyTimer;
