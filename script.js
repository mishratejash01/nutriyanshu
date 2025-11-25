document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let cart = JSON.parse(localStorage.getItem('nutriyanshuCart')) || [];
    let quantity = 1;
    let selectedVariant = '200g'; // Default variant

    const productData = {
        '100g': { id: 'moringa-100g', name: 'Organic Moringa Leaf Powder (100g)', price: 149, image: 'front.jpg' },
        '200g': { id: 'moringa-200g', name: 'Organic Moringa Leaf Powder (200g)', price: 249, image: 'front.jpg' }
    };

    // --- DOM ELEMENTS ---
    const qtyDisplay = document.getElementById('qty-display');
    const qtyIncrease = document.getElementById('qty-increase');
    const qtyDecrease = document.getElementById('qty-decrease');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const stickyAddBtn = document.getElementById('sticky-add-btn');
    const buyItNowBtn = document.getElementById('buy-it-now-btn');
    const variantButtons = document.querySelectorAll('.variant-btn');
    const pincodeCheckBtn = document.getElementById('pincode-check-btn');
    const pincodeInput = document.getElementById('pincode-input');
    const pincodeMessage = document.getElementById('pincode-message');
    
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

    // Sticky Bar
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
                    <div class="flex gap-4 border-b border-gray-100 pb-4 cart-item animate-fade-in" data-id="${item.id}">
                        <div class="w-16 h-16 bg-gray-50 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                            <img src="${item.image}" class="w-full h-full object-cover">
                        </div>
                        <div class="flex-1">
                            <h4 class="text-sm font-bold text-gray-900 line-clamp-2">${item.name}</h4>
                            <p class="text-sm text-gray-500 font-medium mt-0.5">₹${item.price}</p>
                            
                            <div class="flex items-center justify-between mt-3">
                                <div class="flex items-center gap-3 bg-gray-50 rounded p-1">
                                    <button class="cart-decrease w-6 h-6 bg-white rounded shadow-sm text-gray-600 flex items-center justify-center hover:text-black font-bold">-</button>
                                    <span class="text-xs font-bold w-4 text-center">${item.quantity}</span>
                                    <button class="cart-increase w-6 h-6 bg-white rounded shadow-sm text-gray-600 flex items-center justify-center hover:text-black font-bold">+</button>
                                </div>
                                <button class="cart-remove text-xs text-red-500 font-medium hover:underline">Remove</button>
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
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeCart() {
        cartModal.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }

    function addToCart() {
        const product = productData[selectedVariant];
        const existing = cart.find(i => i.id === product.id);
        if (existing) existing.quantity += quantity;
        else cart.push({ ...product, quantity: quantity });
        
        saveCart();
        openCart();
        quantity = 1;
        if(qtyDisplay) qtyDisplay.textContent = 1;
    }

    // 2. Event Listeners
    if (qtyIncrease) qtyIncrease.addEventListener('click', () => { quantity++; qtyDisplay.textContent = quantity; });
    if (qtyDecrease) qtyDecrease.addEventListener('click', () => { if(quantity > 1) quantity--; qtyDisplay.textContent = quantity; });

    if (addToCartBtn) addToCartBtn.addEventListener('click', addToCart);
    if (stickyAddBtn) stickyAddBtn.addEventListener('click', addToCart);
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
            variantButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const text = btn.innerText;
            if (text.includes('100g')) selectedVariant = '100g';
            if (text.includes('200g')) selectedVariant = '200g';
        });
    });

    // Pincode Checker
    if (pincodeCheckBtn) {
        pincodeCheckBtn.addEventListener('click', () => {
            const val = pincodeInput.value;
            if (val.length === 6 && !isNaN(val)) {
                pincodeMessage.className = 'text-xs mt-2 font-bold text-green-600';
                pincodeMessage.textContent = `Delivery available to ${val} by ${new Date(Date.now() + 3*86400000).toDateString().slice(0,10)}`;
            } else {
                pincodeMessage.className = 'text-xs mt-2 font-bold text-red-500';
                pincodeMessage.textContent = 'Please enter a valid 6-digit pincode';
            }
        });
    }

    // FAQ Accordions
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('ion-icon');
            
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                // Close others
                document.querySelectorAll('.accordion-content').forEach(c => c.style.maxHeight = null);
                document.querySelectorAll('.accordion-header ion-icon').forEach(i => i.style.transform = 'rotate(0deg)');
                
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // Sticky CTA Bar Logic
    if (addToCartBtn && stickyCtaBar) {
        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting && window.scrollY > 400) {
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
