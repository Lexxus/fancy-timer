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
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
    else {
        var e = {};
        factory(null, e);
        window.FancyTimer = e.FancyTimer;
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FancyTimer = void 0;
    var MINUTE = 60;
    var HOUR = MINUTE * 60;
    var DAY = HOUR * 24;
    var MAX_DAYS_DIGITS = 6;
    var WARN_CLASS_NAME = 'ft-warn';
    var REVERSE_CLASS_NAME = 'ft-reverse';
    var FancyTimer = /** @class */ (function () {
        function FancyTimer(containerEl, options) {
            var _this = this;
            this.timestamp = 0;
            this.value = 0;
            this.direction = 0;
            var captions = options.captions, _a = options.showDays, showDays = _a === void 0 ? 0 : _a;
            this.container = containerEl;
            this.tick = this.tick.bind(this);
            this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
            this.updateOptions(options);
            var seconds = createDigitsElement(captions === null || captions === void 0 ? void 0 : captions.seconds);
            var minutes = createDigitsElement(captions === null || captions === void 0 ? void 0 : captions.minutes);
            var hours = createDigitsElement(captions === null || captions === void 0 ? void 0 : captions.hours);
            var days = showDays > 0 && showDays <= MAX_DAYS_DIGITS ? createDigitsElement(captions === null || captions === void 0 ? void 0 : captions.days, showDays) : undefined;
            this.element = { seconds: seconds, minutes: minutes, hours: hours, days: days };
            containerEl.innerHTML = '';
            if (days) {
                containerEl.appendChild(days);
                var spaceEl = document.createElement('span');
                spaceEl.className = 'ft-space';
                containerEl.appendChild(spaceEl);
            }
            containerEl.appendChild(hours);
            var delimEl = document.createElement('span');
            delimEl.className = 'ft-delimiter';
            containerEl.appendChild(delimEl);
            containerEl.appendChild(minutes);
            containerEl.appendChild(delimEl.cloneNode());
            containerEl.appendChild(seconds);
            var digits = containerEl.querySelectorAll('.ft-shifter');
            // set height to all digit elements
            // and subscribe them to the transitionend event
            digits.forEach(function (el) {
                var height = el.offsetHeight;
                el.parentElement.style.height = height / 2 + "px";
                el.addEventListener('transitionend', _this.handleTransitionEnd);
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
        FancyTimer.prototype.destroy = function () {
            var _this = this;
            var digits = this.container.querySelectorAll('.ft-shifter');
            digits.forEach(function (el) {
                el.removeEventListener('transitionend', _this.handleTransitionEnd);
            });
        };
        /**
         * Start the timer.
         * @param direction - optional, in which direction to start. 1 - forward, -1 - backward (countdown).
         *  if not specified of greater that |1|, using this.direction property if it's not zero.
         */
        FancyTimer.prototype.start = function (direction) {
            var dir = direction && Math.abs(direction) < 2 ? direction : this.direction;
            if (dir) {
                if (this.intervalId) {
                    this.stop();
                }
                this.timestamp = Date.now();
                var setInterval_1 = window.setInterval;
                this.direction = dir;
                this.intervalId = setInterval_1(this.tick, 1000);
            }
        };
        /**
         * Stop the timer.
         * Reset the value property to actual value.
         */
        FancyTimer.prototype.stop = function () {
            window.clearInterval(this.intervalId);
            this.intervalId = 0;
            this.value = this.getActualValue();
        };
        /**
         * Apply a value to the timer.
         * @param value - value in seconds to apply.
         * @param force - optional, if true apply immediately without animation. Default false.
         */
        FancyTimer.prototype.showValue = function (value, force) {
            if (force === void 0) { force = false; }
            var days = Math.floor(value / DAY);
            var val = value % DAY;
            var hours = Math.floor(val / HOUR);
            val %= HOUR;
            var minutes = Math.floor(val / MINUTE);
            var seconds = (val % MINUTE);
            var el = this.element;
            if (el.days) {
                updateDigits(el.days, days, force, this.reverse);
            }
            updateDigits(el.hours, hours, force, this.reverse);
            updateDigits(el.minutes, minutes, force, this.reverse);
            updateDigits(el.seconds, seconds, force, this.reverse);
        };
        /**
         * Update options. This overwrite old options with the new values except captions & showDays.
         * @param options - new options.
         */
        FancyTimer.prototype.updateOptions = function (_a) {
            var value = _a.value, direction = _a.direction, warn = _a.warn, reverseAnimation = _a.reverseAnimation, onFinish = _a.onFinish, onWarning = _a.onWarning;
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
                        }
                        else {
                            this.direction = -1;
                        }
                    }
                    break;
                case 'string':
                    if (/^[012]?\d:[0-5]?\d:[0-5]?\d$/.test(value)) {
                        var dateStr = new Date().toISOString().split('T')[0];
                        var date = new Date(dateStr + "T" + value);
                        this.value = date2Seconds(date);
                    }
                    break;
            }
            if (this.reverse) {
                this.container.classList.add(REVERSE_CLASS_NAME);
            }
            else {
                this.container.classList.remove(REVERSE_CLASS_NAME);
            }
        };
        /**
         * Get actual value in seconds that depends on the time when timer has been started.
         * @returns actual value in seconds.
         */
        FancyTimer.prototype.getActualValue = function () {
            var delta = Math.round((Date.now() - this.timestamp) / 1000);
            return this.value + (delta * this.direction);
        };
        /**
         * Method that calls every second to update the timer.
         */
        FancyTimer.prototype.tick = function () {
            if (this.direction) {
                var value = this.getActualValue();
                if (value < 0) {
                    this.stop();
                    if (typeof this.onFinish === 'function') {
                        this.onFinish();
                    }
                }
                else {
                    this.showValue(value);
                }
                if (this.warn) {
                    var isWarn = this.direction < 0 && value >= 0 && this.warn.secondsLeft >= value;
                    var className = this.warn.className || WARN_CLASS_NAME;
                    var classList = this.container.classList;
                    var isWarnApplied = classList.contains(className);
                    if (isWarn && !isWarnApplied) {
                        classList.add(className);
                        if (typeof this.onWarning === 'function') {
                            this.onWarning();
                        }
                    }
                    else if (!isWarn && isWarnApplied) {
                        classList.remove(className);
                    }
                }
            }
            else {
                this.stop();
            }
        };
        /**
         * Handler of 'transitionend' event.
         * Update a digit to the initial state with new value.
         * @param event
         */
        FancyTimer.prototype.handleTransitionEnd = function (_a) {
            var target = _a.target;
            var el = target;
            var i0 = this.reverse ? 1 : 0;
            var i1 = this.reverse ? 0 : 1;
            el.children[i1].textContent = el.children[i0].textContent;
            el.classList.remove('ft-transit');
        };
        return FancyTimer;
    }());
    exports.FancyTimer = FancyTimer;
    /**
     * Convert a date into seconds relative to current date.
     * @param value - date to convert.
     * @returns seconds after or before specified date to the current date.
     *  Negative seconds mean it's before current date.
     */
    function date2Seconds(value) {
        var time = value.getTime() || 0;
        return Math.round((time - Date.now()) / 1000);
    }
    /**
     * Create digits element with optinal caption.
     * @param caption - optional
     * @param digits - quantity of digits, default 2.
     * @returns Created element.
     */
    function createDigitsElement(caption, digits) {
        if (digits === void 0) { digits = 2; }
        var el = document.createElement('figure');
        el.className = 'ft-digits';
        el.innerHTML = createDigits(digits) +
            (caption ? "<figcaption class=\"ft-caption\">" + caption + "</figcaption>" : '');
        return el;
    }
    /**
     * Create HTML for digits element.
     * @param count - count of the digits.
     * @returns HTML string of digit elements.
     */
    function createDigits(count) {
        var html = '';
        for (var i = 0; i < count; i++) {
            html += "<div class=\"ft-digit\">" +
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
    function updateDigits(el, value, force, reverse) {
        if (reverse === void 0) { reverse = false; }
        var digits = el.querySelectorAll('.ft-digit');
        var i0 = reverse ? 1 : 0;
        var i1 = reverse ? 0 : 1;
        var str = value.toString();
        if (str.length < digits.length) {
            str = '0000'.substr(0, digits.length - str.length) + str;
        }
        digits.forEach(function (digit, i) {
            var shifter = digit.firstElementChild;
            var children = shifter.children;
            var textContent = children[i1].textContent;
            var char = str[i];
            if (textContent !== char) {
                if (force) {
                    children[i1].textContent = char;
                }
                else {
                    children[i0].textContent = char;
                    shifter.classList.add('ft-transit');
                }
            }
        });
    }
    exports.default = FancyTimer;
});
//# sourceMappingURL=index.js.map