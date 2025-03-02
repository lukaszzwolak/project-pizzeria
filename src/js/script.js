/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  // Obiekt przechowujący selektory używane w kodzie
  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product'
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
  };

  // Klasy CSS używane w kodzie
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    }
  };

  // Ustawienia aplikacji
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    },
  };

  // Kompilacja szablonów Handlebars
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  // Klasa Product (reprezentująca pojedynczy produkt)
  class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion(); // ✅ DODANO POPRAWIONĄ METODĘ (był błąd "initAccordion is not a function")
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
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

      // Obiekt dom do przechowywania referencji do elementów DOM
      thisProduct.dom = {};
      thisProduct.dom.wrapper = thisProduct.element;
      thisProduct.dom.accordionTrigger = thisProduct.dom.wrapper.querySelector(select.menuProduct.clickable);
      thisProduct.dom.form = thisProduct.dom.wrapper.querySelector(select.menuProduct.form);
      thisProduct.dom.formInputs = thisProduct.dom.form ? thisProduct.dom.form.querySelectorAll(select.all.formInputs) : [];
      thisProduct.dom.cartButton = thisProduct.dom.wrapper.querySelector(select.menuProduct.cartButton);
      thisProduct.dom.priceElem = thisProduct.dom.wrapper.querySelector(select.menuProduct.priceElem);
      thisProduct.dom.imageWrapper = thisProduct.dom.wrapper.querySelector(select.menuProduct.imageWrapper);
      thisProduct.dom.amountWidgetElem = thisProduct.dom.wrapper.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion() {
      const thisProduct = this;

      if (thisProduct.dom.accordionTrigger) {
        thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
          event.preventDefault();

          const activeProduct = document.querySelector(select.all.menuProductsActive);
          if (activeProduct && activeProduct !== thisProduct.dom.wrapper) {
            activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          }

          thisProduct.dom.wrapper.classList.toggle(classNames.menuProduct.wrapperActive);
        });
      }
    }

    initOrderForm() {
      const thisProduct = this;

      if (thisProduct.dom.form) {
        thisProduct.dom.form.addEventListener('submit', function (event) {
          event.preventDefault();
          thisProduct.processOrder();
        });

        for (let input of thisProduct.dom.formInputs) {
          input.addEventListener('change', function () {
            thisProduct.processOrder();
          });
        }
      }

      if (thisProduct.dom.cartButton) {
        thisProduct.dom.cartButton.addEventListener('click', function (event) {
          event.preventDefault();
          thisProduct.processOrder();
        });
      }
    }

    processOrder() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      let price = thisProduct.data.price;

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];

        for (let optionId in param.options) {
          const option = param.options[optionId];

          if (formData[paramId] && formData[paramId].includes(optionId)) {
            if (!option.default) {
              price += option.price;
            }
          } else if (option.default) {
            price -= option.price;
          }

          const optionImage = thisProduct.dom.imageWrapper.querySelector(`.${paramId}-${optionId}`);
          if (optionImage) {
            if (formData[paramId] && formData[paramId].includes(optionId)) {
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }

      price *= thisProduct.amountWidget.value;
      thisProduct.dom.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;

      if (thisProduct.dom.amountWidgetElem) {
        thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem);
        thisProduct.dom.amountWidgetElem.addEventListener('updated', function () {
          thisProduct.processOrder();
        });
      }
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
    }

    getElements(element) {
      const thisWidget = this;
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
      const thisWidget = this;
      let newValue = parseInt(value);
      if (isNaN(newValue)) newValue = settings.amountWidget.defaultValue;
      newValue = Math.min(Math.max(newValue, settings.amountWidget.defaultMin), settings.amountWidget.defaultMax);

      if (thisWidget.value !== newValue) {
        thisWidget.value = newValue;
        thisWidget.input.value = thisWidget.value;
        thisWidget.announce();
      }
    }

    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function () {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener('click', function (event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

    announce() {
      const event = new Event('updated');
      this.element.dispatchEvent(event);
    }
  }

  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};
      thisCart.dom.wrapper = element;

      if (!select.cart.toggleTrigger) {
        console.error("🚨 Błąd: Brak selektora `cart.toggleTrigger` w obiekcie `select`. Sprawdź, czy jest poprawnie wpisany.");
        return;
      }

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      if (!thisCart.dom.toggleTrigger) {
        console.error("🚨 Błąd: Nie znaleziono elementu `toggleTrigger` w wrapperze koszyka.");
      }
    }

    initActions() {
      const thisCart = this;

      if (thisCart.dom.toggleTrigger) {
        thisCart.dom.toggleTrigger.addEventListener('click', function () {
          thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
      } else {
        console.warn("Ostrzeżenie: toggleTrigger jest undefined, event listener nie został dodany.");
      }
    }
  }

  const app = {
    initMenu() {
      for (let productData in dataSource.products) {
        new Product(productData, dataSource.products[productData]);
      }
    },

    initCart() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      console.log('Koszyk działa!', thisApp.cart);
    },

    init() {
      this.initMenu();
      this.initCart();
    },
  };

  app.init();
}
