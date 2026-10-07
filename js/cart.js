/**
 * NEVERMIND // CART & WISHLIST STATE MANAGEMENT
 * Handles shopping bag, wishlists, promo codes, multi-currency recalculations, and checkout
 */

const Cart = {
  items: [],
  wishlist: [],
  discountPercent: 0,
  discountFixed: 0,
  freeShippingOverride: false,
  activePromoCode: '',
  freeShippingThreshold: 7500, // Base in PHP

  init() {
    this.loadFromStorage();
    this.render();
    this.renderWishlist();
    this.bindEvents();
  },

  loadFromStorage() {
    try {
      const savedCart = localStorage.getItem('nevermind_cart');
      if (savedCart) this.items = JSON.parse(savedCart);
    } catch (e) {
      this.items = [];
    }

    try {
      const savedWishlist = localStorage.getItem('nevermind_wishlist');
      if (savedWishlist) this.wishlist = JSON.parse(savedWishlist);
    } catch (e) {
      this.wishlist = [];
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('nevermind_cart', JSON.stringify(this.items));
      localStorage.setItem('nevermind_wishlist', JSON.stringify(this.wishlist));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  },

  /* Cart Operations */
  addItem(productId, size = 'L', quantity = 1) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = this.items.findIndex(
      item => item.productId === productId && item.size === size
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: `${productId}-${size}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        size: size,
        quantity: quantity
      });
    }

    this.saveToStorage();
    this.render();
    this.openDrawer();
    showToast(`Added to Bag: ${product.name} [${size}]`);
  },

  updateQuantity(itemId, delta) {
    const itemIndex = this.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return;

    const newQty = this.items[itemIndex].quantity + delta;
    if (newQty <= 0) {
      this.removeItem(itemId);
    } else {
      this.items[itemIndex].quantity = newQty;
      this.saveToStorage();
      this.render();
    }
  },

  removeItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    this.items = this.items.filter(i => i.id !== itemId);
    this.saveToStorage();
    this.render();
    if (item) {
      showToast(`Removed from Bag: ${item.name}`);
    }
  },

  /* Wishlist Operations */
  toggleWishlist(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;

    const index = this.wishlist.indexOf(productId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
      showToast(`Removed from Saved: ${product.name}`);
    } else {
      this.wishlist.push(productId);
      showToast(`Saved to Wishlist: ${product.name}`);
    }

    this.saveToStorage();
    this.renderWishlist();
    if (typeof renderProducts === 'function') renderProducts();
  },

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  },

  renderWishlist() {
    const badge = document.getElementById('wishlistCountBadge');
    if (badge) {
      const count = this.wishlist.length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    const listEl = document.getElementById('wishlistItemsList');
    if (!listEl) return;

    if (this.wishlist.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-message">
          <svg style="width: 44px; height: 44px; margin: 0 auto 12px; stroke: #444;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
          <p style="color: #fff; margin-bottom: 6px;">NO SAVED SILHOUETTES</p>
          <p style="font-size: 0.72rem; color: #777;">Save your favorite archive hoodies for quick access.</p>
        </div>
      `;
      return;
    }

    listEl.innerHTML = this.wishlist.map(pid => {
      const p = PRODUCTS.find(prod => prod.id === pid);
      if (!p) return '';
      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}" class="cart-item-img">
          <div>
            <div class="cart-item-title">${p.name}</div>
            <div class="cart-item-price">${formatCurrency(p.price)}</div>
            <button class="btn btn-minimal" style="padding: 4px 0; font-size: 0.7rem; margin-top: 6px;" onclick="Cart.addItem('${p.id}', 'L', 1)">
              MOVE TO BAG
            </button>
          </div>
          <button class="cart-remove-btn" onclick="Cart.toggleWishlist('${p.id}')" title="Remove from Saved">✕</button>
        </div>
      `;
    }).join('');
  },

  /* Promo Codes */
  applyPromo(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'DISRUPT10') {
      this.discountPercent = 10;
      this.discountFixed = 0;
      this.activePromoCode = cleanCode;
      showToast('Promo Code Applied: 10% Off');
      this.render();
    } else if (cleanCode === 'ELEGANCE') {
      this.discountPercent = 0;
      this.discountFixed = 500;
      this.activePromoCode = cleanCode;
      showToast('Promo Code Applied: ₱500 Off');
      this.render();
    } else if (cleanCode === 'VIPDROP') {
      this.discountPercent = 15;
      this.discountFixed = 0;
      this.activePromoCode = cleanCode;
      showToast('VIP Drop Code Applied: 15% Off');
      this.render();
    } else if (cleanCode === 'FREESHIP') {
      this.freeShippingOverride = true;
      this.activePromoCode = cleanCode;
      showToast('Promo Applied: Complimentary Shipping');
      this.render();
    } else {
      showToast('Invalid Promo Code. Try "DISRUPT10" or "VIPDROP"');
    }
  },

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getTotal() {
    const subtotal = this.getSubtotal();
    let discount = 0;
    if (this.discountPercent > 0) {
      discount = subtotal * (this.discountPercent / 100);
    } else if (this.discountFixed > 0) {
      discount = Math.min(this.discountFixed, subtotal);
    }
    return Math.max(0, subtotal - discount);
  },

  getItemCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  },

  openDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (drawer && backdrop) {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartBackdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  render() {
    const countBadge = document.getElementById('cartCountBadge');
    const totalCount = this.getItemCount();
    if (countBadge) {
      countBadge.textContent = totalCount;
      countBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    const listEl = document.getElementById('cartItemsList');
    if (!listEl) return;

    if (this.items.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-message">
          <svg style="width: 48px; height: 48px; margin: 0 auto 16px; stroke: #333;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <p style="color: #fff; margin-bottom: 8px;">YOUR BAG IS EMPTY</p>
          <p style="font-size: 0.75rem; color: #777;">Explore DROP 004 archive silhouettes to proceed.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = this.items.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-size">SIZE: ${item.size}</div>
            <div class="cart-item-price">${formatCurrency(item.price)}</div>
            <div class="cart-qty-stepper">
              <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="Cart.updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-remove-btn" onclick="Cart.removeItem('${item.id}')" title="Remove Item" aria-label="Remove Item">✕</button>
        </div>
      `).join('');
    }

    // Update free shipping bar
    const subtotal = this.getSubtotal();
    const shippingThreshold = this.freeShippingThreshold;
    const progressFill = document.getElementById('shippingProgressFill');
    const progressText = document.getElementById('shippingProgressText');

    if (progressFill && progressText) {
      if (this.freeShippingOverride || subtotal >= shippingThreshold) {
        progressFill.style.width = '100%';
        progressText.innerHTML = `<span>COMPLIMENTARY EXPRESS SHIPPING UNLOCKED</span> <span>100%</span>`;
      } else {
        const percent = Math.min(100, (subtotal / shippingThreshold) * 100);
        const remaining = shippingThreshold - subtotal;
        progressFill.style.width = `${percent}%`;
        progressText.innerHTML = `<span>ADD ${formatCurrency(remaining)} MORE FOR FREE EXPRESS SHIPPING</span> <span>${Math.round(percent)}%</span>`;
      }
    }

    // Update totals
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountVal = document.getElementById('cartDiscountVal');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (totalEl) totalEl.textContent = formatCurrency(this.getTotal());

    if (discountRow && discountVal) {
      const discount = subtotal - this.getTotal();
      if (discount > 0) {
        discountRow.style.display = 'flex';
        discountVal.textContent = `-${formatCurrency(discount)} (${this.activePromoCode})`;
      } else {
        discountRow.style.display = 'none';
      }
    }
  },

  bindEvents() {
    const backdrop = document.getElementById('cartBackdrop');
    const closeBtn = document.getElementById('cartCloseBtn');
    const cartToggle = document.getElementById('cartToggleBtn');

    if (backdrop) backdrop.addEventListener('click', () => this.closeDrawer());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeDrawer());
    if (cartToggle) cartToggle.addEventListener('click', () => this.openDrawer());

    const promoBtn = document.getElementById('applyPromoBtn');
    const promoInput = document.getElementById('promoInput');
    if (promoBtn && promoInput) {
      promoBtn.addEventListener('click', () => {
        this.applyPromo(promoInput.value);
      });
      promoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.applyPromo(promoInput.value);
        }
      });
    }

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) {
          showToast('Your bag is currently empty.');
          return;
        }
        this.closeDrawer();
        openCheckoutModal();
      });
    }
  }
};
