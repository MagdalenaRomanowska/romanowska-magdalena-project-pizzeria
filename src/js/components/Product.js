import {select, classNames, templates} from '/js/settings.js'; 
import {utils} from '/js/utils.js';
import AmountWidget from './AmountWidget.js';

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
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);       
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
    //console.log('thisProduct.params:' , thisProduct.params);
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
    
    //app.cart.add(thisProduct); //in class Cart as method: add(menuProduct)
    
    //poniżej kod, dzięki któremu nie musimy wykorzystywać obiektu app w Product.js.
    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    }); //CustomEvent już istnieje w JS, jest wbudowana w przeglądarkę.
    thisProduct.element.dispatchEvent(event); //tu na elemencie thisProduct wywołujemy stworzony wyżej event.
    //nasłuchujemy go w app.js w metodzie initCart.
  }
}

export default Product;