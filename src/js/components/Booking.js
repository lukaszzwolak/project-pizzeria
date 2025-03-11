import { templates } from "./settings.js";

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
    }

    initWidgets() {
        const thisBooking = this;
        console.log('inizjalizacja widgetow w booking');
    }
}


export default Booking;