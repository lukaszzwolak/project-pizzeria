import { select, settings } from '../settings.js';


class AmountWidget {
    constructor(element) {
        const thisWidget = this;
        thisWidget.getElements(element);
        thisWidget.setValue(thisWidget.input.value);
        thisWidget.initActions();
    }
    getElements(element) {
        const thisWidget = this;
        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }
    setValue(value) {
        const thisWidget = this;
        let newValue = parseInt(value) || settings.amountWidget.defaultValue;
        newValue = Math.min(Math.max(newValue, settings.amountWidget.defaultMin), settings.amountWidget.defaultMax);
        if (thisWidget.value !== newValue) {
            thisWidget.value = newValue;
            thisWidget.input.value = thisWidget.value;
            thisWidget.announce();
        }
    }
    initActions() {
        const thisWidget = this;
        thisWidget.input.addEventListener('change', function () {
            thisWidget.setValue(thisWidget.input.value);
        });
        thisWidget.linkDecrease.addEventListener('click', function (event) {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value - 1);
        });
        thisWidget.linkIncrease.addEventListener('click', function (event) {
            event.preventDefault();
            thisWidget.setValue(thisWidget.value + 1);
        });
    }
    announce() {
        const event = new CustomEvent('updated', { bubbles: true });
        this.element.dispatchEvent(event);
    }
}

export default AmountWidget;