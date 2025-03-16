import { select, templates, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
    constructor(element) {
        const thisBooking = this;
        thisBooking.element = element;

        thisBooking.render();
        thisBooking.initWidgets();
        thisBooking.getData();
    }

    getData() {
        const thisBooking = this;
        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
        //console.log(endDateParam);

        const params = {
            bookings: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrents: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam
            ]
        };
        //console.log(params);

        const urls = {
            bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrents.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
        };
        console.log(urls);
        console.log(urls);

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat)
        ]).then(function (allResponses) {
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1]
            const eventsRepeatResponse = allResponses[2]
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json()
            ]);
        })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                console.log(bookings);
                console.log(eventsCurrent);
                console.log(eventsRepeat);
                // thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);

                // console.log(eventsCurrent);

            })
    }


    render() {
        const thisBooking = this;
        const generateHTML = templates.bookingWidget();

        thisBooking.dom = {};
        thisBooking.dom.wrapper = thisBooking.element;
        thisBooking.dom.wrapper.innerHTML = generateHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('click', function () { });
        thisBooking.dom.hoursAmount.addEventListener('click', function () { });
    }
}

export default Booking;
