let cart = {
    items: [],
    total: 0
};

// Estado de favoritos
let favorites = new Set();

document.addEventListener('DOMContentLoaded', function () {
    loadCartFromStorage();
    loadFavoritesFromStorage();
    updateCartDisplay();
    initializeAnimations();
});

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('highflight-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveCartToStorage() {
    localStorage.setItem('highflight-cart', JSON.stringify(cart));
}

function loadFavoritesFromStorage() {
    const savedFavorites = localStorage.getItem('highflight-favorites');
    if (savedFavorites) {
        favorites = new Set(JSON.parse(savedFavorites));
        updateFavoritesDisplay();
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem('highflight-favorites', JSON.stringify([...favorites]));
}

// Agregar item al carrito
function addToCart(itemId, price, name = null, image = null) {
    if (!name) {
        const itemElement = document.querySelector(`[data-item="${itemId}"]`) ||
            document.querySelector(`button[onclick*="${itemId}"]`).closest('.menu-item, .dish-card');
        if (itemElement) {
            name = itemElement.querySelector('h3').textContent;
            const imgElement = itemElement.querySelector('img');
            image = imgElement ? imgElement.src : null;
        }
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = cart.items.find(item => item.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: itemId,
            name: name || itemId,
            price: price,
            quantity: 1,
            image: image
        });
    }

    calculateTotal();

    saveCartToStorage();

    updateCartDisplay();

    // Mostrar notificación
    showNotification(`${name || itemId} agregado al carrito`, 'success');

    if (window.event && window.event.target) {
        animateAddToCart(window.event.target);
    }
}

// Remover item del carrito
function removeFromCart(itemId) {
    cart.items = cart.items.filter(item => item.id !== itemId);
    calculateTotal();
    saveCartToStorage();
    updateCartDisplay();
    showNotification('Producto eliminado del carrito', 'info');
}

function updateQuantity(itemId, newQuantity) {
    const item = cart.items.find(item => item.id === itemId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(itemId);
        } else {
            item.quantity = newQuantity;
            calculateTotal();
            saveCartToStorage();
            updateCartDisplay();
        }
    }
}

