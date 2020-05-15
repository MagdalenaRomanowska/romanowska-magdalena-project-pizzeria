/* global rangeSlider */
import {select, settings} from '/js/settings.js';
import {utils} from '/js/utils.js';
import BaseWidget from './BaseWidget.js';

class HourPicker extends BaseWidget{ // HP jest rozszerzeniem klasy BaseWidget.
  constructor(wrapper){
    super(wrapper, settings.hours.open); 
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output);
    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;
  }
  initPlugin(){
    const thisWidget = this;
    rangeSlider.create(thisWidget.dom.input); //uruchomienie pluginu.
    thisWidget.dom.input.addEventListener('input', function(){    
      thisWidget.value = thisWidget.dom.input.value;
    });
  }
  parseValue(){ 
    const thisWidget = this;
    const result = utils.numberToHour(thisWidget.dom.input.value);//zamienia liczby na zapis godzinowy, czyli np. 12 na '12:00'.
    return result;
  }

  isValid(){ //nie może zostać domyślna z BaseWidget.
    return true; //nie mamy dla niej zastosowania w tym widgecie, ponieważ plugin zajmie się dbaniem o poprawność danych, więc niech po prostu zwraca true.
  }
  renderValue(){ //ma zamieniać zawartość elementu thisWidget.dom.output na wartość widgetu.
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value;
  }
}

export default HourPicker;