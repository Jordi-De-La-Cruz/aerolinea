// slider.js - Tu slider existente mejorado con compatibilidad

let currentSlideIndex = 0;
let slideInterval;

// Inicializar slider cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    initializeSlider();
    // Inicializar también el nuevo sistema de sliders si existe
    initModernSliders();
});

function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    showSlide(currentSlideIndex);
    startAutoPlay();

    const sliderContainer = document.querySelector('.slider-container') || document.querySelector('.slider');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }

    let touchStartX = 0;
    let touchEndX = 0;

    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        sliderContainer.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
        }
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (slides[index]) {
        slides[index].classList.add('active');
    }

    if (indicators[index]) {
        indicators[index].classList.add('active');
    }

    // También manejar dots de paginación del nuevo sistema
    const paginationDots = document.querySelectorAll('.pagination-dot');
    paginationDots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');

    if (slides.length === 0) return;

    currentSlideIndex += direction;

    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }

    showSlide(currentSlideIndex);
    updateSliderTransform();

    stopAutoPlay();
    startAutoPlay();
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);
    updateSliderTransform();

    stopAutoPlay();
    startAutoPlay();
}

function updateSliderTransform() {
    // Para el nuevo sistema de slider con transform
    const slidesWrapper = document.querySelector('.slides-wrapper');
    if (slidesWrapper) {
        slidesWrapper.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    // Para el slider clásico con margin
    const classicSlider = document.querySelector('.slider ul');
    if (classicSlider) {
        classicSlider.style.marginLeft = `-${currentSlideIndex * 100}%`;
    }

    // Disparar evento personalizado
    const sliderContainer = document.querySelector('.slider-container') || document.querySelector('.slider');
    if (sliderContainer) {
        sliderContainer.dispatchEvent(new CustomEvent('slideChange', {
            detail: {
                currentSlide: currentSlideIndex,
                totalSlides: document.querySelectorAll('.slide').length
            }
        }));
    }
}

function startAutoPlay() {
    const autoPlayDelay = 4000;

    slideInterval = setInterval(function () {
        changeSlide(1);
    }, autoPlayDelay);
}

function stopAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function addSlide(imageSrc, title, description) {
    const slider = document.querySelector('.slider') || document.querySelector('.slides-wrapper');
    const indicators = document.querySelector('.slider-indicators') || document.querySelector('.slider-pagination');

    if (!slider) return;

    const newSlide = document.createElement('div');
    newSlide.className = 'slide';
    newSlide.innerHTML = `
        <img src="${imageSrc}" alt="${title}" loading="lazy">
        ${title || description ? `
            <div class="slide-info">
                ${title ? `<h3>${title}</h3>` : ''}
                ${description ? `<p>${description}</p>` : ''}
            </div>
        ` : ''}
    `;

    // Crear nuevo indicador si existe contenedor
    if (indicators) {
        const newIndicator = document.createElement('span');
        newIndicator.className = indicators.classList.contains('slider-pagination') ? 'pagination-dot' : 'indicator';
        const slideCount = document.querySelectorAll('.slide').length + 1;
        newIndicator.onclick = function () { currentSlide(slideCount); };
        indicators.appendChild(newIndicator);
    }

    slider.appendChild(newSlide);
}

function preloadSliderImages() {
    const slides = document.querySelectorAll('.slide img');

    slides.forEach(function (img) {
        const imageLoader = new Image();
        imageLoader.src = img.src;
    });
}

function setupLazyLoading() {
    const slides = document.querySelectorAll('.slide img[data-src]');

    const imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    slides.forEach(function (img) {
        imageObserver.observe(img);
    });
}

function updateSliderForMobile() {
    const sliderContainer = document.querySelector('.slider-container') || document.querySelector('.slider');

    if (!sliderContainer) return;

    function checkScreenSize() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            sliderContainer.classList.add('mobile-slider');
            // En móvil, autoplay más lento
            stopAutoPlay();
            slideInterval = setInterval(() => changeSlide(1), 6000);
        } else {
            sliderContainer.classList.remove('mobile-slider');
            stopAutoPlay();
            startAutoPlay();
        }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
}

// Sistema de slider moderno para compatibilidad
function initModernSliders() {
    // Manejar botones de navegación del nuevo sistema
    const prevBtns = document.querySelectorAll('.slider-btn--prev');
    const nextBtns = document.querySelectorAll('.slider-btn--next');

    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => changeSlide(-1));
    });

    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => changeSlide(1));
    });

    // Manejar dots de paginación
    const paginationDots = document.querySelectorAll('.pagination-dot');
    paginationDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlideIndex = index;
            showSlide(currentSlideIndex);
            updateSliderTransform();
            stopAutoPlay();
            startAutoPlay();
        });
    });

    // Navegación por teclado
    document.addEventListener('keydown', (e) => {
        const sliderContainer = document.querySelector('.slider-container') || document.querySelector('.slider');
        if (sliderContainer && sliderContainer.matches(':hover')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                changeSlide(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                changeSlide(1);
            } else if (e.key === ' ') {
                e.preventDefault();
                toggleAutoPlay();
            }
        }
    });
}

