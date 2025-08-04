document.addEventListener('DOMContentLoaded', function () {
    initHotelBooking();
    initGallery();
    initPriceCalculator();
    initMapInteractions();
});

function initHotelBooking() {
    const bookingForm = document.getElementById('bookingForm');
    if (!bookingForm) return;

    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');

    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    if (checkinInput) checkinInput.min = today;
    if (checkoutInput) checkoutInput.min = today;

    if (checkinInput) {
        checkinInput.addEventListener('change', function () {
            const checkinDate = new Date(this.value);
            const minCheckout = new Date(checkinDate);
            minCheckout.setDate(minCheckout.getDate() + 1);

            if (checkoutInput) {
                checkoutInput.min = minCheckout.toISOString().split('T')[0];
                if (checkoutInput.value && new Date(checkoutInput.value) <= checkinDate) {
                    checkoutInput.value = minCheckout.toISOString().split('T')[0];
                }
            }
            calculatePrice();
        });
    }

    if (checkoutInput) {
        checkoutInput.addEventListener('change', calculatePrice);
    }

    // Manejar envío del formulario
    bookingForm.addEventListener('submit', handleBookingSubmit);

    // Listeners para cambios en huéspedes y habitaciones
    const guestsSelect = document.getElementById('guests');
    const roomsSelect = document.getElementById('rooms');

    if (guestsSelect) guestsSelect.addEventListener('change', calculatePrice);
    if (roomsSelect) roomsSelect.addEventListener('change', calculatePrice);
}

function initGallery() {
    const galleryImages = document.querySelectorAll('.gallery-thumbnails img');
    const mainImage = document.querySelector('.gallery-main img');

    if (!mainImage) return;

    galleryImages.forEach(thumbnail => {
        thumbnail.addEventListener('click', function () {
            const tempSrc = mainImage.src;
            mainImage.src = this.src;
            this.src = tempSrc;

            // Añadir efecto de transición
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.style.opacity = '1';
            }, 150);
        });
    });

    // Botón "ver más fotos"
    const galleryMore = document.querySelector('.gallery-more');
    if (galleryMore) {
        galleryMore.addEventListener('click', function () {
            showNotification('Galería completa próximamente disponible', 'info');
        });
    }
}

// Calculadora de precios
function calculatePrice() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const guestsSelect = document.getElementById('guests');
    const roomsSelect = document.getElementById('rooms');

    if (!checkinInput?.value || !checkoutInput?.value) return;

    const checkinDate = new Date(checkinInput.value);
    const checkoutDate = new Date(checkoutInput.value);
    const nights = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

    if (nights <= 0) return;

    const guests = parseInt(guestsSelect?.value || '1');
    const rooms = parseInt(roomsSelect?.value || '1');

    // Obtener precio base
    const priceElement = document.querySelector('.price-amount');
    let basePrice = 120;

    if (priceElement) {
        const priceText = priceElement.textContent.replace(/[^0-9]/g, '');
        basePrice = parseInt(priceText) || 120;
    }

    // Calcular precios
    const roomPrice = basePrice * rooms;
    const subtotal = roomPrice * nights;
    const taxes = Math.round(subtotal * 0.15);
    const total = subtotal + taxes;

    // Actualizar UI
    updatePriceSummary(roomPrice, nights, subtotal, taxes, total, rooms);
}

// Actualizar resumen de precios
function updatePriceSummary(roomPrice, nights, subtotal, taxes, total, rooms) {
    const priceBreakdown = document.querySelector('.price-breakdown');
    if (!priceBreakdown) return;

    const currency = getCurrency();
    const roomText = rooms > 1 ? `${rooms} habitaciones` : 'habitación';
    const nightText = nights > 1 ? 'noches' : 'noche';

    priceBreakdown.innerHTML = `
        <div class="price-line">
            <span>${currency}${roomPrice} x ${nights} ${nightText} (${roomText})</span>
            <span>${currency}${subtotal}</span>
        </div>
        <div class="price-line">
            <span>Impuestos y tasas</span>
            <span>${currency}${taxes}</span>
        </div>
        <div class="price-line price-total">
            <span><strong>Total</strong></span>
            <span><strong>${currency}${total}</strong></span>
        </div>
    `;
}

