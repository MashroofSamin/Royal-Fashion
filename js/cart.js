// Function to update item quantities
function updateQty(index, change) {
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    cart[index].quantity += change;

    // If quantity hits 0, remove it
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('royalCart', JSON.stringify(cart));
    renderCart(); // Re-render everything
    if (typeof updateCartCount === "function") updateCartCount();
}

// Function to remove items entirely
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('royalCart', JSON.stringify(cart));
    renderCart();
    if (typeof updateCartCount === "function") updateCartCount();
}

// THE MAIN RENDER FUNCTION
function renderCart() {
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');

    // Grab the new UI elements we added
    const checkoutBtn = document.getElementById('checkout-btn');
    const termsCheckbox = document.getElementById('terms-agree');
    const minWarning = document.getElementById('min-order-warning');

    let subtotal = 0;
    const MIN_ORDER = 40.00;
    const SHIPPING_FEE = 10.00;

    if (!container) return;

    // 1. Handle Empty Cart
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="padding: 40px 0; text-align: center;">
                <p>Your bag is currently empty.</p>
                <br>
                <a href="apparel.html" style="color: black; font-weight: bold; text-decoration: none; border-bottom: 2px solid black;">CONTINUE SHOPPING</a>
            </div>`;
        if (subtotalEl) subtotalEl.innerText = "$0.00";
        if (totalEl) totalEl.innerText = "$0.00";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    // 2. Render the Items
    container.innerHTML = cart.map((item, index) => {
        const price = item.price || 0;
        const itemTotal = price * item.quantity;
        subtotal += itemTotal;

        return `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Size: ${item.size}</p>
                    <p>Price: $${price.toFixed(2)}</p>
                    <div class="qty-adjuster">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                </div>
                <div class="item-price-total">
                    <strong>$${itemTotal.toFixed(2)}</strong>
                </div>
            </div>
        `;
    }).join('');

    // 3. Update the Numbers in the Sidebar
    const finalTotal = subtotal + SHIPPING_FEE;
    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    if (totalEl) totalEl.innerText = `$${finalTotal.toFixed(2)}`;

    // 4. CHECKOUT LOGIC (Minimum Order + Policy Agreement)
    function validateCheckout() {
        const isMinMet = subtotal >= MIN_ORDER;
        const isAgreed = termsCheckbox ? termsCheckbox.checked : false;

        // Show/Hide warning
        if (minWarning) {
            minWarning.style.display = isMinMet ? 'none' : 'block';
        }

        // Enable/Disable Button
        if (checkoutBtn) {
            if (isMinMet && isAgreed) {
                checkoutBtn.disabled = false;
                checkoutBtn.style.opacity = "1";
                checkoutBtn.style.cursor = "pointer";
            } else {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = "0.5";
                checkoutBtn.style.cursor = "not-allowed";
            }
        }
    }

    // Run validation immediately
    validateCheckout();

    // Re-run validation whenever the checkbox is clicked
    if (termsCheckbox) {
        termsCheckbox.onchange = validateCheckout;
    }
}

// Add this to allow changing quantity directly in the cart
function updateQty(index, amount) {
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    cart[index].quantity += amount;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    localStorage.setItem('royalCart', JSON.stringify(cart));
    renderCart();
    if (typeof updateCartCount === "function") updateCartCount();
}

function removeFromCart(index) {
    // 1. Get the current cart from storage
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];

    // 2. Remove the specific item at that index
    cart.splice(index, 1);

    // 3. Save the updated cart back to storage
    localStorage.setItem('royalCart', JSON.stringify(cart));

    // 4. Re-run the render function to refresh the list on screen
    renderCart();

    // 5. Update the (0) count in the nav bar
    if (typeof updateCartCount === "function") {
        updateCartCount();
    }
}

// Use DOMContentLoaded to ensure the HTML is ready before we try to inject items
document.addEventListener('DOMContentLoaded', renderCart);