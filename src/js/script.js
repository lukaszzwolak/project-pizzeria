/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: "#template-menu-product",
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
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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

      console.log('new Product: ', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      const menuContainer = document.querySelector(select.containerOf.menu);

      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }

    initAccordion() {
      const thisProduct = this;

      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        console.log('clicked');
        /* prevent default action for event */
        event.preventDefault();
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
      console.log('Accordion initialized for product: ', thisProduct.id);
    }

    initOrderForm() {
      console.log('initOrderForm worked', this.initOrderForm);

      const thisProduct = this;

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder() {
      console.log('processOrder worked', this.processOrder);

      const thisProduct = this;

      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);

      //ustaw cene na cene domyslna
      let price = thisProduct.data.price;
      //dla kazdej kategorii (param)...
      for (let paramId in thisProduct.data.params) {
        //określ wartość parametru, np. paramId = 'toppings', param = { label: 'Toppings', wpisz: 'checkboxs'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);

        //dla kazdej opcji w tej kategorii
        for (let optionId in param.options) {
          //okresl wartosc opci np. optionId = 'olives', option = {label: 'Toppings', type: 'checkboxes'...}
          const option = param.options[optionId];
          console.log(optionId, option);

          // sprawdzamy, czy w formData istnieje właściwość o nazwie paramId
          // i czy zawiera ona nazwę sprawdzanej opcji (czyli czy opcja została wybrana)
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            // opcja jest zaznaczona – teraz sprawdzamy, czy nie jest opcją domyślną
            if (!option.default) {
              // opcja zaznaczona, ale niedomyślna – zwiększamy cenę o koszt opcji
              price += option.price;
            }
          } else if (option.default) {
            // opcja nie jest zaznaczona, ale jest domyślna – odejmujemy koszt opcji (bo domyślna cena już ją zawiera)
            price -= option.price;
          }
        }
      }
      console.log('Total pizza price: ', price);
      //aktualizacja obliczonej ceny w HTML
      thisProduct.priceElem.innerHTML = price;
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

      //generowanie html
      const generatedHTML = templates.menuProduct(thisApp.data);
      //tworzenie elementu DOM
      const element = utils.createDOMFromHTML(generatedHTML);
      //szukanie kontener menu
      const menuContainer = document.querySelector(select.containerOf.menu);
      //dodawanie stworzony element na strone
      menuContainer.appendChild(element);

      // console.log('Template element (w initData):', document.querySelector(select.templateOf.menuProduct));
      // console.log('Menu container (w initData):', document.querySelector(select.containerOf.menu));
      // console.log('Form inputs (w initData):', document.querySelectorAll(select.all.formInputs));
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

  // console.log('Template element:', document.querySelector(select.templateOf.menuProduct));
  // console.log('Menu container:', document.querySelector(select.containerOf.menu));
  // console.log('Form inputs:', document.querySelectorAll(select.all.formInputs));

  app.init();
}
