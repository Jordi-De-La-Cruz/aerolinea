/* ============================================================
   OFERTA.JS — Lógica de la página de ofertas especiales
   Requiere: main.js (window.showNotification)
   ============================================================ */

/* ============================================================
   FAVORITOS
   ============================================================ */
function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem("offerFavorites") || "[]")); }
    catch { return new Set(); }
}

function saveFavorites(set) {
    try { localStorage.setItem("offerFavorites", JSON.stringify([...set])); }
    catch {}
}

function initFavorites() {
    const favorites = loadFavorites();

    document.querySelectorAll(".action-btn--fav").forEach((btn) => {
        const id = btn.dataset.id;

        /* Restaurar estado guardado */
        if (favorites.has(id)) markFav(btn, true);

        btn.addEventListener("click", () => {
            const active = favorites.has(id);
            const name   = btn.closest(".offer-card")?.querySelector("h3")?.textContent.trim() || id;

            if (active) {
                favorites.delete(id);
                markFav(btn, false);
                window.showNotification(`${name} eliminado de favoritos`, "info");
            } else {
                favorites.add(id);
                markFav(btn, true);
                window.showNotification(`${name} añadido a favoritos`, "success");
            }

            saveFavorites(favorites);
        });
    });
}

function markFav(btn, active) {
    const icon = btn.querySelector("i");
    if (icon) icon.className = active ? "fas fa-heart" : "far fa-heart";
    btn.setAttribute("aria-pressed", String(active));

    /* Micro-animación */
    btn.style.transform = "scale(1.25)";
    setTimeout(() => { btn.style.transform = ""; }, 200);
}

/* ============================================================
   ANIMACIONES DE ENTRADA
   ============================================================ */
function initAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity   = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".offer-card").forEach((el) => {
        el.style.opacity    = "0";
        el.style.transform  = "translateY(20px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        observer.observe(el);
    });
}

/* ============================================================
   INICIALIZACIÓN
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    initFavorites();
    initAnimations();
});