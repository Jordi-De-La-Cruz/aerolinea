/**
 * kawaii.js - Funcionalidades específicas para la página kawaii
 * Maneja animaciones, efectos y interacciones kawaii
 */

class KawaiiManager {
    constructor() {
        this.kawaiiButtons = document.querySelectorAll('.kawaii-btn');
        this.kawaiiCards = document.querySelectorAll('.kawaii-card');
        this.decorations = document.querySelectorAll('.kawaii-decoration');

        this.destinations = {
            conejitos: {
                name: 'Conejitos Kawaii',
                emoji: '🐰',
                locations: ['Okunoshima (Japón)', 'Campos de Tulipanes (Holanda)', 'Sanctuary Farm (Australia)']
            },
            gatitos: {
                name: 'Gatitos Kawaii',
                emoji: '🐱',
                locations: ['Cat Café Tokyo', 'Isla Tashirojima (Japón)', 'Santorini Cat Welfare']
            },
            patitos: {
                name: 'Patitos Kawaii',
                emoji: '🐣',
                locations: ['Central Park (Nueva York)', 'Lago Bled (Eslovenia)', 'Parque Retiro (Madrid)']
            },
            pandas: {
                name: 'Pandas Kawaii',
                emoji: '🐼',
                locations: ['Chengdu Research Base', 'Zoológico de San Diego', 'Reserva de Wolong']
            },
            pinguinos: {
                name: 'Pingüinos Kawaii',
                emoji: '🐧',
                locations: ['Antártida', 'Península Valdés (Argentina)', 'Isla Phillip (Australia)']
            },
            koalas: {
                name: 'Koalas Kawaii',
                emoji: '🐨',
                locations: ['Kangaroo Island', 'Great Otway National Park', 'Lone Pine Sanctuary']
            }
        };

        this.kawaiiSounds = {
            click: '✨',
            hover: '💖',
            success: '🌟'
        };

        this.init();
    }

    init() {
        this.setupKawaiiButtons();
        this.setupCardHoverEffects();
        this.setupFloatingDecorations();
        this.setupScrollAnimations();
        this.setupKawaiiCursor();
        this.setupParticleEffects();
        this.initializeKawaiiFeatures();
    }

