import {select, classNames, templates, settings} from '/js/settings.js'; 
import {utils} from '/js/utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.products = [];  //products added to basket
    thisCart.getElements(element);
    thisCart.initActions();
    //console.log('new Cart' , thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

    for(let key of thisCart.renderTotalsKeys){
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
  }

  initActions(){
    const thisCart = this;
    function clickListener() {  
      thisCart.dom.toggleTrigger.addEventListener('click', clickHandler);
    }
    function clickHandler(event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); 
    }
    clickListener();

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  sendOrder(){   //tu kilka stałych, które będą nam potrzebne do wysłania zapytania do API.
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order; //endpoint address.

    const payload = { //"ładunek" wysyłany do serwera.
      totalPrice: thisCart.totalPrice,
      phone: thisCart.dom.phone,
      address: thisCart.dom.address,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };

    for(let productForAPI of thisCart.products){
      const resultOfGetData = productForAPI.getData();
      payload.products.push(resultOfGetData);
    }

    const options = { //zawiera opcje, które skonfigurują zapytanie.
      method: 'POST', //POST służy do wysyłania nowych danych do API.
      headers: {
        'Content-Type': 'application/json',  //ustawiamy nagłówek, by serwer wiedział, że wysyłamy dane w postaci JSONa.
      },
      body: JSON.stringify(payload),  //Ostatni z nagłówków to body, czyli treść którą wysyłamy. 
      //Używamy tutaj metody JSON.stringify, aby przekonwertować obiekt payload na ciąg znaków w formacie JSON.
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse' , parsedResponse);
      });
  }

  remove(cartProduct){ //remove from basket
    const thisCart = this;
    const index = thisCart.products.indexOf(cartProduct);
    console.log('index:' , index);
    const removedElement = thisCart.products.splice(index, 1);//usunięcie elementu o tym indeksie z tablicy
    console.log('removedElement:' , removedElement);
    cartProduct.dom.wrapper.remove();//usunąć z DOM element cartProduct.dom.wrapper
    thisCart.update();
  }

  add(menuProduct){
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct); /*generate HTML based on template */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML); /*create DOM using utils.createElementFromHTML */      
    thisCart.dom.productList.appendChild(generatedDOM); /*add element to cart */
    //console.log('adding product' , menuProduct);
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));//jednocześnie nowa instancja klasy new CartProduct oraz dodamy ją do tablicy thisCart.products
    //console.log('thisCart.products' , thisCart.products);
    thisCart.update();
  }

  update(){ //updated basket
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    for (let oneProduct of thisCart.products){
      thisCart.subtotalPrice += oneProduct.price;
      thisCart.totalNumber += oneProduct.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    console.log('thisCart.totalNumber' , thisCart.totalNumber);
    console.log('thisCart.subtotalPrice' , thisCart.subtotalPrice);
    console.log('thisCart.totalPrice' , thisCart.totalPrice);
    for (let key of thisCart.renderTotalsKeys){
      for (let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }
}

export default Cart;