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

/* Simulación de registro */
function saveUser(name, email) {
    try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        users.push({ name, email, createdAt: new Date().toISOString() });
        localStorage.setItem("users", JSON.stringify(users));
    } catch { }
}

/* Formulario */
function initRegisterForm() {
    const form = document.getElementById("registerForm");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmInput = document.getElementById("confirmPassword");
    const termsCheckbox = document.getElementById("terms");
    const submitBtn = form?.querySelector(".btn-register");

    const nameError = document.getElementById("name-error");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");
    const confirmError = document.getElementById("confirm-error");

    if (!form) return;

    /* Limpiar error de cada campo al escribir */
    nameInput?.addEventListener("input", () => clearFieldError(nameInput, nameError));
    emailInput?.addEventListener("input", () => clearFieldError(emailInput, emailError));
    passwordInput?.addEventListener("input", () => clearFieldError(passwordInput, passwordError));
    confirmInput?.addEventListener("input", () => clearFieldError(confirmInput, confirmError));

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        /* Limpiar todos los errores */
        clearFieldError(nameInput, nameError);
        clearFieldError(emailInput, emailError);
        clearFieldError(passwordInput, passwordError);
        clearFieldError(confirmInput, confirmError);

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirm = confirmInput.value;
        let isValid = true;

        if (!name) {
            showFieldError(nameInput, nameError, "El nombre es obligatorio");
            isValid = false;
        }

        if (!email) {
            showFieldError(emailInput, emailError, "El correo es obligatorio");
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError(emailInput, emailError, "Ingresa un correo electrónico válido");
            isValid = false;
        }

        if (!password) {
            showFieldError(passwordInput, passwordError, "La contraseña es obligatoria");
            isValid = false;
        } else if (password.length < 8) {
            showFieldError(passwordInput, passwordError, "Mínimo 8 caracteres");
            isValid = false;
        }

        if (!confirm) {
            showFieldError(confirmInput, confirmError, "Confirma tu contraseña");
            isValid = false;
        } else if (password && confirm !== password) {
            showFieldError(confirmInput, confirmError, "Las contraseñas no coinciden");
            isValid = false;
        }

        if (!termsCheckbox?.checked) {
            window.showNotification?.("Debes aceptar los términos y condiciones", "warning");
            isValid = false;
        }

        if (!isValid) {
            /* Enfocar el primer campo con error */
            form.querySelector(".form-input.error")?.focus();
            return;
        }

        /* Estado de carga */
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Registrando…';

        await new Promise((res) => setTimeout(res, 1000));

        saveUser(name, email);
        window.showNotification?.(`¡Bienvenido, ${name}! Tu cuenta ha sido creada.`, "success");

        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus" aria-hidden="true"></i> Registrarse';
        form.reset();

        /* Redirigir al login tras un breve instante */
        setTimeout(() => { window.location.href = "login.html"; }, 1800);
    });
}

/* Botón "Volver" */
function initBackButton() {
    document.getElementById("backBtn")?.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    initRegisterForm();
    initBackButton();
});