    // === BOTONES KAWAII ===
    setupKawaiiButtons() {
        this.kawaiiButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleKawaiiClick(e));
            button.addEventListener('mouseenter', (e) => this.handleKawaiiHover(e));
            button.addEventListener('mouseleave', (e) => this.handleKawaiiLeave(e));
        });
    }

    handleKawaiiClick(e) {
        const button = e.currentTarget;
        const destination = button.dataset.destination;

        // Efecto de click kawaii
        this.createKawaiiExplosion(button);

        // Sonido kawaii (visual)
        this.showKawaiiSound(button, this.kawaiiSounds.click);

        // Mostrar información del destino
        if (destination && this.destinations[destination]) {
            this.showDestinationInfo(destination);
        }
    }

    handleKawaiiHover(e) {
        const button = e.currentTarget;
        this.showKawaiiSound(button, this.kawaiiSounds.hover);

        // Efecto de brillo kawaii
        this.addKawaiiGlow(button);
    }

    handleKawaiiLeave(e) {
        const button = e.currentTarget;
        this.removeKawaiiGlow(button);
    }

    // === EFECTOS VISUALES ===
    createKawaiiExplosion(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const emojis = ['💖', '✨', '🌟', '💫', '🎀', '🌸', '💕', '⭐'];

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.className = 'kawaii-particle';

            const angle = (i / 8) * Math.PI * 2;
            const distance = 100 + Math.random() * 50;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            Object.assign(particle.style, {
                position: 'fixed',
                left: centerX + 'px',
                top: centerY + 'px',
                fontSize: '2rem',
                pointerEvents: 'none',
                zIndex: '9999',
                transition: 'all 1s ease-out',
                opacity: '1'
            });

            document.body.appendChild(particle);

            // Animar partícula
            requestAnimationFrame(() => {
                particle.style.transform = `translate(${endX}px, ${endY}px) scale(0.2)`;
                particle.style.opacity = '0';
            });

            // Limpiar después de la animación
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1000);
        }
    }

    showKawaiiSound(element, emoji) {
        const sound = document.createElement('div');
        sound.textContent = emoji;
        sound.className = 'kawaii-sound';

        Object.assign(sound.style, {
            position: 'absolute',
            top: '-30px',
            right: '-10px',
            fontSize: '1.5rem',
            opacity: '0',
            transform: 'scale(0.5)',
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
            zIndex: '10'
        });

        element.style.position = 'relative';
        element.appendChild(sound);

        // Animar aparición
        requestAnimationFrame(() => {
            sound.style.opacity = '1';
            sound.style.transform = 'scale(1) translateY(-10px)';
        });

        // Limpiar
        setTimeout(() => {
            if (sound.parentNode) {
                sound.parentNode.removeChild(sound);
            }
        }, 800);
    }

    addKawaiiGlow(element) {
        element.style.boxShadow = '0 0 20px rgba(255, 107, 157, 0.6), 0 0 40px rgba(255, 107, 157, 0.4)';
        element.style.transform = 'translateY(-3px) scale(1.05)';
    }

    removeKawaiiGlow(element) {
        element.style.boxShadow = '';
        element.style.transform = '';
    }

    // === EFECTOS DE TARJETAS ===
    setupCardHoverEffects() {
        this.kawaiiCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.animateCardEntry(card));
            card.addEventListener('mouseleave', () => this.animateCardExit(card));
        });
    }

    animateCardEntry(card) {
        const title = card.querySelector('.kawaii-card__title');
        if (title) {
            title.style.animation = 'kawaiiBounce 0.6s ease';
        }

        // Efecto de partículas flotantes
        this.createFloatingHearts(card);
    }

    animateCardExit(card) {
        const title = card.querySelector('.kawaii-card__title');
        if (title) {
            title.style.animation = '';
        }
    }

    createFloatingHearts(container) {
        const hearts = ['💖', '💕', '💗', '💓'];

        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.className = 'floating-heart';

            Object.assign(heart.style, {
                position: 'absolute',
                left: Math.random() * 100 + '%',
                bottom: '0px',
                fontSize: '1.5rem',
                opacity: '0.8',
                pointerEvents: 'none',
                animation: 'floatUp 2s ease-out forwards',
                zIndex: '5'
            });

            container.style.position = 'relative';
            container.appendChild(heart);

            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 2000);
        }
    }

    // === DECORACIONES FLOTANTES ===
    setupFloatingDecorations() {
        this.decorations.forEach((decoration, index) => {
            this.animateDecoration(decoration, index);
        });
    }

    animateDecoration(decoration, index) {
        const duration = 8000 + (index * 1000);
        const delay = index * 500;

        decoration.style.animationDuration = duration + 'ms';
        decoration.style.animationDelay = delay + 'ms';

        // Cambiar emoji ocasionalmente
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.changeDecorationEmoji(decoration);
            }
        }, 5000 + (index * 1000));
    }

    changeDecorationEmoji(decoration) {
        const kawaiEmojis = ['🐰', '🐱', '🐣', '🐼', '🐧', '🐨', '💖', '✨', '🌟', '💫', '🎀', '🌸', '💕', '⭐', '🦄', '🌈'];
        const currentEmoji = decoration.textContent;
        let newEmoji;

        do {
            newEmoji = kawaiEmojis[Math.floor(Math.random() * kawaiEmojis.length)];
        } while (newEmoji === currentEmoji);

        decoration.style.transform = 'scale(0)';

        setTimeout(() => {
            decoration.textContent = newEmoji;
            decoration.style.transform = 'scale(1)';
        }, 200);
    }

    // === ANIMACIONES DE SCROLL ===
    setupScrollAnimations() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('kawaii-visible');
                    this.triggerKawaiiEntry(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.kawaiiCards.forEach(card => {
            observer.observe(card);
        });
    }

    triggerKawaiiEntry(element) {
        // Efecto de entrada kawaii
        const sparkles = ['✨', '🌟', '💫'];
        const sparkle = document.createElement('div');
        sparkle.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];

        Object.assign(sparkle.style, {
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '2rem',
            opacity: '0',
            transform: 'scale(0)',
            transition: 'all 0.5s ease',
            pointerEvents: 'none',
            zIndex: '10'
        });

        element.style.position = 'relative';
        element.appendChild(sparkle);

        requestAnimationFrame(() => {
            sparkle.style.opacity = '1';
            sparkle.style.transform = 'scale(1) rotate(360deg)';
        });

        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.parentNode.removeChild(sparkle);
            }
        }, 1000);
    }

    // === CURSOR KAWAII ===
    setupKawaiiCursor() {
        let cursor = document.querySelector('.kawaii-cursor');

        if (!cursor) {
            cursor = document.createElement('div');
            cursor.className = 'kawaii-cursor';
            cursor.textContent = '💖';

            Object.assign(cursor.style, {
                position: 'fixed',
                pointerEvents: 'none',
                fontSize: '1.5rem',
                zIndex: '9999',
                transition: 'transform 0.1s ease',
                opacity: '0'
            });

            document.body.appendChild(cursor);
        }

        document.addEventListener('mousemove', (e) => {
            cursor.style.left = (e.clientX + 10) + 'px';
            cursor.style.top = (e.clientY - 10) + 'px';
            cursor.style.opacity = '0.7';
        });

        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
        });

        // Cambiar emoji del cursor en elementos kawaii
        this.kawaiiCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                cursor.textContent = '🌟';
                cursor.style.transform = 'scale(1.2)';
            });

            card.addEventListener('mouseleave', () => {
                cursor.textContent = '💖';
                cursor.style.transform = 'scale(1)';
            });
        });
    }

    // === EFECTOS DE PARTÍCULAS ===
    setupParticleEffects() {
        // Crear partículas kawaii ocasionales
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.createRandomParticle();
            }
        }, 3000);
    }

    createRandomParticle() {
        const emojis = ['✨', '🌟', '💫', '🎀', '🌸'];
        const particle = document.createElement('div');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.className = 'random-particle';

        Object.assign(particle.style, {
            position: 'fixed',
            left: Math.random() * window.innerWidth + 'px',
            top: window.innerHeight + 'px',
            fontSize: '2rem',
            opacity: '0.6',
            pointerEvents: 'none',
            zIndex: '1',
            animation: 'floatUpAndFade 4s ease-out forwards'
        });

        document.body.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 4000);
    }

    // === INFORMACIÓN DE DESTINOS ===
    showDestinationInfo(destinationKey) {
        const destination = this.destinations[destinationKey];
        if (!destination) return;

        const modal = this.createKawaiiModal(destination);
        document.body.appendChild(modal);

        // Animar entrada del modal
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
            modal.querySelector('.kawaii-modal-content').style.transform = 'translateY(0) scale(1)';
        });

        // Cerrar modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('kawaii-modal-close')) {
                this.closeKawaiiModal(modal);
            }
        });

        // Cerrar con ESC
        const closeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeKawaiiModal(modal);
                document.removeEventListener('keydown', closeHandler);
            }
        };
        document.addEventListener('keydown', closeHandler);
    }

    createKawaiiModal(destination) {
        const modal = document.createElement('div');
        modal.className = 'kawaii-modal';

        modal.innerHTML = `
            <div class="kawaii-modal-content">
                <button class="kawaii-modal-close">&times;</button>
                <div class="kawaii-modal-header">
                    <h2>${destination.emoji} ${destination.name} ${destination.emoji}</h2>
                </div>
                <div class="kawaii-modal-body">
                    <p>¡Descubre los lugares más adorables para encontrar ${destination.name.toLowerCase()}!</p>
                    <div class="kawaii-locations">
                        <h3>🌍 Destinos Principales:</h3>
                        <ul>
                            ${destination.locations.map(location =>
            `<li><span class="location-emoji">📍</span> ${location}</li>`
        ).join('')}
                        </ul>
                    </div>
                    <div class="kawaii-features">
                        <h3>✨ Lo que incluye tu aventura:</h3>
                        <div class="feature-grid">
                            <div class="feature-item">
                                <span class="feature-emoji">🎫</span>
                                <span>Entrada a santuarios</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-emoji">📸</span>
                                <span>Sesión de fotos kawaii</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-emoji">🎁</span>
                                <span>Kit de souvenirs</span>
                            </div>
                            <div class="feature-item">
                                <span class="feature-emoji">🍽️</span>
                                <span>Comida temática</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="kawaii-modal-footer">
                    <button class="btn btn--secondary kawaii-reserve-btn">
                        <i class="fas fa-heart"></i>
                        ¡Reservar Ahora!
                    </button>
                </div>
            </div>
        `;

        Object.assign(modal.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            opacity: '0',
            transition: 'opacity 0.3s ease'
        });

        const content = modal.querySelector('.kawaii-modal-content');
        Object.assign(content.style, {
            background: 'linear-gradient(145deg, #ffffff, #fff0f5)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            transform: 'translateY(50px) scale(0.9)',
            transition: 'transform 0.3s ease',
            border: '3px solid #ff6b9d',
            boxShadow: '0 20px 40px rgba(255, 107, 157, 0.3)'
        });

        // Manejar botón de reserva
        const reserveBtn = modal.querySelector('.kawaii-reserve-btn');
        reserveBtn.addEventListener('click', () => {
            this.handleReservation(destination);
            this.closeKawaiiModal(modal);
        });

        return modal;
    }

    closeKawaiiModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.kawaii-modal-content').style.transform = 'translateY(50px) scale(0.9)';

        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    handleReservation(destination) {
        // Crear efecto de corazones
        this.createHeartExplosion();

        // Mostrar notificación kawaii
        this.showKawaiiNotification(
            `¡Genial! 🎉 Tu reserva para ${destination.name} está siendo procesada con mucho amor 💖`,
            'success'
        );

        // Simular proceso de reserva
        setTimeout(() => {
            this.showKawaiiNotification(
                `¡Reserva confirmada! 🌟 Prepárate para la aventura más kawaii con ${destination.name} ${destination.emoji}`,
                'success'
            );
        }, 2000);
    }

    createHeartExplosion() {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const hearts = ['💖', '💕', '💗', '💓', '💘', '💝'];

        for (let i = 0; i < 12; i++) {
            const heart = document.createElement('div');
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

            const angle = (i / 12) * Math.PI * 2;
            const distance = 150 + Math.random() * 100;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;

            Object.assign(heart.style, {
                position: 'fixed',
                left: centerX + 'px',
                top: centerY + 'px',
                fontSize: '2.5rem',
                pointerEvents: 'none',
                zIndex: '9999',
                transition: 'all 1.5s ease-out',
                opacity: '1'
            });

            document.body.appendChild(heart);

            requestAnimationFrame(() => {
                heart.style.transform = `translate(${endX}px, ${endY}px) scale(0.3) rotate(720deg)`;
                heart.style.opacity = '0';
            });

            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
            }, 1500);
        }
    }

    // === NOTIFICACIONES KAWAII ===
    showKawaiiNotification(message, type = 'info') {
        // Usar el sistema global si está disponible
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
            return;
        }

        // Crear notificación kawaii personalizada
        const notification = document.createElement('div');
        notification.className = 'kawaii-notification';

        const typeEmojis = {
            success: '🌟',
            info: '💖',
            warning: '🎀',
            error: '💔'
        };

        const typeColors = {
            success: '#ff6b9d',
            info: '#ff9ff3',
            warning: '#ffb74d',
            error: '#ff5252'
        };

        notification.innerHTML = `
            <div class="kawaii-notification-content">
                <span class="kawaii-notification-emoji">${typeEmojis[type] || typeEmojis.info}</span>
                <span class="kawaii-notification-text">${message}</span>
                <button class="kawaii-notification-close">✕</button>
            </div>
        `;

        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: `linear-gradient(145deg, ${typeColors[type]}, ${typeColors[type]}dd)`,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '15px',
            fontFamily: 'Comic Neue, cursive',
            fontSize: '1.4rem',
            fontWeight: '600',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            maxWidth: '400px',
            border: '2px solid rgba(255,255,255,0.3)'
        });

        const content = notification.querySelector('.kawaii-notification-content');
        Object.assign(content.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        });

        const closeBtn = notification.querySelector('.kawaii-notification-close');
        Object.assign(closeBtn.style, {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            marginLeft: 'auto',
            padding: '0.2rem'
        });

        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Cerrar al hacer clic
        closeBtn.addEventListener('click', () => {
            this.closeKawaiiNotification(notification);
        });

        // Auto-cerrar
        setTimeout(() => {
            this.closeKawaiiNotification(notification);
        }, 5000);
    }

    closeKawaiiNotification(notification) {
        if (!notification.parentNode) return;

        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    // === CARACTERÍSTICAS ADICIONALES ===
    initializeKawaiiFeatures() {
        // Añadir clase kawaii al body
        document.body.classList.add('kawaii-active');

        // Crear estilos CSS dinámicos
        this.addKawaiiStyles();

        // Configurar eventos especiales
        this.setupSpecialEvents();

        // Easter eggs
        this.setupEasterEggs();
    }

    addKawaiiStyles() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes kawaiiBounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }
            
            @keyframes floatUp {
                from {
                    transform: translateY(0);
                    opacity: 0.8;
                }
                to {
                    transform: translateY(-100px);
                    opacity: 0;
                }
            }
            
            @keyframes floatUpAndFade {
                from {
                    transform: translateY(0);
                    opacity: 0.6;
                }
                to {
                    transform: translateY(-200px);
                    opacity: 0;
                }
            }
            
            .kawaii-visible {
                animation: kawaiiBounce 0.6s ease !important;
            }
        `;
        document.head.appendChild(style);
    }

    setupSpecialEvents() {
        // Konami code para modo ultra kawaii
        let konamiCode = [];
        const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

        document.addEventListener('keydown', (e) => {
            konamiCode.push(e.keyCode);
            if (konamiCode.length > konamiSequence.length) {
                konamiCode.shift();
            }

            if (konamiCode.join(',') === konamiSequence.join(',')) {
                this.activateUltraKawaiiMode();
                konamiCode = [];
            }
        });
    }

    setupEasterEggs() {
        // Triple click para sorpresa kawaii
        let clickCount = 0;
        let clickTimer;

        document.addEventListener('click', () => {
            clickCount++;

            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 500);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                this.triggerKawaiiSurprise();
            }
        });
    }

    activateUltraKawaiiMode() {
        this.showKawaiiNotification('🦄 ¡MODO ULTRA KAWAII ACTIVADO! 🌈', 'success');

        // Lluvia de emojis
        this.createEmojiRain();

        // Cambiar cursor a unicornio
        document.body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ctext y=\'24\' font-size=\'24\'%3E🦄%3C/text%3E%3C/svg%3E"), auto';

        setTimeout(() => {
            document.body.style.cursor = '';
        }, 10000);
    }

    createEmojiRain() {
        const emojis = ['🦄', '🌈', '⭐', '✨', '💖', '🌟', '💫', '🎀', '🌸', '💕'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                Object.assign(emoji.style, {
                    position: 'fixed',
                    left: Math.random() * window.innerWidth + 'px',
                    top: '-50px',
                    fontSize: '2rem',
                    pointerEvents: 'none',
                    zIndex: '9999',
                    animation: `fall ${3 + Math.random() * 2}s linear forwards`
                });

                document.body.appendChild(emoji);

                setTimeout(() => {
                    if (emoji.parentNode) {
                        emoji.parentNode.removeChild(emoji);
                    }
                }, 5000);
            }, i * 100);
        }

        // Añadir animación de caída
        if (!document.querySelector('#fall-animation')) {
            const fallStyle = document.createElement('style');
            fallStyle.id = 'fall-animation';
            fallStyle.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(${window.innerHeight + 100}px) rotate(360deg);
                    }
                }
            `;
            document.head.appendChild(fallStyle);
        }
    }

    triggerKawaiiSurprise() {
        this.showKawaiiNotification('🎉 ¡Sorpresa kawaii desbloqueada! 🎉', 'success');

        // Cambiar todos los emojis de decoración temporalmente
        this.decorations.forEach(decoration => {
            const originalEmoji = decoration.textContent;
            decoration.textContent = '🎉';
            decoration.style.animation = 'kawaiiBounce 0.6s ease infinite';

            setTimeout(() => {
                decoration.textContent = originalEmoji;
                decoration.style.animation = '';
            }, 3000);
        });
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    new KawaiiManager();
});

// === COMPATIBILIDAD CON TEMA OSCURO ===
window.addEventListener('themeChanged', (e) => {
    const kawaiiElements = document.querySelectorAll('.kawaii-card, .kawaii-modal, .kawaii-notification');

    kawaiiElements.forEach(element => {
        if (e.detail.theme === 'dark') {
            element.classList.add('kawaii-dark');
        } else {
            element.classList.remove('kawaii-dark');
        }
    });
});