/* global flatpickr */
import {select, settings} from '/js/settings.js';
import {utils} from '/js/utils.js';
import BaseWidget from './BaseWidget.js';

class DatePicker extends BaseWidget{ // DP jest rozszerzeniem klasy BaseWidget.
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); //odwołanie do konstruktora klasy BaseWidget.
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.datePicker.input);
    thisWidget.initPlugin();
  }
  initPlugin(){
    const thisWidget = this;
    thisWidget.minDate = new Date(thisWidget.value); //new Date tworzy obiekt daty, którego wartość to "teraz".
    thisWidget.maxDate  = utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture); //ma być datą późniejszą od thisWidget.minDate o ilość dni zdefiniowaną w settings.datePicker.maxDaysInFuture.
    utils.dateToStr(new Date());//przekształca obiekt daty na tekst w formacie rok-miesiąc-dzień.
        
    flatpickr(thisWidget.dom.input, { //zainicjować plugin flatpickr. 1szy arg to input, drugi arg to obiekt zawierający opcje pluginu.
      defaultDate: thisWidget.minDate, //domyślna data.
      minDate: thisWidget.minDate,//najwcześniejsza data, którą można wybrać.
      maxDate: thisWidget.maxDate,//najpóźniejsza data do wybrania.   
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      'disable': [ //restauracja jest nieczynna w poniedziałki.
        function(date) { // return true to disable
          return (date.getDay() === 1);
        }
      ],
      onChange: function(dateStr) { //w momencie wykrycia zmiany wartości przez plugin, chcemy ustawiać wartość właściwości thisWidget.value na dateStr z dokumentacji pluginu.
        thisWidget.value = dateStr;
      }      
    }); 
    
  }
  parseValue(value){ //nadpisana metoda, bo wartością tego pluginu nie będzie liczba.
    return value;
  }
  isValid(){ //nie może zostać domyślna z BaseWidget.
    return true; //nie mamy dla niej zastosowania w tym widgecie, ponieważ plugin zajmie się dbaniem o poprawność danych, więc niech po prostu zwraca true.
  }
  renderValue(){ //też nie będzie nam potrzebna tutaj, nadpisujemy.
  }
}

export default DatePicker;