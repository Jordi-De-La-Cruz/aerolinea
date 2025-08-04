/**
 * index.js - Funcionalidades específicas para la página principal
 * Maneja animaciones, contadores, efectos de servicios y navegación
 */

class IndexManager {
    constructor() {
        this.serviceCards = document.querySelectorAll('.service-card');
        this.statNumbers = document.querySelectorAll('.stat-number');
        this.heroActions = document.querySelector('.hero-actions');

        this.isStatsAnimated = false;
        this.isHeroVisible = false;

        this.init();
    }

    init() {
        this.setupServiceCards();
        this.setupSmoothScrolling();
        this.setupStatsCounter();
        this.setupHeroAnimations();
        this.setupScrollEffects();
        this.setupNavigationHighlight();
        this.setupLazyContent();
        this.initializeFeatures();
    }

    // === TARJETAS DE SERVICIOS ===
    setupServiceCards() {
        this.serviceCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.handleCardHover(card));
            card.addEventListener('mouseleave', () => this.handleCardLeave(card));
            card.addEventListener('click', () => this.handleCardClick(card));
        });
    }

    handleCardHover(card) {
        // Animar icono
        const icon = card.querySelector('.service-icon');
        if (icon) {
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        }

        // Mostrar dropdown con animación
        const dropdown = card.querySelector('.service-dropdown');
        if (dropdown) {
            dropdown.style.display = 'flex';
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';

            requestAnimationFrame(() => {
                dropdown.style.transition = 'all 0.3s ease-out';
                dropdown.style.opacity = '1';
                dropdown.style.transform = 'translateY(0)';
            });
        }

        // Efecto de brillo
        this.addGlowEffect(card);
    }

    handleCardLeave(card) {
        // Resetear icono
        const icon = card.querySelector('.service-icon');
        if (icon) {
            icon.style.transform = '';
        }

        // Ocultar dropdown
        const dropdown = card.querySelector('.service-dropdown');
        if (dropdown) {
            dropdown.style.opacity = '0';
            dropdown.style.transform = 'translateY(-10px)';

            setTimeout(() => {
                if (dropdown && !card.matches(':hover')) {
                    dropdown.style.display = 'none';
                }
            }, 300);
        }

        // Remover brillo
        this.removeGlowEffect(card);
    }

    handleCardClick(card) {
        // Efecto de pulsación
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
            card.style.transform = '';
        }, 150);

        // Crear efecto de ondas
        this.createRippleEffect(card);
    }

    addGlowEffect(element) {
        element.style.boxShadow = '0 10px 40px rgba(33, 147, 176, 0.3)';
    }

    removeGlowEffect(element) {
        element.style.boxShadow = '';
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        const rect = element.getBoundingClientRect();

        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(33, 147, 176, 0.3);
            transform: translate(-50%, -50%);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
            z-index: 1;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // === NAVEGACIÓN SUAVE ===
    setupSmoothScrolling() {
        // Mejorar el scroll suave para enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;

            e.preventDefault();
            const targetId = link.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                const offsetTop = target.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Actualizar URL
                history.pushState(null, null, targetId);

                // Efecto visual en el destino
                this.highlightTarget(target);
            }
        });
    }

    highlightTarget(target) {
        target.style.transition = 'box-shadow 0.3s ease';
        target.style.boxShadow = '0 0 20px rgba(33, 147, 176, 0.3)';

        setTimeout(() => {
            target.style.boxShadow = '';
        }, 2000);
    }

    // === CONTADOR DE ESTADÍSTICAS ===
    setupStatsCounter() {
        if (!('IntersectionObserver' in window)) {
            this.animateStatsDirectly();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isStatsAnimated) {
                    this.animateStats();
                    this.isStatsAnimated = true;
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        const aboutSection = document.querySelector('.about');
        if (aboutSection) {
            observer.observe(aboutSection);
        }
    }

    animateStats() {
        this.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            const duration = 2000; // 2 segundos
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target.toLocaleString();
                }
            };

            updateCounter();
        });
    }

    animateStatsDirectly() {
        this.statNumbers.forEach(stat => {
            const target = parseInt(stat.dataset.count);
            stat.textContent = target.toLocaleString();
        });
    }

    // === ANIMACIONES DEL HERO ===
    setupHeroAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isHeroVisible) {
                    this.animateHeroContent();
                    this.isHeroVisible = true;
                }
            });
        }, {
            threshold: 0.3
        });

        const hero = document.querySelector('.hero');
        if (hero) {
            observer.observe(hero);
        }
    }

    animateHeroContent() {
        const elements = document.querySelectorAll('.hero .fade-in');
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('animate');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // === EFECTOS DE SCROLL ===
    setupScrollEffects() {
        let lastScrollTop = 0;
        const header = document.querySelector('.header');

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Header que se oculta/muestra
            if (header) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    // Scrolling down
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // Scrolling up
                    header.style.transform = 'translateY(0)';
                }
            }

            // Parallax sutil en el hero
            const hero = document.querySelector('.hero');
            if (hero && scrollTop < window.innerHeight) {
                hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
            }

            lastScrollTop = scrollTop;
        });
    }

    // === NAVEGACIÓN DESTACADA ===
    setupNavigationHighlight() {
        if (!('IntersectionObserver' in window)) return;

        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('a[href^="#"]');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');

                    // Remover active de todos los links
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });

                    // Agregar active al link correspondiente
                    const activeLink = document.querySelector(`a[href="#${id}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.6
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // === CARGA LAZY DE CONTENIDO ===
    setupLazyContent() {
        // Carga lazy para el mapa
        const mapContainer = document.querySelector('.map-container');
        if (mapContainer && 'IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadMap();
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '100px'
            });

            observer.observe(mapContainer);
        }
    }

    loadMap() {
        const iframe = document.querySelector('.company-map');
        if (iframe && !iframe.src) {
            iframe.src = iframe.dataset.src || iframe.getAttribute('data-src');
        }
    }

    // === CARACTERÍSTICAS ADICIONALES ===
    initializeFeatures() {
        // Agregar estilos CSS dinámicos
        this.addDynamicStyles();

        // Configurar tooltips
        this.setupTooltips();

        // Manejar errores de imágenes
        this.setupImageErrorHandling();

        // Configurar eventos de teclado
        this.setupKeyboardNavigation();
    }

    addDynamicStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    width: 200px;
                    height: 200px;
                    opacity: 0;
                }
            }
            
            .fade-in {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.6s ease-out;
            }
            
            .fade-in.animate {
                opacity: 1;
                transform: translateY(0);
            }
            
            .nav a.active {
                color: var(--secondary);
                font-weight: 600;
            }
            
            .service-card {
                transition: all 0.3s ease;
            }
            
            .header {
                transition: transform 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    setupTooltips() {
        const elementsWithTooltip = document.querySelectorAll('[data-tooltip]');

        elementsWithTooltip.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target);
            });

            element.addEventListener('mouseleave', (e) => {
                this.hideTooltip(e.target);
            });
        });
    }

    showTooltip(element) {
        const text = element.getAttribute('data-tooltip');
        if (!text) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'custom-tooltip';
        tooltip.textContent = text;

        Object.assign(tooltip.style, {
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            zIndex: '1000',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        element.style.position = 'relative';
        element.appendChild(tooltip);

        requestAnimationFrame(() => {
            tooltip.style.opacity = '1';
        });
    }

    hideTooltip(element) {
        const tooltip = element.querySelector('.custom-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }, 300);
        }
    }

    setupImageErrorHandling() {
        const images = document.querySelectorAll('img');

        images.forEach(img => {
            img.addEventListener('error', () => {
                // Crear placeholder si la imagen falla
                const placeholder = document.createElement('div');
                placeholder.style.cssText = `
                    width: ${img.offsetWidth || 300}px;
                    height: ${img.offsetHeight || 200}px;
                    background: linear-gradient(45deg, #f0f0f0, #e0e0e0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #999;
                    font-size: 14px;
                    border-radius: 8px;
                `;
                placeholder.textContent = 'Imagen no disponible';

                if (img.parentNode) {
                    img.parentNode.replaceChild(placeholder, img);
                }
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Navegación con teclado
            if (e.key === 'Tab') {
                this.handleTabNavigation(e);
            }

            // Atajos de teclado
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k': // Ctrl+K para buscar
                        e.preventDefault();
                        this.focusSearch();
                        break;
                    case 'h': // Ctrl+H para ir al inicio
                        e.preventDefault();
                        this.scrollToTop();
                        break;
                }
            }
        });
    }

    handleTabNavigation(e) {
        // Mejorar la navegación por tabulador
        const focusableElements = document.querySelectorAll(
            'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    focusSearch() {
        // Enfocar elemento de búsqueda si existe
        const searchInput = document.querySelector('input[type="search"], .search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // === INTERACCIONES AVANZADAS ===
    setupAdvancedInteractions() {
        // Efecto parallax para elementos específicos
        this.setupParallaxElements();

        // Animaciones al hacer scroll
        this.setupScrollAnimations();

        // Efectos de mouse
        this.setupMouseEffects();
    }

    setupParallaxElements() {
        const parallaxElements = document.querySelectorAll('.parallax-element');

        if (parallaxElements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const rate = scrolled * -0.5;
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }

    setupScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(element => {
            observer.observe(element);
        });
    }

    setupMouseEffects() {
        // Efecto de seguimiento del mouse en elementos especiales
        const interactiveElements = document.querySelectorAll('.mouse-interactive');

        interactiveElements.forEach(element => {
            element.addEventListener('mousemove', (e) => {
                const rect = element.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / centerY * 10;
                const rotateY = (centerX - x) / centerX * 10;

                element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            });

            element.addEventListener('mouseleave', () => {
                element.style.transform = '';
            });
        });
    }

    // === OPTIMIZACIÓN DE RENDIMIENTO ===
    setupPerformanceOptimizations() {
        // Lazy loading para imágenes
        this.setupLazyImages();

        // Debounce para eventos de scroll
        this.setupDebouncedEvents();

        // Preload de páginas importantes
        this.setupPagePreloading();
    }

    setupLazyImages() {
        if ('loading' in HTMLImageElement.prototype) {
            // Navegador soporta lazy loading nativo
            const images = document.querySelectorAll('img[data-src]');
            images.forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
        } else {
            // Fallback con Intersection Observer
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupDebouncedEvents() {
        let scrollTimeout;
        let resizeTimeout;

        const originalScrollHandler = this.handleScroll.bind(this);
        const originalResizeHandler = this.handleResize.bind(this);

        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(originalScrollHandler, 16); // ~60fps
        });

        window.addEventListener('resize', () => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            resizeTimeout = setTimeout(originalResizeHandler, 250);
        });
    }

    handleScroll() {
        // Lógica optimizada para scroll
        this.updateScrollPosition();
        this.checkElementsInView();
    }

    handleResize() {
        // Lógica para cambio de tamaño
        this.updateLayoutDimensions();
        this.recalculatePositions();
    }

    updateScrollPosition() {
        // Actualizar indicador de progreso de scroll si existe
        const scrollProgress = document.querySelector('.scroll-progress');
        if (scrollProgress) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            scrollProgress.style.width = `${scrolled}%`;
        }
    }

    checkElementsInView() {
        // Verificar elementos en vista de manera eficiente
        // Esta función se puede expandir según necesidades específicas
    }

    updateLayoutDimensions() {
        // Actualizar dimensiones del layout
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    recalculatePositions() {
        // Recalcular posiciones de elementos posicionados
        // Útil para elementos sticky o fixed que dependan del tamaño de pantalla
    }

    setupPagePreloading() {
        // Precargar páginas importantes al hover
        const importantLinks = document.querySelectorAll('a[href$=".html"]');

        importantLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (!document.querySelector(`link[href="${href}"]`)) {
                    const preloadLink = document.createElement('link');
                    preloadLink.rel = 'prefetch';
                    preloadLink.href = href;
                    document.head.appendChild(preloadLink);
                }
            });
        });
    }

    // === UTILIDADES PÚBLICAS ===
    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones global si está disponible
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
        } else {
            // Fallback simple
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        let current = '';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom >= 100) {
                current = section.getAttribute('id');
            }
        });

        return current;
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const offsetTop = section.offsetTop - headerHeight - 20;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // === MÉTODOS DE LIMPIEZA ===
    destroy() {
        // Limpiar event listeners y observers
        this.serviceCards.forEach(card => {
            card.removeEventListener('mouseenter', this.handleCardHover);
            card.removeEventListener('mouseleave', this.handleCardLeave);
            card.removeEventListener('click', this.handleCardClick);
        });

        // Limpiar otros recursos si es necesario
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }
}

// === INICIALIZACIÓN ===
let indexManager;

document.addEventListener('DOMContentLoaded', () => {
    indexManager = new IndexManager();
});

// === COMPATIBILIDAD CON TEMA OSCURO ===
window.addEventListener('themeChanged', (e) => {
    const isDark = e.detail.theme === 'dark';

    // Ajustar elementos específicos del index para el tema oscuro
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        if (isDark) {
            card.classList.add('dark-variant');
        } else {
            card.classList.remove('dark-variant');
        }
    });
});

// === EXPORTAR PARA USO GLOBAL ===
window.IndexManager = IndexManager;
window.indexManager = indexManager;