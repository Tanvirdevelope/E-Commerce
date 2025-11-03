const menuIcon = document.getElementById
("menu-icon")
const menu = document.getElementById
("menu")

menuIcon?.addEventListener("click", () => {
    if(menu.className === "hidden"){
        menu.classList.remove("hidden");
    }
    else{
        menu.classList.add("hidden");
    }
}) 

// --- Simple cart functionality using localStorage ---
const CART_KEY = "te_cart";

function getCart(){
    try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }catch(e){ return []; }
}
function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}
function currency(n){
    return `$${Number(n || 0).toFixed(2)}`;
}
function cartTotals(cart){
    const subtotal = cart.reduce((s,i) => s + i.price * i.qty, 0);
    return { qty: cart.reduce((s,i)=>s+i.qty,0), subtotal };
}
function updateCartNav(){
    const cart = getCart();
    const { qty, subtotal } = cartTotals(cart);
    const cartIcon = document.querySelector('.nav-lower .fa-cart-shopping');
    if(!cartIcon) return;
    const cartLink = cartIcon.closest('a');
    if(!cartLink) return;
    cartLink.innerHTML = `<span><i class="fa-solid fa-cart-shopping"></i></span> Cart ${qty} Products - ${currency(subtotal)}`;
}

function addToCart(item){
    const cart = getCart();
    const index = cart.findIndex(p => p.id === item.id);
    if(index >= 0){ cart[index].qty += item.qty; }
    else { cart.push(item); }
    saveCart(cart);
    updateCartNav();
}

function bindAddToCartButtons(){
    const buttons = document.querySelectorAll('.product__button');
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Only intercept if it looks like an add-to-cart action
            const isAdd = /add to cart/i.test(btn.textContent || '');
            if(!isAdd) return;
            e.preventDefault();
            const productEl = btn.closest('.product') || document;
            const nameEl = productEl.querySelector('.product__name');
            const priceEl = productEl.querySelector('.product__price');
            const imgEl = productEl.querySelector('.product__img') || document.querySelector('.product__details-left img');
            const name = (nameEl?.textContent || 'Product').trim();
            const priceText = (priceEl?.textContent || '').replace(/[^0-9.]/g, '');
            const price = parseFloat(priceText) || 0;
            const id = name.toLowerCase().replace(/\s+/g,'-');
            const image = imgEl?.getAttribute('src') || '';
            addToCart({ id, name, price, image, qty: 1 });
            // Navigate to cart
            window.location.href = 'cart.html';
        });
    });
}

function renderCartPage(){
    const isCart = /cart\.html$/i.test(window.location.pathname);
    if(!isCart) return;
    const cart = getCart();
    const itemsRoot = document.querySelector('.cart__items');
    const heading = document.querySelector('.cart__items-heading h2');
    if(heading){ heading.textContent = `Shopping Cart [${cart.reduce((s,i)=>s+i.qty,0)} items]`; }
    if(!itemsRoot) return;
    // Build items
    itemsRoot.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'cart__item card flex-space-arround';
        row.innerHTML = `
            <input type="checkbox">
            <img src="${item.image || 'images/cart/cart-1.jpg'}" alt="${item.name}" class="cart__item-img">
            <div class="cart__item-description">
                <h3 class="product__name">${item.name}</h3>
                <h4 class="product__price">Price: ${currency(item.price)}</h4>
                <p class="cart__item-shipping">Free Shipping</p>
            </div>
            <div class="cart__item-action">
                <button class="btn js-remove" data-id="${item.id}"><i class="fas fa-trash-alt"></i></button>
                <div>
                    <button class="btn js-inc" data-id="${item.id}"><i class="fas fa-add"></i></button>
                    <span class="js-qty" data-id="${item.id}">${item.qty}</span>
                    <button class="btn js-dec" data-id="${item.id}"><i class="fas fa-minus"></i></button>
                </div>
            </div>
        `;
        itemsRoot.appendChild(row);
    });
    updateCartSummary();
    itemsRoot.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if(!target) return;
        const id = target.getAttribute('data-id');
        let cartNow = getCart();
        const idx = cartNow.findIndex(i=>i.id===id);
        if(idx<0) return;
        if(target.classList.contains('js-inc')){ cartNow[idx].qty += 1; }
        if(target.classList.contains('js-dec')){ cartNow[idx].qty = Math.max(0, cartNow[idx].qty - 1); }
        if(target.classList.contains('js-remove')){ cartNow.splice(idx,1); }
        cartNow = cartNow.filter(i=>i.qty>0);
        saveCart(cartNow);
        renderCartPage(); // re-render
        updateCartNav();
    });
}

function updateCartSummary(){
    const cart = getCart();
    const { subtotal } = cartTotals(cart);
    const summary = document.querySelector('.cart__payment-summary');
    if(!summary) return;
    const rows = summary.querySelectorAll('div');
    if(rows[0]) rows[0].lastElementChild.textContent = currency(subtotal);
    if(rows[1]) rows[1].lastElementChild.textContent = cart.length ? currency(10) : currency(0);
    if(rows[2]) rows[2].lastElementChild.textContent = currency(subtotal + (cart.length ? 10 : 0));
}

function renderCheckoutPage(){
    const isCheckout = /checkout\.html$/i.test(window.location.pathname);
    if(!isCheckout) return;
    const summary = document.querySelector('.cart__payment-summary');
    if(!summary) return;
    const cart = getCart();
    const { subtotal } = cartTotals(cart);
    const rows = summary.querySelectorAll('div');
    if(rows[0]) rows[0].lastElementChild.textContent = currency(subtotal);
    if(rows[1]) rows[1].lastElementChild.textContent = cart.length ? currency(10) : currency(0);
    if(rows[2]) rows[2].lastElementChild.textContent = currency(subtotal + (cart.length ? 10 : 0));
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartNav();
    bindAddToCartButtons();
    renderCartPage();
    renderCheckoutPage();
    // Mark active nav link based on current page
    const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('#menu .nav__link').forEach(a => {
        try{
            const href = (a.getAttribute('href') || '').toLowerCase();
            if(href && path === href){ a.classList.add('nav__link--active'); }
        }catch(e){}
    });
});