function getCurrency() {
    const title = document.querySelector('h1')?.textContent || '';
    if (title.includes('Francia') || title.includes('París')) return '€';
    if (title.includes('República Dominicana') || title.includes('Dominicana')) return '$';
    return '$';
}

async function handleBookingSubmit(e) {
    e.preventDefault();

    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // Mostrar estado de carga
    submitButton.classList.add('loading');
    submitButton.innerHTML = '<div class="loading-spinner"></div> Procesando...';
    submitButton.disabled = true;

    try {
        await simulateBookingRequest();

        // Mostrar éxito
        showNotification('¡Reserva procesada exitosamente! Te contactaremos pronto.', 'success');

        setTimeout(() => {
        }, 2000);

    } catch (error) {
        console.error('Error en la reserva:', error);
        showNotification('Error al procesar la reserva. Inténtalo nuevamente.', 'error');
    } finally {
        // Restaurar botón
        submitButton.classList.remove('loading');
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    }
}

// Simular petición de reserva
function simulateBookingRequest() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (Math.random() > 0.1) {
                resolve({ success: true, bookingId: 'HF' + Date.now() });
            } else {
                reject(new Error('Error de conexión'));
            }
        }, 2000);
    });
}

function initMapInteractions() {
    const mapIframe = document.querySelector('.hotel-map');
    if (!mapIframe) return;

    // Prevenir scroll accidental en el mapa
    mapIframe.addEventListener('mouseenter', function () {
        this.style.pointerEvents = 'none';
    });

    mapIframe.addEventListener('mouseleave', function () {
        this.style.pointerEvents = 'auto';
    });

    // Habilitar interacción al hacer clic
    mapIframe.addEventListener('click', function () {
        this.style.pointerEvents = 'auto';
        showNotification('Mapa activado. Haz clic fuera para desactivar.', 'info');
    });
}

// Funcionalidad para botones de favoritos
document.addEventListener('click', function (e) {
    if (e.target.closest('.btn--outline')) {
        const btn = e.target.closest('.btn--outline');
        const icon = btn.querySelector('i') || document.createElement('i');

        if (btn.textContent.includes('Favoritos')) {
            e.preventDefault();

            // Toggle favorito
            const isFavorite = btn.classList.contains('favorite');

            if (isFavorite) {
                btn.classList.remove('favorite');
                btn.innerHTML = '<i class="ti ti-heart"></i> Agregar a Favoritos';
                showNotification('Removido de favoritos', 'info');
            } else {
                btn.classList.add('favorite');
                btn.innerHTML = '<i class="ti ti-heart-filled"></i> En Favoritos';
                showNotification('Agregado a favoritos', 'success');
            }
        }
    }
});

// Smooth scroll para anclas internas
document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
});

function initHotelAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observar elementos específicos de hotel
    const elementsToAnimate = document.querySelectorAll(`
        .amenity-item,
        .attraction-item,
        .review-card,
        .feature-card,
        .hotel-card
    `);

    elementsToAnimate.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.1}s`;
        observer.observe(element);
    });
}

// Auto-ejecutar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initHotelAnimations);

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function validateBookingForm(formData) {
    const errors = [];

    if (!formData.get('checkin')) {
        errors.push('Fecha de llegada es requerida');
    }

    if (!formData.get('checkout')) {
        errors.push('Fecha de salida es requerida');
    }

    if (formData.get('checkin') && formData.get('checkout')) {
        const checkin = new Date(formData.get('checkin'));
        const checkout = new Date(formData.get('checkout'));

        if (checkout <= checkin) {
            errors.push('La fecha de salida debe ser posterior a la de llegada');
        }
    }

    return errors;
}

window.HotelBooking = {
    calculatePrice,
    handleBookingSubmit,
    formatDate,
    validateBookingForm
};

class HotelExperience {
    constructor() {
        this.initRatingInteraction();
        this.initImageLazyLoading();
        this.initTooltips();
        this.initKeyboardNavigation();
    }

    initRatingInteraction() {
        const reviewCards = document.querySelectorAll('.review-card');

        reviewCards.forEach(card => {
            const stars = card.querySelectorAll('.stars i');

            stars.forEach((star, index) => {
                star.addEventListener('mouseenter', () => {
                    this.highlightStars(stars, index);
                });

                star.addEventListener('mouseleave', () => {
                    this.resetStars(stars);
                });
            });
        });
    }

    highlightStars(stars, upToIndex) {
        stars.forEach((star, index) => {
            if (index <= upToIndex) {
                star.style.transform = 'scale(1.1)';
                star.style.filter = 'brightness(1.2)';
            }
        });
    }

    resetStars(stars) {
        stars.forEach(star => {
            star.style.transform = 'scale(1)';
            star.style.filter = 'brightness(1)';
        });
    }

    initImageLazyLoading() {
        const images = document.querySelectorAll('img[loading="lazy"]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Añadir clase de carga
                    img.classList.add('loading');

                    img.addEventListener('load', () => {
                        img.classList.remove('loading');
                        img.classList.add('loaded');
                    });

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        images.forEach(img => imageObserver.observe(img));
    }

    initTooltips() {
        const amenityItems = document.querySelectorAll('.amenity-item');

        amenityItems.forEach(item => {
            item.addEventListener('mouseenter', this.showTooltip.bind(this));
            item.addEventListener('mouseleave', this.hideTooltip.bind(this));
        });
    }

    showTooltip(event) {
        const item = event.currentTarget;
        const text = item.querySelector('span').textContent;
        const tooltipText = this.getTooltipText(text);

        if (!tooltipText) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'amenity-tooltip';
        tooltip.textContent = tooltipText;

        document.body.appendChild(tooltip);

        const rect = item.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;

        setTimeout(() => tooltip.classList.add('visible'), 10);
    }

    hideTooltip() {
        const tooltip = document.querySelector('.amenity-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
            setTimeout(() => tooltip.remove(), 300);
        }
    }

    getTooltipText(amenityText) {
        const tooltips = {
            'Wi-Fi gratis': 'Internet de alta velocidad en todas las áreas',
            'Piscina': 'Piscina climatizada con área para niños',
            'Gimnasio': 'Equipamiento moderno 24/7',
            'Spa': 'Tratamientos relajantes con productos naturales',
            'Estacionamiento': 'Parking gratuito vigilado',
            'Aire acondicionado': 'Control individual en todas las habitaciones'
        };

        return tooltips[amenityText] || null;
    }

    initKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTooltip();
            }

            if (e.key === 'Tab') {
                this.highlightFocusedElement();
            }
        });
    }

    highlightFocusedElement() {
        setTimeout(() => {
            const focused = document.activeElement;
            if (focused && focused.matches('button, input, select, a')) {
                focused.style.outline = '2px solid var(--primary)';
                focused.style.outlineOffset = '2px';
            }
        }, 10);
    }
}

// Inicializar experiencia mejorada del hotel
document.addEventListener('DOMContentLoaded', () => {
    new HotelExperience();
});

const BookingUtils = {
    formatPrice(amount, currency = '$') {
        return `${currency}${amount.toLocaleString()}`;
    },

    // Calcular noches entre fechas
    calculateNights(checkin, checkout) {
        const start = new Date(checkin);
        const end = new Date(checkout);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    },

    // Validar disponibilidad
    async checkAvailability(checkin, checkout, rooms) {
        return new Promise(resolve => {
            setTimeout(() => {
                const available = Math.random() > 0.1;
                resolve({
                    available,
                    message: available ?
                        'Habitaciones disponibles' :
                        'Lo sentimos, no hay disponibilidad para estas fechas'
                });
            }, 1000);
        });
    },

    getSpecialOffers() {
        const offers = [
            {
                title: 'Reserva Anticipada',
                description: '15% de descuento reservando con 30 días de anticipación',
                code: 'EARLY15'
            },
            {
                title: 'Estancia Larga',
                description: '20% de descuento en estadías de 7 noches o más',
                code: 'STAY7'
            },
            {
                title: 'Luna de Miel',
                description: 'Upgrade gratuito y cena romántica incluida',
                code: 'HONEYMOON'
            }
        ];

        return offers;
    },

    // Aplicar código de descuento
    applyDiscountCode(code, total) {
        const discounts = {
            'EARLY15': 0.15,
            'STAY7': 0.20,
            'WELCOME10': 0.10,
            'HONEYMOON': 0.25
        };

        const discount = discounts[code.toUpperCase()];
        if (discount) {
            const discountAmount = total * discount;
            return {
                success: true,
                discountAmount,
                newTotal: total - discountAmount,
                message: `Descuento aplicado: ${(discount * 100)}%`
            };
        }

        return {
            success: false,
            message: 'Código de descuento inválido'
        };
    }
};

class HotelComparison {
    constructor() {
        this.compareList = JSON.parse(localStorage.getItem('hotelCompare') || '[]');
        this.initCompareButtons();
    }

    initCompareButtons() {
        const compareBtn = document.createElement('button');
        compareBtn.className = 'btn btn--outline compare-btn';
        compareBtn.innerHTML = '<i class="ti ti-git-compare"></i> Comparar Hotel';

        const hotelActions = document.querySelector('.hotel-actions');
        if (hotelActions) {
            hotelActions.appendChild(compareBtn);
            compareBtn.addEventListener('click', () => this.toggleCompare());
        }
    }

    toggleCompare() {
        const hotelTitle = document.querySelector('h1').textContent;
        const hotelId = this.generateHotelId(hotelTitle);

        if (this.compareList.includes(hotelId)) {
            this.removeFromCompare(hotelId);
        } else {
            this.addToCompare(hotelId, hotelTitle);
        }

        this.updateCompareButton();
        this.saveCompareList();
    }

    addToCompare(id, title) {
        if (this.compareList.length >= 3) {
            showNotification('Máximo 3 hoteles para comparar', 'warning');
            return;
        }

        this.compareList.push(id);
        showNotification(`${title} agregado para comparar`, 'success');
    }

    removeFromCompare(id) {
        this.compareList = this.compareList.filter(item => item !== id);
        showNotification('Hotel removido de comparación', 'info');
    }

    updateCompareButton() {
        const btn = document.querySelector('.compare-btn');
        const hotelTitle = document.querySelector('h1').textContent;
        const hotelId = this.generateHotelId(hotelTitle);

        if (this.compareList.includes(hotelId)) {
            btn.innerHTML = '<i class="ti ti-check"></i> En Comparación';
            btn.classList.add('active');
        } else {
            btn.innerHTML = '<i class="ti ti-git-compare"></i> Comparar Hotel';
            btn.classList.remove('active');
        }
    }

    generateHotelId(title) {
        return title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    }

    saveCompareList() {
        localStorage.setItem('hotelCompare', JSON.stringify(this.compareList));
    }
}

// Inicializar comparación de hoteles
document.addEventListener('DOMContentLoaded', () => {
    new HotelComparison();
});

const style = document.createElement('style');
style.textContent = `
    .amenity-tooltip {
        position: absolute;
        background: var(--dark);
        color: var(--light);
        padding: 0.5rem 1rem;
        border-radius: var(--border-radius);
        font-size: var(--font-size-small);
        transform: translateX(-50%) translateY(-100%);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        white-space: nowrap;
    }
    
    .amenity-tooltip.visible {
        opacity: 1;
    }
    
    .amenity-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 5px solid transparent;
        border-top-color: var(--dark);
    }
    
    img.loading {
        opacity: 0.5;
        filter: blur(2px);
    }
    
    img.loaded {
        opacity: 1;
        filter: blur(0);
        transition: opacity 0.3s ease, filter 0.3s ease;
    }
    
    .compare-btn.active {
        background: var(--primary);
        color: var(--light);
        border-color: var(--primary);
    }
    
    .btn--outline.favorite {
        background: var(--danger);
        color: var(--light);
        border-color: var(--danger);
    }
`;

document.head.appendChild(style);