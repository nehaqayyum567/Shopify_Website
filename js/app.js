/**
 * NEVERMIND // MAIN APPLICATION CONTROLLER
 * Handles product rendering, filter/sort, modals, search, currency, wishlist, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

let currentFilter = 'all';
let currentSort = 'featured';
let selectedProductForModal = null;

function initApp() {
  // Initialize Cart and Wishlist
  Cart.init();

  // Render Product Catalog
  renderProducts();

  // Initialize Header Scroll Effects & Currency Switcher
  initHeaderScroll();
  initCurrencySelector();

  // Initialize Event Listeners
  initCatalogFilters();
  initModals();
  initSearch();
  initMobileNav();
  initNewsletter();
  initWishlistDrawer();
}

/**
 * 1. HEADER SCROLL & ANNOUNCEMENT BAR DISMISS
 */
function initHeaderScroll() {
  const header = document.querySelector('.main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const dismissAnnouncementBtn = document.getElementById('dismissAnnouncement');
  const announcementBar = document.getElementById('announcementBar');
  if (dismissAnnouncementBtn && announcementBar) {
    dismissAnnouncementBtn.addEventListener('click', () => {
      announcementBar.style.display = 'none';
    });
  }
}

/**
 * 2. MULTI-CURRENCY SELECTOR
 */
function initCurrencySelector() {
  const select = document.getElementById('currencySelector');
  if (select) {
    select.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      renderProducts();
      Cart.render();
      Cart.renderWishlist();
      showToast(`Currency updated to ${currentCurrency}`);
    });
  }
}

/**
 * 3. PRODUCT CATALOG RENDERING (4-COLUMN LAYOUT)
 */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  let filtered = [...PRODUCTS];

  // Filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(p => p.category === currentFilter);
  }

  // Sort
  if (currentSort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'newest') {
    filtered.sort((a, b) => b.id.localeCompare(a.id));
  }

  grid.innerHTML = filtered.map(product => {
    const isSaved = Cart.isWishlisted(product.id);
    return `
    <article class="product-card" data-id="${product.id}">
      <div class="product-image-wrap" onclick="openQuickView('${product.id}')">
        <img 
          src="${product.image}" 
          alt="${product.name}" 
          class="product-image" 
          id="img-${product.id}"
          onmouseover="this.src='${product.hoverImage || product.image}'"
          onmouseout="this.src='${product.image}'"
          loading="lazy"
        />
        <div class="product-badge-group">
          <span class="badge ${product.badgeType === 'sale' ? 'badge-sale' : 'badge-limited'}">
            ${product.badge}
          </span>
          <span class="badge badge-outline">${product.gsm}</span>
        </div>

        <button 
          type="button" 
          class="wishlist-card-btn ${isSaved ? 'active' : ''}" 
          onclick="event.stopPropagation(); Cart.toggleWishlist('${product.id}')"
          title="${isSaved ? 'Remove from Saved' : 'Save to Wishlist'}"
          aria-label="Save to Wishlist"
        >
          <svg fill="${isSaved ? '#fff' : 'none'}" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </button>

        <button 
          class="product-quick-view-btn" 
          onclick="event.stopPropagation(); openQuickView('${product.id}')"
          aria-label="Quick view ${product.name}"
        >
          QUICK VIEW // ARCHIVE SPECS
        </button>
      </div>

      <div class="product-details">
        <div class="product-tag-line">${product.tagline}</div>
        <h3 class="product-title">${product.name}</h3>
        
        <div class="product-price-row">
          <span class="original-price">${formatCurrency(product.originalPrice)}</span>
          <span class="sale-price">${formatCurrency(product.price)}</span>
          <span class="discount-tag">-${Math.round((1 - (product.price / product.originalPrice)) * 100)}%</span>
        </div>

        <div class="product-sizes-row" id="sizes-${product.id}">
          ${product.sizes.map((s, idx) => `
            <button 
              type="button" 
              class="size-pill ${idx === 1 ? 'selected' : ''}" 
              onclick="selectCardSize('${product.id}', '${s}', this)"
            >${s}</button>
          `).join('')}
        </div>

        <button 
          class="product-add-btn" 
          onclick="quickAddProduct('${product.id}')"
        >
          ADD TO BAG
        </button>
      </div>
    </article>
  `;
  }).join('');
}

function selectCardSize(productId, size, btnEl) {
  const container = document.getElementById(`sizes-${productId}`);
  if (container) {
    container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
  }
}

function getSelectedCardSize(productId) {
  const container = document.getElementById(`sizes-${productId}`);
  if (container) {
    const selected = container.querySelector('.size-pill.selected');
    if (selected) return selected.textContent.trim();
  }
  return 'L';
}

