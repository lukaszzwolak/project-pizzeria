import { settings, select } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

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

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });
  },
  init() {
    this.initData();
    this.initCart();
  },
};
app.init();

