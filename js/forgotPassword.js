function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(input, errorEl, message) {
    input.classList.add("error");
    input.setAttribute("aria-invalid", "true");
    errorEl.textContent = message;
    errorEl.hidden = false;
}

function clearFieldError(input, errorEl) {
    input.classList.remove("error");
    input.setAttribute("aria-invalid", "false");
    errorEl.hidden = true;
    errorEl.textContent = "";
}

/* Simulación de envío */
function simulateSendToken(email) {
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    const payload = { email, token, expires: Date.now() + 5 * 60 * 1000 };
    try {
        localStorage.setItem("resetToken", JSON.stringify(payload));
    } catch { }
    console.info(`Token de recuperación (simulado): ${token}`);
}

/* Formulario */
function initForgotForm() {
    const form = document.getElementById("forgotForm");
    const emailInput = document.getElementById("email");
    const errorEl = document.getElementById("email-error");
    const submitBtn = form?.querySelector(".btn-forgot");
    if (!form || !emailInput || !errorEl || !submitBtn) return;

    /* Limpiar error al escribir */
    emailInput.addEventListener("input", () => clearFieldError(emailInput, errorEl));

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearFieldError(emailInput, errorEl);

        const email = emailInput.value.trim();

        if (!email) {
            showFieldError(emailInput, errorEl, "Este campo es obligatorio");
            emailInput.focus();
            return;
        }

        if (!isValidEmail(email)) {
            showFieldError(emailInput, errorEl, "Ingresa un correo electrónico válido");
            emailInput.focus();
            return;
        }

        /* Estado de carga */
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Enviando…';

        await new Promise((res) => setTimeout(res, 1000));

        simulateSendToken(email);

        window.showNotification?.(
            `Enlace enviado a ${email}. Revisa tu bandeja de entrada.`,
            "success"
        );

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> Enviar enlace';
        form.reset();
    });
}

/* Botón "Volver atrás" */
function initBackButton() {
    document.getElementById("backBtn")?.addEventListener("click", () => {
        window.history.back();
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    initForgotForm();
    initBackButton();
});