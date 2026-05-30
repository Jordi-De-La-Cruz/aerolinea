/* ============================================================
   ASIA.JS — Lógica de la página Asia
   Requiere: main.js (window.showNotification)
             sur.js  (initTableReserve, initBookingForm,
                       validateBookingForm, showInputError,
                       handleBookingSubmit)
   ============================================================ */

function initAsiaSlider() {
    const sliderEl = document.querySelector(".section-padded .slider");
    if (sliderEl) sliderEl.classList.add("asia-slider");
}

function initAsiaAnimations() {
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
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".highlight-card").forEach((el) => {
        el.style.opacity    = "0";
        el.style.transform  = "translateY(20px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        observer.observe(el);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initAsiaSlider();
    initTableReserve();
    initBookingForm();
    initAsiaAnimations();
});