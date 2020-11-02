import {settings, select} from '../settings.js';
 
//mod 8.7
class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.value = settings.amountWidget.defaultValue;

    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
  }

  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = element.querySelector(select.widgets.amount.linkIncrease);
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    //validation
    if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.input.value = thisWidget.value;
  }

  initActions() {
    const thisWidget = this;

    //value change in the widget after manual input
    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });
    //value increase after widget 'click' '+'
    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
    //value decrease after widget 'click' '-'
    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
  }

  announce() {
    const thisWidget = this;

    //const event = new Event('updated');
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.element.dispatchEvent(event);
  }
}
export default AmountWidget;