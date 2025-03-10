import { select, classNames, settings, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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

export default Cart;