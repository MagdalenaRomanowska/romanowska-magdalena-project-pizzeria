import {select, settings, templates, classNames} from '/js/settings.js'; 
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
        //console.log('bookings:' , bookings);
        //console.log('eventsCurrent:' , eventsCurrent);
        //console.log('eventsRepeat:' , eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;
    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){  //sprawdzamy warunek czy wyrażenie item ma właśc. repeat równe daily. Można tu dać weekly itd.
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){ 
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
        
      }
    }
    //console.log('thisBooking.booked:' , thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){ //oznaczenie zajętości stolika, przez rezerwację.
    const thisBooking = this;
    if(typeof thisBooking.booked[date] == 'undefined'){ //jeśli nie istnieje rezerwacja, to tworzymy obiekt.
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour); //zmienia np. 16:30 na 16.5.

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){ //zajętość stolików w rezerwacji. Po każdej iteracji pętli zwiększamy hourBlock o pół (godziny).
      //console.log('loop:' , hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){//jeśli nie istnieje rezerwacja np o godz 20:00, to tworzymy tablicę.
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);//w obiekcie thisBooking.booked znajdujemy po kluczach date i hourBlock. Przypisanie stolika do danej godziny.
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value; //wartość wybrana przez użytkownika.
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value); //wartość wybrana przez użytkownika.

    let allAvailable = false; //tego dnia o tej godzinie wszystkie stoliki są dostępne. Teraz false.

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined' //jeśli tu dla tej daty nie ma obiektu
      ||  //lub dla tej daty i godziny nie istnieje tablica:
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true; //wszystkie stoliki są dostępne.
    }

    for(let table of thisBooking.dom.tables){ //iterujemy przez wszystkie stoliki na mapie.
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);//pobieram id aktualnego stolika. to tekst bo z elementu DOM.
      if(!isNaN(tableId)){ //jeśli tekst zamienimy na liczbę dzięki parseInt to isNan zwróci false. Negujemy to za pomocą !.
        tableId = parseInt(tableId);
      }
      if( //sprawdza czy nie wszystkie stoliki są dostępne.
        !allAvailable
        && // && to LUB. Poniżej sprawdzam czy tego dnia o tej godz zajęty jest stolik o danym id.
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
        //metoda includes sprawdza czy tableId znajduje się w tej całej tablicy.
      ){//jeśli tak, to dostanie klasę:
        table.classList.add(classNames.booking.tableBooked); 
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
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
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
  }
 
  initWidgets(){ //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
  } 
}

export default Booking;