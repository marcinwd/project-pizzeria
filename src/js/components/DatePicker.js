import utils from '../utils.js';
import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget {
  constructor(wrapper) {
    super(wrapper, utils.dateToStr(new Date()));

    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }

  initPlugin() {
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture);

    // eslint-disable-next-line no-undef
    flatpickr(thisWidget.dom.input, {
      defaultDate: thisWidget.minDate,
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      local: {
        firstDayOfWeek: 1,
      },
      disable: [
        function (date) {
          return (date.getDay() === 1);
        }],
      onChange: function (selectedDates, dateToStr) {
        thisWidget.value = dateToStr;
      }, //blad wyswietlania - data ma brak obramowania i widac tylko rok
    });
  }
  parseValue(value) {
    return value;
  }

  isValid() {
    return true;
  }

}

export default DatePicker;