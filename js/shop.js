// State
let products = [];
let activeMainCategory = "all";
let activeColorFilters = [];

// Supabase client
const SUPABASE_URL = 'https://gouaisrlgkgrfymqsqas.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdWFpc3JsZ2tncmZ5bXFzcWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MzI3NDEsImV4cCI6MjA4OTIwODc0MX0.wES6GjiS0D5FojHQEiTrE9SLAW-ep3BnxMuBlarC6wE';
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
// Load products from Supabase
async function loadProducts() {
    try {
        const { data, error } = await db
            .from('products')
            .select('*');

        if (error) throw error;

        products = data;

        if (document.getElementById('slider-1')) {
            fillSlider();
        }

        applyFilters();
        updateCartCount();
    } catch (error) {
        console.error("Error loading products:", error);
    }
}

// Set main category tab and apply filters
function setMainCategory(cat, element) {
    document.querySelectorAll('.cat-tab').forEach(c => c.classList.remove('active'));
    if (element) element.classList.add('active');
    activeMainCategory = cat;
    applyFilters();
}

// Toggle color filter selection
function toggleColorFilter(color, element) {
    if (!element) return;
    const idx = activeColorFilters.indexOf(color);
    if (idx > -1) {
        activeColorFilters.splice(idx, 1);
        element.classList.remove('selected');
    } else {
        activeColorFilters.push(color);
        element.classList.add('selected');
    }
    applyFilters();
}

// Update price range slider visual
function fillSlider() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    const track = document.getElementById("track");
    if (!s1 || !s2 || !track) return;
    const p1 = (s1.value / s1.max) * 100;
    const p2 = (s2.value / s2.max) * 100;
    track.style.background = `linear-gradient(to right, #ddd ${p1}%, var(--royal-blue) ${p1}%, var(--royal-blue) ${p2}%, #ddd ${p2}%)`;
}

// Handle min price slider change
function slideOne() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    if (!s1 || !s2) return;
    if (parseInt(s2.value) - parseInt(s1.value) <= 20) s1.value = parseInt(s2.value) - 20;
    const range1 = document.getElementById("range1");
    if (range1) range1.textContent = s1.value;
    fillSlider();
    applyFilters();
}

// Handle max price slider change
function slideTwo() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    if (!s1 || !s2) return;
    if (parseInt(s2.value) - parseInt(s1.value) <= 20) s2.value = parseInt(s1.value) + 20;
    const range2 = document.getElementById("range2");
    if (range2) range2.textContent = s2.value;
    fillSlider();
    applyFilters();
}

// Apply all active filters to product list
function applyFilters() {
    const s1 = document.getElementById("slider-1");
    const s2 = document.getElementById("slider-2");
    const selectedDepts = Array.from(document.querySelectorAll('.dept-filter:checked')).map(cb => cb.value);

    const minPrice = s1 ? parseInt(s1.value) : 0;
    const maxPrice = s2 ? parseInt(s2.value) : 1000;

    // Detect page type (gifts vs apparel)
    const isGiftsPage = window.location.pathname.toLowerCase().includes("gifts");

    const filtered = products.filter(p => {
        // Check page category
        const matchesPage = isGiftsPage ? (p.maincategory === "gifts") : (p.maincategory === "apparel");
        if (!matchesPage) return false;

        // Check main category filter
        const matchCat = activeMainCategory === "all" || p.category === activeMainCategory || p.subcat === activeMainCategory;

        // Check all active filters
        const matchDept = selectedDepts.length === 0 || selectedDepts.includes(p.dept);
        const matchColor = activeColorFilters.length === 0 || p.colors.some(c => activeColorFilters.includes(c));
        const matchPrice = p.price >= minPrice && p.price <= maxPrice;

        return matchCat && matchDept && matchColor && matchPrice;
    });

    renderRows(filtered);
}

