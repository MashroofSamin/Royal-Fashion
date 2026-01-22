let currentProduct = null;
let selectedSize = null; 

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    try {
        const response = await fetch('products.json');
        const products = await response.json();
        currentProduct = products.find(p => p.id === productId);

        if (currentProduct) {
            // 1. Basic Info Updates
            document.title = `${currentProduct.name} | Royal Fashion NYC`;
            document.querySelector('.breadcrumb').innerText = `Shop / ${currentProduct.dept} / ${currentProduct.subcat}`;
            document.querySelector('.product-title').innerText = currentProduct.name;
            document.querySelector('.product-price').innerText = `$${currentProduct.price.toFixed(2)}`;

            const mainImg = document.getElementById('mainProductImg');
            mainImg.src = currentProduct.image;
            mainImg.alt = currentProduct.name;

            // 2. Grids and Sections
            const infantGrid = document.getElementById('infant-grid');
            const kidsGrid = document.getElementById('kids-grid');
            const womenGrid = document.getElementById('women-grid');
            const adultGrid = document.getElementById('adult-grid');

            if (currentProduct.sizes) {
                // Clear and Hide Everything First
                [infantGrid, kidsGrid, womenGrid, adultGrid].forEach(grid => { if (grid) grid.innerHTML = ''; });
                ['infant-section', 'kids-section', 'women-section', 'adult-section'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });

                // 3. Sorting Logic Loop
                currentProduct.sizes.forEach((size, index) => {
                    const tile = document.createElement('div');
                    tile.className = `size-tile ${index === 0 ? 'selected' : ''}`;
                    tile.setAttribute('data-size', size);
                    tile.innerText = size;

                    tile.onclick = function() {
                        document.querySelectorAll('.size-tile').forEach(t => t.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedSize = this.getAttribute('data-size'); 
                        updateUIFromCart(); 
                    };

                    // --- PLACE YOUR RULE 1 HERE ---
                    const sizeLower = size.toLowerCase();

                    if (sizeLower.includes("women")) {
                        const wGrid = document.getElementById('women-grid');
                        const wSection = document.getElementById('women-section');
                        if (wGrid && wSection) {
                            wGrid.appendChild(tile);
                            wSection.style.display = 'block';
                        }
                    } 
                    // Then follow with Rule 2, 3, etc.
                    else if (size.includes("Months") || size.includes("2T")) {
                        infantGrid.appendChild(tile);
                        document.getElementById('infant-section').style.display = 'block';
                    } 
                    else if (size.includes("(")) {
                        kidsGrid.appendChild(tile);
                        document.getElementById('kids-section').style.display = 'block';
                    } 
                    else {
                        adultGrid.appendChild(tile);
                        document.getElementById('adult-section').style.display = 'block';
                    }

                    if (index === 0) selectedSize = size;
                });
            }

            updateUIFromCart();

            mainImg.onload = () => {
                if (typeof initZoom === "function") initZoom("mainProductImg", "zoomResult");
            };
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