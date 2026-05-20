class LoginHandler {
    constructor() {
        this.form = document.getElementById("loginForm");
        this.emailInput = document.getElementById("email");
        this.passwordInput = document.getElementById("password");
        this.rememberCheckbox = document.getElementById("remember");
        this.submitButton = this.form?.querySelector(".btn-login");

        this.isSubmitting = false;
        this.maxAttempts = 3;
        this.attemptCount = 0;

        this.init();
    }

    init() {
        if (!this.form) {
            console.warn("Formulario de login no encontrado");
            return;
        }

        this.setupFormHandling();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.loadSavedEmail();
    }

    /* MANEJO DEL FORMULARIO */
    setupFormHandling() {
        this.form.addEventListener("submit", (e) => this.handleSubmit(e));

        this.emailInput?.addEventListener("blur", () => this.validateEmail());
        this.emailInput?.addEventListener("input", () => this.clearError(this.emailInput));

        this.passwordInput?.addEventListener("blur", () => this.validatePassword());
        this.passwordInput?.addEventListener("input", () => this.clearError(this.passwordInput));
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (this.isSubmitting) return;

        if (this.attemptCount >= this.maxAttempts) {
            window.showNotification("Demasiados intentos. Espera unos minutos.", "error");
            return;
        }

        const emailOk = this.validateEmail();
        const passwordOk = this.validatePassword();
        if (!emailOk || !passwordOk) return;

        this.setLoading(true);

        try {
            const success = await this.performLogin(
                this.emailInput.value.trim(),
                this.passwordInput.value
            );

            if (success) {
                this.onSuccess();
            } else {
                this.onFailure();
            }
        } catch {
            window.showNotification("Error de conexión. Intenta nuevamente.", "error");
            this.setLoading(false);
        }
    }

    async performLogin(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(email.includes("@") && password.length >= 6);
            }, 1800);
        });
    }

    onSuccess() {
        if (this.submitButton) {
            this.submitButton.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> ¡Bienvenido!';
            this.submitButton.style.background = "var(--success)";
        }

        window.showNotification("¡Inicio de sesión exitoso!", "success");

        if (this.rememberCheckbox?.checked) {
            this.saveEmail(this.emailInput.value.trim());
        } else {
            localStorage.removeItem("savedEmail");
        }

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1500);
    }

    onFailure() {
        this.attemptCount++;
        window.showNotification(
            `Credenciales incorrectas. Intento ${this.attemptCount} de ${this.maxAttempts}.`,
            "error"
        );
        this.setLoading(false);

        if (this.attemptCount >= this.maxAttempts) {
            this.lockForm();
        }
    }

    setLoading(active) {
        this.isSubmitting = active;

        if (!this.submitButton) return;

        if (active) {
            this.submitButton.disabled = true;
            this.submitButton.innerHTML = '<i class="fas fa-spinner" aria-hidden="true"></i> Iniciando sesión...';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.innerHTML = '<i class="fas fa-sign-in-alt" aria-hidden="true"></i> Iniciar Sesión';
            this.submitButton.style.background = "";
        }
    }

    lockForm() {
        this.form.querySelectorAll("input, button").forEach((el) => (el.disabled = true));
        if (this.submitButton) {
            this.submitButton.innerHTML = '<i class="fas fa-lock" aria-hidden="true"></i> Bloqueado';
        }
    }

    /* VALIDACIÓN */
    validateEmail() {
        const value = this.emailInput?.value.trim() || "";
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

        if (!valid) {
            this.showError(this.emailInput, "Ingresa un correo electrónico válido");
        }

        return valid;
    }

    validatePassword() {
        const value = this.passwordInput?.value || "";
        const valid = value.length >= 6;

        if (!valid) {
            this.showError(this.passwordInput, "La contraseña debe tener al menos 6 caracteres");
        }

        return valid;
    }

    showError(input, message) {
        if (!input) return;
        this.clearError(input);

        input.classList.add("error");
        input.setAttribute("aria-invalid", "true");

        const span = document.createElement("span");
        span.className = "error-message";
        span.id = `${input.id}-error`;
        span.textContent = message;
        input.parentNode.appendChild(span);
    }

    clearError(input) {
        if (!input) return;
        input.classList.remove("error");
        input.removeAttribute("aria-invalid");
        input.parentNode.querySelector(".error-message")?.remove();
    }

    /* TOGGLE DE CONTRASEÑA */
    setupPasswordToggle() {
        if (!this.passwordInput) return;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "password-toggle";
        btn.setAttribute("aria-label", "Mostrar contraseña");
        btn.innerHTML = '<i class="fas fa-eye" aria-hidden="true"></i>';

        this.passwordInput.style.paddingRight = "4rem";
        this.passwordInput.parentNode.appendChild(btn);

        btn.addEventListener("click", () => {
            const show = this.passwordInput.type === "password";
            this.passwordInput.type = show ? "text" : "password";
            btn.querySelector("i").className = show ? "fas fa-eye-slash" : "fas fa-eye";
            btn.setAttribute("aria-label", show ? "Ocultar contraseña" : "Mostrar contraseña");
        });
    }

    /* BOTONES SOCIALES */
    setupSocialButtons() {
        document.querySelectorAll(".btn-social").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();

                const provider =
                    btn.classList.contains("google") ? "Google" :
                        btn.classList.contains("facebook") ? "Facebook" :
                            btn.classList.contains("twitter") ? "Twitter" : "Red Social";

                window.showNotification(`Conectando con ${provider}…`, "info");

                setTimeout(() => {
                    window.showNotification(`¡Conectado con ${provider}!`, "success");
                    setTimeout(() => { window.location.href = "index.html"; }, 1000);
                }, 2000);
            });
        });
    }

    /* PERSISTENCIA DEL EMAIL */
    saveEmail(email) {
        try {
            localStorage.setItem("savedEmail", email);
        } catch {
            /* Storage bloqueado — ignorar silenciosamente */
        }
    }

    loadSavedEmail() {
        try {
            const saved = localStorage.getItem("savedEmail");
            if (saved && this.emailInput) {
                this.emailInput.value = saved;
                if (this.rememberCheckbox) this.rememberCheckbox.checked = true;
            }
        } catch {
            /* Storage bloqueado — ignorar silenciosamente */
        }
    }
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    new LoginHandler();
});