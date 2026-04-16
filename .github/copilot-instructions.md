# Royal Fashion AI Coding Instructions

## Purpose
Concise, actionable guidance for AI agents working on this client-side e-commerce storefront.

## Architecture Overview

**Tech Stack:**
- **Frontend:** Vanilla JavaScript, HTML, CSS (no build step or framework)
- **Data Layer:** Supabase PostgreSQL backend (real-time product data and images)
- **State:** localStorage for cart (`royalCart` key)
- **Styling:** CSS files organized by domain (base, layout, shop, product, home)

**Key Data Flow:**
1. `js/shop.js` → Supabase `products` table → renders product grid into `#product-container`
2. `js/app.js` → Supabase product lookup by ID → renders single product with color/size selection
3. `js/cart.js` → localStorage cart persistence → renders cart page with quantity controls
4. `index.html` carousel uses vanilla drag+auto-scroll (no library)

## Critical Files & Their Roles

| File | Purpose |
|------|---------|
| `js/shop.js` | Product listing, filtering (dept, price, color), category navigation. Loads products from Supabase. |
| `js/app.js` | Single product detail page. Loads by ID, renders color swatches, size selection, cart add. Includes `imageOverrides` map for special product images. |
| `js/cart.js` | Cart render, qty +/-, checkout validation. **Note:** Has duplicate function definitions (both at top and bottom of file). |
| `apparel.html` | Shop page layout; includes filters sidebar, category tabs, product container. |
| `product-detail.html` | Product detail page template; zoom region and size grids. |
| `cart.html` | Cart page; loads `js/cart.js` and renders from localStorage. |
| `products.json` | Legacy file; **NOT USED** — Supabase is the source of truth. |

## Key Patterns & Conventions

### Supabase Integration
- Both `shop.js` and `app.js` create a Supabase client:
  ```javascript
  const SUPABASE_URL = 'https://gouaisrlgkgrfymqsqas.supabase.co'
  const SUPABASE_KEY = '...' // Public anon key
  const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
  ```
- Products table has columns: `id`, `name`, `price`, `maincategory`, `category`, `subcat`, `dept`, `sizes`, `colors`, `image`
- Field names are **lowercase** (e.g., `maincategory` not `mainCategory`)

### Cart Data Structure
```javascript
// localStorage['royalCart'] is an array of:
{
  id,            // product ID
  name,          // product name
  price,         // unit price
  image,         // image URL
  size,          // selected size string
  selectedColor, // selected color string
  quantity,      // number of units
  link           // product-detail.html?id=...
}
```

### Color Handling
- `app.js` maintains a `colorCSS` map for rendering swatch circles (maps color name to hex).
- `imageOverrides` object in `app.js` maps product ID → color → image path for manual overrides (e.g., product 26 has color-specific images).
- Default: filename is auto-built from product image path + color name; use overrides if pattern doesn't match.

### Filtering Logic (`shop.js`)
- Page detection: `window.location.pathname.includes('gifts')` → apparel vs gifts catalog
- Filters work on `products` array loaded from Supabase
- Filter by: dept (Men/Women/Kids/Infants/Unisex), price range, color, category/subcat
- **Note:** Field `maincategory` is checked lowercase in comparisons

### Global Functions (exposed on `window`)
- `updateCartCount()` — refreshes cart badge in nav
- `applyFilters()` — re-filters and renders product grid
- `setMainCategory(cat, element)` — changes active category tab
- `toggleColorFilter(color, element)` — toggles color filter
- `changeQty(amount)` — adjusts quantity in product detail
- Many functions called directly via `onclick=""` in HTML

## Common Tasks & Where to Make Changes

### Add or Update a Product
1. Add/edit row in Supabase `products` table (not `products.json`)
2. Ensure `image` column points to a URL (can be relative like `Images/product.webp` or external)
3. If colors need custom image mappings, add entry to `imageOverrides` in `app.js`

### Change Shipping Thresholds
- `js/shop.js`, line ~290+: look for `40` and `100` in free shipping logic
- `js/cart.js`, lines ~75–95: same thresholds in shipping status display

### Modify Filter Options (Dept, Price, etc.)
- `apparel.html`: update checkboxes in `<aside class="filter-sidebar">` to change available filter values
- `js/shop.js` `applyFilters()`: update comparison logic if schema changes

### Add New Page
1. Create HTML file (e.g., `blog.html`)
2. Import `js/shop.js` or custom JS as needed
3. Use `window.location.pathname.includes('blog')` pattern to detect page in JS logic

## Code Quality Issues (Known)

- **js/cart.js has duplicate functions:** `updateQty()` and `removeFromCart()` are defined twice (once at top, again mid-file). Consolidate to single definition.
- **No error boundaries:** Supabase fetch errors are logged to console only; consider user-facing error messages.
- **Inline styles:** Many HTML elements use inline styles; consider CSS classes for maintainability.
- **Global scope pollution:** Many functions on `window` instead of module pattern; manageable for small app but could refactor to object namespace.

## Developer Workflow

### Local Testing
```bash
cd "Royal Fashion"
python3 -m http.server 8000
# Visit http://localhost:8000/
```

### Debugging
- **Console:** inspect Supabase errors, filter state, cart contents
- **localStorage:** `JSON.parse(localStorage.getItem('royalCart'))` to view cart
- **Network tab:** watch Supabase API calls
- **Breakpoints:** set in DevTools on `js/*.js` files

### Deployment
- No build step; all files are static
- Supabase credentials are in client-side JS (acceptable for public anon key with RLS policies)
- Images should be hosted on Supabase Storage or CDN, referenced by URL in `image` column

## What's NOT Here
- No backend API beyond Supabase
- No tests, CI/CD, or build tooling
- No real payment integration (checkout button is placeholder)
- No user authentication

---

**Last Updated:** April 2026  
**Analyzed:** Supabase-backed storefront with static HTML + vanilla JS
