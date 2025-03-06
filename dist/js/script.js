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
    cartProduct: {
      amountWidget: '.widget-amount',
      priceElem: '.cart__product-price',
      edit: 'a[href="#edit"]',
      remove: 'a[href="#remove"]',
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
    deliveryFee: 20,
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
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
      const event = new CustomEvent('updated', { bubbles: true });
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
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    }
    initActions() {
      const thisCart = this;

      if (thisCart.dom.toggleTrigger) {
        thisCart.dom.toggleTrigger.addEventListener('click', function () {
          thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
        });
      }

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });

      // Nasłuchiwacz na formularz zamówienia
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        console.log('Zamówienie zostało złożone!');
        thisCart.sendOrder();
      });
    }
    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.form.querySelector(select.cart.address).value,
        phone: thisCart.dom.form.querySelector(select.cart.phone).value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.totalPrice - settings.deliveryFee,
        totalNumber: thisCart.products.length,
        deliveryFee: settings.deliveryFee,
        products: [],
      };

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }

      console.log('Zamówienie:', payload);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      fetch(url, options);
    }


    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM, thisCart));

      thisCart.update();
    }
    update() {
      const thisCart = this;

      // Pobranie wartości kosztu dostawy
      const deliveryFee = settings.deliveryFee || 20;

      // Inicjalizacja zmiennych
      let totalNumber = 0;
      let subtotalPrice = 0;

      // Iteracja przez produkty w koszyku
      for (let cartProduct of thisCart.products) {
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }

      // Obliczenie całkowitej ceny zamówienia (z kosztami dostawy)
      if (totalNumber > 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      // Aktualizacja liczby sztuk i ceny w HTML
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;

      // Obsługa wielu elementów `totalPrice`
      if (thisCart.dom.totalPrice) {
        const totalPriceElements = document.querySelectorAll(select.cart.totalPrice);
        for (let elem of totalPriceElements) {
          elem.innerHTML = thisCart.totalPrice;
        }
      }

      // Osobna pętla warunkowa dla kosztu dostawy
      if (totalNumber > 0) {
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      } else {
        thisCart.dom.deliveryFee.innerHTML = 0;
      }

      // Logowanie wartości do konsoli dla testów
      console.log('Total Number:', totalNumber);
      console.log('Subtotal Price:', subtotalPrice);
      console.log('Delivery Fee:', thisCart.dom.deliveryFee.innerHTML);
      console.log('Total Price:', thisCart.totalPrice);
    }
    remove(cartProduct) {
      const thisCart = this;
      //szukanie indeksu w tablicy
      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
      }
      /*usuniecie reprezentacji produktu z htmla*/
      cartProduct.dom.wrapper.remove();
      /*aktualizacja koszyka po usunieciu produktu */
      thisCart.update();
    }
  }


  class CartProduct {
    constructor(menuProduct, element, cart) {
      const thisCartProduct = this;
      thisCartProduct.cart = cart;

      // Przypisanie właściwości z `menuProduct`
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.params = menuProduct.params;

      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
    getElements(element) {
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.priceElem);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.amount * thisCartProduct.priceSingle;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        thisCartProduct.cart.update();
      });
    }

    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', (event) => {
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', (event) => {
        event.preventDefault();
        thisCartProduct.remove();
      });
    }

    getData() {
      const thisCartProduct = this;
      return {
        id: thisCartProduct.id,
        name: thisCartProduct.name,
        amount: thisCartProduct.amount,
        priceSingle: thisCartProduct.priceSingle,
        price: thisCartProduct.price,
        params: thisCartProduct.params
      };
    }
  }
  const app = {
    initData() {
      const thisApp = this;
      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          console.log('Pobrane produkty:', data);
          thisApp.data.products = data;
          thisApp.initMenu();
        })
        .catch(error => {
          console.error('Błąd pobierania danych:', error);
        });
    },
    initMenu() {
      const thisApp = this;
      if (!thisApp.data.products) return;

      for (let productData of thisApp.data.products) {
        new Product(productData.id, productData);
      }
    },
    initCart() {
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },
    init() {
      this.initData();
      this.initCart();
    },
  };
  app.init();
}