// Toggle autoplay
function toggleAutoPlay() {
    if (slideInterval) {
        stopAutoPlay();
    } else {
        startAutoPlay();
    }
}

// Inicializar funcionalidades adicionales
document.addEventListener('DOMContentLoaded', function () {
    preloadSliderImages();
    setupLazyLoading();
    updateSliderForMobile();

    // Manejo de errores de imágenes
    const sliderImages = document.querySelectorAll('.slide img');
    sliderImages.forEach(function (img) {
        img.addEventListener('error', function () {
            this.src = 'img/placeholder.jpg';
            this.alt = 'Imagen no disponible';
            console.warn('Error cargando imagen del slider:', this.src);
        });
    });
});

// Clase moderna para sliders avanzados (opcional)
class ModernSlider {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) return;

        this.options = {
            autoPlay: options.autoPlay !== false,
            autoPlayDelay: options.autoPlayDelay || 4000,
            showDots: options.showDots !== false,
            showArrows: options.showArrows !== false,
            loop: options.loop !== false,
            ...options
        };

        this.currentSlide = 0;
        this.slides = [];
        this.isPlaying = this.options.autoPlay;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        this.setupSlider();
        this.bindEvents();
        if (this.options.autoPlay) {
            this.startAutoPlay();
        }
    }

    setupSlider() {
        this.slidesWrapper = this.container.querySelector('.slides-wrapper');
        this.slides = Array.from(this.container.querySelectorAll('.slide'));
        this.prevBtn = this.container.querySelector('.slider-btn--prev');
        this.nextBtn = this.container.querySelector('.slider-btn--next');
        this.dotsContainer = this.container.querySelector('.slider-pagination');

        if (this.slides.length === 0) return;

        // Configurar slides
        this.slides.forEach((slide, index) => {
            slide.style.transform = `translateX(${index * 100}%)`;
            slide.classList.toggle('active', index === 0);
        });

        // Configurar dots si existen
        if (this.dotsContainer) {
            this.dots = Array.from(this.dotsContainer.querySelectorAll('.pagination-dot'));
            this.updateDots();
        }
    }

    bindEvents() {
        // Botones de navegación
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevSlide());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Dots de paginación
        if (this.dots) {
            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });
        }

        // Pausar en hover
        this.container.addEventListener('mouseenter', () => {
            this.pauseAutoPlay();
        });

        this.container.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                this.startAutoPlay();
            }
        });
    }

    goToSlide(index) {
        if (index === this.currentSlide) return;

        // Remover clase active del slide actual
        this.slides[this.currentSlide].classList.remove('active');

        // Actualizar índice
        this.currentSlide = index;

        // Animar slides
        this.slides.forEach((slide, i) => {
            slide.style.transform = `translateX(${(i - this.currentSlide) * 100}%)`;
        });

        // Agregar clase active al nuevo slide
        this.slides[this.currentSlide].classList.add('active');

        // Actualizar dots
        this.updateDots();

        // Actualizar sistema clásico
        currentSlideIndex = this.currentSlide;
        showSlide(currentSlideIndex);
    }

    nextSlide() {
        let nextIndex = this.currentSlide + 1;
        if (nextIndex >= this.slides.length) {
            nextIndex = this.options.loop ? 0 : this.slides.length - 1;
        }
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        let prevIndex = this.currentSlide - 1;
        if (prevIndex < 0) {
            prevIndex = this.options.loop ? this.slides.length - 1 : 0;
        }
        this.goToSlide(prevIndex);
    }

    updateDots() {
        if (!this.dots) return;
        this.dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    startAutoPlay() {
        if (!this.options.autoPlay || this.slides.length <= 1) return;
        this.stopAutoPlay();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.options.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    pauseAutoPlay() {
        this.stopAutoPlay();
    }
}

// Hacer funciones globales para compatibilidad
window.changeSlide = changeSlide;
window.currentSlide = currentSlide;
window.ModernSlider = ModernSlider;
window.addSlide = addSlide;
window.toggleAutoPlay = toggleAutoPlay;

// Inicializar sliders modernos si están disponibles
document.addEventListener('DOMContentLoaded', () => {
    const modernSliders = document.querySelectorAll('[data-slider="modern"]');
    modernSliders.forEach(slider => {
        new ModernSlider(slider, {
            autoPlay: true,
            autoPlayDelay: 4000,
            loop: true
        });
    });
});