import {settings, select, classNames} from './settings.js'; //importuj obiekt settings z pliku settings.js z tego samego katalogu. Nawiasy {} używamy do importu więcej niż 1 rzeczy i gdy nie jest to rzecz domyślna.
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';
// tylko domyślnie exportowana rzecz może być importowana bez nawiasów klamrowych.

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children; //kontener wszystkich stron. Children to sekcje o id order, main i booking.
    thisApp.navLinks = document.querySelectorAll(select.nav.links); //znajduje wszystkie linki.
    thisApp.navButtons = document.querySelectorAll('.btn-links');
    thisApp.navBar = document.querySelector('.main-nav'); //pasek linków.

    const idFromHash = window.location.hash.replace('#/', ''); 
    //uzyskujemy id podstrony, która ma być otwarta jako domyślna.
    //sprawdzamy każdą z podstron, czy pasuje do uzyskanego id z podstrony:
    let pageMatchingHash = thisApp.pages[0].id; //jeśli adres po # jest błędny to aktywuje się 1sza podstrona. Czyli order u nas.
    for(let page of thisApp.pages){//jeżeli pasuje do id to ta zostanie otwarta.
      if(page.id == idFromHash){
        pageMatchingHash = page.id; 
        break; //hamuje kolejne iteracje pętli - gdy znajdzie pasującą do hasha stronę.
      }
    }
    thisApp.activatePage(pageMatchingHash); //aktywujemy odpowiednią podstronę.
        
    for(let link of thisApp.navLinks){ //nasłuch dla klikniętego linka.
      thisApp.addNavigationButtonListener(link);
    }
    for(let link of thisApp.navButtons){ //nasłuch dla klikniętego buttona-linka.
      thisApp.addNavigationButtonListener(link);
    }
  },

  addNavigationButtonListener(link){
    const thisApp = this;
    link.addEventListener('click', function(event){
      const clickedElement = this;
      event.preventDefault();
      /*get page id from href attribute */
      const id = clickedElement.getAttribute('href').replace('#', ''); //na końcu zamieniamy # na puste znaki bo nie jest częścią id strony. Wówczas pasuje do id podstron - w html wewnątrz każdego section.
      /*run thisApp.activatePage with that id. Aktywacja odpowiedniej podstrony. */
      thisApp.activatePage(id);
      /*change URL hash */
      window.location.hash = '#/' + id; // dzięki #/ strona nie przewija się tam gdzie zaczyna się podsekcja np. order.
    });
  },

  activatePage: function (pageId) { //otrzymujemy informację o id podstrony do aktywacji.
    const thisApp = this;
    if (thisApp.navLinks !== undefined){
      if (pageId == 'welcome'){
        thisApp.navBar.classList.add(classNames.pages.invisible);//pasek linków-zakładek robimy niewidoczny.
      }
      else{
        thisApp.navBar.classList.remove(classNames.pages.invisible);
      }
    }
    /* add class "active" to matching pages, remove from non-matching */
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId); //przy toggle można 2 warunków użyć.
    }
    /* add class "active" to matching links, remove from non-matching */
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active, //będzie nadana lub usunięta klasa active
        link.getAttribute('href') == '#' + pageId // pod tym warunkiem.
      ); //przy toggle można 2 warunków użyć.
    }
  },
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
  initBooking: function (){
    const thisApp = this;
    thisApp.bookingWidget = document.querySelector(select.containerOf.booking); //znajduje kontener widgetu do rezerwacji stron.
    thisApp.booking = new Booking(thisApp.bookingWidget); // nowa instancja klasy Booking.
  },

  init: function () {
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
  },
    
};
app.init();