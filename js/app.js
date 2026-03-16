const SUPABASE_URL = 'https://gouaisrlgkgrfymqsqas.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdWFpc3JsZ2tncmZ5bXFzcWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MzI3NDEsImV4cCI6MjA4OTIwODc0MX0.wES6GjiS0D5FojHQEiTrE9SLAW-ep3BnxMuBlarC6wE'
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;

// Maps color names to CSS colors for swatch circles
const colorCSS = {
    'white':     '#ffffff',
    'black':     '#000000',
    'gray':      '#888888',
    'grey':      '#888888',
    'navy':      '#001f5b',
    'navy blue': '#001f5b',
    'blue':      '#1a6bbf',
    'purple':    '#6a0dad',
    'maroon':    '#800000',
    'red':       '#cc0000',
    'pink':      '#ffb6c1',
    'light pink':'#ffccd5',
    'hot pink':  '#ff69b4',
    'green':     '#39bd44',
    'yellow':    '#ffd700',
    'orange':    '#ff8c00',
    'silver':    '#c0c0c0',
    'light gray':'#d3d3d3',
    'dark gray': '#555555',
}

// Manual image maps for products with special characters in their name
// Add new products here as needed: id: { color: 'Images/filename.ext' }
const imageOverrides = {
    26: {
        'white':  'Images/ilnyonesiewhite.webp',
        'black':  'Images/ilnyonesieblack.webp',
        'gray':   'Images/ilnyonesiegray.webp',
        'navy':   'Images/ilnyonesienavy.webp',
        'purple': 'Images/ilnyonesiepurple.webp',
        'maroon': 'Images/ilnyonesiemaroon.webp',
        'pink':   'Images/ilnyonesiepink.webp'
    }
}

async function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    try {
        const { data, error } = await db
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (error) throw error

        currentProduct = data;

        if (currentProduct) {
            // 1. Basic Info
            document.title = `${currentProduct.name} | Royal Fashion NYC`;
            document.querySelector('.breadcrumb').innerText = `Shop / ${currentProduct.dept} / ${currentProduct.subcat}`;
            document.querySelector('.product-title').innerText = currentProduct.name;
            document.querySelector('.product-price').innerText = `$${parseFloat(currentProduct.price).toFixed(2)}`;

            const mainImg = document.getElementById('mainProductImg');
            mainImg.src = currentProduct.image;
            mainImg.alt = currentProduct.name;

            // 2. Color Swatches
            const colorSection = document.getElementById('color-section');
            const colorGrid = document.getElementById('color-grid');
            const colorLabel = document.getElementById('selected-color-label');

            if (currentProduct.colors && currentProduct.colors.length > 0 && colorSection && colorGrid) {
                colorGrid.innerHTML = '';
                colorSection.style.display = 'block';

                currentProduct.colors.forEach((color, index) => {
                    const swatch = document.createElement('div');
                    swatch.className = `color-swatch ${index === 0 ? 'selected' : ''}`;
                    swatch.setAttribute('data-color', color);
                    swatch.style.backgroundColor = colorCSS[color.toLowerCase()] || color;
                    swatch.title = color;

                    swatch.onclick = function() {
                        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedColor = this.getAttribute('data-color');
                        if (colorLabel) colorLabel.innerText = selectedColor;

                        // Check for manual override first
                        const override = imageOverrides[currentProduct.id];
                        if (override && override[selectedColor.toLowerCase()]) {
                            mainImg.src = override[selectedColor.toLowerCase()];
                        } else {
                            // Auto-build filename from product name + color
                            const basePath = currentProduct.image;
                            const ext = basePath.split('.').pop();
                            const folder = basePath.includes('/') ? basePath.substring(0, basePath.lastIndexOf('/') + 1) : 'Images/';
                            const productSlug = currentProduct.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                            const colorSlug = selectedColor.toLowerCase().replace(/\s/g, '');
                            const newSrc = `${folder}${productSlug}${colorSlug}.${ext}`;
                            const testImg = new Image();
                            testImg.onload = () => { mainImg.src = newSrc; }
                            testImg.onerror = () => { /* keep current image if not found */ }
                            testImg.src = newSrc;
                        }
                    };

                    colorGrid.appendChild(swatch);
                });

                selectedColor = currentProduct.colors[0];
                if (colorLabel) colorLabel.innerText = selectedColor;
            } else if (colorSection) {
                colorSection.style.display = 'none';
            }

            // 3. Size Grids
            const infantGrid = document.getElementById('infant-grid');
            const kidsGrid = document.getElementById('kids-grid');
            const womenGrid = document.getElementById('women-grid');
            const adultGrid = document.getElementById('adult-grid');

            if (currentProduct.sizes && currentProduct.sizes.length > 0) {
                [infantGrid, kidsGrid, womenGrid, adultGrid].forEach(grid => { if (grid) grid.innerHTML = ''; });
                ['infant-section', 'kids-section', 'women-section', 'adult-section'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });

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

                    const sizeLower = size.toLowerCase();

                    if (sizeLower.includes("women")) {
                        if (womenGrid) {
                            womenGrid.appendChild(tile);
                            document.getElementById('women-section').style.display = 'block';
                        }
                    } else if (size.includes("Months") || size.includes("2T") || size.includes("6M") || size.includes("12M") || size.includes("18M")) {
                        if (infantGrid) {
                            infantGrid.appendChild(tile);
                            document.getElementById('infant-section').style.display = 'block';
                        }
                    } else if (size.includes("(")) {
                        if (kidsGrid) {
                            kidsGrid.appendChild(tile);
                            document.getElementById('kids-section').style.display = 'block';
                        }
                    } else {
                        if (adultGrid) {
                            adultGrid.appendChild(tile);
                            document.getElementById('adult-section').style.display = 'block';
                        }
                    }

                    if (index === 0) selectedSize = size;
                });

            } else {
                ['infant-section', 'kids-section', 'women-section', 'adult-section'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.style.display = 'none';
                });
                const selGroup = document.querySelector('.selection-group');
                if (selGroup) selGroup.style.display = 'none';
                selectedSize = 'OS';
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
        document.querySelector('.product-detail-container').innerHTML = `<h1>Error loading product. Please try again.</h1>`;
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        countElement.textContent = total;
    }
}

function updateUIFromCart() {
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

function changeQty(amount) {
    if (!currentProduct || !selectedSize) return;

    const mainImg = document.getElementById('mainProductImg');
    let cart = JSON.parse(localStorage.getItem('royalCart')) || [];
    const index = cart.findIndex(item => item.id === currentProduct.id && item.size === selectedSize);

    if (index > -1) {
        cart[index].quantity += amount;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
    } else if (amount > 0) {
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: mainImg ? mainImg.src : currentProduct.image,
            size: selectedSize,
            color: selectedColor || '',
            quantity: 1,
            link: `product-detail.html?id=${currentProduct.id}`
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

    if (initialAddBtn) initialAddBtn.onclick = () => changeQty(1);
    if (plusBtn) plusBtn.onclick = () => changeQty(1);
    if (minusBtn) minusBtn.onclick = () => changeQty(-1);

    if (document.querySelector('.product-title')) {
        loadProductDetails();
    }
}); 