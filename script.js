document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let cart = JSON.parse(localStorage.getItem('nutriyanshuCart')) || [];
    let quantity = 1;
    let selectedVariant = '200g'; // Default variant

    const productData = {
        '100g': { id: 'moringa-100g', name: 'Organic Moringa Leaf Powder (100g)', price: 149, image: 'front.jpg' },
        '200g': { id: 'moringa-200g', name: 'Organic Moringa Leaf Powder (200g)', price: 249, image: 'front.jpg' }
    };

    // --- ELEMENTS ---
    const qtyDisplay = document.getElementById('qty-display');
    const qtyIncrease = document.getElementById('qty-increase');
    const qtyDecrease = document.getElementById('qty-decrease');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const stickyAddBtn = document.getElementById('sticky-add-btn');
    const buyItNowBtn = document.getElementById('buy-it-now-btn');
    const variantButtons = document.querySelectorAll('.variant-btn');
    
    // Cart Elements
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const emptyCartMessage = document.getElementById('empty-cart-message');

    // Sticky Bar Logic
    const stickyCtaBar = document.getElementById('sticky-cta-bar');
    
    // Accordions
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // --- FUNCTIONS ---

    // 1. Cart Logic
    function saveCart() {
        localStorage.setItem('nutriyanshuCart', JSON.stringify(cart));
        updateCartIcon();
    }

    function updateCartIcon() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartItemCount) {
            cartItemCount.textContent = totalItems;
            if (totalItems > 0) cartItemCount.classList.remove('hidden');
            else cartItemCount.classList.add('hidden');
        }
    }

    function renderCart() {
        if (!cartBody) return;
        cartBody.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartFooter.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            cartFooter.classList.remove('hidden');
            
            let subtotal = 0;
            cart.forEach(item => {
                subtotal += item.price * item.quantity;
                const html = `
                    <div class="flex gap-4 border-b border-gray-100 pb-4 cart-item" data-id="${item.id}">
                        <img src="${item.image}" class="w-16 h-16 object-cover rounded-md border border-gray-200">
                        <div class="flex-1">
                            <h4 class="text-sm font-semibold text-gray-800">${item.name}</h4>
                            <p class="text-sm text-gray-600">₹${item.price} x ${item.quantity}</p>
                            <div class="flex items-center gap-3 mt-2">
                                <button class="cart-decrease w-6 h-6 bg-gray-100 rounded text-gray-600 flex items-center justify-center hover:bg-gray-200">-</button>
                                <span class="text-sm font-medium">${item.quantity}</span>
                                <button class="cart-increase w-6 h-6 bg-gray-100 rounded text-gray-600 flex items-center justify-center hover:bg-gray-200">+</button>
                                <button class="cart-remove text-xs text-red-500 ml-auto underline">Remove</button>
                            </div>
                        </div>
                    </div>
                `;
                cartBody.insertAdjacentHTML('beforeend', html);
            });
            cartSubtotal.textContent = `₹${subtotal}`;
        }
    }

    function openCart() {
        renderCart();
        cartModal.classList.remove('translate-x-full');
        cartOverlay.classList.remove('hidden');
    }

    function closeCart() {
        cartModal.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    }

    function addToCart() {
        const product = productData[selectedVariant];
        const existing = cart.find(i => i.id === product.id);
        if (existing) existing.quantity += quantity;
        else cart.push({ ...product, quantity: quantity });
        
        saveCart();
        openCart();
        quantity = 1;
        qtyDisplay.textContent = 1;
    }

    // 2. Event Listeners
    if (qtyIncrease) qtyIncrease.addEventListener('click', () => { quantity++; qtyDisplay.textContent = quantity; });
    if (qtyDecrease) qtyDecrease.addEventListener('click', () => { if(quantity > 1) quantity--; qtyDisplay.textContent = quantity; });

    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', addToCart); // Link sticky button
    if (buyItNowBtn) buyItNowBtn.addEventListener('click', () => { addToCart(); /* Add Checkout Logic Here */ });

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Cart Actions (Delegation)
    if (cartBody) {
        cartBody.addEventListener('click', (e) => {
            const itemEl = e.target.closest('.cart-item');
            if (!itemEl) return;
            const id = itemEl.dataset.id;
            const item = cart.find(i => i.id === id);

            if (e.target.classList.contains('cart-increase')) {
                item.quantity++;
            } else if (e.target.classList.contains('cart-decrease')) {
                if (item.quantity > 1) item.quantity--;
                else cart = cart.filter(i => i.id !== id);
            } else if (e.target.classList.contains('cart-remove')) {
                cart = cart.filter(i => i.id !== id);
            }
            saveCart();
            renderCart();
        });
    }

    // Variant Selection
    variantButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            variantButtons.forEach(b => b.classList.remove('active', 'border-brand-black', 'bg-gray-50'));
            // Remove checkmarks or styled borders from others
            btn.classList.add('active');
            
            // Logic to parse variant from text (Quick & Dirty)
            const text = btn.innerText;
            if (text.includes('100g')) selectedVariant = '100g';
            if (text.includes('200g')) selectedVariant = '200g';
        });
    });

    // Accordions
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('ion-icon');
            
            // Toggle
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Sticky Bar Observer
    if (addToCartBtn && stickyCtaBar) {
        const observer = new IntersectionObserver((entries) => {
            // If Add to Cart button is NOT visible (we scrolled past it), SHOW sticky bar
            if (!entries[0].isIntersecting && window.scrollY > 500) {
                stickyCtaBar.classList.remove('translate-y-full');
            } else {
                stickyCtaBar.classList.add('translate-y-full');
            }
        }, { threshold: 0 });
        
        observer.observe(addToCartBtn);
    }
    
    // Initial Load
    updateCartIcon();
});
