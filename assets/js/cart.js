// Shopping Cart System
class ShoppingCart {
  constructor() {
    this.cart = this.loadCart();
    this.updateCartUI();
  }

  loadCart() {
    const saved = localStorage.getItem('blackTShirtCart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('blackTShirtCart', JSON.stringify(this.cart));
    this.updateCartUI();
  }

  addItem(product) {
    if (!product.color || product.quantity < 1) {
      alert('Please select color and quantity');
      return false;
    }
    const sizePart = product.size ? '-' + product.size : '';
    const itemId = product.id + '-' + product.color + sizePart;

    const item = {
      id: itemId,
      productId: product.id,
      name: product.name,
      color: product.color,
      size: product.size || null,
      sizeName: product.sizeName || null,
      quantity: parseInt(product.quantity),
      price: product.price,
      image: product.image || ''
    };

    // Check if item already exists (same product, color, size)
    const existingIndex = this.cart.findIndex(
      (cartItem) => cartItem.id === item.id
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += item.quantity;
    } else {
      this.cart.push(item);
    }

    this.saveCart();
    this.showCartNotification();
    return true;
  }

  removeItem(itemId) {
    this.cart = this.cart.filter((item) => item.id !== itemId);
    this.saveCart();
  }

  updateQuantity(itemId, quantity) {
    const item = this.cart.find((item) => item.id === itemId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(itemId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  getTotal() {
    return this.cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart() {
    this.cart = [];
    this.saveCart();
  }

  updateCartUI() {
    const count = this.getItemCount();
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  showCartNotification() {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = 'Added to cart!';
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  getCart() {
    return this.cart;
  }
}

// Initialize cart
const cart = new ShoppingCart();

// Global function to add product to cart
function addToCart(productId, productName, productPrice, productImage) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const color = card?.querySelector('.color-selector input:checked')?.value;
  const sizeInput = card?.querySelector('.size-selector input:checked');
  const size = sizeInput ? sizeInput.value : null;
  const quantityInput = card?.querySelector('.quantity-input input');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  if (!color) {
    alert('Please select a color');
    return;
  }
  if (card?.querySelector('.size-selector') && !size) {
    alert('Please select a size');
    return;
  }

  let sizeName = null;
  if (size && typeof Store !== 'undefined' && Store.getSizes) {
    const s = Store.getSizes().find(function (x) { return x.id === size; });
    sizeName = (s && s.name) ? s.name : size;
  }

  const product = {
    id: productId,
    name: productName,
    color: color,
    size: size,
    sizeName: sizeName,
    quantity: quantity,
    price: productPrice,
    image: productImage
  };

  if (cart.addItem(product)) {
    if (quantityInput) {
      quantityInput.value = 1;
    }
  }
}

// Buy Now function - adds to cart and redirects to checkout immediately
function buyNow(productId, productName, productPrice, productImage) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const color = card?.querySelector('.color-selector input:checked')?.value;
  const sizeInput = card?.querySelector('.size-selector input:checked');
  const size = sizeInput ? sizeInput.value : null;
  const quantityInput = card?.querySelector('.quantity-input input');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  if (!color) {
    alert('Please select a color');
    return;
  }
  if (card?.querySelector('.size-selector') && !size) {
    alert('Please select a size');
    return;
  }

  let sizeName = null;
  if (size && typeof Store !== 'undefined' && Store.getSizes) {
    const s = Store.getSizes().find(function (x) { return x.id === size; });
    sizeName = (s && s.name) ? s.name : size;
  }

  cart.clearCart();
  const product = {
    id: productId,
    name: productName,
    color: color,
    size: size,
    sizeName: sizeName,
    quantity: quantity,
    price: productPrice,
    image: productImage
  };

  if (cart.addItem(product)) {
    proceedToCheckout();
  }
}

// Buy Now via WhatsApp (alternative quick checkout)
function buyNowWhatsApp(productId, productName, productPrice) {
  const card = document.querySelector(`[data-product-id="${productId}"]`);
  const color = card?.querySelector('.color-selector input:checked')?.value;
  const sizeInput = card?.querySelector('.size-selector input:checked');
  const sizeName = sizeInput && typeof Store !== 'undefined' && Store.getSizes ? (Store.getSizes().find(function (x) { return x.id === sizeInput.value; }) || {}).name || sizeInput.value : null;
  const quantityInput = card?.querySelector('.quantity-input input');
  const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

  if (!color) {
    alert('Please select a color');
    return;
  }
  if (card?.querySelector('.size-selector') && !sizeInput?.value) {
    alert('Please select a size');
    return;
  }

  const totalPrice = productPrice * quantity;
  let message = `Hello, I want to buy this T-shirt.\nProduct: ${productName}\nColor: ${color}\nQuantity: ${quantity}\nPrice: ${totalPrice} MAD`;
  if (sizeName) message += '\nSize: ' + sizeName;
  const phone = (typeof Store !== 'undefined' && Store.getWhatsappNumber) ? Store.getWhatsappNumber() : '';
  if (!phone) return;
  const whatsappUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(message);
  window.open(whatsappUrl, '_blank');
}

// Quantity controls
function changeQuantity(productId, change) {
  const input = document.querySelector(`[data-product-id="${productId}"] .quantity-input input`);
  if (input) {
    const current = parseInt(input.value) || 1;
    const newValue = Math.max(1, current + change);
    input.value = newValue;
  }
}

// Open cart modal
function openCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-modal', 'true');
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('aria-hidden', 'true');
    renderCart();
    var closeBtn = modal.querySelector('.cart-close');
    if (closeBtn) closeBtn.focus();
  }
}

// Close cart modal
function closeCart() {
  const modal = document.getElementById('cart-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.removeAttribute('aria-modal');
    document.body.style.overflow = '';
    document.body.removeAttribute('aria-hidden');
  }
}

// Render cart items
function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const cartEmpty = document.getElementById('cart-empty');

  if (!cartItems) return;

  const items = cart.getCart();

  if (items.length === 0) {
    if (cartEmpty) cartEmpty.style.display = 'block';
    if (cartItems) cartItems.innerHTML = '';
    if (cartTotal) cartTotal.textContent = '0 MAD';
    return;
  }

  if (cartEmpty) cartEmpty.style.display = 'none';

  function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  const lblColor = (typeof t === 'function' && t('color')) ? t('color') : 'Color';
  const lblSize = (typeof t === 'function' && t('size')) ? t('size') : 'Size';
  function safeId(id) {
    return String(id || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }
  cartItems.innerHTML = items.map((item) => {
    var safeItemId = safeId(item.id);
    var metaLine = lblColor + ': ' + escapeHtml(item.color);
    if (item.sizeName || item.size) metaLine += ' · ' + lblSize + ': ' + escapeHtml(item.sizeName || item.size);
    return '<div class="cart-item" data-item-id="' + escapeHtml(item.id) + '">' +
      (item.image ? '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.name) + '" class="cart-item-image" loading="lazy">' : '') +
      '<div class="cart-item-details">' +
        '<h4>' + escapeHtml(item.name) + '</h4>' +
        '<p class="cart-item-meta">' + metaLine + '</p>' +
        '<div class="cart-item-controls">' +
          '<div class="quantity-controls">' +
            '<button type="button" onclick="updateCartQuantity(\'' + safeItemId + '\', ' + (item.quantity - 1) + ')" aria-label="Decrease quantity">−</button>' +
            '<span class="cart-quantity-value" aria-live="polite">' + item.quantity + '</span>' +
            '<button type="button" onclick="updateCartQuantity(\'' + safeItemId + '\', ' + (item.quantity + 1) + ')" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<span class="cart-item-price">' + (item.price * item.quantity) + ' MAD</span>' +
        '</div>' +
      '</div>' +
      '<button type="button" class="cart-item-remove" onclick="removeCartItem(\'' + safeItemId + '\')" aria-label="Remove item">×</button>' +
    '</div>';
  }).join('');

  if (cartTotal) {
    cartTotal.textContent = `${cart.getTotal()} MAD`;
  }
}

function updateCartQuantity(itemId, quantity) {
  cart.updateQuantity(itemId, quantity);
  renderCart();
}

function removeCartItem(itemId) {
  cart.removeItem(itemId);
  renderCart();
}

// Close modal on outside click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('cart-modal');
  if (modal && e.target === modal) {
    closeCart();
  }
});

// Close cart on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('cart-modal');
    if (modal && modal.classList.contains('active')) {
      closeCart();
    }
  }
});

// Export cart for order form
window.getCartData = () => cart.getCart();
window.getCartTotal = () => cart.getTotal();
window.clearCartAfterOrder = () => cart.clearCart();
