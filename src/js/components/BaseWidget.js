class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;    
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  //getter i setter - 'użycie' metody jako właściwości.
  get value(){ //geter -metoda wykonywana przy każdej próbie odczytania właściwości value.
    const thisWidget = this;
    return thisWidget.correctValue;
  }

  set value(v){//seter-metoda wykonywana przy każdej próbie ustawienia nowej wartości właściwości value.
    const thisWidget = this;
    const newValue = thisWidget.parseValue(v);
    if(newValue != thisWidget.correctValue /*add validation */
        && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  // setValue(v){
  // const thisWidget = this;
  // thisWidget.value = v; //ten zapis powoduje wykonanie setera, który ustawi nową wartość tylko jeżeli jest ona poprawna.
  // }

  parseValue(v){ //ustawiamy typ danych
    return parseInt(v);//Przetwarza argument w postaci łańcucha znaków i zwraca liczbę całkowitą typu integer.
  }

  isValid(v){
    return !isNaN(v); //isNan sprawdza czy przekazana wartość jest nie-liczbą.
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