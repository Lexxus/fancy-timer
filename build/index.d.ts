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
export declare type Direction = 1 | 0 | -1;
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
    value: number | Date | string;
    direction?: Direction;
    captions?: ICaptions;
    showDays?: number;
    reverseAnimation?: boolean;
    warn?: IWarn;
    onFinish?: () => void;
    onWarning?: () => void;
}
export declare class FancyTimer {
    private timestamp;
    private value;
    private direction;
    private intervalId?;
    private element;
    private container;
    private warn?;
    private reverse?;
    private onFinish?;
    private onWarning?;
    constructor(containerEl: Element, options: IFancyTimerOptions);
    /**
     * Allow correctly destroy the timer.
     * Remove all related event listeners.
     */
    destroy(): void;
    /**
     * Start the timer.
     * @param direction - optional, in which direction to start. 1 - forward, -1 - backward (countdown).
     *  if not specified of greater that |1|, using this.direction property if it's not zero.
     */
    start(direction?: Direction): void;
    /**
     * Stop the timer.
     * Reset the value property to actual value.
     */
    stop(): void;
    /**
     * Apply a value to the timer.
     * @param value - value in seconds to apply.
     * @param force - optional, if true apply immediately without animation. Default false.
     */
    showValue(value: number, force?: boolean): void;
    /**
     * Update options. This overwrite old options with the new values except captions & showDays.
     * @param options - new options.
     */
    updateOptions({ value, direction, warn, reverseAnimation, onFinish, onWarning }: Partial<IFancyTimerOptions>): void;
    /**
     * Get actual value in seconds that depends on the time when timer has been started.
     * @returns actual value in seconds.
     */
    private getActualValue;
    /**
     * Method that calls every second to update the timer.
     */
    private tick;
    /**
     * Handler of 'transitionend' event.
     * Update a digit to the initial state with new value.
     * @param event
     */
    private handleTransitionEnd;
}
export default FancyTimer;
