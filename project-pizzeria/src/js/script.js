/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', 
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', 
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, 
    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();     
      //console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); /*generate HTML based on template */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); /*create element using utils.createElementFromHTML */      
      const menuContainer = document.querySelector(select.containerOf.menu); /*find menu container */      
      menuContainer.appendChild(thisProduct.element); /*add element to menu */
    }

    getElements() {
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;      
      function clickListener() {  /* START: click event listener to trigger */
        thisProduct.accordionTrigger.addEventListener('click', clickHandler);
      }
      function clickHandler(event) {
        event.preventDefault();
        thisProduct.element.classList.toggle('active'); // active class goes to: ".product active"
        const activeProducts = document.querySelectorAll('.product.active');
        for (let activeProduct of activeProducts) {        
          if (activeProduct != thisProduct.element) { /* START: if the active product isn't the element of thisProduct */
            activeProduct.classList.remove('active');
          } else {
            activeProduct.classList.add('active');
          }
        }
      }
      clickListener();
    }

    initOrderForm() {   //copy from kodilla
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // read all data from the form   
      thisProduct.params = {};
      let price = thisProduct.data.price;  // set variable price to equal thisProduct.data.price          
      for(let paramId in thisProduct.data.params) {  /* START LOOP: for each paramId in thisProduct.data.params */         
        const param = thisProduct.data.params[paramId]; /* save the element in thisProduct.data.params with key paramId as const param */           
        for(let optionId in param.options) { /* START LOOP: for each optionId in param.options */             
          const option = param.options[optionId]; /* save the element in param.options with key optionId as const option */                
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1; //W stałej optionSelected sprawdzamy, czy istnieje formData[paramId], a jeśli tak, to czy ta tablica zawiera klucz równy wartości optionId.               
          const productsImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
          if(optionSelected && !option.default){  /* START IF: if option is selected and option is not default */ 
            price = price + option.price; /* add price of option to variable price */
          }                    
          else if(!optionSelected && option.default) { /* START ELSE IF: if option is not selected and option is default */
            price = price - option.price; /* deduct price of option from price */                   
          }  
          if(optionSelected){
            if(!thisProduct.params[paramId]){ 
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label;

            for(let productsImage of productsImages){
              productsImage.classList.add(classNames.menuProduct.imageVisible);
            }
          } 
          else{
            for(let productsImage of productsImages){
              productsImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }                 
        }                    
      }                   
      thisProduct.priceSingle = price; 
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value; /*multiply price by amount */
      thisProduct.priceElem.innerHTML = thisProduct.price; /* set the contents of thisProduct.priceElem to be the value of variable price */
      console.log('thisProduct.params:' , thisProduct.params);
    }
    
    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.amount = thisProduct.amountWidget.value;
      app.cart.add(thisProduct); //in class Cart as method: add(menuProduct)
    }

  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      //console.log('AmountWidget:' , AmountWidget);
      //console.log('constructor arguments:' , element);
    }
    
    getElements(element){
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    announce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      if(newValue != thisWidget.value /*add validation */
        && newValue >= settings.amountWidget.defaultMin 
        && newValue <= settings.amountWidget.defaultMax){
        thisWidget.value = newValue;
        thisWidget.announce();
      }
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      });
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;
      thisCart.products = [];  //products added to basket
      thisCart.getElements(element);
      thisCart.initActions();
      console.log('new Cart' , thisCart);
    }

    getElements(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
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
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct); /*generate HTML based on template */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML); /*create DOM using utils.createElementFromHTML */      
      thisCart.dom.productList.appendChild(generatedDOM); /*add element to cart */
      console.log('adding product' , menuProduct);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));//jednocześnie nowa instancja klasy new CartProduct oraz dodamy ją do tablicy thisCart.products
      console.log('thisCart.products' , thisCart.products);
    }
  }

  class CartProduct{
    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      console.log('new CartProduct' , thisCartProduct);
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', clickHandler);
        function clickHandler(event) {
          event.preventDefault();
          thisCartProduct.amount = thisCartProduct.amountWidget.value;
          thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
          thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        }
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      //console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    initCart: function () {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem); // outside app we call it by: app.cart
    },
    init: function () {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
    

  };
  app.init();
}
