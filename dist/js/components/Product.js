import { select, classNames, templates } from "../settings.js";
import utils from '../utils.js';
import AmountWidget from "./AmountWidget.js";

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
        thisProduct.priceSingle = price;
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

        //  app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        }
        );
        thisProduct.element.dispatchEvent(event);
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

export default Product;