import { select, templates } from '../settings.js';
import AmountWidget from "./AmountWidget.js";


class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.element = element;

        thisBooking.render();
        thisBooking.initWidgets();
    }

    render() {
        const thisBooking = this;
        const generateHTML = templates.bookingWidget();

        thisBooking.dom = {};
        thisBooking.dom.wrapper = thisBooking.element;
        thisBooking.dom.wrapper.innerHTML = generateHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);


    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.peopleAmount.addEventListener('click', function () { });
        thisBooking.dom.hoursAmount.addEventListener('click', function () { });
    }
}


export default Booking;