let favorites = new Set();

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    loadFavoritesFromStorage();
    updateFavoritesDisplay();
    initializeAnimations();
    initializeFilters();
});

function loadFavoritesFromStorage() {
    const savedFavorites = localStorage.getItem('highflight-favorites');
    if (savedFavorites) {
        favorites = new Set(JSON.parse(savedFavorites));
    }
}

function saveFavoritesToStorage() {
    localStorage.setItem('highflight-favorites', JSON.stringify([...favorites]));
}

function toggleFavorite(button) {
    const offerCard = button.closest('.offer-card');
    if (!offerCard) return;

    const offerTitle = offerCard.querySelector('h3').textContent.trim();
    const offerId = offerTitle.toLowerCase().replace(/\s+/g, '-');
    const icon = button.querySelector('i');

    if (favorites.has(offerId)) {
        favorites.delete(offerId);
        icon.className = 'far fa-heart';
        button.classList.remove('active');
        showNotification('Eliminado de favoritos', 'info');
    } else {
        favorites.add(offerId);
        icon.className = 'fas fa-heart';
        button.classList.add('active');
        showNotification('Agregado a favoritos', 'success');
    }

    saveFavoritesToStorage();
    animateFavorite(button);
}

// Actualizar display de favoritos
function updateFavoritesDisplay() {
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');

    favoriteButtons.forEach(button => {
        const offerCard = button.closest('.offer-card');
        if (offerCard) {
            const offerTitle = offerCard.querySelector('h3').textContent.trim();
            const offerId = offerTitle.toLowerCase().replace(/\s+/g, '-');
            const icon = button.querySelector('i');

            if (favorites.has(offerId)) {
                icon.className = 'fas fa-heart';
                button.classList.add('active');
            } else {
                icon.className = 'far fa-heart';
                button.classList.remove('active');
            }
        }
    });
}

function initializeAnimations() {
    // Animación de entrada para las cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    const cards = document.querySelectorAll('.offer-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    const heroElements = document.querySelectorAll('.offers-hero h1, .offers-hero p, .hero-features');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = `opacity 0.8s ease ${index * 0.2}s, transform 0.8s ease ${index * 0.2}s`;

        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100);
    });
}

