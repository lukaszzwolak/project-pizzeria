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
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu() {
      const thisProduct = this;
      thisProduct.element = utils.createDOMFromHTML(templates.menuProduct(thisProduct.data));
      document.querySelector(select.containerOf.menu).appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      thisProduct.dom = {
        wrapper: thisProduct.element,
        accordionTrigger: thisProduct.element.querySelector(select.menuProduct.clickable),
        form: thisProduct.element.querySelector(select.menuProduct.form),
        formInputs: thisProduct.element.querySelectorAll(select.all.formInputs),
        cartButton: thisProduct.element.querySelector(select.menuProduct.cartButton),
        priceElem: thisProduct.element.querySelector(select.menuProduct.priceElem),
        imageWrapper: thisProduct.element.querySelector(select.menuProduct.imageWrapper),
        amountWidgetElem: thisProduct.element.querySelector(select.menuProduct.amountWidget)
      };
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
          thisProduct.addToCart();
        });
      }
    }

    processOrder() {
      const thisProduct = this;
      let price = thisProduct.data.price;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);

      for (let paramId in thisProduct.data.params) {
        for (let optionId in thisProduct.data.params[paramId].options) {
          const option = thisProduct.data.params[paramId].options[optionId];
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
      // aktualizacja ceny jednostkowej
      thisProduct.priceSingle = price;

      // aktualizacja ceny w HTMLu
      thisProduct.dom.priceElem.innerHTML = price * thisProduct.amountWidget.value;
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

    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      console.log('podsumowanie produktu: ', productSummary);
      app.cart.add(productSummary);
    }

    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.dom.form);
      const params = {};

      for (let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
        params[paramId] = {
          label: param.label,
          options: {}
        };
        for (let optionId in param.options) {
          const option = param.options[optionId];
          if (formData[paramId] && formData[paramId].includes(optionId)) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
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
      let newValue = parseInt(value) || settings.amountWidget.defaultValue;
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
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    initActions() {
      const thisCart = this;

      if (thisCart.dom.toggleTrigger) {
        thisCart.dom.toggleTrigger.addEventListener('click', function () {
          thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
      }
    }

    add(menuProduct) {
      const thisCart = this;

      /*wygenerowanie kodu html*/
      const generatedHTML = templates.cartProduct(menuProduct);

      /* zamiana kodu html na element DOM */
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* dodanie elementu do listy w koszyku */
      thisCart.dom.productList.appendChild(generatedDOM);

      /* przechowywanie produkttow w koszyku */
      thisCart.products.push(menuProduct);

      console.log('produkt dodany do koszyka:', thisCart.products);
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      //przypisanie wlasciwosci z menuProduct
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      console.log('instancja CartProduct: ', thisCartProduct);
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
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
