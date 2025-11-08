// script.js

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    // Cart is loaded from localStorage to persist across pages
    let cart = JSON.parse(localStorage.getItem('nutriyanshuCart')) || [];
    let quantity = 1;
    let selectedVariant = '200g'; 
    
    const productData = {
        '100g': {
            id: 'moringa-100g',
            name: 'Organic Moringa Leaf Powder (100g)',
            price: 149,
            image: 'https://images.unsplash.com/photo-1590333894165-a6369651c6b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
        },
        '200g': {
            id: 'moringa-200g',
            name: 'Organic Moringa Leaf Powder (200g)',
            price: 249,
            image: 'https://images.unsplash.com/photo-1590333894165-a6369651c6b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=100&q=80'
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
                subtotal += item.price * item.quantity;
                const itemHtml = `
                    <div class="cart-item flex gap-4 mb-4" data-id="${item.id}">
                        <img src="${item.image}" alt="${item.name}" class="h-20 w-20 object-cover rounded-md border border-gray-200">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-800">${item.name}</h3>
                            <div class="flex justify-between items-center">
                                <p class="text-sm text-gray-500">Qty: ${item.quantity}</p>
                                <p class="text-md font-semibold mt-1">₹${item.price * item.quantity}</p>
                            </div>
                        </div>
                        <button class="remove-from-cart p-1 text-gray-500 hover:text-red-600 self-start">
                            <ion-icon name="trash-outline" class="h-5 w-5"></ion-icon>
                        </button>
                    </div>
                `;
                cartBody.insertAdjacentHTML('beforeend', itemHtml);
            });
            cartSubtotal.textContent = `₹${subtotal}`;
        }
        updateCartIcon();
    }
    
    function handleRemoveFromCart(event) {
        const removeButton = event.target.closest('.remove-from-cart');
        if (removeButton) {
            const cartItemElement = removeButton.closest('.cart-item');
            const itemId = cartItemElement.dataset.id;
            cart = cart.filter(item => item.id !== itemId);
            saveCart(); // Save changes
            renderCart();
        }
    }

    function handleAddToCart() {
        const productToAdd = productData[selectedVariant];
        const existingItem = cart.find(item => item.id === productToAdd.id);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...productToAdd, quantity: quantity });
        }
        quantity = 1;
        updateQuantityDisplay();
        saveCart(); // Save changes
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

    // --- EVENT LISTENERS ---
    
    // Quantity controls (only on index.html)
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

    // Add to Cart (only on index.html)
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            handleAddToCart();
            showToast('Item added to cart!');
        });
    }
    
    // Buy It Now (only on index.html)
    if (buyItNowBtn) {
        buyItNowBtn.addEventListener('click', () => {
            handleAddToCart();
            openCart();
        });
    }
    
    // Cart modal controls (global)
    if(openCartBtn) openCartBtn.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if(cartOverlay) cartOverlay.addEventListener('click', closeCart);
    if(cartBody) cartBody.addEventListener('click', handleRemoveFromCart);
    
    // Pincode Check (only on index.html)
    if (pincodeCheckBtn) {
        pincodeCheckBtn.addEventListener('click', checkPincode);
        pincodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkPincode();
            }
        });
    }

    // Image Gallery (only on index.html)
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

    // Accordions (global, for index.html and faq.html)
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('ion-icon');
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                    icon.setAttribute('name', 'add-outline');
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    icon.setAttribute('name', 'remove-outline');
                }
            });
        });
    }

    // Variant Selection (only on index.html)
    if (variantButtons.length > 0) {
        variantButtons.forEach(button => {
            button.addEventListener('click', () => {
                variantButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                selectedVariant = button.textContent.trim().split(' ')[0].toLowerCase();
            });
        });
    }
    
    // Review Form Listeners (only on index.html)
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
    updateCartIcon(); // Set initial cart count on page load
    
    // Run on index.html only
    if (qtyDisplay) {
        updateQuantityDisplay();
    }
});
