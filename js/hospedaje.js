class HospedajeManager {
    constructor() {
        this.searchForm = document.getElementById('hotelSearchForm');
        this.destinationInput = document.getElementById('destinationInput');
        this.destinationSuggestions = document.getElementById('destinationSuggestions');
        this.checkinDate = document.getElementById('checkinDate');
        this.checkoutDate = document.getElementById('checkoutDate');
        this.guestsSelect = document.getElementById('guestsSelect');
        this.roomsSelect = document.getElementById('roomsSelect');
        this.loadMoreBtn = document.getElementById('loadMoreBtn');
        this.favoriteButtons = document.querySelectorAll('.hotel-card__favorite');
        this.hotelCards = document.querySelectorAll('.hotel-card');

        this.favorites = JSON.parse(localStorage.getItem('hotelFavorites') || '[]');
        this.currentPage = 1;
        this.hotelsPerPage = 6;

        this.destinations = [
            'Buenos Aires, Argentina',
            'Medellín, Colombia',
            'Cusco, Perú',
            'Caracas, Venezuela',
            'Quito, Ecuador',
            'Miami, Estados Unidos',
            'Puerto Plata, República Dominicana',
            'París, Francia',
            'Paraíso Tropical, Asia',
            'Madrid, España',
            'Roma, Italia',
            'Londres, Reino Unido',
            'Tokio, Japón',
            'Bangkok, Tailandia',
            'Bali, Indonesia'
        ];

        this.init();
    }

    init() {
        this.setupSearchForm();
        this.setupDateInputs();
        this.setupDestinationSearch();
        this.setupFavorites();
        this.setupLoadMore();
        this.setupHotelCardAnimations();
        this.setupFilters();
        this.initializeDates();
    }

    setupSearchForm() {
        if (!this.searchForm) return;

        this.searchForm.addEventListener('submit', (e) => this.handleSearch(e));

        // Validación en tiempo real
        [this.checkinDate, this.checkoutDate].forEach(input => {
            if (input) {
                input.addEventListener('change', () => this.validateDates());
            }
        });
    }

    handleSearch(e) {
        e.preventDefault();

        if (!this.validateSearchForm()) {
            this.showNotification('Por favor completa todos los campos de búsqueda', 'warning');
            return;
        }

        const searchData = {
            destination: this.destinationInput?.value || '',
            checkin: this.checkinDate?.value || '',
            checkout: this.checkoutDate?.value || '',
            guests: this.guestsSelect?.value || '2',
            rooms: this.roomsSelect?.value || '1'
        };

        this.performSearch(searchData);
    }

    async performSearch(searchData) {
        // Mostrar loading
        this.showSearchLoading();

        try {
            await this.simulateHotelSearch(searchData);

            this.filterHotels(searchData);

            this.showNotification(`¡Encontramos hoteles en ${searchData.destination}!`, 'success');

            // Scroll a resultados
            document.querySelector('.featured-hotels')?.scrollIntoView({
                behavior: 'smooth'
            });

        } catch (error) {
            console.error('Error en búsqueda:', error);
            this.showNotification('Error al buscar hoteles. Intenta nuevamente.', 'error');
        } finally {
            this.hideSearchLoading();
        }
    }

    async simulateHotelSearch(searchData) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    results: Math.floor(Math.random() * 50) + 10,
                    searchData
                });
            }, 1500);
        });
    }

    // === VALIDACIÓN ===
    validateSearchForm() {
        const destination = this.destinationInput?.value?.trim();
        const checkin = this.checkinDate?.value;
        const checkout = this.checkoutDate?.value;

        if (!destination || !checkin || !checkout) {
            return false;
        }

        return this.validateDates();
    }

    validateDates() {
        const checkin = new Date(this.checkinDate?.value);
        const checkout = new Date(this.checkoutDate?.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkin < today) {
            this.showFieldError(this.checkinDate, 'La fecha de entrada no puede ser anterior a hoy');
            return false;
        }

        if (checkout <= checkin) {
            this.showFieldError(this.checkoutDate, 'La fecha de salida debe ser posterior a la entrada');
            return false;
        }

        this.clearFieldErrors();
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldErrors();

        field.style.borderColor = 'var(--danger)';
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: var(--danger);
            font-size: var(--font-size-small);
            margin-top: 4px;
        `;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldErrors() {
        document.querySelectorAll('.field-error').forEach(error => error.remove());
        [this.checkinDate, this.checkoutDate].forEach(field => {
            if (field) field.style.borderColor = '';
        });
    }

    setupDateInputs() {
        const today = new Date().toISOString().split('T')[0];

        if (this.checkinDate) {
            this.checkinDate.min = today;
            this.checkinDate.addEventListener('change', () => {
                if (this.checkoutDate) {
                    const checkinDate = new Date(this.checkinDate.value);
                    const minCheckout = new Date(checkinDate);
                    minCheckout.setDate(minCheckout.getDate() + 1);
                    this.checkoutDate.min = minCheckout.toISOString().split('T')[0];
                }
            });
        }

        if (this.checkoutDate) {
            this.checkoutDate.min = today;
        }
    }

    initializeDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (this.checkinDate && !this.checkinDate.value) {
            this.checkinDate.value = today.toISOString().split('T')[0];
        }

        if (this.checkoutDate && !this.checkoutDate.value) {
            this.checkoutDate.value = tomorrow.toISOString().split('T')[0];
        }
    }

    setupDestinationSearch() {
        if (!this.destinationInput) return;

        this.destinationInput.addEventListener('input', (e) => {
            this.handleDestinationInput(e.target.value);
        });

        this.destinationInput.addEventListener('focus', () => {
            if (!this.destinationInput.value) {
                this.showAllDestinations();
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-field')) {
                this.hideSuggestions();
            }
        });
    }

    handleDestinationInput(query) {
        if (query.length < 2) {
            this.hideSuggestions();
            return;
        }

        const matches = this.destinations.filter(dest =>
            dest.toLowerCase().includes(query.toLowerCase())
        );

        this.showSuggestions(matches);
    }

    showAllDestinations() {
        this.showSuggestions(this.destinations.slice(0, 8));
    }

    showSuggestions(suggestions) {
        if (!this.destinationSuggestions || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.destinationSuggestions.innerHTML = suggestions
            .map(dest => `
                <div class="suggestion-item" onclick="hospedajeManager.selectDestination('${dest}')">
                    <i class="fas fa-map-marker-alt"></i>
                    ${dest}
                </div>
            `).join('');

        this.destinationSuggestions.style.display = 'block';
    }

    selectDestination(destination) {
        if (this.destinationInput) {
            this.destinationInput.value = destination;
        }
        this.hideSuggestions();
    }

    hideSuggestions() {
        if (this.destinationSuggestions) {
            this.destinationSuggestions.style.display = 'none';
        }
    }

    setupFavorites() {
        this.favoriteButtons.forEach(btn => {
            const hotelCard = btn.closest('.hotel-card');
            const hotelName = hotelCard?.querySelector('h3')?.textContent || '';

            // Verificar si ya está en favoritos
            if (this.favorites.includes(hotelName)) {
                this.markAsFavorite(btn);
            }

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(btn, hotelName);
            });
        });
    }

    toggleFavorite(button, hotelName) {
        const isFavorite = this.favorites.includes(hotelName);

        if (isFavorite) {
            this.removeFromFavorites(button, hotelName);
        } else {
            this.addToFavorites(button, hotelName);
        }

        this.saveFavorites();
    }

    addToFavorites(button, hotelName) {
        this.favorites.push(hotelName);
        this.markAsFavorite(button);
        this.showNotification(`${hotelName} agregado a favoritos`, 'success');

        // Efecto visual
        this.createHeartAnimation(button);
    }

    removeFromFavorites(button, hotelName) {
        this.favorites = this.favorites.filter(name => name !== hotelName);
        this.unmarkAsFavorite(button);
        this.showNotification(`${hotelName} removido de favoritos`, 'info');
    }

    markAsFavorite(button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('far');
            icon.classList.add('fas');
        }
        button.classList.add('is-favorite');
        button.style.color = 'var(--danger)';
    }

    unmarkAsFavorite(button) {
        const icon = button.querySelector('i');
        if (icon) {
            icon.classList.remove('fas');
            icon.classList.add('far');
        }
        button.classList.remove('is-favorite');
        button.style.color = '';
    }

    createHeartAnimation(button) {
        const hearts = ['💖', '💕', '💗', '💓'];

        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.className = 'floating-heart';

            const rect = button.getBoundingClientRect();
            Object.assign(heart.style, {
                position: 'fixed',
                left: rect.left + 'px',
                top: rect.top + 'px',
                fontSize: '1.5rem',
                pointerEvents: 'none',
                zIndex: '9999',
                animation: `floatHeart 1.5s ease-out forwards`,
                animationDelay: `${i * 0.2}s`
            });

            document.body.appendChild(heart);

            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 1500);
        }
    }

    saveFavorites() {
        localStorage.setItem('hotelFavorites', JSON.stringify(this.favorites));
    }

    setupLoadMore() {
        if (!this.loadMoreBtn) return;

        this.loadMoreBtn.addEventListener('click', () => {
            this.loadMoreHotels();
        });
    }

    async loadMoreHotels() {
        const originalText = this.loadMoreBtn.innerHTML;
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cargando...';
        this.loadMoreBtn.disabled = true;

        try {
            // Simular carga de más hoteles
            await new Promise(resolve => setTimeout(resolve, 1500));

            const newHotels = this.generateMoreHotels();
            this.appendHotels(newHotels);

            this.currentPage++;
            this.showNotification('¡Más hoteles cargados!', 'success');

        } catch (error) {
            console.error('Error cargando hoteles:', error);
            this.showNotification('Error al cargar más hoteles', 'error');
        } finally {
            this.loadMoreBtn.innerHTML = originalText;
            this.loadMoreBtn.disabled = false;
        }
    }

    generateMoreHotels() {
        const newHotels = [
            {
                name: 'Hotel Paradise Resort',
                location: 'Cancún, México',
                image: 'img/hotel-extra-1.jpg',
                price: '$180',
                rating: 4.5,
                reviews: 234,
                amenities: ['Playa', 'Spa', 'Todo incluido']
            },
            {
                name: 'Urban Boutique Hotel',
                location: 'Barcelona, España',
                image: 'img/hotel-extra-2.jpg',
                price: '€160',
                rating: 4.3,
                reviews: 156,
                amenities: ['Centro', 'Design', 'Rooftop']
            },
            {
                name: 'Mountain Lodge',
                location: 'Aspen, Estados Unidos',
                image: 'img/hotel-extra-3.jpg',
                price: '$320',
                rating: 4.7,
                reviews: 89,
                amenities: ['Montaña', 'Ski', 'Spa']
            }
        ];

        return newHotels;
    }

    appendHotels(hotels) {
        const grid = document.querySelector('.hotels-grid');
        if (!grid) return;

        hotels.forEach((hotel, index) => {
            const hotelElement = this.createHotelCard(hotel, index);
            grid.appendChild(hotelElement);
        });

        // Animar nuevos elementos
        const newCards = grid.querySelectorAll('.hotel-card:nth-last-child(-n+3)');
        newCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    createHotelCard(hotel, index) {
        const card = document.createElement('article');
        card.className = 'hotel-card hover-lift';

        const stars = '★'.repeat(Math.floor(hotel.rating)) + '☆'.repeat(5 - Math.floor(hotel.rating));

        card.innerHTML = `
            <div class="hotel-card__image">
                <img src="${hotel.image}" alt="${hotel.name}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/350x220/2193b0/ffffff?text=${encodeURIComponent(hotel.name)}'">
                <button class="hotel-card__favorite" aria-label="Agregar a favoritos">
                    <i class="far fa-heart"></i>
                </button>
            </div>
            <div class="hotel-card__content">
                <h3>${hotel.name}</h3>
                <div class="hotel-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${hotel.location}</span>
                </div>
                <div class="hotel-rating">
                    <div class="stars">
                        ${stars}
                    </div>
                    <span>${hotel.rating}/5 (${hotel.reviews} reseñas)</span>
                </div>
                <div class="hotel-amenities">
                    ${hotel.amenities.map(amenity => `
                        <span class="amenity-tag">
                            <i class="fas fa-check"></i> ${amenity}
                        </span>
                    `).join('')}
                </div>
                <div class="hotel-price">
                    <span class="price-from">Desde</span>
                    <span class="price-amount">${hotel.price}</span>
                    <span class="price-period">por noche</span>
                </div>
                <a href="hotel${index + 7}.html" class="btn btn--secondary">Ver Detalles</a>
            </div>
        `;

        // Setup favoritos para nueva card
        const favoriteBtn = card.querySelector('.hotel-card__favorite');
        favoriteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleFavorite(favoriteBtn, hotel.name);
        });

        return card;
    }

    setupFilters() {
    }

    filterHotels(searchData) {
        this.hotelCards.forEach(card => {
            const location = card.querySelector('.hotel-location span')?.textContent || '';
            const shouldShow = this.shouldShowHotel(location, searchData);

            if (shouldShow) {
                card.style.display = 'block';
                card.classList.add('search-match');
            } else {
                card.style.display = 'none';
                card.classList.remove('search-match');
            }
        });
    }

    shouldShowHotel(hotelLocation, searchData) {
        const searchLocation = searchData.destination.toLowerCase();
        const hotelLocationLower = hotelLocation.toLowerCase();

        // Búsqueda flexible
        return hotelLocationLower.includes(searchLocation) ||
            searchLocation.includes(hotelLocationLower.split(',')[0]);
    }

    setupHotelCardAnimations() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });

            this.hotelCards.forEach(card => {
                observer.observe(card);
            });
        }
    }

    showSearchLoading() {
        const searchBtn = this.searchForm?.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Buscando...';
            searchBtn.disabled = true;
        }
    }

    hideSearchLoading() {
        const searchBtn = this.searchForm?.querySelector('.search-btn');
        if (searchBtn) {
            searchBtn.innerHTML = '<i class="fas fa-search"></i> Buscar Hoteles';
            searchBtn.disabled = false;
        }
    }

    // === UTILIDADES ===
    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones global si está disponible
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            // Fallback simple
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getFavorites() {
        return [...this.favorites];
    }

    clearFavorites() {
        this.favorites = [];
        this.saveFavorites();
        this.favoriteButtons.forEach(btn => this.unmarkAsFavorite(btn));
        this.showNotification('Favoritos limpiados', 'info');
    }

    exportFavorites() {
        const data = {
            favorites: this.favorites,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mis-hoteles-favoritos.json';
        a.click();

        URL.revokeObjectURL(url);
        this.showNotification('Favoritos exportados', 'success');
    }
}

let hospedajeManager;

document.addEventListener('DOMContentLoaded', () => {
    hospedajeManager = new HospedajeManager();
});

// === ESTILOS CSS DINÁMICOS ===
const hospedajeStyles = document.createElement('style');
hospedajeStyles.textContent = `
    .suggestion-item {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm);
        cursor: pointer;
        transition: var(--transition);
        font-size: var(--font-size-small);
    }
    
    .suggestion-item:hover {
        background: var(--gray-light);
    }
    
    .field-error {
        animation: shake 0.3s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    @keyframes floatHeart {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px) scale(0.5);
            opacity: 0;
        }
    }
    
    .hotel-card.search-match {
        animation: highlightMatch 0.5s ease-out;
    }
    
    @keyframes highlightMatch {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }
    
    .is-favorite {
        color: var(--danger) !important;
        animation: favoriteAdded 0.4s ease-out;
    }
    
    @keyframes favoriteAdded {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
`;

document.head.appendChild(hospedajeStyles);

// === EXPORTAR PARA USO GLOBAL ===
window.HospedajeManager = HospedajeManager;
window.hospedajeManager = hospedajeManager;