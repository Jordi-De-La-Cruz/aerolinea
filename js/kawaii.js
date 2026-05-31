const KAWAII_DESTINATIONS = {
    conejitos: {
        name: "Conejitos Kawaii",
        emoji: "🐰",
        locations: ["Okunoshima, Japón", "Campos de Tulipanes, Holanda", "Sanctuary Farm, Australia"],
        features: [["🎫", "Entrada a santuarios"], ["📸", "Sesión de fotos kawaii"], ["🎁", "Kit de souvenirs"], ["🍽️", "Comida temática"]],
    },
    gatitos: {
        name: "Gatitos Kawaii",
        emoji: "🐱",
        locations: ["Cat Café Tokyo, Japón", "Isla Tashirojima, Japón", "Santorini Cat Welfare, Grecia"],
        features: [["🎫", "Entrada a cafeterías"], ["📸", "Fotos con los gatos"], ["🎁", "Souvenirs felinos"], ["☕", "Café temático"]],
    },
    patitos: {
        name: "Patitos Kawaii",
        emoji: "🐣",
        locations: ["Central Park, Nueva York", "Lago Bled, Eslovenia", "Parque Retiro, Madrid"],
        features: [["🎫", "Acceso a parques"], ["📸", "Sesión fotográfica"], ["🎁", "Pato de recuerdo"], ["🌿", "Picnic a la orilla"]],
    },
    pandas: {
        name: "Pandas Kawaii",
        emoji: "🐼",
        locations: ["Chengdu Research Base, China", "Zoológico de San Diego, USA", "Reserva de Wolong, China"],
        features: [["🎫", "Tour guiado"], ["📸", "Foto con el panda"], ["🎁", "Peluche oficial"], ["🍃", "Alimentación de bambú"]],
    },
    pinguinos: {
        name: "Pingüinos Kawaii",
        emoji: "🐧",
        locations: ["Antártida", "Península Valdés, Argentina", "Isla Phillip, Australia"],
        features: [["🎫", "Expedición polar"], ["📸", "Foto en el hielo"], ["🎁", "Kit explorador"], ["🧊", "Experiencia ártica"]],
    },
    koalas: {
        name: "Koalas Kawaii",
        emoji: "🐨",
        locations: ["Kangaroo Island, Australia", "Great Otway National Park", "Lone Pine Sanctuary"],
        features: [["🎫", "Visita al santuario"], ["📸", "Foto con koala"], ["🎁", "Eucalipto de recuerdo"], ["🌿", "Tour naturaleza"]],
    },
};

/* MODAL */
const modal = document.getElementById("kawaiiModal");
const body = document.getElementById("kawaiiModalBody");
const closeBtn = document.getElementById("kawaiiModalClose");
const backdrop = document.getElementById("kawaiiBackdrop");

function openModal(destKey) {
    const dest = KAWAII_DESTINATIONS[destKey];
    if (!dest || !modal || !body) return;

    body.innerHTML = `
        <h2>${dest.emoji} ${dest.name} ${dest.emoji}</h2>
        <p>¡Descubre los lugares más adorables para encontrar ${dest.name.toLowerCase()}!</p>

        <div class="kawaii-locations">
            <h3>🌍 Destinos Principales:</h3>
            <ul>
                ${dest.locations.map((l) => `<li><span aria-hidden="true">📍</span> ${l}</li>`).join("")}
            </ul>
        </div>

        <div class="kawaii-features">
            <h3>✨ Lo que incluye tu aventura:</h3>
            <div class="feature-grid">
                ${dest.features.map(([e, t]) => `
                    <div class="feature-item">
                        <span class="feature-emoji" aria-hidden="true">${e}</span>
                        <span>${t}</span>
                    </div>`).join("")}
            </div>
        </div>

        <div class="kawaii-modal__footer">
            <button class="btn kawaii-btn js-reserve" data-name="${dest.name}" data-emoji="${dest.emoji}">
                <i class="fas fa-heart" aria-hidden="true"></i>
                ¡Reservar Ahora!
            </button>
        </div>
    `;

    /* Botón de reserva dentro del modal */
    body.querySelector(".js-reserve")?.addEventListener("click", (e) => {
        const { name, emoji } = e.currentTarget.dataset;
        handleReservation(name, emoji);
        closeModal();
    });

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    closeBtn?.focus();
}

