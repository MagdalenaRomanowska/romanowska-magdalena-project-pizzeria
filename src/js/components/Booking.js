import {select, templates} from '/js/settings.js'; 
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';

class Booking {
  constructor(bookingWidget) {
    const thisBooking = this;
    thisBooking.render(bookingWidget);
    thisBooking.initWidgets();
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
  }
 
  initWidgets(){ //we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget, którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
  } 
}

export default Booking;