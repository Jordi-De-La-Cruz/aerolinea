function initCardAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const cards = document.querySelectorAll(".am-card, .consejo");

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(24px)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(card);
    });
}

/* PAUSA DEL SLIDER AL HOVER */
function initSliderPause() {
    const slider = document.querySelector(".slider ul");
    if (!slider) return;

    const parent = slider.closest(".slider");
    if (!parent) return;

    parent.addEventListener("mouseenter", () => {
        slider.style.animationPlayState = "paused";
    });

    parent.addEventListener("mouseleave", () => {
        slider.style.animationPlayState = "running";
    });

    /* Pausar en dispositivos con preferencia de movimiento reducido */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        slider.style.animationPlayState = "paused";
    }
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    initCardAnimations();
    initSliderPause();
});