const FAQ_DATA = [
    { q: "check-in", text: "¿Con cuánta anticipación debo hacer el check-in?" },
    { q: "equipaje mano", text: "¿Cuál es la política de equipaje de mano?" },
    { q: "cambiar fecha", text: "¿Puedo cambiar la fecha de mi vuelo?" },
    { q: "reembolso", text: "¿Cómo solicito un reembolso?" },
    { q: "documentos visa", text: "¿Qué documentos necesito para viajar al extranjero?" },
    { q: "cancelar vuelo", text: "¿Cómo cancelo mi reserva?" },
    { q: "mascota", text: "¿Puedo viajar con mi mascota?" },
    { q: "seleccionar asiento", text: "¿Cómo selecciono mi asiento?" },
    { q: "equipaje facturado", text: "¿Cuántos kilos de equipaje facturado puedo llevar?" },
    { q: "niños menores", text: "¿Pueden viajar solos los menores de edad?" },
];

/* BÚSQUEDA */
function initSearch() {
    const input = document.getElementById("helpSearchInput");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;

    let debounceTimer;

    input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toLowerCase();
            renderSearchResults(query, results);
        }, 250);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            input.value = "";
            results.innerHTML = "";
        }
    });

    /* Botón buscar */
    document.querySelector(".help-search__btn")?.addEventListener("click", () => {
        const query = input.value.trim().toLowerCase();
        renderSearchResults(query, results);
    });
}

function renderSearchResults(query, container) {
    if (!query || query.length < 2) {
        container.innerHTML = "";
        return;
    }

    const matches = FAQ_DATA.filter(
        (item) => item.q.includes(query) || item.text.toLowerCase().includes(query)
    );

    if (!matches.length) {
        container.innerHTML = `<p class="search-no-results">
            <i class="fas fa-info-circle"></i>
            No encontramos resultados para "<strong>${escapeHtml(query)}</strong>".
            Prueba con otra búsqueda o contáctanos.
        </p>`;
        return;
    }

    container.innerHTML = matches
        .map((item) => `
            <div class="search-result-item" role="option" tabindex="0" data-question="${escapeHtml(item.text)}">
                <i class="fas fa-question-circle" aria-hidden="true"></i>
                ${escapeHtml(item.text)}
            </div>
        `)
        .join("");

    /* Al hacer clic en un resultado, desplazarse al FAQ y abrirlo */
    container.querySelectorAll(".search-result-item").forEach((el) => {
        el.addEventListener("click", () => openMatchingFaq(el.dataset.question));
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter") openMatchingFaq(el.dataset.question);
        });
    });
}

function openMatchingFaq(questionText) {
    const faqButtons = document.querySelectorAll(".faq-question");

    for (const btn of faqButtons) {
        if (btn.textContent.trim().includes(questionText.trim())) {
            btn.closest(".faq-item")?.scrollIntoView({ behavior: "smooth", block: "center" });
            if (btn.getAttribute("aria-expanded") !== "true") btn.click();
            return;
        }
    }

    /* Si no hay coincidencia exacta, scroll a la sección FAQ */
    document.getElementById("faqList")?.scrollIntoView({ behavior: "smooth" });
}

/* ACORDEÓN DE FAQ */
function initFaqAccordion() {
    document.querySelectorAll(".faq-question").forEach((btn) => {
        btn.addEventListener("click", () => {
            const isOpen = btn.getAttribute("aria-expanded") === "true";
            const answer = btn.nextElementSibling;

            /* Cerrar todos los demás */
            document.querySelectorAll(".faq-question").forEach((other) => {
                if (other !== btn) {
                    other.setAttribute("aria-expanded", "false");
                    other.nextElementSibling?.setAttribute("hidden", "");
                }
            });

            if (isOpen) {
                btn.setAttribute("aria-expanded", "false");
                answer?.setAttribute("hidden", "");
            } else {
                btn.setAttribute("aria-expanded", "true");
                answer?.removeAttribute("hidden");
            }
        });
    });
}

/* MODAL DE VIDEO */
function initVideoModal() {
    const modal = document.getElementById("videoModal");
    const iframe = document.getElementById("tutorialVideo");
    const openBtn = document.getElementById("videoBtn");
    const closeBtn = document.getElementById("closeVideo");
    const backdrop = modal?.querySelector(".video-modal__backdrop");

    if (!modal || !iframe || !openBtn) return;

    openBtn.addEventListener("click", () => {
        if (!iframe.src && iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
        }
        modal.removeAttribute("hidden");
        closeBtn?.focus();
        document.body.style.overflow = "hidden";
    });

    function closeModal() {
        modal.setAttribute("hidden", "");
        iframe.src = "";
        document.body.style.overflow = "";
        openBtn.focus();
    }

    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    /* Cerrar con Escape */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hasAttribute("hidden")) closeModal();
    });
}

/* BOTONES DE CONTACTO */
function initContactButtons() {
    document.getElementById("chatBtn")?.addEventListener("click", () => {
        window.showNotification("Conectando con un agente… Por favor espera.", "info");
        /* En producción: abrir widget de chat real */
    });

    document.getElementById("emailBtn")?.addEventListener("click", () => {
        const mailtoLink = "mailto:soporte@destinosmundiales.com?subject=Consulta%20desde%20Centro%20de%20Ayuda";
        window.location.href = mailtoLink;
    });
}

/* ANIMACIONES DE ENTRADA */
function initCardAnimations() {
    if (!("IntersectionObserver" in window)) return;

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

    document.querySelectorAll(".category-card, .contact-card").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        observer.observe(el);
    });
}

function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    initSearch();
    initFaqAccordion();
    initVideoModal();
    initContactButtons();
    initCardAnimations();
});