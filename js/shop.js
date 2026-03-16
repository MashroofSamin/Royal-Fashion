let products = [];
let activeMainCategory = window.activeMainCategory || "all";
let activeColorFilters = [];
window.refreshGlobalCart = function() { updateCartCount(); };

const SUPABASE_URL = 'https://gouaisrlgkgrfymqsqas.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdWFpc3JsZ2tncmZ5bXFzcWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MzI3NDEsImV4cCI6MjA4OTIwODc0MX0.wES6GjiS0D5FojHQEiTrE9SLAW-ep3BnxMuBlarC6wE'
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
async function loadProducts() {
    try {
        const { data, error } = await db
            .from('products')
            .select('*')

        if (error) throw error

        products = data;
        console.log('Products from Supabase:', products);
        

        if (document.getElementById("slider-1")) {
            fillSlider();
        }

        applyFilters();
        updateCartCount();
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

    // --- SMARTER PAGE DETECTION ---
    const path = window.location.pathname.toLowerCase();
    
    // This checks if "gifts" is anywhere in the URL name
    const isGiftsPage = path.includes("gifts");

    const filtered = products.filter(p => {
        // 1. PAGE CHECK
        // If we are on the gifts page, only show "gifts". Otherwise, show "apparel".
        const matchesPage = isGiftsPage ? (p.maincategory === "gifts") : (p.maincategory === "apparel");

        if (!matchesPage) return false; 

        // 2. CATEGORY CHECK
        const matchCat = activeMainCategory === "all" || 
        activeMainCategory === "gifts" ||
        p.category === activeMainCategory ||
        p.subcat === activeMainCategory;

        // 3. OTHER FILTERS
        const matchDept = selectedDepts.length === 0 || selectedDepts.includes(p.dept);
        const matchColor = activeColorFilters.length === 0 || p.colors.some(c => activeColorFilters.includes(c));
        const matchPrice = p.price >= minP && p.price <= maxP;

        return matchCat && matchDept && matchColor && matchPrice;
    });

    renderRows(filtered);
}

let visibleLimits = {}; // Object to track the limit for each subcategory

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

function updateCartCount() {
    // 1. Get the current cart from local storage
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    
    // 2. Update the Bag number in the Nav
    const countElement = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    if (countElement) countElement.textContent = totalItems;

    // 3. FREE SHIPPING CALCULATION
    const goal = 40; // Set your free shipping threshold here
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    
    const progressMsg = document.getElementById('shipping-message');
    const progressBar = document.getElementById('shipping-progress');

    // Only run if the elements exist on the current page
    if (progressMsg && progressBar) {
        const remaining = goal - totalPrice;

        if (remaining > 0) {
            // Still progress to be made
            progressMsg.innerText = `Add $${remaining.toFixed(2)} more for free shipping!`;
            
            // Calculate percentage (e.g., $40 spent / $100 goal = 40%)
            const percent = (totalPrice / goal) * 100;
            progressBar.style.width = percent + "%";
            progressMsg.style.color = "#333"; // Default color
        } else {
            // Goal reached
            progressMsg.innerHTML = "🎉 You've earned <strong>FREE SHIPPING!</strong>";
            progressBar.style.width = "100%";
            progressMsg.style.color = "var(--brand-green)"; // Turn text green
        }
    }
}

// Call this immediately so the number is correct when the page opens
updateCartCount();

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('claim-shipping-toggle');
    const details = document.getElementById('shipping-details');

    if (toggleBtn && details) {
        toggleBtn.addEventListener('click', () => {
            // If it's hidden, show it. If it's shown, hide it.
            if (details.style.display === "none") {
                details.style.display = "block";
                toggleBtn.innerText = "Close shipping info";
            } else {
                details.style.display = "none";
                toggleBtn.innerText = "Claim free shipping!";
            }
        });
    }
});

function zoomToSubcategory(subName) {
    // 1. Set the global filter to the subcategory name
    activeMainCategory = subName;

    // 2. Scroll to the top of the page so the user sees the new results
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 3. Re-run the filters
    applyFilters();

    // 4. (Optional) Add a "Back to All" button or update the UI
    console.log("Viewing more of: " + subName);
}

// Run everything inside ONE listener to prevent double-firing
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartCount();
});