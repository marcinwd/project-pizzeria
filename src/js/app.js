import {settings, select, classNames, templates} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  //instancja do klasy Product
  initMenu: function () {
    const thisApp = this;
    //START LOOP creating an instance to each product
    for (let productData in thisApp.data.products) {
      //new Product(productData, thisApp.data.products[productData]);
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      //END LOOP
    }
  },

  // taking data from data.js-> dataSource.Products
  initData: function () {
    const thisApp = this;
    //thisApp.data = dataSource; //change from mod 9.7 below
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    console.log('url: ', url);

    
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
        //save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        // execute initMenu method
        thisApp.initMenu();
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  
  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    console.log('classNames:', classNames);
    console.log('settings:', settings);
    console.log('templates:', templates);

    thisApp.initData();
    thisApp.initCart();
  },
};
app.init();