function calculateTotal() {
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartCount || !cartItems || !cartTotal) return;

    // Actualizar contador
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

    if (cart.items.length === 0) {
        cartItems.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-cart"></i>
        <p>Tu carrito está vacío</p>
      </div>
    `;
    } else {
        cartItems.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
        </div>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <div class="cart-item-controls">
            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="quantity-btn">
              <i class="fas fa-minus"></i>
            </button>
            <span class="quantity">${item.quantity}</span>
            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="quantity-btn">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="remove-btn">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
    }

    // Actualizar total
    cartTotal.textContent = cart.total.toFixed(2);
}

function toggleCart() {
    const cartDropdown = document.getElementById('cartDropdown');
    if (cartDropdown) {
        cartDropdown.classList.toggle('active');
    }
}

// Proceder al checkout
function proceedToCheckout() {
    if (cart.items.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }

    showNotification('Redirigiendo al pago...', 'info');

    setTimeout(() => {
        cart = { items: [], total: 0 };
        saveCartToStorage();
        updateCartDisplay();
        toggleCart();
        showNotification('¡Pedido realizado con éxito!', 'success');
    }, 2000);
}

// Toggle favoritos
function toggleFavorite(button) {
    const itemElement = button.closest('.menu-item, .dish-card');
    if (!itemElement) return;

    const itemId = itemElement.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
    const icon = button.querySelector('i');

    if (favorites.has(itemId)) {
        favorites.delete(itemId);
        icon.className = 'far fa-heart';
        button.classList.remove('active');
        showNotification('Eliminado de favoritos', 'info');
    } else {
        favorites.add(itemId);
        icon.className = 'fas fa-heart';
        button.classList.add('active');
        showNotification('Agregado a favoritos', 'success');
    }

    saveFavoritesToStorage();
    animateFavorite(button);
}

function updateFavoritesDisplay() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');

    favoriteButtons.forEach(button => {
        const itemElement = button.closest('.menu-item, .dish-card');
        if (itemElement) {
            const itemId = itemElement.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '-');
            const icon = button.querySelector('i');

            if (favorites.has(itemId)) {
                icon.className = 'fas fa-heart';
                button.classList.add('active');
            } else {
                icon.className = 'far fa-heart';
                button.classList.remove('active');
            }
        }
    });
}

// Animaciones
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.menu-item, .dish-card, .category-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

function animateAddToCart(button) {
    if (!button) return;

    const originalBackground = button.style.backgroundColor;

    button.style.transform = 'scale(0.95)';
    button.style.backgroundColor = '#27ae60';

    setTimeout(() => {
        button.style.transform = 'scale(1)';
        button.style.backgroundColor = originalBackground;
    }, 200);
}

function animateFavorite(button) {
    if (!button) return;

    button.style.transform = 'scale(1.2)';

    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Búsqueda y filtros
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterItems);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterItems);
    }

    if (priceFilter) {
        priceFilter.addEventListener('change', filterItems);
    }
}

function filterItems() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const priceFilter = document.getElementById('priceFilter')?.value || '';

    const items = document.querySelectorAll('.dish-card, .menu-item');

    items.forEach(item => {
        const title = item.querySelector('h3').textContent.toLowerCase();
        const priceElement = item.querySelector('.current-price, .price');
        const priceText = priceElement ? priceElement.textContent.replace(/[^\d.]/g, '') : '0';
        const price = parseFloat(priceText) || 0;

        let showItem = true;

        if (searchTerm && !title.includes(searchTerm)) {
            showItem = false;
        }

        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            if (max && (price < min || price > max)) {
                showItem = false;
            } else if (!max && price < min) {
                showItem = false;
            }
        }

        item.style.display = showItem ? 'block' : 'none';
    });
}


document.addEventListener('click', function (e) {
    const cartFloating = document.getElementById('cartFloating');
    const cartDropdown = document.getElementById('cartDropdown');

    if (cartFloating && cartDropdown && cartDropdown.classList.contains('active')) {
        if (!cartFloating.contains(e.target)) {
            cartDropdown.classList.remove('active');
        }
    }
});

// Funciones utilitarias
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function getItemFromElement(element) {
    const itemElement = element.closest('.menu-item, .dish-card');
    if (!itemElement) return null;

    const name = itemElement.querySelector('h3').textContent;

    const priceElement = itemElement.querySelector('.current-price, .price');
    const priceText = priceElement ? priceElement.textContent.replace(/[^\d.]/g, '') : '0';
    const price = parseFloat(priceText) || 0;

    const img = itemElement.querySelector('img');
    const image = img ? img.src : null;

    return { name, price, image };
}

function showFoodNotification(message, type = 'success') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    } else {
        const notification = document.createElement('div');
        notification.className = `food-notification food-notification--${type}`;
        notification.textContent = message;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '9999',
            fontSize: '14px',
            maxWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };

        notification.style.backgroundColor = colors[type] || colors.success;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Shortcuts de teclado
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        const cartDropdown = document.getElementById('cartDropdown');
        if (cartDropdown && cartDropdown.classList.contains('active')) {
            toggleCart();
        }
    }

    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
        }
    }
});

function addCartStyles() {
    if (document.getElementById('cart-styles')) return;

    const style = document.createElement('style');
    style.id = 'cart-styles';
    style.textContent = `
    .cart-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    
    .cart-item-image {
      width: 50px;
      height: 50px;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .cart-item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .cart-item-info {
      flex: 1;
    }
    
    .cart-item-info h4 {
      margin: 0 0 8px 0;
      font-size: 14px;
      color: #333;
    }
    
    .cart-item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    
    .quantity-btn {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
      color: #495057;
    }
    
    .quantity-btn:hover {
      background: #e9ecef;
    }
    
    .quantity {
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }
    
    .cart-item-price {
      font-weight: 600;
      color: #2193b0;
      font-size: 14px;
    }
    
    .remove-btn {
      background: #dc3545;
      color: white;
      border: none;
      width: 28px;
      height: 28px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 12px;
    }
    
    .remove-btn:hover {
      background: #c82333;
    }
  `;

    document.head.appendChild(style);
}

// Inicializar estilos del carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', addCartStyles);

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.toggleFavorite = toggleFavorite;
window.proceedToCheckout = proceedToCheckout;