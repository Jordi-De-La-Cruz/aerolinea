const themeToggle = document.getElementById("themeToggle");
const body = document.body;

/* TEMA OSCURO / CLARO */
function enableDarkMode() {
    body.classList.add("dark-theme");
    const icon = themeToggle?.querySelector("i");
    if (icon) {
        icon.classList.replace("fa-moon", "fa-sun");
    }
    localStorage.setItem("theme", "dark");
}

function enableLightMode() {
    body.classList.remove("dark-theme");
    const icon = themeToggle?.querySelector("i");
    if (icon) {
        icon.classList.replace("fa-sun", "fa-moon");
    }
    localStorage.setItem("theme", "light");
}

function toggleTheme() {
    if (body.classList.contains("dark-theme")) {
        enableLightMode();
    } else {
        enableDarkMode();
    }
}

function initTheme() {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        enableDarkMode();
    }
}

/* ANIMACIONES AL HACER SCROLL */
function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("fade-in");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".destination-card").forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

/* SCROLL SUAVE */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const headerHeight = document.querySelector(".header")?.offsetHeight || 0;
            const offsetTop = target.offsetTop - headerHeight - 20;

            window.scrollTo({ top: offsetTop, behavior: "smooth" });
        });
    });
}

/* VALIDACIÓN DE FORMULARIOS */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(input, message) {
    input.parentNode.querySelector(".error-message")?.remove();

    const error = document.createElement("span");
    error.className = "error-message";
    error.style.cssText = "color: var(--danger); font-size: var(--font-size-small); display: block; margin-top: 4px;";
    error.textContent = message;
    input.parentNode.appendChild(error);
    input.classList.add("error");
}

function validateForm(form) {
    let isValid = true;

    form.querySelectorAll(".form-input[required]").forEach((input) => {
        input.parentNode.querySelector(".error-message")?.remove();
        input.classList.remove("error");

        const value = input.value.trim();

        if (!value) {
            showFieldError(input, "Este campo es obligatorio");
            isValid = false;
        } else if (input.type === "email" && !isValidEmail(value)) {
            showFieldError(input, "Ingresa un email válido");
            isValid = false;
        }
    });

    return isValid;
}

/* NOTIFICACIONES */
function showNotification(message, type = "success") {
    const colors = {
        success: "#27ae60",
        warning: "#f39c12",
        error: "#e74c3c",
        info: "#3498db",
    };

    const notification = document.createElement("div");
    notification.setAttribute("role", "alert");
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1.2rem 2rem;
        border-radius: 0.5rem;
        color: white;
        font-size: 1.5rem;
        font-weight: 600;
        z-index: 9999;
        transform: translateX(calc(100% + 20px));
        transition: transform 0.3s ease;
        background-color: ${colors[type] || colors.success};
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 320px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = "translateX(0)";
    });

    setTimeout(() => {
        notification.style.transform = "translateX(calc(100% + 20px))";
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/* CARGA LAZY DE IMÁGENES */
function initLazyLoading() {
    if ("loading" in HTMLImageElement.prototype) return; // soporte nativo, no hace falta

    if (!("IntersectionObserver" in window)) return;

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute("data-src");
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => imageObserver.observe(img));
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initScrollAnimations();
    initSmoothScrolling();
    initLazyLoading();

    themeToggle?.addEventListener("click", toggleTheme);

    document.querySelectorAll("form").forEach((form) => {
        form.addEventListener("submit", (e) => {
            if (!validateForm(form)) {
                e.preventDefault();
                showNotification("Por favor completa todos los campos obligatorios", "error");
            }
        });
    });
});

window.addEventListener("error", (e) => {
    console.error("Error en la aplicación:", e.error);
});

/* EXPORTAR PARA USO GLOBAL */
window.showNotification = showNotification;
window.validateForm = validateForm;