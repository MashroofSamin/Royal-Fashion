let products = [];
let activeMainCategory = window.activeMainCategory || "all";
let activeColorFilters = [];
window.refreshGlobalCart = updateCartCount;

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();

        if (document.getElementById("slider-1")) {
            fillSlider();
        }
        applyFilters();
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Fixed: This now handles filtering logic without trying to build a nav bar
function setMainCategory(cat, element) {
    document.querySelectorAll('.cat-tab').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');

    activeMainCategory = cat;
    applyFilters();
}

function toggleColorFilter(color, element) {
    if (activeColorFilters.includes(color)) {
        activeColorFilters = activeColorFilters.filter(c => c !== color);
        element.classList.remove('selected');
    } else {
        activeColorFilters.push(color);
        element.classList.add('selected');
    }
    applyFilters();
}

function fillSlider() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    const track = document.getElementById("track");
    if (!s1 || !s2 || !track) return;
    let p1 = (s1.value / s1.max) * 100;
    let p2 = (s2.value / s2.max) * 100;
    track.style.background = `linear-gradient(to right, #ddd ${p1}%, var(--royal-blue) ${p1}%, var(--royal-blue) ${p2}%, #ddd ${p2}%)`;
}

function slideOne() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    if (parseInt(s2.value) - parseInt(s1.value) <= 20) s1.value = parseInt(s2.value) - 20;
    document.getElementById("range1").textContent = s1.value;
    fillSlider();
    applyFilters();
}

function slideTwo() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    if (parseInt(s2.value) - parseInt(s1.value) <= 20) s2.value = parseInt(s1.value) + 20;
    document.getElementById("range2").textContent = s2.value;
    fillSlider();
    applyFilters();
}

function applyFilters() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    const selectedDepts = Array.from(document.querySelectorAll('.dept-filter:checked')).map(cb => cb.value);

    const minP = s1 ? parseInt(s1.value) : 0;
    const maxP = s2 ? parseInt(s2.value) : 1000;

    const filtered = products.filter(p => {
        // FIXED: This now checks if the tab clicked matches the category OR the subcategory
        const matchCat = activeMainCategory === "all" ||
            p.category === activeMainCategory ||
            p.subcat === activeMainCategory;

        const matchDept = selectedDepts.length === 0 || selectedDepts.includes(p.dept);
        const matchColor = activeColorFilters.length === 0 || p.colors.some(c => activeColorFilters.includes(c));
        const matchPrice = p.price >= minP && p.price <= maxP;

        return matchCat && matchDept && matchColor && matchPrice;
    });
    renderRows(filtered);
}

function renderRows(data) {
    const container = document.getElementById('product-container');
    if (!container) return;
    container.innerHTML = "";

    // Grouping logic for the "Organizers" (Subcategory Headers)
    const subcategories = [...new Set(data.map(p => p.subcat))].sort();

    if (data.length === 0) {
        container.innerHTML = `<p style="padding: 20px;">No products found matching your filters.</p>`;
        return;
    }

    subcategories.forEach(sub => {
        const items = data.filter(p => p.subcat === sub);
        const section = document.createElement('div');
        section.className = 'category-section';

        section.innerHTML = `
            <div class="line-header"><h3>${sub}</h3></div>
            <div class="product-grid">
                ${items.map(item => `
                    <a href="product-detail.html?id=${item.id}" class="product-link">
                        <div class="product-card">
                            <div class="card-img-placeholder">
                                <img src="${item.image}" alt="${item.name}" class="product-img">
                            </div>
                            <div style="font-size: 0.75rem; color: #888; text-transform: uppercase; margin-bottom: 5px;">${item.dept}</div>
                            <h4 style="font-size: 1.1rem; margin-bottom: 10px;">${item.name}</h4>
                            <p style="font-weight: bold; color: var(--brand-green); font-size: 1.2rem; margin-bottom: 15px;">$${item.price.toFixed(2)}</p>
                            <button class="buy-button">View Details</button>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    });
}

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

// Run on page load
// Run everything inside ONE listener to prevent double-firing
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});