function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
}

function initModal() {
    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal?.hidden) closeModal();
    });
}

/* RESERVA */
function handleReservation(name, emoji) {
    createHeartExplosion();
    window.showNotification(`${emoji} ¡Reserva para ${name} en proceso con mucho amor! 💖`, "success");
}

function createHeartExplosion() {
    const hearts = ["💖", "💕", "💗", "💓", "💘", "💝"];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 10; i++) {
        const el = document.createElement("span");
        el.textContent = hearts[i % hearts.length];
        el.setAttribute("aria-hidden", "true");

        const angle = (i / 10) * Math.PI * 2;
        const dist = 120 + Math.random() * 80;

        Object.assign(el.style, {
            position: "fixed",
            left: `${cx}px`,
            top: `${cy}px`,
            fontSize: "2.2rem",
            pointerEvents: "none",
            zIndex: "9999",
            transition: "all 1.2s ease-out",
            opacity: "1",
            transform: "translate(-50%,-50%)",
        });

        document.body.appendChild(el);

        requestAnimationFrame(() => {
            el.style.transform = `translate(${Math.cos(angle) * dist - 16}px, ${Math.sin(angle) * dist - 16}px) scale(0.2)`;
            el.style.opacity = "0";
        });

        setTimeout(() => el.remove(), 1200);
    }
}

/* EFECTOS DE LAS TARJETAS */
function initCardEffects() {
    document.querySelectorAll(".kawaii-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
            const title = card.querySelector(".kawaii-card__title");
            if (title) {
                title.style.animation = "kawaiiBounce 0.6s ease";
                setTimeout(() => { title.style.animation = ""; }, 600);
            }
            spawnFloatingHearts(card);
        });
    });
}

function spawnFloatingHearts(card) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const hearts = ["💖", "💕", "💗"];
    for (let i = 0; i < 3; i++) {
        const h = document.createElement("span");
        h.textContent = hearts[i];
        h.setAttribute("aria-hidden", "true");
        Object.assign(h.style, {
            position: "absolute",
            left: `${20 + Math.random() * 60}%`,
            bottom: "0",
            fontSize: "1.4rem",
            opacity: "0.85",
            pointerEvents: "none",
            animation: "floatUp 1.8s ease-out forwards",
            zIndex: "5",
        });
        card.style.position = "relative";
        card.appendChild(h);
        setTimeout(() => h.remove(), 1800);
    }
}

/* BOTONES "EXPLORAR DESTINO" */
function initExploreButtons() {
    document.querySelectorAll(".kawaii-btn[data-destination]").forEach((btn) => {
        btn.addEventListener("click", () => {
            openModal(btn.dataset.destination);
        });
    });
}

/* ANIMACIONES DE ENTRADA */
function initScrollAnimations() {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = "1";
                        entry.target.style.transform = "translateY(0)";
                    }, i * 100);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".kawaii-card").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(24px)";
        el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(el);
    });
}

function initDecorations() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const kawaiEmojis = ["🐰", "🐱", "🐣", "🐼", "🐧", "🐨", "💖", "✨", "🌟", "💫", "🎀", "🌸", "💕", "⭐", "🦄"];

    document.querySelectorAll(".kawaii-decoration").forEach((el, i) => {
        setInterval(() => {
            el.style.transform = "scale(0)";
            setTimeout(() => {
                const next = kawaiEmojis[Math.floor(Math.random() * kawaiEmojis.length)];
                el.textContent = next;
                el.style.transform = "scale(1)";
            }, 200);
        }, 6000 + i * 900);
    });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    initModal();
    initExploreButtons();
    initCardEffects();
    initScrollAnimations();
    initDecorations();
});