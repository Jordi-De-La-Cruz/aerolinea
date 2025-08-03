/**
 * login.js - Funcionalidades específicas del formulario de login
 * Archivo independiente que funciona con main.js existente
 */

class LoginHandler {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.passwordInput = document.querySelector('input[type="password"]');
        this.emailInput = document.querySelector('input[type="email"]');
        this.rememberCheckbox = document.querySelector('#remember');
        this.submitButton = this.form?.querySelector('.btn-login');

        this.isSubmitting = false;
        this.maxAttempts = 3;
        this.attemptCount = 0;

        this.init();
    }

    init() {
        if (!this.form) {
            console.warn('Formulario de login no encontrado');
            return;
        }

        this.setupFormHandling();
        this.setupPasswordToggle();
        this.setupInputEffects();
        this.setupSocialButtons();
        this.loadSavedData();
        this.setupKeyboardEvents();
    }

    // === MANEJO DEL FORMULARIO ===
    setupFormHandling() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Validación en tiempo real
        if (this.emailInput) {
            this.emailInput.addEventListener('blur', () => this.validateEmail());
            this.emailInput.addEventListener('input', () => this.clearEmailError());
        }

        if (this.passwordInput) {
            this.passwordInput.addEventListener('blur', () => this.validatePassword());
            this.passwordInput.addEventListener('input', () => this.clearPasswordError());
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (!this.validateForm()) {
            this.showError('Por favor completa todos los campos correctamente');
            return;
        }

        if (this.attemptCount >= this.maxAttempts) {
            this.showError('Demasiados intentos. Espera unos minutos.');
            return;
        }

        this.startLogin();

        try {
            const loginData = {
                email: this.emailInput.value.trim(),
                password: this.passwordInput.value,
                remember: this.rememberCheckbox?.checked || false
            };

            const success = await this.performLogin(loginData);

            if (success) {
                this.handleLoginSuccess(loginData);
            } else {
                this.handleLoginFailure();
            }
        } catch (error) {
            console.error('Error en login:', error);
            this.handleLoginError();
        }
    }

    async performLogin(data) {
        // Simulación de autenticación (reemplazar con API real)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Validación básica para demo
                const isValid = data.email.includes('@') && data.password.length >= 6;
                resolve(isValid);
            }, 2000);
        });
    }

    startLogin() {
        this.isSubmitting = true;
        if (this.submitButton) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        }
    }

    handleLoginSuccess(data) {
        if (this.submitButton) {
            this.submitButton.innerHTML = '<i class="fas fa-check"></i> ¡Bienvenido!';
            this.submitButton.style.background = 'var(--success)';
        }

        this.showSuccess('¡Inicio de sesión exitoso!');

        if (data.remember) {
            this.saveUserEmail(data.email);
        }

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    handleLoginFailure() {
        this.attemptCount++;
        this.showError(`Credenciales incorrectas (${this.attemptCount}/${this.maxAttempts})`);
        this.resetLoginButton();

        if (this.attemptCount >= this.maxAttempts) {
            this.lockForm();
        }
    }

    handleLoginError() {
        this.showError('Error de conexión. Intenta nuevamente.');
        this.resetLoginButton();
    }

    resetLoginButton() {
        this.isSubmitting = false;
        if (this.submitButton) {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            this.submitButton.style.background = '';
        }
    }

    lockForm() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => input.disabled = true);

        if (this.submitButton) {
            this.submitButton.innerHTML = '<i class="fas fa-lock"></i> Bloqueado';
        }

        this.showError('Formulario bloqueado por seguridad');
    }

    // === VALIDACIÓN ===
    validateForm() {
        const emailValid = this.validateEmail();
        const passwordValid = this.validatePassword();
        return emailValid && passwordValid;
    }

    validateEmail() {
        if (!this.emailInput) return false;

        const email = this.emailInput.value.trim();
        const isValid = email && this.isValidEmail(email);

        if (!isValid) {
            this.showInputError(this.emailInput, 'Ingresa un email válido');
        }

        return isValid;
    }

    validatePassword() {
        if (!this.passwordInput) return false;

        const password = this.passwordInput.value;
        const isValid = password && password.length >= 6;

        if (!isValid) {
            this.showInputError(this.passwordInput, 'La contraseña debe tener al menos 6 caracteres');
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showInputError(input, message) {
        this.clearInputError(input);

        input.classList.add('error');
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        errorSpan.textContent = message;
        input.parentNode.appendChild(errorSpan);
    }

    clearInputError(input) {
        input.classList.remove('error');
        const errorMsg = input.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    clearEmailError() {
        this.clearInputError(this.emailInput);
    }

    clearPasswordError() {
        this.clearInputError(this.passwordInput);
    }

    // === TOGGLE DE CONTRASEÑA ===
    setupPasswordToggle() {
        if (!this.passwordInput) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'password-toggle';
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
        toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');

        this.passwordInput.parentNode.style.position = 'relative';
        this.passwordInput.style.paddingRight = '4rem';
        this.passwordInput.parentNode.appendChild(toggleBtn);

        toggleBtn.addEventListener('click', () => {
            const isPassword = this.passwordInput.type === 'password';
            this.passwordInput.type = isPassword ? 'text' : 'password';

            const icon = toggleBtn.querySelector('i');
            icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    }

    // === EFECTOS DE INPUTS ===
    setupInputEffects() {
        const inputs = this.form.querySelectorAll('.form-input');

        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentNode.classList.remove('focused');
                }
            });
        });
    }

    // === BOTONES SOCIALES ===
    setupSocialButtons() {
        const socialBtns = document.querySelectorAll('.btn-social');

        socialBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = this.getSocialProvider(btn);
                this.handleSocialLogin(provider);
            });
        });
    }

    getSocialProvider(button) {
        if (button.classList.contains('google')) return 'Google';
        if (button.classList.contains('facebook')) return 'Facebook';
        if (button.classList.contains('twitter')) return 'Twitter';
        return 'Social';
    }

    handleSocialLogin(provider) {
        this.showInfo(`Conectando con ${provider}...`);

        // Simular login social
        setTimeout(() => {
            this.showSuccess(`¡Conectado con ${provider}!`);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }, 2000);
    }

    // === DATOS GUARDADOS ===
    saveUserEmail(email) {
        try {
            localStorage.setItem('savedEmail', email);
        } catch (e) {
            console.warn('No se pudo guardar el email');
        }
    }

    loadSavedData() {
        try {
            const savedEmail = localStorage.getItem('savedEmail');
            if (savedEmail && this.emailInput) {
                this.emailInput.value = savedEmail;
                if (this.rememberCheckbox) {
                    this.rememberCheckbox.checked = true;
                }
            }
        } catch (e) {
            console.warn('No se pudo cargar datos guardados');
        }
    }

    // === EVENTOS DE TECLADO ===
    setupKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // Enter para enviar
            if (e.key === 'Enter' && this.form.contains(e.target)) {
                if (e.target.tagName !== 'BUTTON') {
                    e.preventDefault();
                    this.form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    // === NOTIFICACIONES ===
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Usar el sistema de notificaciones global si existe
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message, type);
            return;
        }

        // Fallback: crear notificación simple
        this.createSimpleNotification(message, type);
    }

    createSimpleNotification(message, type) {
        const notification = document.createElement('div');

        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db',
            warning: '#f39c12'
        };

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            font-size: 1.4rem;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        notification.textContent = message;
        document.body.appendChild(notification);

        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Auto-eliminar
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
    new LoginHandler();
});

// === ESTILOS CSS DINÁMICOS ===
const loginStyles = document.createElement('style');
loginStyles.textContent = `
    .form-input.error {
        border-color: var(--danger, #e74c3c);
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
    
    .error-message {
        color: var(--danger, #e74c3c);
        font-size: var(--font-size-small, 1.4rem);
        margin-top: 0.5rem;
        display: block;
    }
    
    .password-toggle {
        position: absolute;
        right: 1rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--gray, #666);
        cursor: pointer;
        font-size: 1.6rem;
        z-index: 2;
        transition: color 0.3s ease;
    }
    
    .password-toggle:hover {
        color: var(--primary, #2193b0);
    }
    
    .form-group.focused .input-icon {
        color: var(--primary, #2193b0);
    }
`;
document.head.appendChild(loginStyles);