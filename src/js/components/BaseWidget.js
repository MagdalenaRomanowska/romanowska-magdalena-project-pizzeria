class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;
    
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;
  }

  get value(){ //geter -metoda wykonywana przy każdej próbie odczytania właćsiwości value.
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(value){//seter-metoda wykonywana przy każdej próbie ustawienia nowej wartości właściwości value.
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    if(newValue != thisWidget.correctValue /*add validation */
        && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  setValue(value){
    const thisWidget = this;
    thisWidget.value = value; //ten zapis powoduje wykonanie setera, który ustawi nową wartość tylko jeżeli jest ona poprawna.
  }

  parseValue(value){ //ustawiamy typ danych
    return parseInt(value);
  }

  isValid(value){
    return !isNaN(value); //isNan sprawdza czy przekazana wartość jest nie-liczbą.
  }

  renderValue(){ 
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}
  

export default BaseWidget;