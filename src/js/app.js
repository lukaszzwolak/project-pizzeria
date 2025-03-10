import { settings, select, classNames } from "./settings.js";
import Product from "./components/Product.js";
import Cart from "./components/Cart.js";

const app = {
  initPages() {
    const thisApp = this;

    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    console.log("Podstrony:", thisApp.pages); // ✅ Sprawdzenie w konsoli

    const idFromHash = window.location.hash.replace('#/', '');
    console.log('idFromHash', idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(idFromHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute*/
        const id = clickedElement.getAttribute('href').replace('#', '');

        console.log("Kliknięto link:", id); // ✅ Sprawdzenie w konsoli

        /* run thisApp.activePage with that id*/
        thisApp.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  },

  activatePage: function (pageId) {
    const thisApp = this;
    console.log("Aktywowana strona:", pageId); // ✅ Dodaj logowanie

    /* add class "active" to matching pages, remove from non-matching*/
    for (let page of thisApp.pages) {
      console.log("Strona przed zmianą:", page.id, page.classList);
      page.classList.toggle(classNames.pages.active, page.id == pageId);
      console.log("Klasy strony:", page.classList); // ✅ Logowanie klas

    }
    /* add class "active" to matching links, remove from non-matching*/
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
    const bookingPage = document.querySelector("#booking");
    console.log("Booking display:", getComputedStyle(bookingPage).display);
  },
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
    this.initPages();
    this.initData();
    this.initCart();
  },
};
app.init();

