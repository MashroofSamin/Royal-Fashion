let currentProduct = null;

// 1. Core Loader
async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    try {
        const response = await fetch('products.json');
        const products = await response.json();
        currentProduct = products.find(p => p.id === productId);

        if (currentProduct) {
            document.title = `${currentProduct.name} | Royal Fashion NYC`;
            document.querySelector('.breadcrumb').innerText = `Shop / ${currentProduct.dept} / ${currentProduct.subcat}`;
            document.querySelector('.product-title').innerText = currentProduct.name;
            document.querySelector('.product-price').innerText = `$${currentProduct.price.toFixed(2)}`;

            const mainImg = document.getElementById('mainProductImg');
            mainImg.src = currentProduct.image;
            mainImg.alt = currentProduct.name;

            const sizeSelect = document.getElementById('sizeSelect');
            if (sizeSelect && currentProduct.sizes) {
                sizeSelect.innerHTML = currentProduct.sizes.map(size =>
                    `<option value="${size}">${size}</option>`
                ).join('');

                // ADDED: Initialize UI now that sizes are loaded
                updateUIFromCart();
            }

            mainImg.onload = () => {
                if (typeof initZoom === "function") initZoom("mainProductImg", "zoomResult");
            };

            const container = document.querySelector('.img-zoom-container');
            const result = document.getElementById('zoomResult');
            if (container && result) {
                container.addEventListener('mouseenter', () => result.style.visibility = 'visible');
                container.addEventListener('mouseleave', () => result.style.visibility = 'hidden');
            }

        } else {
            document.querySelector('.product-detail-container').innerHTML = `<h1>Product not found</h1>`;
        }
    } catch (error) {
        console.error("Error loading product details:", error);
    }
}

// 2. Global Nav Update
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        // Sum up the quantities of all items in the array
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countElement.textContent = total;
    }
}

// Call this immediately so the number is correct when the page opens
updateCartCount();

// 3. UI Logic for +/- Toggle
function updateUIFromCart() {
    const sizeSelect = document.getElementById('sizeSelect');
    if (!currentProduct || !sizeSelect) return;

    const selectedSize = sizeSelect.value;
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const existingItem = cart.find(item => item.id === currentProduct.id && item.size === selectedSize);

    const addBtn = document.getElementById('initial-add-btn');
    const qtyControls = document.getElementById('quantity-controls');
    const qtyText = document.getElementById('current-qty');

    if (addBtn && qtyControls && qtyText) {
        if (existingItem) {
            addBtn.style.display = 'none';
            qtyControls.style.display = 'flex';
            qtyText.innerText = existingItem.quantity;
        } else {
            addBtn.style.display = 'block';
            qtyControls.style.display = 'none';
        }
    }
}

// 4. Cart Action Logic
// Function to handle the +/- clicks - NO ALERTS
function changeQty(amount) {
    const sizeSelect = document.getElementById('sizeSelect');
    if (!currentProduct || !sizeSelect) return;

    const selectedSize = sizeSelect.value;
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const index = cart.findIndex(item => item.id === currentProduct.id && item.size === selectedSize);

    if (index > -1) {
        // If it exists, just update the number
        cart[index].quantity += amount;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else if (amount > 0) {
        // ONLY ADDS NEW ITEM IF NOT FOUND
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            size: selectedSize,
            quantity: 1
        });
    }

    localStorage.setItem('royalCart', JSON.stringify(cart));
    updateUIFromCart();
    updateCartCount();
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    const initialAddBtn = document.getElementById('initial-add-btn');
    const plusBtn = document.getElementById('plus-btn');
    const minusBtn = document.getElementById('minus-btn');
    const sizeSelect = document.getElementById('sizeSelect');

    // Use .onclick to ensure only ONE listener is active
    if (initialAddBtn) {
        initialAddBtn.onclick = (e) => {
            changeQty(1);
        };
    }

    if (plusBtn) {
        plusBtn.onclick = () => changeQty(1);
    }

    if (minusBtn) {
        minusBtn.onclick = () => changeQty(-1);
    }

    if (sizeSelect) {
        sizeSelect.onchange = updateUIFromCart;
    }

    if (document.querySelector('.product-title')) {
        loadProductDetails();
    }
});