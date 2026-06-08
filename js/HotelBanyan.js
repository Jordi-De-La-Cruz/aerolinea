const VILLA_RATES = {
    laguna: 450,
    panoramica: 680,
    presidencial: 950,
    real: 1400,
};

/* Cotizador de fechas */
function initBookingForm() {
    const form = document.getElementById("bookingForm");
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const villaType = document.getElementById("villaType");
    const summary = document.getElementById("priceSummary");

    if (!form) return;

    /* Fecha mínima: hoy */
    const today = new Date().toISOString().split("T")[0];
    if (checkin) checkin.min = today;
    if (checkout) checkout.min = today;

    [checkin, checkout, villaType].forEach((el) => {
        el?.addEventListener("change", updatePriceSummary);
    });

    function updatePriceSummary() {
        if (!checkin?.value || !checkout?.value || !summary) return;

        const inDate = new Date(checkin.value);
        const outDate = new Date(checkout.value);
        const nights = Math.round((outDate - inDate) / 86_400_000);

        if (nights <= 0) {
            summary.innerHTML = buildPrompt("La fecha de salida debe ser posterior a la llegada.");
            return;
        }

        const rate = VILLA_RATES[villaType?.value] ?? 450;
        const subtotal = rate * nights;
        const taxes = subtotal * 0.1;
        const total = subtotal + taxes;
        const fmt = (n) => `$${n.toFixed(2)}`;

        summary.innerHTML = `
            <div class="price-breakdown">
                <div class="price-line">
                    <span>${nights} noche${nights > 1 ? "s" : ""} × ${fmt(rate)}</span>
                    <span>${fmt(subtotal)}</span>
                </div>
                <div class="price-line">
                    <span>Impuestos y cargos (10%)</span>
                    <span>${fmt(taxes)}</span>
                </div>
                <div class="price-line price-line--total">
                    <span>Total estimado</span>
                    <span>${fmt(total)}</span>
                </div>
            </div>`;
    }

    function buildPrompt(msg) {
        return `<p class="date-prompt"><i class="fas fa-info-circle" aria-hidden="true"></i> ${msg}</p>`;
    }

    /* Envío del formulario */
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!checkin?.value || !checkout?.value) {
            window.showNotification("Por favor selecciona las fechas de tu estadía.", "warning");
            return;
        }

        const inDate = new Date(checkin.value);
        const outDate = new Date(checkout.value);
        if (outDate <= inDate) {
            window.showNotification("La fecha de salida debe ser posterior a la llegada.", "error");
            return;
        }

        const nights = Math.round((outDate - inDate) / 86_400_000);
        const villa = villaType?.options[villaType.selectedIndex]?.text ?? "Villa";
        const submitBtn = form.querySelector('[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Procesando...';
        }

        setTimeout(() => {
            window.showNotification(
                `¡Reserva iniciada! ${villa} · ${nights} noche${nights > 1 ? "s" : ""}. Te redirigimos al pago.`,
                "success"
            );
            setTimeout(() => { window.location.href = "tarjeta.html"; }, 1800);
        }, 1000);
    });
}

/* Lista de deseos */
function initWishlistButton() {
    const btn = document.getElementById("wishlistBtn");
    if (!btn) return;

    const key = "banyan_saved";
    const saved = localStorage.getItem(key) === "true";
    const icon = btn.querySelector("i");

    if (saved) {
        btn.classList.add("active");
        if (icon) icon.style.color = "var(--danger)";
    }

    btn.addEventListener("click", () => {
        const active = btn.classList.toggle("active");
        if (icon) icon.style.color = active ? "var(--danger)" : "";
        localStorage.setItem(key, active);

        window.showNotification(
            active ? "¡Hotel Banyan Tree guardado en tu lista de deseos!" : "Eliminado de tu lista de deseos",
            active ? "success" : "info"
        );
    });
}

/* Animación scroll para amenities */
function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".animate-on-scroll").forEach((el) => {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, i * 60);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(16px)";
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        observer.observe(el);
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    initBookingForm();
    initWishlistButton();
    initScrollAnimations();
});