function quickAddProduct(productId) {
  const size = getSelectedCardSize(productId);
  Cart.addItem(productId, size, 1);
}

/**
 * 4. CATALOG FILTER & SORT
 */
function initCatalogFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter || 'all';
      renderProducts();
    });
  });

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }
}

/**
 * 5. QUICK VIEW MODAL WITH THUMBNAIL ANGLE SWITCHER
 */
function openQuickView(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  selectedProductForModal = product;
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('quickViewContent');

  let chosenSize = product.sizes[1] || product.sizes[0];

  content.innerHTML = `
    <div class="quickview-layout">
      <div class="quickview-gallery-wrap">
        <div class="quickview-gallery">
          <img id="qvMainImg" src="${product.image}" alt="${product.name}" />
        </div>
        <div class="quickview-thumbnails">
          <button type="button" class="qv-thumb-btn active" onclick="switchQvImg('${product.image}', this)">
            <img src="${product.image}" alt="Back View" />
            <span>BACK PRINT</span>
          </button>
          <button type="button" class="qv-thumb-btn" onclick="switchQvImg('${product.hoverImage || product.image}', this)">
            <img src="${product.hoverImage || product.image}" alt="Macro Detail" />
            <span>MACRO DETAIL</span>
          </button>
        </div>
      </div>

      <div class="quickview-info">
        <div class="product-tag-line">${product.tagline}</div>
        <h2 style="font-size: 1.6rem; margin-bottom: 12px; letter-spacing: 0.08em;">${product.name}</h2>
        
        <div class="product-price-row" style="margin-bottom: 20px;">
          <span class="original-price" style="font-size: 1.05rem;">${formatCurrency(product.originalPrice)}</span>
          <span class="sale-price" style="font-size: 1.4rem;">${formatCurrency(product.price)}</span>
          <span class="discount-tag" style="font-size: 0.8rem;">SAVE ${formatCurrency(product.originalPrice - product.price)}</span>
        </div>

        <p style="font-size: 0.9rem; line-height: 1.7; color: #b5b5b5; margin-bottom: 20px;">
          ${product.description}
        </p>

        <div style="background: #181818; border: 1px solid #282828; padding: 16px; margin-bottom: 20px; font-family: var(--font-mono); font-size: 0.75rem;">
          <div style="color: #fff; margin-bottom: 6px; font-weight: 600;">BACK PRINT SPECIFICATIONS:</div>
          <div style="color: #999; margin-bottom: 10px;">${product.backPrint}</div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #222; padding-top: 8px;">
            <span>WEIGHT: <strong style="color: #fff;">${product.gsm}</strong></span>
            <span>COLOR: <strong style="color: #fff;">${product.color}</strong></span>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
            <label style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; color: #888;">
              SELECT SIZE // OVERSIZED FIT
            </label>
            <button type="button" class="size-guide-link" onclick="openSizeGuideModal()">
              📏 SIZE GUIDE
            </button>
          </div>
          <div style="display: flex; gap: 8px;" id="qvSizesRow">
            ${product.sizes.map(s => `
              <button 
                type="button" 
                class="size-pill ${s === chosenSize ? 'selected' : ''}" 
                style="width: 44px; height: 44px; font-size: 0.85rem;"
                onclick="setQvSize('${s}', this)"
              >${s}</button>
            `).join('')}
          </div>
          <div style="margin-top: 8px; font-family: var(--font-mono); font-size: 0.7rem; color: #10b981;">
            ● ONLY ${product.inStock} PIECES REMAINING IN RUN
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-top: auto;">
          <button 
            class="btn btn-primary" 
            style="flex: 1;"
            onclick="addQvToBag('${product.id}')"
          >
            ADD TO BAG — ${formatCurrency(product.price)}
          </button>
          <button 
            type="button" 
            class="btn btn-outline" 
            style="padding: 0 18px;" 
            onclick="Cart.toggleWishlist('${product.id}')"
            title="Save to Wishlist"
          >
            ♡
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function switchQvImg(imgSrc, btnEl) {
  const mainImg = document.getElementById('qvMainImg');
  if (mainImg) mainImg.src = imgSrc;
  document.querySelectorAll('.qv-thumb-btn').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
}

function setQvSize(size, btnEl) {
  const container = document.getElementById('qvSizesRow');
  if (container) {
    container.querySelectorAll('.size-pill').forEach(b => b.classList.remove('selected'));
    btnEl.classList.add('selected');
  }
}

function addQvToBag(productId) {
  const container = document.getElementById('qvSizesRow');
  const selectedBtn = container ? container.querySelector('.size-pill.selected') : null;
  const size = selectedBtn ? selectedBtn.textContent.trim() : 'L';

  Cart.addItem(productId, size, 1);
  closeAllModals();
}

/**
 * 6. SIZE GUIDE MODAL
 */
function openSizeGuideModal() {
  const modal = document.getElementById('sizeGuideModal');
  const backdrop = document.getElementById('modalBackdrop');
  if (modal && backdrop) {
    modal.classList.add('open');
    backdrop.classList.add('open');
  }
}

/**
 * 7. WISHLIST DRAWER
 */
function initWishlistDrawer() {
  const btn = document.getElementById('wishlistToggleBtn');
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistBackdrop');
  const closeBtn = document.getElementById('wishlistCloseBtn');

  if (btn && drawer && backdrop) {
    btn.addEventListener('click', () => {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && drawer && backdrop) {
    closeBtn.addEventListener('click', closeWishlistDrawer);
    backdrop.addEventListener('click', closeWishlistDrawer);
  }
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlistDrawer');
  const backdrop = document.getElementById('wishlistBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * 8. MODAL SYSTEM & CLOSE HANDLERS
 */
function initModals() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeAllModals();
      }
    });
  }

  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
      Cart.closeDrawer();
      closeWishlistDrawer();
      closeSearch();
      closeMobileNav();
    }
  });

  const accountBtn = document.getElementById('accountBtn');
  if (accountBtn) {
    accountBtn.addEventListener('click', openAccountModal);
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.modal-container').forEach(c => c.classList.remove('open'));
  document.body.style.overflow = '';
}

function openAccountModal() {
  const modal = document.getElementById('accountModal');
  const backdrop = document.getElementById('modalBackdrop');
  if (modal && backdrop) {
    modal.classList.add('open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * 9. LIVE SEARCH MODAL
 */
function initSearch() {
  const searchBtn = document.getElementById('searchBtn');
  const searchModal = document.getElementById('searchModal');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const searchInput = document.getElementById('searchInput');
  const closeSearchBtn = document.getElementById('closeSearchBtn');

  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchModal.classList.add('open');
      searchBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInput.focus(), 150);
      renderSearchResults('');
    });
  }

  if (closeSearchBtn) {
    closeSearchBtn.addEventListener('click', closeSearch);
  }

  if (searchBackdrop) {
    searchBackdrop.addEventListener('click', (e) => {
      if (e.target === searchBackdrop) closeSearch();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderSearchResults(e.target.value);
    });
  }
}

function closeSearch() {
  const searchModal = document.getElementById('searchModal');
  const searchBackdrop = document.getElementById('searchBackdrop');
  if (searchModal && searchBackdrop) {
    searchModal.classList.remove('open');
    searchBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderSearchResults(query) {
  const resultsContainer = document.getElementById('searchResultsList');
  if (!resultsContainer) return;

  const clean = query.trim().toLowerCase();
  const matched = clean === '' 
    ? PRODUCTS.slice(0, 4) 
    : PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(clean) || 
        p.tagline.toLowerCase().includes(clean) || 
        p.backPrint.toLowerCase().includes(clean) ||
        p.category.toLowerCase().includes(clean)
      );

  if (matched.length === 0) {
    resultsContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 0; color: #777; font-family: var(--font-mono);">
        NO ARCHIVE PIECES FOUND MATCHING "${query.toUpperCase()}"
      </div>
    `;
    return;
  }

  resultsContainer.innerHTML = matched.map(p => `
    <div 
      style="display: flex; align-items: center; gap: 16px; padding: 12px; background: #181818; border: 1px solid #222; cursor: pointer; transition: border-color 0.2s;"
      onmouseover="this.style.borderColor='#ffffff'"
      onmouseout="this.style.borderColor='#222'"
      onclick="closeSearch(); openQuickView('${p.id}')"
    >
      <img src="${p.image}" alt="${p.name}" style="width: 56px; height: 70px; object-fit: cover;" />
      <div style="flex: 1;">
        <div style="font-family: var(--font-mono); font-size: 0.65rem; color: #888; text-transform: uppercase;">${p.tagline}</div>
        <div style="font-weight: 700; font-size: 0.95rem; color: #fff;">${p.name}</div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #ddd; margin-top: 4px;">
          ${formatCurrency(p.price)} <span style="text-decoration: line-through; color: #666; margin-left: 8px;">${formatCurrency(p.originalPrice)}</span>
        </div>
      </div>
      <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #fff;">VIEW →</span>
    </div>
  `).join('');
}

