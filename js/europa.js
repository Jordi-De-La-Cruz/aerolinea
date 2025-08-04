class EuropaPage {
    constructor() {
        this.destinations = [];
        this.currentCurrency = 'EUR';
        this.exchangeRates = {
            'EUR': 1,
            'USD': 1.08,
            'GBP': 0.86,
            'JPY': 161.50
        };

        this.init();
    }

    init() {
        this.initDestinations();
        this.initBookingForms();
        this.initPriceCalculator();
        this.initAnimations();
        this.initInteractiveFeatures();
        this.loadDestinationData();
    }

    initDestinations() {
        this.destinations = [
            {
                id: 'paris',
                name: 'París, Francia',
                country: 'Francia',
                basePrice: 899,
                currency: 'EUR',
                rating: 4.9,
                image: 'img/paris.jpg',
                features: ['Monumentos', 'Arte', 'Gastronomía'],
                description: 'La Ciudad de la Luz te espera con sus icónicos monumentos...',
                season: {
                    high: [6, 7, 8],
                    low: [1, 2, 11, 12]
                }
            },
            {
                id: 'roma',
                name: 'Roma, Italia',
                country: 'Italia',
                basePrice: 749,
                currency: 'EUR',
                rating: 4.8,
                image: 'img/roma.jpg',
                features: ['Historia', 'Arquitectura', 'Comida'],
                description: 'La Ciudad Eterna donde cada piedra cuenta una historia...',
                season: {
                    high: [5, 6, 7, 8, 9],
                    low: [1, 2, 12]
                }
            },
            {
                id: 'barcelona',
                name: 'Barcelona, España',
                country: 'España',
                basePrice: 599,
                currency: 'EUR',
                rating: 4.7,
                image: 'img/barcelona.jpg',
                features: ['Playas', 'Gaudí', 'Tapas'],
                description: 'Modernismo catalán, playas mediterráneas...',
                season: {
                    high: [6, 7, 8, 9],
                    low: [1, 2, 3, 12]
                }
            },
            {
                id: 'londres',
                name: 'Londres, Reino Unido',
                country: 'Reino Unido',
                basePrice: 699,
                currency: 'GBP',
                rating: 4.6,
                image: 'img/londres.jpg',
                features: ['Realeza', 'Teatro', 'Museos'],
                description: 'Tradición y modernidad se fusionan...',
                season: {
                    high: [6, 7, 8],
                    low: [1, 2, 11, 12]
                }
            },
            {
                id: 'amsterdam',
                name: 'Ámsterdam, Países Bajos',
                country: 'Países Bajos',
                basePrice: 679,
                currency: 'EUR',
                rating: 4.5,
                image: 'img/amsterdam.jpg',
                features: ['Canales', 'Bicicletas', 'Tulipanes'],
                description: 'Canales pintorescos, museos extraordinarios...',
                season: {
                    high: [4, 5, 6, 7, 8],
                    low: [1, 2, 11, 12]
                }
            },
            {
                id: 'praga',
                name: 'Praga, República Checa',
                country: 'República Checa',
                basePrice: 529,
                currency: 'EUR',
                rating: 4.4,
                image: 'img/praga.jpg',
                features: ['Castillos', 'Cerveza', 'Puentes'],
                description: 'La "Ciudad de las Cien Torres"...',
                season: {
                    high: [5, 6, 7, 8, 9],
                    low: [1, 2, 3, 11, 12]
                }
            }
        ];
    }

    initBookingForms() {
        const bookingButtons = document.querySelectorAll('.btn[data-destination]');

        bookingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const destinationId = button.dataset.destination;
                this.openBookingModal(destinationId);
            });
        });

        // Alternative: redirect to booking page
        const reservarButtons = document.querySelectorAll('.card-footer .btn--primary');
        reservarButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const destination = this.destinations[index];
                if (destination) {
                    this.handleBookingClick(destination);
                }
            });
        });
    }

    handleBookingClick(destination) {
        // Simulate booking process
        this.showBookingAnimation();

        // Save destination to localStorage for booking page
        localStorage.setItem('selectedDestination', JSON.stringify(destination));

        setTimeout(() => {
            if (typeof showNotification === 'function') {
                showNotification(`Redirigiendo a reservas para ${destination.name}...`, 'info');
            }

            setTimeout(() => {
                window.location.href = `reservar.html?destino=${destination.id}`;
            }, 1500);
        }, 1000);
    }

    showBookingAnimation() {
        const button = event.target;
        const originalText = button.innerHTML;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        button.disabled = true;
        button.style.opacity = '0.7';

        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            button.style.opacity = '1';
        }, 2000);
    }

    initPriceCalculator() {
        this.updatePricesWithSeason();
        this.initCurrencyConverter();
    }

    updatePricesWithSeason() {
        const currentMonth = new Date().getMonth() + 1;
        const priceElements = document.querySelectorAll('.price-amount');

        priceElements.forEach((element, index) => {
            const destination = this.destinations[index];
            if (destination) {
                const adjustedPrice = this.calculateSeasonalPrice(destination, currentMonth);
                element.textContent = this.formatPrice(adjustedPrice, destination.currency);
            }
        });
    }

    calculateSeasonalPrice(destination, month) {
        let multiplier = 1;

        if (destination.season.high.includes(month)) {
            multiplier = 1.3;
        } else if (destination.season.low.includes(month)) {
            multiplier = 0.8;
        }

        return Math.round(destination.basePrice * multiplier);
    }

    formatPrice(price, currency) {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'JPY': '¥'
        };

        return `${symbols[currency] || '€'}${price.toLocaleString()}`;
    }

    initCurrencyConverter() {
        this.createCurrencySelector();

        const currencySelector = document.getElementById('currencySelector');
        if (currencySelector) {
            currencySelector.addEventListener('change', (e) => {
                this.currentCurrency = e.target.value;
                this.convertAllPrices();
            });
        }
    }

    createCurrencySelector() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent || document.getElementById('currencySelector')) return;

        const currencyDiv = document.createElement('div');
        currencyDiv.className = 'currency-selector';
        currencyDiv.innerHTML = `
            <div style="margin-top: 2rem; display: inline-flex; align-items: center; gap: 1rem; 
                        background: rgba(255, 255, 255, 0.1); padding: 1rem 2rem; 
                        border-radius: 2rem; backdrop-filter: blur(10px);">
                <i class="fas fa-coins" style="color: var(--secondary);"></i>
                <label for="currencySelector" style="color: white; font-weight: 600;">Moneda:</label>
                <select id="currencySelector" style="background: rgba(255, 255, 255, 0.9); 
                        border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; 
                        font-weight: 600; color: var(--primary);">
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                </select>
            </div>
        `;

        heroContent.appendChild(currencyDiv);
    }

    convertAllPrices() {
        const priceElements = document.querySelectorAll('.price-amount');

        priceElements.forEach((element, index) => {
            const destination = this.destinations[index];
            if (destination) {
                const currentMonth = new Date().getMonth() + 1;
                const basePrice = this.calculateSeasonalPrice(destination, currentMonth);
                const convertedPrice = this.convertPrice(basePrice, destination.currency, this.currentCurrency);
                element.textContent = this.formatPrice(convertedPrice, this.currentCurrency);
            }
        });
    }

    convertPrice(amount, fromCurrency, toCurrency) {
        if (fromCurrency === toCurrency) return amount;

        // Convert to EUR first, then to target currency
        const inEUR = amount / this.exchangeRates[fromCurrency];
        const converted = inEUR * this.exchangeRates[toCurrency];

        return Math.round(converted);
    }

    initAnimations() {
        this.initScrollAnimations();
        this.initHoverAnimations();
        this.initCounterAnimations();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = `${Math.random() * 0.5}s`;
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        const animateElements = document.querySelectorAll('.destination-card, .tip-card');
        animateElements.forEach(el => observer.observe(el));
    }

    initHoverAnimations() {
        const cards = document.querySelectorAll('.destination-card');

        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                // Add subtle animation to feature tags
                const tags = card.querySelectorAll('.feature-tag');
                tags.forEach((tag, index) => {
                    setTimeout(() => {
                        tag.style.transform = 'translateY(-2px) scale(1.05)';
                    }, index * 100);
                });
            });

            card.addEventListener('mouseleave', () => {
                const tags = card.querySelectorAll('.feature-tag');
                tags.forEach(tag => {
                    tag.style.transform = 'translateY(0) scale(1)';
                });
            });
        });
    }

    initCounterAnimations() {
        const ratings = document.querySelectorAll('.card-rating span');

        const animateRating = (element) => {
            const finalValue = parseFloat(element.textContent);
            let currentValue = 0;
            const increment = finalValue / 50;

            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    currentValue = finalValue;
                    clearInterval(timer);
                }
                element.textContent = currentValue.toFixed(1);
            }, 20);
        };

        const ratingObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateRating(entry.target);
                    ratingObserver.unobserve(entry.target);
                }
            });
        });

        ratings.forEach(rating => ratingObserver.observe(rating));
    }

    initInteractiveFeatures() {
        this.initFeatureTagInteractions();
        this.initPriceComparison();
        this.initDestinationFilters();
    }

    initFeatureTagInteractions() {
        const featureTags = document.querySelectorAll('.feature-tag');

        featureTags.forEach(tag => {
            tag.addEventListener('click', () => {
                const feature = tag.textContent.trim();
                this.showFeatureInfo(feature);
            });
        });
    }

    showFeatureInfo(feature) {
        const featureInfo = {
            'Monumentos': 'Descubre los monumentos más icónicos y su historia fascinante.',
            'Arte': 'Explora museos y galerías de arte de renombre mundial.',
            'Gastronomía': 'Disfruta de la auténtica cocina local y restaurantes premiados.',
            'Historia': 'Sumérgete en siglos de historia y cultura ancestral.',
            'Arquitectura': 'Admira estilos arquitectónicos únicos y construcciones legendarias.',
            'Playas': 'Relájate en hermosas costas y playas mediterráneas.',
            'Realeza': 'Conoce palacios, castillos y la rica tradición monárquica.',
            'Teatro': 'Disfruta de espectáculos teatrales en venues históricos.',
            'Museos': 'Visita colecciones artísticas y culturales excepcionales.',
            'Canales': 'Navega por pintorescos canales y arquitectura acuática.',
            'Bicicletas': 'Explora la ciudad de forma ecológica y divertida.',
            'Tulipanes': 'Admira campos de flores y jardines espectaculares.',
            'Castillos': 'Visita fortalezas medievales y palacios históricos.',
            'Cerveza': 'Degusta cervezas artesanales y tradiciones cerveceras.',
            'Puentes': 'Cruza puentes históricos con vistas panorámicas.'
        };

        if (typeof showNotification === 'function') {
            showNotification(`${feature}: ${featureInfo[feature] || 'Información no disponible'}`, 'info');
        }
    }

    initPriceComparison() {
        const compareButton = this.createCompareButton();
        this.selectedDestinations = new Set();

        const cards = document.querySelectorAll('.destination-card');
        cards.forEach((card, index) => {
            this.addCompareCheckbox(card, index);
        });
    }

    createCompareButton() {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) return;

        const compareDiv = document.createElement('div');
        compareDiv.className = 'compare-section';
        compareDiv.innerHTML = `
            <button id="compareBtn" class="btn btn--outline" style="margin-top: 2rem; display: none;">
                <i class="fas fa-balance-scale"></i>
                Comparar Seleccionados (<span id="compareCount">0</span>)
            </button>
        `;

        heroContent.appendChild(compareDiv);

        const compareBtn = document.getElementById('compareBtn');
        compareBtn.addEventListener('click', () => this.showComparison());

        return compareBtn;
    }

    addCompareCheckbox(card, index) {
        const checkbox = document.createElement('div');
        checkbox.className = 'compare-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" id="compare-${index}" class="compare-input">
            <label for="compare-${index}" class="compare-label">
                <i class="fas fa-plus"></i>
                Comparar
            </label>
        `;

        checkbox.style.cssText = `
            position: absolute;
            top: 1rem;
            left: 1rem;
            z-index: 4;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 0.5rem;
            padding: 0.5rem;
            backdrop-filter: blur(10px);
        `;

        card.style.position = 'relative';
        card.appendChild(checkbox);

        const input = checkbox.querySelector('input');
        input.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedDestinations.add(index);
            } else {
                this.selectedDestinations.delete(index);
            }
            this.updateCompareButton();
        });
    }

    updateCompareButton() {
        const compareBtn = document.getElementById('compareBtn');
        const compareCount = document.getElementById('compareCount');

        if (!compareBtn || !compareCount) return;

        const count = this.selectedDestinations.size;
        compareCount.textContent = count;

        if (count >= 2) {
            compareBtn.style.display = 'inline-flex';
        } else {
            compareBtn.style.display = 'none';
        }
    }

    showComparison() {
        const selectedDestinations = Array.from(this.selectedDestinations)
            .map(index => this.destinations[index]);

        if (selectedDestinations.length < 2) {
            if (typeof showNotification === 'function') {
                showNotification('Selecciona al menos 2 destinos para comparar', 'warning');
            }
            return;
        }

        this.createComparisonModal(selectedDestinations);
    }

    createComparisonModal(destinations) {
        const modal = document.createElement('div');
        modal.className = 'comparison-modal';
        modal.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Comparación de Destinos</h2>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="comparison-table">
                        ${this.generateComparisonTable(destinations)}
                    </div>
                </div>
            </div>
        `;

        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(modal);

        const closeButton = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        closeButton.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) modal.remove();
        });
    }

    generateComparisonTable(destinations) {
        const currentMonth = new Date().getMonth() + 1;

        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--primary); color: white;">
                        <th style="padding: 1rem; text-align: left;">Aspecto</th>
                        ${destinations.map(dest => `<th style="padding: 1rem; text-align: center;">${dest.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 1rem; font-weight: bold;">Precio</td>
                        ${destinations.map(dest => `
                            <td style="padding: 1rem; text-align: center; color: var(--primary); font-weight: bold;">
                                ${this.formatPrice(this.calculateSeasonalPrice(dest, currentMonth), dest.currency)}
                            </td>
                        `).join('')}
                    </tr>
                    <tr style="background: var(--gray-light);">
                        <td style="padding: 1rem; font-weight: bold;">Rating</td>
                        ${destinations.map(dest => `
                            <td style="padding: 1rem; text-align: center;">
                                <span style="color: #ffd700;">★</span> ${dest.rating}
                            </td>
                        `).join('')}
                    </tr>
                    <tr>
                        <td style="padding: 1rem; font-weight: bold;">Características</td>
                        ${destinations.map(dest => `
                            <td style="padding: 1rem; text-align: center;">
                                ${dest.features.map(f => `<span style="display: inline-block; background: var(--secondary); color: white; padding: 0.2rem 0.5rem; margin: 0.1rem; border-radius: 1rem; font-size: 0.8rem;">${f}</span>`).join('')}
                            </td>
                        `).join('')}
                    </tr>
                </tbody>
            </table>
        `;
    }

    initDestinationFilters() {
        this.createFilterControls();
    }

    createFilterControls() {
        const destinationsSection = document.querySelector('.destinations-section');
        if (!destinationsSection) return;

        const filterDiv = document.createElement('div');
        filterDiv.className = 'filter-controls';
        filterDiv.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 1rem; margin: 2rem 0; flex-wrap: wrap;">
                <button class="filter-btn active" data-filter="all">
                    <i class="fas fa-globe"></i> Todos
                </button>
                <button class="filter-btn" data-filter="budget">
                    <i class="fas fa-coins"></i> Económicos
                </button>
                <button class="filter-btn" data-filter="luxury">
                    <i class="fas fa-crown"></i> Premium
                </button>
                <button class="filter-btn" data-filter="cultural">
                    <i class="fas fa-monument"></i> Culturales
                </button>
                <button class="filter-btn" data-filter="coastal">
                    <i class="fas fa-umbrella-beach"></i> Costeros
                </button>
            </div>
        `;

        const sectionTitle = destinationsSection.querySelector('.section-title');
        sectionTitle.after(filterDiv);

        const filterButtons = filterDiv.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterDestinations(btn.dataset.filter);
            });
        });

        this.styleFilterButtons(filterButtons);
    }

    styleFilterButtons(buttons) {
        buttons.forEach(btn => {
            btn.style.cssText = `
                background: rgba(33, 147, 176, 0.1);
                border: 2px solid var(--primary);
                color: var(--primary);
                padding: 0.8rem 1.5rem;
                border-radius: 2rem;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            `;

            btn.addEventListener('mouseenter', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.background = 'var(--primary)';
                    btn.style.color = 'white';
                    btn.style.transform = 'translateY(-2px)';
                }
            });

            btn.addEventListener('mouseleave', () => {
                if (!btn.classList.contains('active')) {
                    btn.style.background = 'rgba(33, 147, 176, 0.1)';
                    btn.style.color = 'var(--primary)';
                    btn.style.transform = 'translateY(0)';
                }
            });
        });

        // Style active button
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) {
            activeBtn.style.background = 'var(--primary)';
            activeBtn.style.color = 'white';
        }
    }

    filterDestinations(filterType) {
        const cards = document.querySelectorAll('.destination-card');

        cards.forEach((card, index) => {
            const destination = this.destinations[index];
            let shouldShow = true;

            switch (filterType) {
                case 'budget':
                    shouldShow = destination.basePrice < 650;
                    break;
                case 'luxury':
                    shouldShow = destination.basePrice >= 750;
                    break;
                case 'cultural':
                    shouldShow = destination.features.some(f =>
                        ['Historia', 'Arte', 'Monumentos', 'Arquitectura', 'Museos'].includes(f)
                    );
                    break;
                case 'coastal':
                    shouldShow = destination.features.includes('Playas');
                    break;
                default:
                    shouldShow = true;
            }

            if (shouldShow) {
                card.style.display = 'flex';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadDestinationData() {
        this.showLoadingState();

        setTimeout(() => {
            this.updateWithRealTimeData();
            this.hideLoadingState();
        }, 1500);
    }

    showLoadingState() {
        const priceElements = document.querySelectorAll('.price-amount');
        priceElements.forEach(el => {
            el.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        });
    }

    hideLoadingState() {
        this.updatePricesWithSeason();
    }

    updateWithRealTimeData() {
        const flightData = {
            availability: Math.random() * 100,
            demandMultiplier: 0.9 + (Math.random() * 0.2)
        };

        this.destinations.forEach(dest => {
            dest.availability = flightData.availability;
            dest.demandMultiplier = flightData.demandMultiplier;
        });

        this.showAvailabilityInfo();
    }

    showAvailabilityInfo() {
        const cards = document.querySelectorAll('.destination-card');

        cards.forEach((card, index) => {
            const destination = this.destinations[index];
            const availability = Math.round(destination.availability);

            let statusClass = 'high';
            let statusText = 'Alta disponibilidad';
            let statusIcon = 'fa-check-circle';

            if (availability < 30) {
                statusClass = 'low';
                statusText = 'Pocas plazas';
                statusIcon = 'fa-exclamation-triangle';
            } else if (availability < 60) {
                statusClass = 'medium';
                statusText = 'Disponibilidad media';
                statusIcon = 'fa-info-circle';
            }

            const statusBadge = document.createElement('div');
            statusBadge.className = `availability-badge ${statusClass}`;
            statusBadge.innerHTML = `
                <i class="fas ${statusIcon}"></i>
                <span>${statusText}</span>
            `;

            statusBadge.style.cssText = `
                position: absolute;
                bottom: 1rem;
                left: 1rem;
                background: rgba(255, 255, 255, 0.95);
                padding: 0.5rem 1rem;
                border-radius: 1rem;
                font-size: 0.8rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.3rem;
                z-index: 3;
                backdrop-filter: blur(10px);
            `;

            const colors = {
                high: '#27ae60',
                medium: '#f39c12',
                low: '#e74c3c'
            };

            statusBadge.style.color = colors[statusClass];

            card.querySelector('.card-image').appendChild(statusBadge);
        });
    }

    destroy() {
        // Limpiar event listeners
        const buttons = document.querySelectorAll('.btn, .filter-btn, .compare-input');
        buttons.forEach(btn => {
            btn.replaceWith(btn.cloneNode(true));
        });

        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.europaPage = new EuropaPage();
});

// Limpiar al salir de la página
window.addEventListener('beforeunload', () => {
    if (window.europaPage) {
        window.europaPage.destroy();
    }
});

window.EuropaPage = EuropaPage;