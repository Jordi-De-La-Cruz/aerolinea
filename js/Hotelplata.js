const PRICE_PER_NIGHT = 120;
const TAX_RATE = 0.12;

/* GALERÍA */
function initGallery() {
    /* Intercambio de imagen principal al clicar thumbnail */
    const mainImg = document.querySelector(".gallery-main img");
    document.querySelectorAll(".gallery-thumbnails img").forEach((thumb) => {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
            if (!mainImg) return;
            const prevSrc = mainImg.src;
            const prevAlt = mainImg.alt;
            mainImg.src = thumb.src;
            mainImg.alt = thumb.alt;
            thumb.src = prevSrc;
            thumb.alt = prevAlt;
        });
    });

    /* Botón "+15 fotos más" */
    document.getElementById("galleryMoreBtn")?.addEventListener("click", () => {
        window.showNotification("Galería completa próximamente disponible", "info");
    });
}

/* FAVORITO */
function initFavorite() {
    const btn = document.getElementById("favBtn");
    if (!btn) return;

    let active = false;
    try {
        const saved = JSON.parse(localStorage.getItem("hotelFavorites") || "[]");
        active = saved.includes("hotel-plata");
    } catch { }

    applyFavState(btn, active);

    btn.addEventListener("click", () => {
        active = !active;
        applyFavState(btn, active);

        try {
            const saved = JSON.parse(localStorage.getItem("hotelFavorites") || "[]");
            const updated = active
                ? [...new Set([...saved, "hotel-plata"])]
                : saved.filter((id) => id !== "hotel-plata");
            localStorage.setItem("hotelFavorites", JSON.stringify(updated));
        } catch { }

        window.showNotification(
            active ? "Hotel Plata añadido a favoritos ❤️" : "Hotel Plata eliminado de favoritos",
            active ? "success" : "info"
        );
    });
}

function applyFavState(btn, active) {
    const icon = btn.querySelector("i");
    if (icon) icon.className = active ? "fas fa-heart" : "far fa-heart";
    btn.setAttribute("aria-pressed", String(active));
    btn.style.color = active ? "var(--danger)" : "";
}

/* CALCULADOR DE PRECIO */
function initPriceCalculator() {
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const rooms = document.getElementById("rooms");
    const guests = document.getElementById("guests");

    if (!checkin || !checkout) return;

    /* Fecha mínima: hoy */
    const today = new Date().toISOString().split("T")[0];
    checkin.min = today;
    checkout.min = today;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkin.value = today;
    checkout.value = tomorrow.toISOString().split("T")[0];

    checkin.addEventListener("change", () => {
        const next = new Date(checkin.value);
        next.setDate(next.getDate() + 1);
        checkout.min = next.toISOString().split("T")[0];
        if (checkout.value && checkout.value <= checkin.value) {
            checkout.value = next.toISOString().split("T")[0];
        }
        updatePriceDisplay();
    });

    [checkout, rooms, guests].forEach((el) =>
        el?.addEventListener("change", updatePriceDisplay)
    );

    updatePriceDisplay();
}

function updatePriceDisplay() {
    const checkin = document.getElementById("checkin")?.value;
    const checkout = document.getElementById("checkout")?.value;
    const rooms = parseInt(document.getElementById("rooms")?.value || "1", 10);
    const summary = document.getElementById("priceSummary");
    const prompt = document.getElementById("datePrompt");
    const breakdown = document.getElementById("priceBreakdown");

    if (!checkin || !checkout || checkout <= checkin) {
        if (summary) summary.hidden = true;
        if (prompt) prompt.hidden = false;
        return;
    }

    const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
    const base = PRICE_PER_NIGHT * nights * rooms;
    const tax = Math.round(base * TAX_RATE);
    const total = base + tax;

    if (breakdown) {
        breakdown.innerHTML = `
            <div class="price-line">
                <span>$${PRICE_PER_NIGHT} × ${nights} noche${nights > 1 ? "s" : ""} × ${rooms} habitación${rooms > 1 ? "es" : ""}</span>
                <span>$${base.toLocaleString()}</span>
            </div>
            <div class="price-line">
                <span>Impuestos y tasas (12%)</span>
                <span>$${tax.toLocaleString()}</span>
            </div>
            <div class="price-line price-line--total">
                <strong>Total</strong>
                <strong>$${total.toLocaleString()}</strong>
            </div>
        `;
    }

    if (summary) summary.hidden = false;
    if (prompt) prompt.hidden = true;
}

/* FORMULARIO DE RESERVA */
function initBookingForm() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const checkin = document.getElementById("checkin")?.value;
        const checkout = document.getElementById("checkout")?.value;

        if (!checkin || !checkout || checkout <= checkin) {
            window.showNotification("Por favor selecciona fechas válidas", "warning");
            return;
        }

        const btn = form.querySelector('[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Procesando…';
        }

        try {
            /* Simulación — reemplazar con fetch real */
            await new Promise((res) => setTimeout(res, 1600));
            window.showNotification("¡Reserva confirmada! Recibirás un email de confirmación.", "success");
            form.reset();
            updatePriceDisplay();
        } catch {
            window.showNotification("Error al procesar la reserva. Intenta nuevamente.", "error");
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-calendar-check" aria-hidden="true"></i> Confirmar Reserva';
            }
        }
    });
}

/* ANIMACIONES DE ENTRADA */
function initAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, i * 70);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(
        ".feature-card, .amenity-item, .review-card, .hotel-card, .attraction-item"
    ).forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(16px)";
        el.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        observer.observe(el);
    });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    initGallery();
    initFavorite();
    initPriceCalculator();
    initBookingForm();
    initAnimations();
});