import {settings, select} from './settings.js'; //importuj obiekt settings z pliku settings.js z tego samego katalogu. Nawiasy {} używamy do importu więcej niż 1 rzeczy i gdy nie jest to rzecz domyślna.
import Product from './components/Product.js';
import Cart from './components/Cart.js';
// tylko domyślnie exportowana rzecz może być importowana bez nawiasów klamrowych.

const app = {
  initMenu: function () {
    const thisApp = this;
    //console.log('thisApp.data: ', thisApp.data);
    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;

    fetch(url)  //Najpierw za pomocą funkcji fetch wysyłamy zapytanie pod podany adres endpointu.
      .then(function(rawResponse){
        return rawResponse.json(); //Następnie otrzymaną odpowiedź konwertujemy z JSONa na tablicę.
      })
      .then(function(parsedResponse){ //Wreszcie, po otrzymaniu skonwertowanej odpowiedzi parsedResponse
        console.log('parsedResponse' , parsedResponse); //wyświetlamy ją w konsoli.
        /*save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;
        /*execute initMenu method */
        thisApp.initMenu(); //tutaj ta metoda, bo inaczej uruchamiałaby się zanim nasz skrypt otrzymałby z serwera listę produktów.
      });
    console.log('thisApp.data' , JSON.stringify(thisApp.data));
  },
  initCart: function () {
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem); // outside app we call it by: app.cart.
    
    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){ //event add-to-cart stworzony w Product.js.
      app.cart.add(event.detail.product); //event posiada obiekt detail z właściwością product. 
    }); 

  },
  init: function () {
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initData();
    thisApp.initCart();
  },
    
};
app.init();