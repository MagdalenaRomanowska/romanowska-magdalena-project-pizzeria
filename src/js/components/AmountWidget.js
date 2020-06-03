import {select, settings} from '/js/settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{ // Am jest rozszerzeniem klasy BaseWidget.
  constructor(element){
    super(element, settings.amountWidget.defaultValue); //odwołanie do konstruktora klasy BaseWidget.
    //element zamiast wrapperElement w BaseWidget oraz sett... jako initialValue tutaj.
    const thisWidget = this;
    thisWidget.getElements(element);
    thisWidget.initActions();
  }
    
  getElements(){
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  
  isValid(value){
    return !isNaN(value) //isNan sprawdza czy przekazana wartość jest nie-liczbą.
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){ 
    const thisWidget = this; 
    thisWidget.dom.input.value = thisWidget.value;//przypisanie wartości widgetu do wartości inputa.
  }

  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value -1;
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.value = thisWidget.value +1;
    });
  }
}

export default AmountWidget;