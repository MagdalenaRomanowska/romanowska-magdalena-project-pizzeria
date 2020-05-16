import {select, settings, templates} from '/js/settings.js'; 
import {utils} from '/js/utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(bookingWidget) {
    const thisBooking = this;
    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
    thisBooking.getData();
  }

  getData (){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = { //parametry adresów z settings.js
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [ //dla cyklicznego tylko końcowa data.
        settings.db.repeatParam,
        endDateParam,
      ],
    };
    //console.log('getData params:' , params);
    const urls = { //generujemy adresy do API.
      booking:        settings.db.url + '/' + settings.db.booking 
                                            + '?' + params.booking.join('&'), //łączymy wszystkie elementy z tablicy powyżej.
      eventsCurrent:  settings.db.url + '/' + settings.db.event 
                                            + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:   settings.db.url + '/' + settings.db.event 
                                            + '?' + params.eventsRepeat.join('&'),
    };
    //console.log('urls:' , urls);
    Promise.all([
      fetch(urls.booking), //łączymy się z serwerem.
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0]; //1szy arg tablicy allResponses.
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      }).then(function([bookings, eventsCurrent, eventsRepeat]){ //ten zapis: potraktuj 1szy element jako tablicę i 1szy element zapisz w zmiennej bookings.
        console.log('bookings:' , bookings);
        console.log('eventsCurrent:' , eventsCurrent);
        console.log('eventsRepeat:' , eventsRepeat);
      });
  }

  render(bookingWidget) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {}; //stworzyć pusty obiekt thisBooking.dom
    thisBooking.dom.wrapper = bookingWidget;  //zapisywać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi.
    thisBooking.dom.wrapper.innerHTML = generatedHTML; //zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu.
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount); //we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount.
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount); //analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount.
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
  }
 
  initWidgets(){ //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
  } 
}

export default Booking;