// Obiekt przechowujący selektory używane w kodzie
export const select = {
    templateOf: {
        menuProduct: '#template-menu-product',
        cartProduct: '#template-cart-product',
        bookingWidget: '#template-booking-widget', // Dodane dla systemu rezerwacji
    },
    containerOf: {
        menu: '#product-list',
        cart: '#cart',
        pages: '#pages', // Dodane dla systemu rezerwacji
        booking: '.booking-wrapper', // Dodane dla systemu rezerwacji
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
        datePicker: { // Dodane dla systemu rezerwacji
            wrapper: '.date-picker',
            input: `input[name="date"]`,
        },
        hourPicker: { // Dodane dla systemu rezerwacji
            wrapper: '.hour-picker',
            input: 'input[type="range"]',
            output: '.output',
        },
    },
    booking: { // Dodane dla systemu rezerwacji
        peopleAmount: '.people-amount',
        hoursAmount: '.hours-amount',
        tables: '.floor-plan .table',
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
    nav: { // Dodane dla systemu rezerwacji
        links: '.main-nav a',
    },
};

// Klasy CSS używane w kodzie
export const classNames = {
    menuProduct: {
        wrapperActive: 'active',
        imageVisible: 'active',
    },
    cart: {
        wrapperActive: 'active',
    },
    booking: { // Dodane dla systemu rezerwacji
        loading: 'loading',
        tableBooked: 'booked',
    },
    nav: { // Dodane dla systemu rezerwacji
        active: 'active',
    },
    pages: { // Dodane dla systemu rezerwacji
        active: 'active',
    },
};

// Ustawienia aplikacji
export const settings = {
    amountWidget: {
        defaultValue: 1,
        defaultMin: 0,
        defaultMax: 10,
    },
    deliveryFee: 20,
    hours: { // Dodane dla systemu rezerwacji
        open: 12,
        close: 24,
    },
    datePicker: { // Dodane dla systemu rezerwacji
        maxDaysInFuture: 14,
    },
    booking: { // Dodane dla systemu rezerwacji
        tableIdAttribute: 'data-table',
    },
    db: {
        url: '//localhost:3131',
        products: 'products',
        orders: 'orders',
        bookings: 'bookings', // Dodane dla systemu rezerwacji
        events: 'events', // Dodane dla systemu rezerwacji
        dateStartParamKey: 'date_gte', // Dodane dla systemu rezerwacji
        dateEndParamKey: 'date_lte', // Dodane dla systemu rezerwacji
        notRepeatParam: 'repeat=false', // Dodane dla systemu rezerwacji
        repeatParam: 'repeat_ne=false', // Dodane dla systemu rezerwacji
    },
};

// Kompilacja szablonów Handlebars
export const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    bookingWidget: Handlebars.compile(document.querySelector(select.templateOf.bookingWidget).innerHTML),
};
