let currentProduct = null;
let selectedSize = null; 

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

            // --- SIZE TILE LOGIC ---
            const sizeGrid = document.getElementById('size-grid');
            if (sizeGrid && currentProduct.sizes) {
                // Generate the HTML for the tiles
                sizeGrid.innerHTML = currentProduct.sizes.map((size, index) =>
                    `<div class="size-tile ${index === 0 ? 'selected' : ''}" data-size="${size}">${size}</div>`
                ).join('');

                // Set initial size selection
                selectedSize = currentProduct.sizes[0];

                // Attach click listeners to the new tiles
                document.querySelectorAll('.size-tile').forEach(tile => {
                    tile.onclick = function() {
                        document.querySelectorAll('.size-tile').forEach(t => t.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedSize = this.getAttribute('data-size'); 
                        updateUIFromCart(); 
                    };
                });
            }

            // Important: update UI after sizes are set
            updateUIFromCart();

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
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countElement.textContent = total;
    }
}

// 3. UI Logic for +/- Toggle
function updateUIFromCart() {
    // Check global variables instead of DOM elements
    if (!currentProduct || !selectedSize) return;

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
function changeQty(amount) {
    // 1. Ensure we have a product and a size selected from the tiles
    if (!currentProduct || !selectedSize) {
        console.log("No size selected yet");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    
    // 2. Check if this product + the tile size is already in the cart
    const index = cart.findIndex(item => item.id === currentProduct.id && item.size === selectedSize);

    if (index > -1) {
        // Update quantity if it exists
        cart[index].quantity += amount;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else if (amount > 0) {
        // Add as a new item if it doesn't
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            size: selectedSize, // This is the value from the clicked tile
            quantity: 1,
            link: `product-detail.html?id=${currentProduct.id}` 
        });
    }

    // 3. Save and refresh the UI
    localStorage.setItem('royalCart', JSON.stringify(cart));
    updateUIFromCart();
    updateCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. This updates the Free Shipping bar and Bag count immediately
    updateCartCount();

    const initialAddBtn = document.getElementById('initial-add-btn');
    const plusBtn = document.getElementById('plus-btn');
    const minusBtn = document.getElementById('minus-btn');

    // 2. Button listeners for the Product Detail page
    if (initialAddBtn) initialAddBtn.onclick = () => changeQty(1);
    if (plusBtn) plusBtn.onclick = () => changeQty(1);
    if (minusBtn) minusBtn.onclick = () => changeQty(-1);

    // 3. Kick off the product loader if we are on a detail page
    if (document.querySelector('.product-title')) {
        loadProductDetails();
    }
    
    // 4. If you have any price sliders or filters to init, do it here
    if (typeof slideOne === "function") {
        slideOne();
        slideTwo();
    }
});