/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
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
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }
    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      console.log('generatedHTML:', generatedHTML);
      /*create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /*find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
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
      console.log('initOrderForm');
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
      });
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // read all data from the form   
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
      console.log('price: ' , price);
      thisProduct.priceElem.innerHTML = price; /* set the contents of thisProduct.priceElem to be the value of variable price */
    }
  }

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
