import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
    thisBooking.bookTable(); // usunac po presunieciu do initWidget
    thisBooking.selectTable();
  }

  selectTable(table) {
    const thisBooking = this;

    for (let table of thisBooking.dom.tables) {
      table.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('table clicked');

        let tableId = table.getAttribute(settings.booking.tableIdAttribute);

        if (!table.classList.contains(classNames.booking.tableBooked)) {
          alert('the table has been booked');
          thisBooking.tableSelected = tableId;
        }

        if (table.classList.comtains(classNames.booking.tableBooked)) {
          alert('THIS TABLE IS ALREADY BOOKED, CHOOSE ANOTHER ONE.');

        }



      });
    }

    let clickedTableId = table.getAttribute(settings.booking.tableIdAttribute);

    if (table.classList.contains(classNames.booking.tableBooked)) {
      alert('TABLE ALREADY BOOKED, PLEASE CHOOSE ANOTHER ONE');
    } else {
      table.classList.add(classNames.booking.tableBooked);
      alert('Table has been booked');
      thisBooking.clickedTableId = table.getAttribute(settings.booking.tableIdAttribute);
    }
  }

  // zad mod 11.2 eventListener do przycisku wysyłającego booking
  // !! przesunac do init widget
  bookTable() {
    const thisBooking = this;

    thisBooking.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      console.log('mod 11.2 form submit: ', 'submit');
      thisBooking.sendBooking();
    });
  }



  getData() {

    const thisBooking = this;

    const startSateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startSateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startSateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params: ', params);

    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
    };
    // console.log(' getData urls: ', urls);



    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ]).then(function (allResponses) {
      const bookingsResponse = allResponses[0];
      const eventsCurrentResponse = allResponses[1];
      const eventsRepeatResponse = allResponses[2];

      return Promise.all([
        bookingsResponse.json(),
        eventsCurrentResponse.json(),
        eventsRepeatResponse.json(),
      ]);
    })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
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

    // console.log('thisBooking.booked: ', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      // console.log('loop: ', hourBlock);
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);

    }
  }

  updateDOM() {
    const thisBooking = this;
    console.log('updateDOM is working');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
    //console.log('updateDOM: ', thisBooking.date);
    //console.log('updateDOM: ', thisBooking.hour);
  }

  render(element) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);
    // mod 11.2 
    thisBooking.dom.form = element.querySelector(select.booking.form);

  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
  }

}
export default Booking;