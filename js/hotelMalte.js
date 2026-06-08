const ROOM_RATE = 180;

/* Cotizador de fechas */
function initBookingForm() {
    const form = document.getElementById("bookingForm");
    const checkin = document.getElementById("checkin");
    const checkout = document.getElementById("checkout");
    const rooms = document.getElementById("rooms");
    const summary = document.getElementById("priceSummary");

    if (!form) return;

    /* Fecha mínima: hoy */
    const today = new Date().toISOString().split("T")[0];
    if (checkin) checkin.min = today;
    if (checkout) checkout.min = today;

    [checkin, checkout, rooms].forEach((el) => {
        el?.addEventListener("change", updatePriceSummary);
    });

    function updatePriceSummary() {
        if (!checkin?.value || !checkout?.value || !summary) return;

        const inDate = new Date(checkin.value);
        const outDate = new Date(checkout.value);
        const nights = Math.round((outDate - inDate) / 86_400_000);

        if (nights <= 0) {
            summary.innerHTML = buildPrompt("La date de départ doit être après l'arrivée.");
            return;
        }

        const numRooms = parseInt(rooms?.value ?? "1", 10) || 1;
        const subtotal = ROOM_RATE * nights * numRooms;
        const taxe = subtotal * 0.1;
        const total = subtotal + taxe;
        const fmt = (n) => `€${n.toFixed(2)}`;

        summary.innerHTML = `
            <div class="price-breakdown">
                <div class="price-line">
                    <span>${nights} nuit${nights > 1 ? "s" : ""} × ${numRooms} chambre${numRooms > 1 ? "s" : ""} × ${fmt(ROOM_RATE)}</span>
                    <span>${fmt(subtotal)}</span>
                </div>
                <div class="price-line">
                    <span>Taxes et frais (10%)</span>
                    <span>${fmt(taxe)}</span>
                </div>
                <div class="price-line price-line--total">
                    <span>Total estimé</span>
                    <span>${fmt(total)}</span>
                </div>
            </div>`;
    }

    function buildPrompt(msg) {
        return `<p class="date-prompt"><i class="fas fa-info-circle" aria-hidden="true"></i> ${msg}</p>`;
    }

    /* Envío */
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!checkin?.value || !checkout?.value) {
            window.showNotification("Veuillez sélectionner vos dates de séjour.", "warning");
            return;
        }

        const inDate = new Date(checkin.value);
        const outDate = new Date(checkout.value);

        if (outDate <= inDate) {
            window.showNotification("La date de départ doit être après l'arrivée.", "error");
            return;
        }

        const nights = Math.round((outDate - inDate) / 86_400_000);
        const numRooms = parseInt(rooms?.value ?? "1", 10) || 1;
        const submitBtn = form.querySelector('[type="submit"]');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Traitement...';
        }

        setTimeout(() => {
            window.showNotification(
                `¡Réservation initiée! ${numRooms} chambre${numRooms > 1 ? "s" : ""} · ${nights} nuit${nights > 1 ? "s" : ""}. Redirection vers le paiement.`,
                "success"
            );
            setTimeout(() => { window.location.href = "tarjeta.html"; }, 1800);
        }, 1000);
    });
}

/* Favoritos */
function initWishlistButton() {
    const btn = document.getElementById("wishlistBtn");
    if (!btn) return;

    const key = "malte_saved";
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
            active ? "¡Hotel Malte guardado en tus favoritos!" : "Eliminado de favoritos",
            active ? "success" : "info"
        );
    });
}

/* Animaciones scroll amenities */
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