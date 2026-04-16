// Button-based carousel navigation
class Carousel {
    constructor(trackSelector, productIds = []) {
        this.track = document.querySelector(trackSelector);
        if (!this.track) return;

        this.productIds = productIds;
        this.scrollPos = 0;
        this.itemWidth = 220; // product card width + gap
        this.scrollAmount = this.itemWidth; // scroll one item at a time

        this.leftBtn = document.getElementById('carouselLeftBtn');
        this.rightBtn = document.getElementById('carouselRightBtn');

        this.init();
    }

    init() {
        this.populateCarousel();
        this.setupEventListeners();
    }

    populateCarousel() {
        if (this.productIds.length === 0) return;

        this.productIds.forEach(id => {
            const link = document.createElement('a');
            link.href = `product-detail.html?id=${id}`;
            link.className = 'carousel-product-link';
            link.draggable = false;
            link.innerHTML = `<div class="carousel-item" data-product-id="${id}"></div>`;
            this.track.appendChild(link);
        });
    }

    setupEventListeners() {
        if (this.leftBtn) {
            this.leftBtn.addEventListener('click', () => this.scroll(-1));
        }
        if (this.rightBtn) {
            this.rightBtn.addEventListener('click', () => this.scroll(1));
        }
    }

    scroll(direction) {
        const container = this.track.parentElement;
        const maxScroll = Math.max(0, this.track.scrollWidth - container.offsetWidth);
        
        this.scrollPos += direction * this.scrollAmount;
        this.scrollPos = Math.max(0, Math.min(this.scrollPos, maxScroll));
        
        this.track.style.transform = `translateX(-${this.scrollPos}px)`;

        // Update button states
        if (this.leftBtn) this.leftBtn.disabled = this.scrollPos === 0;
        if (this.rightBtn) this.rightBtn.disabled = this.scrollPos >= maxScroll;
    }
}

// Initialize carousel on page load
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('aparelCarouselTrack');
    if (track) {
        // Fetch first few products to display in carousel
        const SUPABASE_URL = 'https://gouaisrlgkgrfymqsqas.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvdWFpc3JsZ2tncmZ5bXFzcWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MzI3NDEsImV4cCI6MjA4OTIwODc0MX0.wES6GjiS0D5FojHQEiTrE9SLAW-ep3BnxMuBlarC6wE';
        const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        (async () => {
            try {
                // Fetch product IDs
                const { data, error } = await db
                    .from('products')
                    .select('id')
                    .eq('maincategory', 'apparel')
                    .limit(12);

                if (error) throw error;

                const ids = data.map(p => p.id);
                const carousel = new Carousel('#aparelCarouselTrack', ids);

                // Populate carousel items with product images
                const { data: products, error: prodError } = await db
                    .from('products')
                    .select('id, image, name')
                    .eq('maincategory', 'apparel')
                    .limit(12);

                if (prodError) throw prodError;

                products.forEach(product => {
                    const item = document.querySelector(`[data-product-id="${product.id}"]`);
                    if (item) {
                        const img = document.createElement('img');
                        img.src = product.image;
                        img.alt = product.name;
                        img.className = 'carousel-img';
                        img.draggable = false;
                        item.innerHTML = '';
                        item.appendChild(img);
                    }
                });

                // Initialize button states after a small delay to ensure layout is calculated
                setTimeout(() => carousel.scroll(0), 100);
            } catch (err) {
                console.error('Error loading carousel:', err);
            }
        })();
    }
});
