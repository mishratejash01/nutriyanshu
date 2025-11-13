// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('nutriyanshuCart')) || [];

    // *** FIX: CLEAN CART ON LOAD ***
    const cleanCart = cart.filter(item => item.id && item.price);
    if (cleanCart.length !== cart.length) {
        cart = cleanCart;
        localStorage.setItem('nutriyanshuCart', JSON.stringify(cart));
    }


    let quantity = 1;
    let selectedVariant = '200g'; 
    
    const productData = {
        '100g': {
            id: 'moringa-100g',
            name: 'Organic Moringa Leaf Powder (100g)',
            price: 149,
            image: 'https://images.unsplash.com/photo-1590333894165-a6369651c6b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBfHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
        },
        '200g': {
            id: 'moringa-200g',
            name: 'Organic Moringa Leaf Powder (200g)',
            price: 249,
            image: 'https://images.unsplash.com/photo-1590333894165-a6369651c6b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDBfHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
        }
    }

    // --- SELECTORS ---
    // Product Page (index.html) specific
    const qtyDisplay = document.getElementById('qty-display');
    const qtyIncrease = document.getElementById('qty-increase');
    const qtyDecrease = document.getElementById('qty-decrease');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyItNowBtn = document.getElementById('buy-it-now-btn');
    const mainProductImage = document.getElementById('main-product-image');
    const thumbnailImages = document.querySelectorAll('.thumbnail-img');
    const pincodeInput = document.getElementById('pincode-input');
    const pincodeCheckBtn = document.getElementById('pincode-check-btn');
    const pincodeMessage = document.getElementById('pincode-message');
    const variantButtons = document.querySelectorAll('.variant-btn');
    const showReviewFormBtn = document.getElementById('show-review-form-btn');
    const reviewForm = document.getElementById('review-form');
    const submitReviewForm = document.getElementById('submit-review-form');
    const cancelReviewBtn = document.getElementById('cancel-review-btn');

    // Global (all pages)
    const toast = document.getElementById('toast');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemCount = document.getElementById('cart-item-count');
    const cartBody = document.getElementById('cart-body');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const accordionHeaders = document.querySelectorAll('.accordion-header');


    // --- FUNCTIONS ---

    function saveCart() {
        localStorage.setItem('nutriyanshuCart', JSON.stringify(cart));
    }
    
    function updateQuantityDisplay() {
        if(qtyDisplay) {
            qtyDisplay.textContent = quantity;
        }
    }

    function showToast(message) {
        if(!toast) return;
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function updateCartIcon() {
        if(!cartItemCount) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartItemCount.textContent = totalItems;
            cartItemCount.classList.remove('hidden');
        } else {
            cartItemCount.classList.add('hidden');
        }
    }
    
    function renderCart() {
        if (!cartBody) return;

        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            cartFooter.classList.add('hidden');
            cartBody.querySelectorAll('.cart-item').forEach(item => item.remove());
        } else {
            emptyCartMessage.classList.add('hidden');
            cartFooter.classList.remove('hidden');
            let subtotal = 0;
            cartBody.innerHTML = '';
            cart.forEach(item => {
                // Ensure price and quantity are numbers before calculation
                const itemPrice = parseFloat(item.price);
                const itemQuantity = parseInt(item.quantity, 10);
                
                if (!isNaN(itemPrice) && !isNaN(itemQuantity)) {
                    subtotal += itemPrice * itemQuantity;
                }

                const itemHtml = `
                    <div class="cart-item flex gap-4 mb-4" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="h-20 w-20 object-cover rounded-md border border-gray-200">
                        <div class="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 class="font-semibold text-gray-800 text-sm">${item.name}</h3>
                                <p class="text-md font-semibold mt-1">₹${itemPrice * itemQuantity}</p>
                            </div>
                            <div class="cart-qty-selector flex items-center border border-gray-300 rounded-md w-max">
                                <button class="cart-qty-btn cart-qty-decrease p-2 text-lg font-bold text-gray-700 hover:bg-gray-100 rounded-l-md">-</button>
                                <span class="w-10 text-center text-md font-semibold">${itemQuantity}</span>
                                <button class="cart-qty-btn cart-qty-increase p-2 text-lg font-bold text-gray-700 hover:bg-gray-100 rounded-r-md">+</button>
                            </div>
                        </div>
                        <button class="remove-from-cart p-1 text-gray-500 hover:text-red-600 self-start">
                            <ion-icon name="trash-outline" class="h-5 w-5"></ion-CSS>
                        </button>
                    </div>
                `;
                cartBody.insertAdjacentHTML('beforeend', itemHtml);
            });
            cartSubtotal.textContent = `₹${subtotal}`;
        }
        updateCartIcon();
    }
    
    function handleCartClick(event) {
        const removeButton = event.target.closest('.remove-from-cart');
        if (removeButton) {
            const cartItemElement = removeButton.closest('.cart-item');
            const itemId = cartItemElement.dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            saveCart();
            renderCart();
            return; 
        }

        const increaseButton = event.target.closest('.cart-qty-increase');
        if (increaseButton) {
            const cartItemElement = increaseButton.closest('.cart-item');
            const itemId = cartItemElement.dataset.id;
            const item = cart.find(i => i.id === itemId);
            if (item) {
                item.quantity++;
                saveCart();
                renderCart();
            }
            return;
        }

        const decreaseButton = event.target.closest('.cart-qty-decrease');
        if (decreaseButton) {
            const cartItemElement = decreaseButton.closest('.cart-item');
            const itemId = cartItemElement.dataset.id;
            const item = cart.find(i => i.id === itemId);
            if (item && item.quantity > 1) {
                item.quantity--;
                saveCart();
                renderCart();
            } else if (item && item.quantity === 1) {
                cart = cart.filter(i => i.id !== itemId);
                saveCart();
                renderCart();
            }
            return;
        }
    }

    function handleAddToCart() {
        const productToAdd = productData[selectedVariant];
        
        if (!productToAdd) {
            console.error('Invalid product variant selected:', selectedVariant);
            return;
        }
        
        const existingItem = cart.find(item => item.id === productToAdd.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...productToAdd, quantity: quantity });
        }
        quantity = 1;
        updateQuantityDisplay();
        saveCart(); 
        renderCart();
    }

    function openCart() {
        renderCart();
        cartModal.classList.add('open');
        cartOverlay.classList.add('open');
    }
    
    function closeCart() {
        cartModal.classList.remove('open');
        cartOverlay.classList.remove('open');
    }
    
    function checkPincode() {
        if (!pincodeInput) return;
        
        const pincode = pincodeInput.value;
        pincodeMessage.classList.remove('text-red-600', 'text-green-600');
        if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
            pincodeMessage.textContent = 'Please enter a valid 6-digit pincode.';
            pincodeMessage.classList.add('text-red-600');
            return;
        }
        pincodeMessage.textContent = 'Checking...';
        setTimeout(() => {
            if (pincode === '110001' || pincode === '400001' || pincode === '560001') {
                pincodeMessage.textContent = `Delivery available to ${pincode} in 2-3 days.`;
                pincodeMessage.classList.add('text-green-600');
            } else {
                pincodeMessage.textContent = `Sorry, delivery is not available to ${pincode} right now.`;
                pincodeMessage.classList.add('text-red-600');
            }
        }, 500);
    }
    
    function toggleReviewForm() {
        if (!reviewForm) return;
        reviewForm.classList.toggle('open');
    }

    // =============================================
    // === STICKY CTA BAR LOGIC ===
    // =============================================
    const stickyCtaBar = document.getElementById('sticky-cta-bar');
    // We observe the main "Add to Cart" button, not "Buy Now"
    const mainCartButton = document.getElementById('add-to-cart-btn'); 
    const mainBuyButton = document.getElementById('buy-it-now-btn');

    const stickyBuyButton = document.getElementById('sticky-buy-now-btn');
    const stickyCartButton = document.getElementById('sticky-add-to-cart-btn');

    // Check if we are on the product page (where these elements exist)
    if (mainCartButton && stickyCtaBar) {
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                // When the main "Add to Cart" button is NOT on the screen...
                if (!entry.isIntersecting) {
                    // SHOW the sticky bar
                    stickyCtaBar.classList.add('show');
                } else {
                    // Otherwise, HIDE it
                    stickyCtaBar.classList.remove('show');
                }
            },
            {
                root: null, 
                threshold: 0, // Triggers as soon as it's 0% visible
                rootMargin: "0px 0px -100px 0px" // Triggers 100px from the bottom edge
            }
        );

        // Start observing the main "Add to Cart" button
        observer.observe(mainCartButton);

        // --- Make sticky buttons trigger the real buttons ---
        if (stickyBuyButton) {
            stickyBuyButton.addEventListener('click', () => {
                mainBuyButton.click(); // Clicks the original "Buy It Now"
            });
        }
        if (stickyCartButton) {
            stickyCartButton.addEventListener('click', () => {
                mainCartButton.click(); // Clicks the original "Add to Cart"
            });
        }
    }
    // =============================================
    // === END OF STICKY CTA BAR LOGIC ===
    // =============================================


    // --- EVENT LISTENERS ---
    
    if (qtyIncrease) {
        qtyIncrease.addEventListener('click', () => {
            quantity++;
            updateQuantityDisplay();
        });
    }
    if (qtyDecrease) {
        qtyDecrease.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                updateQuantityDisplay();
            }
        });
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            handleAddToCart();
            showToast('Item added to cart!');
        });
    }
    
    if (buyItNowBtn) {
        buyItNowBtn.addEventListener('click', () => {
            handleAddToCart();
            openCart();
        });
    }
    
    if(openCartBtn) openCartBtn.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if(cartBody) cartBody.addEventListener('click', handleCartClick);
    
    if (pincodeCheckBtn) {
        pincodeCheckBtn.addEventListener('click', checkPincode);
        pincodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPincode();
            }
        });
    }

    if (thumbnailImages.length > 0) {
        thumbnailImages.forEach(img => {
            img.addEventListener('click', () => {
                const newSrc = img.dataset.src;
                mainProductImage.src = newSrc;
                thumbnailImages.forEach(i => i.classList.remove('thumbnail-active'));
                img.classList.add('thumbnail-active');
            });
        });
    }

    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('ion-icon');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    icon.setAttribute('name', 'add-outline');
                } else {
                    // Set max-height to the content's real scroll height
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.setAttribute('name','remove-outline');
                }
            });
        });
    }

    if (variantButtons.length > 0) {
        variantButtons.forEach(button => {
            button.addEventListener('click', () => {
                variantButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                selectedVariant = button.firstChild.textContent.trim().split(' ')[0] + 'g';
            });
        });
    }
    
    if (showReviewFormBtn) {
        showReviewFormBtn.addEventListener('click', toggleReviewForm);
        cancelReviewBtn.addEventListener('click', toggleReviewForm);
        
        submitReviewForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Thank you for your review!');
            toggleReviewForm();
            submitReviewForm.reset();
        });
    }

    
    // --- INITIALIZATION ---
    updateCartIcon(); 
    
    if (qtyDisplay) {
        updateQuantityDisplay();
    }

    // --- START: Dynamic Cart Count & Delivery Date ---
    
    // 1. Set Random Cart Count
    const recentCartCountEl = document.getElementById('recent-cart-count');
    if (recentCartCountEl) {
        // Generates a random number between 1200 and 1800
        const randomCount = Math.floor(Math.random() * (1800 - 1200 + 1)) + 1200;
        recentCartCountEl.textContent = randomCount;
    }

    // 2. Set Delivery Date (7 days from now)
    const deliveryDateEl = document.getElementById('delivery-date');
    if (deliveryDateEl) {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 7);

        // Format as "Mmm. dd" (e.g., "Nov. 21")
        const month = deliveryDate.toLocaleString('en-US', { month: 'short' });
        const day = deliveryDate.getDate();
        const formattedDate = `${month}. ${day}`;
        
        deliveryDateEl.textContent = formattedDate;
    }
    // --- END: Dynamic Cart Count & Delivery Date ---
});
