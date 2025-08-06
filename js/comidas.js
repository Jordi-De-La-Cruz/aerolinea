// ===================================
// COMIDAS PAGE FUNCTIONALITY
// ===================================

class ComidasPage {
    constructor() {
        this.cart = [];
        this.favorites = new Set();
        this.currentCategory = 'all';
        this.activeFilters = new Set();
        this.serviceCharge = 5.00;
        this.taxRate = 0.10;

        this.init();
    }

    init() {
        this.initFilters();
        this.initCart();
        this.initFavorites();
        this.initStatCounters();
        this.initScrollAnimations();
        this.loadSavedData();
        this.bindEvents();
    }

    // Filter System
    initFilters() {
        const categoryTabs = document.querySelectorAll('.filter-tab');
        const dietaryFilters = document.querySelectorAll('.dietary-btn');

        categoryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.handleCategoryFilter(tab);
            });
        });

        dietaryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                this.handleDietaryFilter(filter);
            });
        });
    }

    handleCategoryFilter(tab) {
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        this.currentCategory = tab.dataset.category;
        this.filterMenuItems();

        // Smooth scroll to menu section
        const targetSection = document.querySelector(`[data-category="${this.currentCategory}"]`);
        if (targetSection && this.currentCategory !== 'all') {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    handleDietaryFilter(filter) {
        const filterType = filter.dataset.filter;

        if (this.activeFilters.has(filterType)) {
            this.activeFilters.delete(filterType);
            filter.classList.remove('active');
        } else {
            this.activeFilters.add(filterType);
            filter.classList.add('active');
        }

        this.filterMenuItems();
    }

    filterMenuItems() {
        const menuItems = document.querySelectorAll('.menu-item');
        const menuSections = document.querySelectorAll('.menu-section');

        menuSections.forEach(section => {
            const sectionCategory = section.dataset.category;
            const shouldShowSection = this.currentCategory === 'all' ||
                this.currentCategory === sectionCategory;

            if (shouldShowSection) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
                return;
            }
        });

        menuItems.forEach(item => {
            const itemSection = item.closest('.menu-section');
            const sectionCategory = itemSection.dataset.category;
            const itemDietary = item.dataset.dietary.split(' ');

            let shouldShow = true;

            // Category filter
            if (this.currentCategory !== 'all' && this.currentCategory !== sectionCategory) {
                shouldShow = false;
            }

            // Dietary filters
            if (this.activeFilters.size > 0) {
                const hasMatchingDiet = Array.from(this.activeFilters).some(filter =>
                    itemDietary.includes(filter)
                );
                if (!hasMatchingDiet) shouldShow = false;
            }

            if (shouldShow) {
                item.classList.remove('filtered-out');
                item.classList.add('filtered-in');
                item.style.display = 'block';
            } else {
                item.classList.add('filtered-out');
                item.classList.remove('filtered-in');
                setTimeout(() => {
                    if (item.classList.contains('filtered-out')) {
                        item.style.display = 'none';
                    }
                }, 300);
            }
        });
    }

    // Cart System
    initCart() {
        const addToCartBtns = document.querySelectorAll('.add-to-cart');
        const viewCartBtn = document.getElementById('viewCartBtn');
        const closeCartModal = document.getElementById('closeCartModal');
        const clearCartBtn = document.getElementById('clearCartBtn');
        const confirmOrderBtn = document.getElementById('confirmOrderBtn');

        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addToCart(e.currentTarget);
            });
        });

        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => this.showCartModal());
        }

        if (closeCartModal) {
            closeCartModal.addEventListener('click', () => this.hideCartModal());
        }

        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => this.clearCart());
        }

        if (confirmOrderBtn) {
            confirmOrderBtn.addEventListener('click', () => this.confirmOrder());
        }

        // Close modal on overlay click
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal || e.target.classList.contains('modal-overlay')) {
                    this.hideCartModal();
                }
            });
        }
    }

    addToCart(button) {
        const itemData = {
            id: button.dataset.id,
            name: button.dataset.name,
            price: parseFloat(button.dataset.price),
            quantity: 1
        };

        // Check if item already exists
        const existingItemIndex = this.cart.findIndex(item => item.id === itemData.id);

        if (existingItemIndex >= 0) {
            this.cart[existingItemIndex].quantity += 1;
        } else {
            this.cart.push(itemData);
        }

        // Visual feedback
        this.showAddToCartAnimation(button);
        this.updateCartDisplay();
        this.saveCartData();

        // Show notification
        if (typeof showNotification === 'function') {
            showNotification(`${itemData.name} agregado al carrito`, 'success');
        }
    }

    showAddToCartAnimation(button) {
        const menuItem = button.closest('.menu-item');

        // Add loading state
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agregando...';

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-check"></i> Agregado';
            menuItem.classList.add('added');

            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-plus"></i> Agregar';
                button.disabled = false;
                menuItem.classList.remove('added');
            }, 1500);
        }, 800);
    }

    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartDisplay();
        this.updateCartModal();
        this.saveCartData();
    }

    updateQuantity(itemId, newQuantity) {
        const item = this.cart.find(item => item.id === itemId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(itemId);
            } else {
                item.quantity = newQuantity;
                this.updateCartDisplay();
                this.updateCartModal();
                this.saveCartData();
            }
        }
    }

    updateCartDisplay() {
        const cartCount = document.getElementById('cartCount');
        const cartTotal = document.getElementById('cartTotal');
        const cartSummary = document.getElementById('cartSummary');

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = this.calculateTotal().subtotal;

        if (cartCount) cartCount.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = totalPrice.toFixed(2);

        // Show/hide cart summary
        if (cartSummary) {
            if (totalItems > 0) {
                cartSummary.classList.add('visible');
            } else {
                cartSummary.classList.remove('visible');
            }
        }
    }

    calculateTotal() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * this.taxRate;
        const total = subtotal + this.serviceCharge + tax;

        return {
            subtotal,
            service: this.serviceCharge,
            tax,
            total
        };
    }

    showCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
            this.updateCartModal();
        }
    }

    hideCartModal() {
        const cartModal = document.getElementById('cartModal');
        if (cartModal) {
            cartModal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }

    updateCartModal() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        const totals = this.calculateTotal();

        // Update totals
        document.getElementById('modalSubtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
        document.getElementById('modalService').textContent = `$${totals.service.toFixed(2)}`;
        document.getElementById('modalTax').textContent = `$${totals.tax.toFixed(2)}`;
        document.getElementById('modalTotal').textContent = `$${totals.total.toFixed(2)}`;

        if (this.cart.length === 0) {
            emptyCart.style.display = 'block';
            cartItems.innerHTML = '';
            return;
        }

        emptyCart.style.display = 'none';
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} c/u</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="comidasPage.updateQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="comidasPage.updateQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="comidasPage.removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `).join('');
    }

    clearCart() {
        this.cart = [];
        this.updateCartDisplay();
        this.updateCartModal();
        this.saveCartData();

        if (typeof showNotification === 'function') {
            showNotification('Carrito vaciado', 'info');
        }
    }

    confirmOrder() {
        if (this.cart.length === 0) {
            if (typeof showNotification === 'function') {
                showNotification('Tu carrito está vacío', 'warning');
            }
            return;
        }

        // Generate order number
        const orderNumber = this.generateOrderNumber();

        // Save order data
        const orderData = {
            orderNumber,
            items: [...this.cart],
            totals: this.calculateTotal(),
            timestamp: new Date().toISOString(),
            flight: 'Singapur - Emiratos'
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));

        // Clear cart
        this.clearCart();

        // Hide cart modal
        this.hideCartModal();

        // Show success modal
        this.showSuccessModal(orderNumber);
    }

    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `#ORD-${year}-${random}`;
    }

    showSuccessModal(orderNumber) {
        const successModal = document.getElementById('successModal');
        const orderNumberSpan = document.getElementById('orderNumber');
        const closeSuccessBtn = document.getElementById('closeSuccessModal');

        if (orderNumberSpan) {
            orderNumberSpan.textContent = orderNumber;
        }

        if (successModal) {
            successModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }

        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', () => {
                successModal.classList.remove('visible');
                document.body.style.overflow = '';
                window.location.href = 'emiratos.html';
            });
        }
    }

    // Favorites System
    initFavorites() {
        const favoriteBtns = document.querySelectorAll('.favorite-btn');

        favoriteBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleFavorite(btn);
            });
        });
    }

    toggleFavorite(button) {
        const itemId = button.dataset.id;

        if (this.favorites.has(itemId)) {
            this.favorites.delete(itemId);
            button.classList.remove('active');
        } else {
            this.favorites.add(itemId);
            button.classList.add('active');
        }

        this.saveFavoritesData();

        // Animate button
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
            button.style.transform = '';
        }, 200);
    }

    // Statistics Counters
    initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, duration / steps);
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.menu-item, .section-header');
        animateElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    }

    // Data Persistence
    saveCartData() {
        localStorage.setItem('menuCart', JSON.stringify(this.cart));
    }

    saveFavoritesData() {
        localStorage.setItem('menuFavorites', JSON.stringify([...this.favorites]));
    }

    loadSavedData() {
        // Load cart
        const savedCart = localStorage.getItem('menuCart');
        if (savedCart) {
            try {
                this.cart = JSON.parse(savedCart);
                this.updateCartDisplay();
            } catch (e) {
                console.error('Error loading cart data:', e);
                this.cart = [];
            }
        }

        // Load favorites
        const savedFavorites = localStorage.getItem('menuFavorites');
        if (savedFavorites) {
            try {
                const favoritesArray = JSON.parse(savedFavorites);
                this.favorites = new Set(favoritesArray);

                // Update UI
                this.favorites.forEach(itemId => {
                    const btn = document.querySelector(`[data-id="${itemId}"].favorite-btn`);
                    if (btn) btn.classList.add('active');
                });
            } catch (e) {
                console.error('Error loading favorites data:', e);
                this.favorites = new Set();
            }
        }
    }

    // Event Binding
    bindEvents() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCartModal();
                const successModal = document.getElementById('successModal');
                if (successModal && successModal.classList.contains('visible')) {
                    successModal.classList.remove('visible');
                    document.body.style.overflow = '';
                }
            }
        });

        // Search functionality
        this.initSearch();

        // Scroll to top of menu sections
        this.initSectionNavigation();
    }

    initSearch() {
        // Create search input if it doesn't exist
        const filtersContainer = document.querySelector('.menu-filters .container');
        if (!document.getElementById('menuSearch') && filtersContainer) {
            const searchDiv = document.createElement('div');
            searchDiv.className = 'menu-search';
            searchDiv.innerHTML = `
                <div class="search-container">
                    <i class="fas fa-search"></i>
                    <input type="text" id="menuSearch" placeholder="Buscar platos..." autocomplete="off">
                    <button id="clearSearch" class="clear-search" style="display: none;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;

            filtersContainer.appendChild(searchDiv);
        }

        const searchInput = document.getElementById('menuSearch');
        const clearSearch = document.getElementById('clearSearch');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                clearSearch.style.display = e.target.value ? 'block' : 'none';
            });
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                searchInput.value = '';
                this.handleSearch('');
                clearSearch.style.display = 'none';
                searchInput.focus();
            });
        }
    }

    handleSearch(query) {
        const menuItems = document.querySelectorAll('.menu-item');
        const searchTerm = query.toLowerCase().trim();

        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('.item-description').textContent.toLowerCase();

            const matches = itemName.includes(searchTerm) || itemDescription.includes(searchTerm);

            if (searchTerm === '' || matches) {
                item.style.display = 'block';
                item.classList.remove('search-hidden');
            } else {
                item.style.display = 'none';
                item.classList.add('search-hidden');
            }
        });

        // Show/hide sections based on visible items
        const menuSections = document.querySelectorAll('.menu-section');
        menuSections.forEach(section => {
            const visibleItems = section.querySelectorAll('.menu-item:not(.search-hidden)');
            section.style.display = visibleItems.length > 0 ? 'block' : 'none';
        });
    }

    initSectionNavigation() {
        // Add smooth scrolling to section headers
        const sectionTitles = document.querySelectorAll('.section-title');
        sectionTitles.forEach(title => {
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => {
                title.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    // Utility Methods
    formatPrice(price) {
        return `${price.toFixed(2)}`;
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    getCartTotal() {
        return this.calculateTotal().total;
    }

    // Public API for external access
    getCartData() {
        return {
            items: [...this.cart],
            totals: this.calculateTotal(),
            itemCount: this.getCartItemCount()
        };
    }

    // Analytics and Tracking
    trackMenuInteraction(action, itemId, additionalData = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'menu_interaction', {
                action: action,
                item_id: itemId,
                ...additionalData
            });
        }

        // Console log for development
        console.log('Menu Interaction:', {
            action,
            itemId,
            timestamp: new Date().toISOString(),
            ...additionalData
        });
    }

    // Error Handling
    handleError(error, context) {
        console.error(`Error in ${context}:`, error);

        if (typeof showNotification === 'function') {
            showNotification('Ha ocurrido un error. Por favor, inténtalo de nuevo.', 'error');
        }
    }

    // Cleanup
    destroy() {
        // Save data before destroying
        this.saveCartData();
        this.saveFavoritesData();

        // Remove event listeners
        const buttons = document.querySelectorAll('.add-to-cart, .favorite-btn, .filter-tab, .dietary-btn');
        buttons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });
    }
}

// CSS for search functionality
const searchStyles = `
    .menu-search {
        margin-top: var(--spacing-md);
        display: flex;
        justify-content: center;
    }
    
    .search-container {
        position: relative;
        max-width: 400px;
        width: 100%;
    }
    
    .search-container i.fa-search {
        position: absolute;
        left: var(--spacing-sm);
        top: 50%;
        transform: translateY(-50%);
        color: var(--gray);
    }
    
    #menuSearch {
        width: 100%;
        padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm) var(--spacing-lg);
        border: 2px solid var(--gray-light);
        border-radius: var(--border-radius);
        font-size: var(--font-size-base);
        background: var(--light);
        transition: var(--transition);
    }
    
    #menuSearch:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 3px rgba(33, 147, 176, 0.1);
    }
    
    .clear-search {
        position: absolute;
        right: var(--spacing-sm);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--gray);
        cursor: pointer;
        padding: var(--spacing-xs);
        border-radius: 50%;
        transition: var(--transition);
    }
    
    .clear-search:hover {
        background: var(--gray-light);
        color: var(--primary);
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-md);
        padding: var(--spacing-md);
        border-bottom: 1px solid var(--gray-light);
        background: var(--light);
        border-radius: var(--border-radius);
        margin-bottom: var(--spacing-sm);
    }
    
    .cart-item-info {
        flex-grow: 1;
    }
    
    .cart-item-info h4 {
        color: var(--primary);
        margin-bottom: var(--spacing-xs);
        font-size: var(--font-size-base);
    }
    
    .cart-item-price {
        color: var(--gray);
        font-size: var(--font-size-small);
        margin: 0;
    }
    
    .cart-item-controls {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
    }
    
    .quantity-btn {
        background: var(--primary);
        color: var(--light);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: var(--transition);
        font-size: var(--font-size-small);
    }
    
    .quantity-btn:hover {
        background: var(--primary-dark);
        transform: scale(1.1);
    }
    
    .quantity {
        min-width: 30px;
        text-align: center;
        font-weight: 600;
        font-size: var(--font-size-base);
    }
    
    .remove-btn {
        background: #e74c3c;
        color: var(--light);
        border: none;
        border-radius: var(--border-radius);
        padding: var(--spacing-xs);
        cursor: pointer;
        transition: var(--transition);
    }
    
    .remove-btn:hover {
        background: #c0392b;
        transform: scale(1.05);
    }
    
    .cart-item-total {
        font-weight: 700;
        color: var(--primary);
        font-size: var(--font-size-large);
        min-width: 80px;
        text-align: right;
    }
    
    .empty-cart {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--gray);
    }
    
    .empty-cart i {
        font-size: var(--font-size-hero);
        margin-bottom: var(--spacing-md);
        opacity: 0.5;
    }
    
    .empty-cart p {
        font-size: var(--font-size-large);
        margin-bottom: var(--spacing-xs);
    }
    
    .empty-cart small {
        font-size: var(--font-size-small);
        opacity: 0.7;
    }
    
    .success-modal .modal-content {
        max-width: 500px;
        text-align: center;
    }
    
    .success-content {
        padding: var(--spacing-xl);
    }
    
    .success-icon {
        font-size: 4rem;
        color: var(--success);
        margin-bottom: var(--spacing-lg);
    }
    
    .success-content h2 {
        color: var(--success);
        margin-bottom: var(--spacing-md);
    }
    
    .order-details {
        background: var(--gray-light);
        padding: var(--spacing-md);
        border-radius: var(--border-radius);
        margin: var(--spacing-lg) 0;
    }
    
    .order-details p {
        margin: var(--spacing-xs) 0;
        font-size: var(--font-size-small);
    }
    
    @media (max-width: 768px) {
        .cart-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--spacing-sm);
        }
        
        .cart-item-controls {
            width: 100%;
            justify-content: center;
        }
        
        .cart-item-total {
            width: 100%;
            text-align: center;
            font-size: var(--font-size-xl);
            padding-top: var(--spacing-sm);
            border-top: 1px solid var(--gray-light);
        }
        
        .search-container {
            max-width: 100%;
        }
    }
`;

// Add styles to page
const styleSheet = document.createElement('style');
styleSheet.textContent = searchStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.comidasPage = new ComidasPage();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.comidasPage) {
        window.comidasPage.destroy();
    }
});

// Export for external use
window.ComidasPage = ComidasPage;