// Render filtered products by subcategory
function renderRows(data) {
    const container = document.getElementById('product-container');
    if (!container) return;
    container.innerHTML = "";

    // 1. STYLED "BACK TO ALL" BUTTON
    if (activeMainCategory !== "all" && activeMainCategory !== "gifts") {
        const backContainer = document.createElement('div');
        backContainer.style.textAlign = "center";
        backContainer.style.padding = "20px 0";

        backContainer.innerHTML = `
            <button onclick="setMainCategory('all')" 
                style="background-color: #f8f9fa; 
                       color: #002366; 
                       border: 1px solid #002366; 
                       padding: 10px 20px; 
                       font-weight: bold; 
                       cursor: pointer; 
                       border-radius: 4px;
                       font-size: 0.9rem;
                       transition: 0.3s;
                       display: inline-flex;
                       align-items: center;
                       gap: 10px;
                       text-transform: uppercase;">
                <span style="font-size: 1.2rem;">←</span> Back to All Categories
            </button>
        `;
        container.appendChild(backContainer);
    }

    const preferredOrder = [
        'T-Shirts', 'Crop Tops', 'Long Sleeves', 'Hoodies', 
        'Jackets', 'Pajamas', 'Hats', 'Bags', 'Bibs', 'Onesies'
    ];

    const subcategories = [...new Set(data.map(p => p.subcat))].sort((a, b) => {
        const ai = preferredOrder.indexOf(a);
        const bi = preferredOrder.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
    });

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
                            <img src="${item.image}" alt="${item.name}" class="product-img">
                            <h4 style="font-size: 1.1rem;">${item.name}</h4>
                            <p style="font-weight: bold; color: var(--brand-green);">$${item.price.toFixed(2)}</p>
                            <button class="buy-button">View Details</button>
                        </div>
                    </a>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px; padding-bottom: 40px;">
                <button class="view-more-btn" 
                    onclick="zoomToSubcategory('${sub}')"
                    style="background-color: white; 
                           color: #002366; 
                           border: 2px solid #002366; 
                           padding: 12px 28px; 
                           font-weight: bold; 
                           text-transform: uppercase; 
                           cursor: pointer; 
                           border-radius: 4px;
                           font-size: 0.85rem;
                           letter-spacing: 1px;
                           transition: 0.3s;">
                    View More ${sub}
                </button>
            </div>
        `;
        container.appendChild(section);
    });
}

// Update cart count in nav and free shipping progress
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];

    // Update Bag count in navbar
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countElement.textContent = totalItems;
    }

    // Update free shipping progress (if elements exist)
    const progressMsg = document.getElementById('shipping-message');
    const progressBar = document.getElementById('shipping-progress');
    if (!progressMsg || !progressBar) return;

    const FREE_SHIPPING_THRESHOLD = 40;
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const remaining = FREE_SHIPPING_THRESHOLD - totalPrice;

    if (remaining > 0) {
        progressMsg.innerText = `Add $${remaining.toFixed(2)} more for free shipping!`;
        progressBar.style.width = ((totalPrice / FREE_SHIPPING_THRESHOLD) * 100) + '%';
        progressMsg.style.color = "#333";
    } else {
        progressMsg.innerHTML = "🎉 You've earned <strong>FREE SHIPPING!</strong>";
        progressBar.style.width = "100%";
        progressMsg.style.color = "var(--brand-green)";
    }
}

// Zoom to specific subcategory
function zoomToSubcategory(subName) {
    activeMainCategory = subName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    applyFilters();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();

    // Set up shipping info toggle
    const toggleBtn = document.getElementById('claim-shipping-toggle');
    const details = document.getElementById('shipping-details');
    if (toggleBtn && details) {
        toggleBtn.addEventListener('click', () => {
            if (details.style.display === 'none') {
                details.style.display = 'block';
                toggleBtn.innerText = 'Close shipping info';
            } else {
                details.style.display = 'none';
                toggleBtn.innerText = 'Claim free shipping!';
            }
        });
    }
});