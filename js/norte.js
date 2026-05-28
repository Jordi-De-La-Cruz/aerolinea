function initCityCards() {
    document.querySelectorAll(".city-item[data-destino]").forEach((card) => {
        /* Hacer teclado-accesible */
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Seleccionar ${card.querySelector("span")?.textContent}`);

        const fill = () => {
            const destino = card.dataset.destino;
            const select = document.getElementById("destino");

            if (select) {
                select.value = destino;
                select.style.transition = "box-shadow 0.3s ease";
                select.style.boxShadow = "0 0 0 3px rgba(33, 147, 176, 0.4)";
                setTimeout(() => { select.style.boxShadow = ""; }, 1200);
            }

            document.querySelector(".booking-form-section")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        };

        card.addEventListener("click", fill);
        card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fill(); } });
    });
}

/* ANIMACIÓN DE ENTRADA PARA TARJETAS ADICIONALES */
function initNorteAnimations() {
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
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".info-card, .fact-card, .tip-card").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        observer.observe(el);
    });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    new Slider(".slider-wrapper");

    initTableReserve();

    initCityCards();

    initBookingForm();

    initNorteAnimations();
});