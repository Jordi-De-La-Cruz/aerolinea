// ===================================
// MAIN APPLICATION JAVASCRIPT
// ===================================

class MainApp {
    constructor() {
        this.theme = 'light';
        this.isLoading = false;
        this.observers = new Map();
        this.debounceTimers = new Map();

        this.init();
    }

    init() {
        this.initTheme();
        this.initScrollAnimations();
        this.initSmoothScrolling();
        this.initPreloader();
        this.initLazyLoading();
        this.initFormValidation();
        this.initNotificationSystem();
        this.initErrorHandling();
        this.initPerformanceOptimizations();
        this.initAccessibility();

        this.bindEvents();
        this.loadUserPreferences();
    }

    // Theme Management
    initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;

        if (!themeToggle) return;

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            this.enableDarkMode();
        }

        themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    enableDarkMode() {
        document.body.classList.add('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', 'dark');
        this.theme = 'dark';
        this.updateThemeMetaTag();
    }

    enableLightMode() {
        document.body.classList.remove('dark-theme');
        const icon = document.querySelector('#themeToggle i');
        if (icon) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', 'light');
        this.theme = 'light';
        this.updateThemeMetaTag();
    }

    toggleTheme() {
        if (document.body.classList.contains('dark-theme')) {
            this.enableLightMode();
        } else {
            this.enableDarkMode();
        }

        // Animate theme transition
        this.animateThemeTransition();
    }

    updateThemeMetaTag() {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        const color = this.theme === 'dark' ? '#323232' : '#2193b0';

        if (metaTheme) {
            metaTheme.setAttribute('content', color);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);
        }
    }

    animateThemeTransition() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';

        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    // Scroll Animations
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;

                    setTimeout(() => {
                        entry.target.classList.add('fade-in');

                        // Trigger any custom animations
                        const customAnimation = entry.target.dataset.animation;
                        if (customAnimation) {
                            entry.target.classList.add(customAnimation);
                        }
                    }, delay);

                    scrollObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        this.observers.set('scroll', scrollObserver);

        // Observe elements
        const animateElements = document.querySelectorAll(
            '.destination-card, .tip-card, .fade-in-element, [data-animate]'
        );

        animateElements.forEach((el, index) => {
            el.dataset.delay = index * 100; // Stagger animations
            scrollObserver.observe(el);
        });
    }

    // Smooth Scrolling
    initSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));

                if (target) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    history.pushState(null, null, anchor.getAttribute('href'));
                }
            });
        });
    }

    // Preloader
    initPreloader() {
        window.addEventListener('load', () => {
            const preloader = document.querySelector('.preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.pointerEvents = 'none';

                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 300);
            }

            // Initialize page-specific features after load
            this.initPageSpecificFeatures();
        });
    }

    // Lazy Loading
    initLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Handle different image loading scenarios
                    if (img.dataset.src) {
                        this.loadImage(img);
                    } else if (img.dataset.bg) {
                        img.style.backgroundImage = `url(${img.dataset.bg})`;
                        img.classList.remove('lazy');
                    }

                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        this.observers.set('images', imageObserver);

        const lazyImages = document.querySelectorAll('img[data-src], [data-bg]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    loadImage(img) {
        const imageLoader = new Image();

        imageLoader.onload = () => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');

            // Trigger fade-in animation
            img.style.opacity = '1';
        };

        imageLoader.onerror = () => {
            img.src = 'img/placeholder.jpg';
            img.alt = 'Imagen no disponible';
            img.classList.add('error');
            console.warn('Error loading image:', img.dataset.src);
        };

        imageLoader.src = img.dataset.src;
    }

    // Form Validation
    initFormValidation() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    this.showNotification('Por favor completa todos los campos obligatorios', 'error');
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('.form-input[required], input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(input) {
        const value = input.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Clear previous errors
        this.clearFieldError(input);

        // Required field validation
        if (input.hasAttribute('required') && !value) {
            errorMessage = 'Este campo es obligatorio';
            isValid = false;
        }
        // Email validation
        else if (input.type === 'email' && value && !this.isValidEmail(value)) {
            errorMessage = 'Ingresa un email válido';
            isValid = false;
        }
        // Phone validation
        else if (input.type === 'tel' && value && !this.isValidPhone(value)) {
            errorMessage = 'Ingresa un teléfono válido';
            isValid = false;
        }
        // Custom validation patterns
        else if (input.pattern && value && !new RegExp(input.pattern).test(value)) {
            errorMessage = input.dataset.errorMessage || 'Formato inválido';
            isValid = false;
        }

        if (!isValid) {
            this.showFieldError(input, errorMessage);
        }

        return isValid;
    }

    showFieldError(input, message) {
        input.classList.add('error');

        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--danger);
            font-size: var(--font-size-small);
            margin-top: 0.5rem;
            display: block;
        `;

        input.parentNode.appendChild(errorElement);
    }

    clearFieldError(input) {
        input.classList.remove('error');
        const errorElement = input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    // Notification System
    initNotificationSystem() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'success', duration = 4000) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <i class="fas ${icons[type] || icons.success}"></i>
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.style.cssText = `
            background: ${colors[type] || colors.success};
            color: white;
            padding: 1rem 1.5rem;
            margin-bottom: 1rem;
            border-radius: var(--border-radius);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            min-width: 300px;
            max-width: 400px;
            font-weight: 600;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            pointer-events: auto;
            position: relative;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.8;
        `;

        closeBtn.addEventListener('click', () => this.removeNotification(notification));

        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
    }

    removeNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // Error Handling
    initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('JavaScript Error:', e.error);
            this.logError(e.error, 'JavaScript Error');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled Promise Rejection:', e.reason);
            this.logError(e.reason, 'Promise Rejection');
        });
    }

    logError(error, type) {
        const errorData = {
            type,
            message: error.message || error,
            stack: error.stack,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // In production, send to error tracking service
        console.log('Error logged:', errorData);
    }

    // Performance Optimizations
    initPerformanceOptimizations() {
        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);

            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16); // ~60fps
        }, { passive: true });

        // Optimize resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);

            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Preload critical resources
        this.preloadCriticalResources();
    }

    handleScroll() {
        const scrollTop = window.pageYOffset;
        const header = document.querySelector('.header');

        // Add scroll shadow to header
        if (header) {
            if (scrollTop > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Show/hide scroll to top button
        this.toggleScrollToTop(scrollTop);
    }

    handleResize() {
        // Recalculate any responsive elements
        this.updateResponsiveElements();
    }

    preloadCriticalResources() {
        const criticalImages = [
            'img/mundo.png',
            'img/europa-hero.jpg'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    toggleScrollToTop(scrollTop) {
        let scrollBtn = document.getElementById('scrollToTop');

        if (!scrollBtn) {
            scrollBtn = this.createScrollToTopButton();
        }

        if (scrollTop > 500) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }

    createScrollToTopButton() {
        const button = document.createElement('button');
        button.id = 'scrollToTop';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';
        button.setAttribute('aria-label', 'Volver arriba');

        button.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 50px;
            height: 50px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            opacity: 0;
            visibility: hidden;
            transform: translateY(20px);
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        document.body.appendChild(button);

        // Add CSS for visible state
        const style = document.createElement('style');
        style.textContent = `
            #scrollToTop.visible {
                opacity: 1 !important;
                visibility: visible !important;
                transform: translateY(0) !important;
            }
            #scrollToTop:hover {
                background: var(--primary-dark) !important;
                transform: translateY(-2px) !important;
            }
        `;
        document.head.appendChild(style);

        return button;
    }

    // Accessibility
    initAccessibility() {
        // Add skip link
        this.addSkipLink();

        // Improve focus management
        this.initFocusManagement();

        // Add ARIA labels where needed
        this.enhanceARIA();

        // Keyboard navigation
        this.initKeyboardNavigation();
    }

    addSkipLink() {
        if (document.querySelector('.skip-link')) return;

        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';

        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    initFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal:not([hidden])');
                if (modal) {
                    this.trapFocus(e, modal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    enhanceARIA() {
        // Add ARIA labels to buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label]):not(:has(span,text))');
        iconButtons.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                const ariaLabel = this.getAriaLabelFromIcon(icon.className);
                if (ariaLabel) {
                    btn.setAttribute('aria-label', ariaLabel);
                }
            }
        });
    }

    getAriaLabelFromIcon(iconClass) {
        const iconMap = {
            'fa-moon': 'Cambiar a modo oscuro',
            'fa-sun': 'Cambiar a modo claro',
            'fa-user': 'Iniciar sesión',
            'fa-question': 'Ayuda',
            'fa-home': 'Inicio',
            'fa-arrow-up': 'Volver arriba'
        };

        for (const [iconName, label] of Object.entries(iconMap)) {
            if (iconClass.includes(iconName)) {
                return label;
            }
        }
        return null;
    }

    initKeyboardNavigation() {
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal:not([hidden])');
                const dropdown = document.querySelector('.dropdown.open');

                if (modal) {
                    this.closeModal(modal);
                } else if (dropdown) {
                    dropdown.classList.remove('open');
                }
            }
        });

        // Enter key on card elements
        document.querySelectorAll('.destination-card').forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) link.click();
                }
            });
        });
    }

    // Page-specific features
    initPageSpecificFeatures() {
        const currentPage = this.getCurrentPage();

        switch (currentPage) {
            case 'europa':
                this.initEuropaFeatures();
                break;
            case 'reservar':
                this.initBookingFeatures();
                break;
            case 'login':
                this.initLoginFeatures();
                break;
            default:
                this.initHomeFeatures();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '') || 'index';
        return page === 'index' ? 'home' : page;
    }

    initEuropaFeatures() {
        // Currency converter integration
        this.initCurrencyDisplay();

        // Interactive map if available
        this.initInteractiveMap();

        // Destination comparison
        this.initDestinationComparison();
    }

    initBookingFeatures() {
        // Form auto-completion
        this.initFormAutoComplete();

        // Price calculator
        this.initPriceCalculator();

        // Seat selection
        this.initSeatSelection();
    }

    initLoginFeatures() {
        // Password strength indicator
        this.initPasswordStrength();

        // Social login
        this.initSocialLogin();

        // Remember me functionality
        this.initRememberMe();
    }

    initHomeFeatures() {
        // Hero animations
        this.initHeroAnimations();

        // Featured destinations carousel
        this.initDestinationCarousel();

        // Search functionality
        this.initSearchFeatures();
    }

    // Utility Methods
    updateResponsiveElements() {
        // Recalculate responsive grid layouts
        const grids = document.querySelectorAll('.destinations-grid, .tips-grid');
        grids.forEach(grid => {
            // Force reflow for CSS Grid
            grid.style.display = 'none';
            grid.offsetHeight; // Trigger reflow
            grid.style.display = '';
        });
    }

    closeModal(modal) {
        modal.classList.add('closing');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    // User Preferences
    loadUserPreferences() {
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');

        // Apply saved preferences
        if (preferences.currency) {
            this.setCurrency(preferences.currency);
        }

        if (preferences.language) {
            this.setLanguage(preferences.language);
        }

        if (preferences.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }
    }

    saveUserPreferences() {
        const preferences = {
            theme: this.theme,
            currency: this.currentCurrency || 'EUR',
            language: document.documentElement.lang || 'es',
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };

        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    }

    // Currency Management
    setCurrency(currency) {
        this.currentCurrency = currency;

        // Update all price displays
        const priceElements = document.querySelectorAll('[data-price]');
        priceElements.forEach(el => {
            const basePrice = parseFloat(el.dataset.price);
            const convertedPrice = this.convertCurrency(basePrice, 'EUR', currency);
            el.textContent = this.formatCurrency(convertedPrice, currency);
        });

        // Save preference
        this.saveUserPreferences();
    }

    convertCurrency(amount, from, to) {
        const rates = {
            'EUR': 1,
            'USD': 1.08,
            'GBP': 0.86,
            'JPY': 161.50
        };

        if (from === to) return amount;

        const inEUR = amount / rates[from];
        return inEUR * rates[to];
    }

    formatCurrency(amount, currency) {
        const symbols = {
            'EUR': '€',
            'USD': '$',
            'GBP': '£',
            'JPY': '¥'
        };

        return `${symbols[currency] || '€'}${Math.round(amount).toLocaleString()}`;
    }

    // Language Management
    setLanguage(lang) {
        document.documentElement.lang = lang;

        // Update text content based on language
        const translations = this.getTranslations(lang);

        Object.keys(translations).forEach(key => {
            const elements = document.querySelectorAll(`[data-translate="${key}"]`);
            elements.forEach(el => {
                el.textContent = translations[key];
            });
        });

        this.saveUserPreferences();
    }

    getTranslations(lang) {
        const translations = {
            'es': {
                'explore': 'Explorar',
                'book_now': 'Reservar Ahora',
                'destinations': 'Destinos',
                'contact': 'Contacto'
            },
            'en': {
                'explore': 'Explore',
                'book_now': 'Book Now',
                'destinations': 'Destinations',
                'contact': 'Contact'
            }
        };

        return translations[lang] || translations['es'];
    }

    // Analytics and Tracking
    trackEvent(eventName, properties = {}) {
        // In production, integrate with analytics service
        console.log('Event tracked:', eventName, properties);

        // Example: Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, properties);
        }
    }

    trackPageView(page) {
        this.trackEvent('page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: page
        });
    }

    // Performance Monitoring
    measurePerformance() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');

            const metrics = {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
            };

            console.log('Performance metrics:', metrics);

            // Send to analytics in production
            this.trackEvent('performance_metrics', metrics);
        }
    }

    // Service Worker Registration
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // PWA Features
    initPWAFeatures() {
        // Install prompt
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            this.hideInstallButton();
            this.trackEvent('pwa_installed');
        });
    }

    showInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.addEventListener('click', () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        }
                        deferredPrompt = null;
                    });
                }
            });
        }
    }

    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.display = 'none';
        }
    }

    // Event Binding
    bindEvents() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openSearch();
            }

            // Ctrl/Cmd + / for help
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.openHelp();
            }
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveUserPreferences();
            this.cleanup();
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.showNotification('Conexión restablecida', 'success');
            this.handleOnline();
        });

        window.addEventListener('offline', () => {
            this.showNotification('Sin conexión a internet', 'warning');
            this.handleOffline();
        });
    }

    openSearch() {
        const searchModal = document.getElementById('searchModal');
        if (searchModal) {
            searchModal.classList.add('active');
            const searchInput = searchModal.querySelector('input');
            if (searchInput) searchInput.focus();
        }
    }

    openHelp() {
        window.location.href = 'ayuda.html';
    }

    handleOnline() {
        // Sync any pending data
        this.syncPendingData();

        // Re-enable online features
        document.body.classList.remove('offline');
    }

    handleOffline() {
        // Enable offline mode
        document.body.classList.add('offline');

        // Cache current page data
        this.cacheCurrentPageData();
    }

    syncPendingData() {
        const pendingData = JSON.parse(localStorage.getItem('pendingSync') || '[]');

        pendingData.forEach(async (data) => {
            try {
                await this.sendToServer(data);
                // Remove from pending list on success
            } catch (error) {
                console.error('Sync failed:', error);
            }
        });
    }

    cacheCurrentPageData() {
        const pageData = {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now()
        };

        localStorage.setItem('cachedPageData', JSON.stringify(pageData));
    }

    // Cleanup
    cleanup() {
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();

        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
    }

    // Public API
    getTheme() {
        return this.theme;
    }

    isOnline() {
        return navigator.onLine;
    }

    getCurrentCurrency() {
        return this.currentCurrency || 'EUR';
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();

    // Track page load
    window.mainApp.trackPageView(window.mainApp.getCurrentPage());

    // Measure performance
    window.addEventListener('load', () => {
        setTimeout(() => {
            window.mainApp.measurePerformance();
        }, 0);
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        window.mainApp?.saveUserPreferences();
    }
});

// Touch device detection
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Export for external use
window.MainApp = MainApp;