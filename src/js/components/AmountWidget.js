import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js'; //czemu brak component?


class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);

    //thisWidget.value = settings.amountWidget.defaultValue; wartosc bedzie pobierana z argumentów super
    //thisWidget.setValue(thisWidget.dom.input.value);

    thisWidget.initActions();

    console.log('AmountWidget', thisWidget);
    //console.log('constructor arguments', element);
  }

  getElements() { //usuniety argument 'element'
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value) {
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    //value change in the widget after manual input
    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value(thisWidget.dom.input.value);
    });
    //value increase after widget 'click' '+'
    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
    //value decrease after widget 'click' '-'
    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
  }
}
export default AmountWidget;