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

function renderCart() {
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const shippingEl = document.getElementById('cart-shipping'); 

    const checkoutBtn = document.getElementById('checkout-btn');
    const termsCheckbox = document.getElementById('terms-agree');

    let subtotal = 0;

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div style="padding: 40px 0; text-align: center;"><p>Your bag is currently empty.</p></div>`;
        if (subtotalEl) subtotalEl.innerText = "$0.00";
        if (totalEl) totalEl.innerText = "$0.00";
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }

    // 1. Render Items & Calculate Subtotal
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
                    <div class="qty-adjuster">
                        <button onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <div class="item-price-total"><strong>$${itemTotal.toFixed(2)}</strong></div>
            </div>`;
    }).join('');

    // 2. UPDATE THE UI NUMBERS
    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toFixed(2)}`;
    
    // Shipping Status Logic
    if (shippingEl) {
        if (subtotal >= 100) {
            // Global Free Shipping reached
            shippingEl.innerText = "FREE";
            shippingEl.style.color = "var(--brand-green)";
            shippingEl.style.fontWeight = "bold";
            shippingEl.style.fontSize = "1rem";
        } else if (subtotal >= 40) {
            // US Free Shipping reached
            shippingEl.innerText = "FREE (US Only)";
            shippingEl.style.color = "var(--brand-green)";
            shippingEl.style.fontWeight = "bold";
            shippingEl.style.fontSize = "0.9rem";
        } else {
            // Below both thresholds
            shippingEl.innerText = "Calculated at checkout";
            shippingEl.style.fontSize = "0.8rem";
            shippingEl.style.color = "#888";
            shippingEl.style.fontWeight = "normal";
        }
    }

    // On this page, the Total will just equal the Subtotal for now
    if (totalEl) totalEl.innerText = `$${subtotal.toFixed(2)}`;

    // 3. CHECKOUT LOGIC (Terms agreement only)
    function validateCheckout() {
        const isAgreed = termsCheckbox ? termsCheckbox.checked : false;

        if (checkoutBtn) {
            if (isAgreed) {
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

    validateCheckout();
    if (termsCheckbox) termsCheckbox.onchange = validateCheckout;
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

document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'claim-shipping-toggle') {
        const details = document.getElementById('shipping-details');
        if (details.style.display === "none") {
            details.style.display = "block";
            e.target.innerText = "Close info";
        } else {
            details.style.display = "none";
            e.target.innerText = "Claim free shipping!";
        }
    }
});