function animateFavorite(button) {
    if (!button) return;

    button.style.transform = 'scale(1.3)';

    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// Filtros de ofertas
function initializeFilters() {
    createFilterControls();

    // Event listeners para filtros
    const categoryFilter = document.getElementById('categoryFilter');
    const discountFilter = document.getElementById('discountFilter');
    const searchInput = document.getElementById('searchInput');

    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (discountFilter) discountFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', debounce(applyFilters, 300));
}

function createFilterControls() {
    const firstSection = document.querySelector('.offers-section');
    if (!firstSection) return;

    const filterContainer = document.createElement('div');
    filterContainer.className = 'filter-controls';
    filterContainer.innerHTML = `
    <div class="filters-row">
      <div class="filter-group">
        <label for="searchInput">Buscar:</label>
        <input type="text" id="searchInput" placeholder="Buscar ofertas..." class="filter-input">
      </div>
      
      <div class="filter-group">
        <label for="categoryFilter">Categoría:</label>
        <select id="categoryFilter" class="filter-select">
          <option value="">Todas las categorías</option>
          <option value="comida">Comida</option>
          <option value="hotel">Hoteles</option>
          <option value="viaje">Viajes</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="discountFilter">Descuento:</label>
        <select id="discountFilter" class="filter-select">
          <option value="">Todos los descuentos</option>
          <option value="5">5% o más</option>
          <option value="8">8% o más</option>
          <option value="10">10% o más</option>
        </select>
      </div>
      
      <button class="btn btn--outline btn--small" onclick="clearFilters()">
        <i class="fas fa-times"></i>
        Limpiar filtros
      </button>
    </div>
  `;

    firstSection.insertBefore(filterContainer, firstSection.querySelector('.offers-grid'));

    addFilterStyles();
}

function addFilterStyles() {
    if (document.getElementById('filter-styles')) return;

    const style = document.createElement('style');
    style.id = 'filter-styles';
    style.textContent = `
    .filter-controls {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: var(--gray-light);
      border-radius: var(--border-radius-lg);
    }
    
    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }
    
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .filter-group label {
      font-weight: 600;
      color: var(--dark);
      font-size: 1.4rem;
    }
    
    .filter-input,
    .filter-select {
      padding: 0.8rem;
      border: 2px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 1.4rem;
      background: white;
      min-width: 150px;
    }
    
    .filter-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    @media (max-width: 768px) {
      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-input,
      .filter-select {
        min-width: auto;
      }
    }
  `;

    document.head.appendChild(style);
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';
    const discountFilter = document.getElementById('discountFilter')?.value || '';

    const offers = document.querySelectorAll('.offer-card');
    let visibleCount = 0;

    offers.forEach(offer => {
        const title = offer.querySelector('h3').textContent.toLowerCase();
        const category = detectCategory(title);
        const discountBadge = offer.querySelector('.discount-badge');
        const discount = discountBadge ? parseInt(discountBadge.textContent.replace(/[-%]/g, '')) : 0;

        let showOffer = true;

        // Filtro de búsqueda
        if (searchTerm && !title.includes(searchTerm)) {
            showOffer = false;
        }

        if (categoryFilter && category !== categoryFilter) {
            showOffer = false;
        }

        // Filtro de descuento
        if (discountFilter && discount < parseInt(discountFilter)) {
            showOffer = false;
        }

        offer.style.display = showOffer ? 'flex' : 'none';
        if (showOffer) visibleCount++;
    });

    updateNoResultsMessage(visibleCount);
}

function detectCategory(title) {
    if (title.includes('comida') || title.includes('pizza')) return 'comida';
    if (title.includes('hotel')) return 'hotel';
    if (title.includes('viaje')) return 'viaje';
    return '';
}

function updateNoResultsMessage(visibleCount) {
    let noResultsMsg = document.querySelector('.no-results-message');

    if (visibleCount === 0) {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--gray);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem;"></i>
          <h3>No se encontraron ofertas</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
      `;

            const firstGrid = document.querySelector('.offers-grid');
            if (firstGrid) {
                firstGrid.parentNode.insertBefore(noResultsMsg, firstGrid.nextSibling);
            }
        }
        noResultsMsg.style.display = 'block';
    } else {
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
    }
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const discountFilter = document.getElementById('discountFilter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (discountFilter) discountFilter.value = '';

    applyFilters();
    showNotification('Filtros limpiados', 'info');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function shareOffer(offerElement) {
    const title = offerElement.querySelector('h3').textContent;
    const url = window.location.href;

    if (navigator.share) {
        navigator.share({
            title: `Oferta: ${title}`,
            text: `¡Mira esta increíble oferta de High Flight!`,
            url: url
        }).catch(console.error);
    } else {
        navigator.clipboard.writeText(`${title} - ${url}`)
            .then(() => showNotification('Enlace copiado al portapapeles', 'success'))
            .catch(() => showNotification('No se pudo copiar el enlace', 'error'));
    }
}

// Ordenamiento de ofertas
function sortOffers(criteria) {
    const sections = document.querySelectorAll('.offers-section');

    sections.forEach(section => {
        const grid = section.querySelector('.offers-grid');
        if (!grid) return;

        const offers = Array.from(grid.querySelectorAll('.offer-card'));

        offers.sort((a, b) => {
            switch (criteria) {
                case 'discount':
                    const discountA = parseInt(a.querySelector('.discount-badge')?.textContent.replace(/[-%]/g, '') || '0');
                    const discountB = parseInt(b.querySelector('.discount-badge')?.textContent.replace(/[-%]/g, '') || '0');
                    return discountB - discountA;

                case 'rating':
                    const ratingA = parseFloat(a.querySelector('.rating-value')?.textContent || '0');
                    const ratingB = parseFloat(b.querySelector('.rating-value')?.textContent || '0');
                    return ratingB - ratingA;

                case 'name':
                    const nameA = a.querySelector('h3').textContent.toLowerCase();
                    const nameB = b.querySelector('h3').textContent.toLowerCase();
                    return nameA.localeCompare(nameB);

                default:
                    return 0;
            }
        });

        offers.forEach(offer => grid.appendChild(offer));
    });
}

function createSortControls() {
    const mainContainer = document.querySelector('.main .container');
    if (!mainContainer || document.querySelector('.sort-controls')) return;

    const sortContainer = document.createElement('div');
    sortContainer.className = 'sort-controls';
    sortContainer.innerHTML = `
    <div class="sort-row">
      <span class="sort-label">Ordenar por:</span>
      <select id="sortSelect" class="sort-select">
        <option value="default">Orden predeterminado</option>
        <option value="discount">Mayor descuento</option>
        <option value="rating">Mejor valoración</option>
        <option value="name">Nombre A-Z</option>
      </select>
    </div>
  `;

    const firstSection = mainContainer.querySelector('.offers-section');
    if (firstSection) {
        mainContainer.insertBefore(sortContainer, firstSection);
    }

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            if (e.target.value !== 'default') {
                sortOffers(e.target.value);
            } else {
                location.reload();
            }
        });
    }

    addSortStyles();
}

function addSortStyles() {
    if (document.getElementById('sort-styles')) return;

    const style = document.createElement('style');
    style.id = 'sort-styles';
    style.textContent = `
    .sort-controls {
      margin-bottom: 2rem;
      display: flex;
      justify-content: flex-end;
    }
    
    .sort-row {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .sort-label {
      font-weight: 600;
      color: var(--dark);
    }
    
    .sort-select {
      padding: 0.8rem;
      border: 2px solid #ddd;
      border-radius: var(--border-radius);
      font-size: 1.4rem;
      background: white;
      cursor: pointer;
    }
    
    .sort-select:focus {
      outline: none;
      border-color: var(--primary);
    }
    
    @media (max-width: 768px) {
      .sort-controls {
        justify-content: center;
      }
      
      .sort-row {
        flex-direction: column;
        text-align: center;
      }
    }
  `;

    document.head.appendChild(style);
}

function showOfferStats() {
    const totalOffers = document.querySelectorAll('.offer-card').length;
    const featuredOffers = document.querySelectorAll('.offer-card.featured').length;
    const averageDiscount = calculateAverageDiscount();

    console.log('📊 Estadísticas de ofertas:', {
        total: totalOffers,
        destacadas: featuredOffers,
        descuentoPromedio: `${averageDiscount}%`
    });
}

function calculateAverageDiscount() {
    const discountBadges = document.querySelectorAll('.discount-badge');
    if (discountBadges.length === 0) return 0;

    const total = Array.from(discountBadges).reduce((sum, badge) => {
        const discount = parseInt(badge.textContent.replace(/[-%]/g, ''));
        return sum + discount;
    }, 0);

    return Math.round(total / discountBadges.length);
}

// Inicializar funcionalidades adicionales
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        createSortControls();
        showOfferStats();
    }, 1000);

    addTooltips();
});

function addTooltips() {
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');
    const viewButtons = document.querySelectorAll('.action-btn.view');

    favoriteButtons.forEach(btn => {
        btn.title = 'Agregar a favoritos';
    });

    viewButtons.forEach(btn => {
        btn.title = 'Ver detalles';
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.offer-image img');

    images.forEach(img => {
        img.addEventListener('error', function () {
            this.src = 'img/placeholder.jpg';
            this.alt = 'Imagen no disponible';
        });
    });
});

function initLazyLoading() {
    const images = document.querySelectorAll('.offer-image img');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        if (img.dataset.src) {
            imageObserver.observe(img);
        }
    });
}

window.toggleFavorite = toggleFavorite;
window.clearFilters = clearFilters;
window.shareOffer = shareOffer;

// Auto-inicializar lazy loading
document.addEventListener('DOMContentLoaded', initLazyLoading);