/**
 * 10. STORY MODAL (MISSION & VISION LEARN MORE)
 */
function openStoryModal(type) {
  const modal = document.getElementById('storyModal');
  const backdrop = document.getElementById('modalBackdrop');
  const titleEl = document.getElementById('storyModalTitle');
  const bodyEl = document.getElementById('storyModalBody');

  if (type === 'mission') {
    titleEl.textContent = 'OUR MISSION // THE ARCHITECTURE OF REBELLION';
    bodyEl.innerHTML = `
      <p style="margin-bottom: 16px;">
        NEVERMIND was founded to bridge the gulf between the uncompromising rigor of Parisian haute couture and the raw energy of underground streetwear culture.
      </p>
      <p style="margin-bottom: 16px;">
        We reject the disposable, seasonal cadence of mass fashion. Every silhouette in our catalog is engineered in strictly limited runs of 150 pieces or fewer. We develop custom 480–500 GSM loopback cotton fleece with custom spinning mills, hand-distressed seams, and bespoke oxidized silver hardware.
      </p>
      <div style="background: #161616; border: 1px solid #282828; padding: 20px; margin: 20px 0; font-family: var(--font-mono); font-size: 0.8rem;">
        <div style="color: #fff; margin-bottom: 8px; font-weight: 700;">ATELIER COMMITMENTS:</div>
        <div style="color: #aaa; line-height: 1.8;">
          • 100% GOTS-Certified Organic Combed Cotton<br>
          • Custom multi-stage mineral stone wash treatments<br>
          • Individually hand-numbered garment tags<br>
          • Lifetime complimentary seam & hardware repair guarantee
        </div>
      </div>
    `;
  } else {
    titleEl.textContent = 'OUR VISION // CULTURAL PERMANENCE';
    bodyEl.innerHTML = `
      <p style="margin-bottom: 16px;">
        Our vision is the creation of wearable artifacts that transcend ephemeral algorithmic trends. We believe a garment should mature alongside its owner, developing unique character through years of wear.
      </p>
      <p style="margin-bottom: 16px;">
        By combining architectural silhouettes with subversive graphic narratives—such as our Los Angeles cartographic archive and acid-wash anatomy prints—NEVERMIND serves as uniform armor for creative visionaries across Tokyo, Paris, and Manila.
      </p>
      <div style="background: #161616; border: 1px solid #282828; padding: 20px; margin: 20px 0; font-family: var(--font-mono); font-size: 0.8rem;">
        <div style="color: #fff; margin-bottom: 8px; font-weight: 700;">ARCHIVAL DROPS ROADMAP:</div>
        <div style="color: #aaa; line-height: 1.8;">
          • DROP 004: Winter Oversized Fleece (Live Now)<br>
          • DROP 005: Heavyweight Raw Denim & Technical Parkas (Q1 2027)<br>
          • PRIVATE SALON: Manila & Tokyo Pop-Up Showrooms
        </div>
      </div>
    `;
  }

  modal.classList.add('open');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

/**
 * 11. CHECKOUT SIMULATION MODAL
 */
function openCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('modalBackdrop');
  const orderNum = 'NVM-' + Math.floor(100000 + Math.random() * 900000);
  const checkoutSummary = document.getElementById('checkoutSummary');

  if (checkoutSummary) {
    checkoutSummary.innerHTML = `
      <div style="margin-bottom: 16px; font-family: var(--font-mono); font-size: 0.75rem; color: #888;">
        ORDER REFERENCE: <strong style="color: #fff;">#${orderNum}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); margin-bottom: 8px;">
        <span>BAG SUBTOTAL:</span>
        <span>${formatCurrency(Cart.getSubtotal())}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); margin-bottom: 8px; color: #10b981;">
        <span>EXPRESS SHIPPING:</span>
        <span>COMPLIMENTARY</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-weight: 700; font-size: 1.1rem; border-top: 1px solid #262626; padding-top: 12px; margin-top: 12px;">
        <span>TOTAL AMOUNT (${currentCurrency}):</span>
        <span style="color: #fff;">${formatCurrency(Cart.getTotal())}</span>
      </div>
    `;
  }

  modal.classList.add('open');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function confirmOrderPlacement() {
  Cart.items = [];
  Cart.saveToStorage();
  Cart.render();
  closeAllModals();
  showToast('Order confirmed! Tracking details sent to email.');
}

/**
 * 12. MOBILE MENU DRAWER
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavClose');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', closeMobileNav);
  }

  document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });
}

function closeMobileNav() {
  const drawer = document.getElementById('mobileNavDrawer');
  if (drawer) {
    drawer.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/**
 * 13. NEWSLETTER & VIP DROP SIGNUP
 */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      if (input && input.value) {
        showToast(`VIP Access granted for: ${input.value}`);
        input.value = '';
      }
    });
  }
}

/**
 * 14. TOAST NOTIFICATION UTILITY
 */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3200);
}
