import { settings, select, templates, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
    constructor(element) {
        const thisBooking = this;

        thisBooking.element = element;
        thisBooking.selectedTable = null;

        thisBooking.render();
        thisBooking.initWidget();
        thisBooking.getData();
    }

    getData() {
        const thisBooking = this;

        if (!thisBooking.datePicker) {
            console.error("DatePicker nie został jeszcze załadowany!");
            return;
        }

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [startDateParam, endDateParam],
            eventsCurrents: [settings.db.notRepeatParam, startDateParam, endDateParam],
            eventsRepeat: [settings.db.repeatParam, endDateParam]
        };

        const urls = {
            bookings: settings.db.url + '/' + settings.db.bookings + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrents.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.events + '?' + params.eventsRepeat.join('&')
        };

        // console.log(urls);
        // console.log(urls);

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
                // console.log(bookings);
                // console.log(eventsCurrent);
                // console.log(eventsRepeat);
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);

                // console.log(eventsCurrent);

            })
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
        }

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this;

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
            //console.log('loop', hourBlock);
            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;


        if (typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute)
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (!allAvailable && thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }

        //thisBooking.resetSelectedTable();
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
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    }

    initWidget() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.peopleAmount.addEventListener('click', function () { });

        thisBooking.dom.hoursAmount.addEventListener('click', function () { });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function () {
            thisBooking.updateDOM()
        })

    }


    initTables(event) {
        const thisBooking = this;

        const clickedElem = event.target;

        //check if clickedelement is a table
        if (clickedElem.classList.contains('table')) {
            //console.log('its a table');
            const tableId = clickedElem.getAttribute(settings.booking.tableIdAttribute);
            //console.log(tableId);

            if (clickedElem.classList.contains(classNames.booking.tableBooked)) {
                alert('Table is not available')
                return;
            }
            if (clickedElem.classList.contains(classNames.booking.tableSelected)) {
                clickedElem.classList.remove(classNames.booking.tableSelected);
                thisBooking.selectedTable = null;
            } else {
                thisBooking.resetSelectedTable();
                clickedElem.classList.add(classNames.booking.tableSelected);
                thisBooking.selectedTable = tableId;
            }
            //console.log(thisBooking.selectedTable);
        }
    }

    resetSelectedTable() {
        const thisBooking = this;
        for (let table of thisBooking.dom.tables) {
            table.classList.remove(classNames.booking.tableSelected);
        }
        thisBooking.selectedTable = null;
        //console.log(thisBooking.selectedTable);
    }

    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;

        const payload = {
            "date": thisBooking.date,
            "hour": utils.numberToHour(thisBooking.hour),
            "table": parseInt(thisBooking.selectedTable),
            "duration": parseInt(thisBooking.dom.duration.value),
            "ppl": parseInt(thisBooking.dom.ppl.value),
            "starters": [],
            "phone": thisBooking.dom.phone.value,
            "address": thisBooking.dom.address.value
        }

        for (let checkbox of thisBooking.dom.starters) {
            if (checkbox.checked) {
                payload.starters.push(checkbox.value)
            }
        }

        const option = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        };

        fetch(url, option)
            .then(function (response) {
                return response.json();
            }).then(function (parsedResponse) {
                console.log('book confirmed:', parsedResponse);

                thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
                thisBooking.updateDOM();
            });
    }



}
export default Booking;