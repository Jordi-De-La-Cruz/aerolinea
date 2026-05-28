class Slider {
    constructor(wrapperSelector) {
        this.slides = Array.from(document.querySelectorAll(`${wrapperSelector} .slide`));
        this.indicators = Array.from(document.querySelectorAll(`${wrapperSelector} .indicator`));
        this.prevBtn = document.getElementById("slidePrev");
        this.nextBtn = document.getElementById("slideNext");
        this.track = document.getElementById("slidesTrack");

        this.current = 0;
        this.total = this.slides.length;
        this.autoTimer = null;
        this.AUTO_DELAY = 5000;

        if (this.total === 0) return;
        this.init();
    }

    init() {
        this.prevBtn?.addEventListener("click", () => { this.go(this.current - 1); this.resetAuto(); });
        this.nextBtn?.addEventListener("click", () => { this.go(this.current + 1); this.resetAuto(); });

        this.indicators.forEach((dot, i) => {
            dot.addEventListener("click", () => { this.go(i); this.resetAuto(); });
        });

        /* Teclado cuando el wrapper tiene foco */
        this.track?.closest(".slider-wrapper")?.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") { this.go(this.current - 1); this.resetAuto(); }
            if (e.key === "ArrowRight") { this.go(this.current + 1); this.resetAuto(); }
        });

        /* Swipe táctil */
        this.initSwipe();

        /* Pausa en hover */
        const wrapper = this.track?.closest(".slider-wrapper");
        wrapper?.addEventListener("mouseenter", () => this.stopAuto());
        wrapper?.addEventListener("mouseleave", () => this.startAuto());

        /* Pausa si prefers-reduced-motion */
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.startAuto();
        }
    }

    go(index) {
        /* Wrap circular */
        const next = ((index % this.total) + this.total) % this.total;

        this.slides[this.current].classList.remove("active");
        this.slides[this.current].setAttribute("aria-hidden", "true");
        this.indicators[this.current].classList.remove("active");
        this.indicators[this.current].setAttribute("aria-selected", "false");

        this.current = next;

        this.slides[this.current].classList.add("active");
        this.slides[this.current].setAttribute("aria-hidden", "false");
        this.indicators[this.current].classList.add("active");
        this.indicators[this.current].setAttribute("aria-selected", "true");
    }

    startAuto() {
        this.stopAuto();
        this.autoTimer = setInterval(() => this.go(this.current + 1), this.AUTO_DELAY);
    }

    stopAuto() {
        clearInterval(this.autoTimer);
    }

    resetAuto() {
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.startAuto();
        }
    }

    initSwipe() {
        const wrapper = this.track?.closest(".slider-wrapper");
        if (!wrapper) return;

        let startX = 0;

        wrapper.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });

        wrapper.addEventListener("touchend", (e) => {
            const diff = startX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                this.go(diff > 0 ? this.current + 1 : this.current - 1);
                this.resetAuto();
            }
        }, { passive: true });
    }
}

/* TABLA — RELLENAR FORMULARIO AL HACER CLIC EN "RESERVAR" */
function initTableReserve() {
    document.querySelectorAll(".prices-table [data-destino]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const destino = btn.dataset.destino;
            const select = document.getElementById("destino");

            if (select) {
                select.value = destino;
                /* Efecto visual de resaltado */
                select.style.transition = "box-shadow 0.3s ease";
                select.style.boxShadow = "0 0 0 3px rgba(33, 147, 176, 0.4)";
                setTimeout(() => { select.style.boxShadow = ""; }, 1200);
            }

            /* Desplazar suavemente al formulario */
            document.querySelector(".booking-form-section")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });
}

/* FORMULARIO DE RESERVA */
function initBookingForm() {
    const form = document.getElementById("bookingForm");
    const fecha = document.getElementById("fecha");
    if (!form) return;

    /* Fecha mínima: hoy */
    if (fecha) {
        fecha.min = new Date().toISOString().split("T")[0];
        fecha.value = fecha.min;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!validateBookingForm(form)) return;

        const data = {
            nombre: document.getElementById("nombre")?.value.trim(),
            apellidos: document.getElementById("apellidos")?.value.trim(),
            pasajes: document.getElementById("pasajes")?.value,
            fecha: fecha?.value,
            origen: document.getElementById("origen")?.value,
            destino: document.getElementById("destino")?.value,
        };

        handleBookingSubmit(data, form);
    });
}

function validateBookingForm(form) {
    let valid = true;

    /* Limpiar errores previos */
    form.querySelectorAll(".error-message").forEach((el) => el.remove());
    form.querySelectorAll(".form-input.error").forEach((el) => el.classList.remove("error"));

    form.querySelectorAll(".form-input[required]").forEach((input) => {
        if (!input.value.trim()) {
            showInputError(input, "Este campo es obligatorio");
            valid = false;
        }
    });

    /* Validar que fecha no sea pasada */
    const fecha = document.getElementById("fecha");
    if (fecha?.value) {
        const selected = new Date(fecha.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selected < today) {
            showInputError(fecha, "La fecha de viaje no puede ser anterior a hoy");
            valid = false;
        }
    }

    return valid;
}

function showInputError(input, message) {
    input.classList.add("error");
    input.setAttribute("aria-invalid", "true");

    const span = document.createElement("span");
    span.className = "error-message";
    span.textContent = message;
    input.parentNode.appendChild(span);
}

async function handleBookingSubmit(data, form) {
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Procesando...';
    }

    try {
        await new Promise((res) => setTimeout(res, 1600));

        window.showNotification(
            `¡Reserva iniciada! ${data.nombre}, te dirigimos al pago para tu vuelo a ${capitalize(data.destino)}.`,
            "success"
        );

    } catch {
        window.showNotification("Error al procesar la reserva. Intenta nuevamente.", "error");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-credit-card" aria-hidden="true"></i> Continuar al pago';
        }
    }
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    new Slider(".slider-wrapper");
    initTableReserve();
    initBookingForm();
});