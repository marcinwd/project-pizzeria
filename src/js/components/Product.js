import { select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from '../components/AmountWidget.js';

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

    console.log('new product: ', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;
    /*generate HTML based on template*/
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /*create element usinf utils.creatElementFromHTML*/
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /*find menu container*/
    const menuContainer = document.querySelector(select.containerOf.menu);
    /*add element to menu*/
    menuContainer.appendChild(thisProduct.element);
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
    /* find the clickable trigger (the element that should react to clicking) */
    const trigger = thisProduct.accordionTrigger;
    /* START: click event listener to trigger */
    trigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct (use toggle function)*/
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); //could be (classNames.menuProduct.wrapperActive)
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
    }
      /* END: click event listener to trigger */
    );
  }

  //mod 8.5 
  initOrderForm() {
    const thisProduct = this;
    //console.log('initOrderForm: ', this);

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function () {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  //mod 8.5 
  processOrder() {
    const thisProduct = this;

    /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);
    thisProduct.params = {};
    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;
    /* START LOOP: for each paramId in thisProduct.data.params */
    for (let paramId in thisProduct.data.params) {
      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      /* START LOOP: for each optionId in param.options */
      for (let optionId in param.options) {
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        /* START IF: if option is selected and option is not default */
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        if (optionSelected && !option.default) {
          /* add price of option to variable price */
          price += option.price;
          /* END IF: if option is selected and option is not default */
        }
        /* START ELSE IF: if option is not selected and option is default */
        else if (!optionSelected && option.default) {
          /* deduct price of option from price */
          price -= option.price;
          /*END else if*/
        }
        /*START IF/ELSE mod 8.6: visible not visible pics*/
        /* create const with ALL images*/
        const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

        //if the option is selected
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          //add class active
          for (let image of images) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          //remove class active
          for (let image of images) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        /*END LOOP optionId*/
      }
      /*END LOOP paramId*/
    }
    //multiply price by amount
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    //console.log('Product elements: ', thisProduct.params);
  }

  //mod 9.3 sending prduct to cart
  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    //app.cart.add(thisProduct);
    //mod10.1 video1 new code start
    const event = new CustomEvent('add-to-cart', {
      bubbles: 'true',
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
    //mod10.1 video1 new code end
  }
}

export default Product;