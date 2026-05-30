const DESTINATIONS = [
    { id: "paris", name: "París, Francia", basePrice: 899, currency: "EUR", rating: 4.9, features: ["Monumentos", "Arte", "Gastronomía"], season: { high: [6, 7, 8], low: [1, 2, 11, 12] } },
    { id: "roma", name: "Roma, Italia", basePrice: 749, currency: "EUR", rating: 4.8, features: ["Historia", "Arquitectura", "Comida"], season: { high: [5, 6, 7, 8, 9], low: [1, 2, 12] } },
    { id: "barcelona", name: "Barcelona, España", basePrice: 599, currency: "EUR", rating: 4.7, features: ["Playas", "Gaudí", "Tapas"], season: { high: [6, 7, 8, 9], low: [1, 2, 3, 12] } },
    { id: "londres", name: "Londres, Reino Unido", basePrice: 699, currency: "GBP", rating: 4.6, features: ["Realeza", "Teatro", "Museos"], season: { high: [6, 7, 8], low: [1, 2, 11, 12] } },
    { id: "amsterdam", name: "Ámsterdam, Países Bajos", basePrice: 679, currency: "EUR", rating: 4.5, features: ["Canales", "Bicicletas", "Tulipanes"], season: { high: [4, 5, 6, 7, 8], low: [1, 2, 11, 12] } },
    { id: "praga", name: "Praga, República Checa", basePrice: 529, currency: "EUR", rating: 4.4, features: ["Castillos", "Cerveza", "Puentes"], season: { high: [5, 6, 7, 8, 9], low: [1, 2, 3, 11, 12] } },
];

const EXCHANGE_RATES = { EUR: 1, USD: 1.08, GBP: 0.86, JPY: 161.5 };
const CURRENCY_SYMBOLS = { EUR: "€", USD: "$", GBP: "£", JPY: "¥" };

const CLASS_MULTIPLIERS = { economica: 1, premium: 1.4, business: 2, primera: 3.2 };
const TAX_RATE = 0.12;

let currentCurrency = "EUR";

/* PRECIO CON TEMPORADA */
function seasonalPrice(dest, month) {
    let m = 1;
    if (dest.season.high.includes(month)) m = 1.3;
    else if (dest.season.low.includes(month)) m = 0.8;
    return Math.round(dest.basePrice * m);
}

function convertPrice(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;
    return Math.round((amount / EXCHANGE_RATES[fromCurrency]) * EXCHANGE_RATES[toCurrency]);
}

function formatPrice(amount, currency) {
    return `${CURRENCY_SYMBOLS[currency] || "€"}${amount.toLocaleString()}`;
}

function updateCardPrices() {
    const month = new Date().getMonth() + 1;

    document.querySelectorAll(".price-amount[data-base]").forEach((el) => {
        const base = parseInt(el.dataset.base, 10);
        const origCur = el.dataset.currency || "EUR";

        /* Precio base ajustado por temporada, en moneda original */
        const destObj = DESTINATIONS.find((d) => el.closest("[data-dest]")?.dataset.dest === d.id);
        const seasonal = destObj ? seasonalPrice(destObj, month) : base;

        /* Convertir a moneda seleccionada */
        const converted = convertPrice(seasonal, origCur, currentCurrency);
        el.textContent = formatPrice(converted, currentCurrency);
    });
}

/* SELECTOR DE MONEDA */
function initCurrencySelector() {
    const sel = document.getElementById("currencySelector");
    if (!sel) return;

    sel.addEventListener("change", () => {
        currentCurrency = sel.value;
        updateCardPrices();
        updatePriceEstimate();
    });
}

/* FILTROS DE DESTINOS */
function initFilters() {
    const buttons = document.querySelectorAll(".filter-btn");
    const cards = document.querySelectorAll(".destination-card");

    buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
            buttons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            const filter = btn.dataset.filter;

            cards.forEach((card) => {
                const categories = card.dataset.category || "";
                const show = filter === "all" || categories.includes(filter);

                card.style.display = show ? "" : "none";
                card.style.animation = show ? "fadeIn 0.4s ease" : "";
            });
        });
    });
}

function initCardBooking() {
    document.querySelectorAll(".destination-card .btn[data-dest]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const destId = btn.dataset.dest;
            const dest = DESTINATIONS.find((d) => d.id === destId);
            if (!dest) return;

            const select = document.getElementById("destino");
            if (select) {
                select.value = destId;
                select.style.boxShadow = "0 0 0 3px rgba(33, 147, 176, 0.4)";
                setTimeout(() => { select.style.boxShadow = ""; }, 1200);
            }

            updatePriceEstimate();

            document.getElementById("europaBookingForm")
                ?.scrollIntoView({ behavior: "smooth", block: "center" });

            window.showNotification(`Destino seleccionado: ${dest.name}`, "info");
        });
    });
}

function updatePriceEstimate() {
    const destinoSel = document.getElementById("destino")?.value;
    const claseSel = document.getElementById("clase")?.value || "economica";
    const pasajeros = parseInt(document.getElementById("pasajeros")?.value || "1", 10);
    const estimate = document.getElementById("priceEstimate");

    if (!destinoSel || !estimate) {
        estimate?.setAttribute("hidden", "");
        return;
    }

    const dest = DESTINATIONS.find((d) => d.id === destinoSel);
    if (!dest) return;

    const month = new Date().getMonth() + 1;
    const base = seasonalPrice(dest, month);
    const converted = convertPrice(base, dest.currency, currentCurrency);
    const classPrice = Math.round(converted * (CLASS_MULTIPLIERS[claseSel] || 1));
    const total = classPrice * pasajeros;
    const taxes = Math.round(total * TAX_RATE);
    const grand = total + taxes;

    document.getElementById("basePrice").textContent = formatPrice(total, currentCurrency);
    document.getElementById("taxes").textContent = formatPrice(taxes, currentCurrency);
    document.getElementById("totalPrice").textContent = formatPrice(grand, currentCurrency);

    estimate.removeAttribute("hidden");
}

function initPriceEstimate() {
    ["destino", "clase", "pasajeros"].forEach((id) => {
        document.getElementById(id)?.addEventListener("change", updatePriceEstimate);
    });
}

/* FORMULARIO DE RESERVA */
function initBookingForm() {
    const form = document.getElementById("europaBookingForm");
    const fechaIda = document.getElementById("fechaIda");
    if (!form) return;

    const todayStr = new Date().toISOString().split("T")[0];
    if (fechaIda) {
        fechaIda.min = todayStr;
        fechaIda.value = todayStr;

        fechaIda.addEventListener("change", () => {
            const fv = document.getElementById("fechaVuelta");
            if (!fv) return;
            const next = new Date(fechaIda.value);
            next.setDate(next.getDate() + 1);
            fv.min = next.toISOString().split("T")[0];
            if (fv.value && fv.value <= fechaIda.value) fv.value = fv.min;
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        let valid = true;
        form.querySelectorAll(".form-input[required]").forEach((input) => {
            input.parentNode.querySelector(".error-message")?.remove();
            input.classList.remove("error");
            if (!input.value.trim()) {
                input.classList.add("error");
                const span = document.createElement("span");
                span.className = "error-message";
                span.textContent = "Este campo es obligatorio";
                input.parentNode.appendChild(span);
                valid = false;
            }
        });

        if (!valid) {
            window.showNotification("Por favor completa todos los campos obligatorios", "warning");
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Buscando...';
        }

        try {
            await new Promise((res) => setTimeout(res, 1400));
            const destName = document.getElementById("destino")?.selectedOptions[0]?.text || "";
            window.showNotification(`¡Vuelos encontrados para ${destName}!`, "success");
        } catch {
            window.showNotification("Error al buscar vuelos. Intenta nuevamente.", "error");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-search" aria-hidden="true"></i> Buscar Vuelos';
            }
        }
    });
}

/* COMPARADOR DE DESTINOS */
let selectedForCompare = new Set();

function initComparator() {
    const cards = document.querySelectorAll(".destination-card");

    cards.forEach((card) => {
        const destId = card.dataset.dest;
        if (!destId) return;

        const btn = document.createElement("button");
        btn.className = "compare-toggle-btn";
        btn.dataset.dest = destId;
        btn.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Comparar';
        btn.setAttribute("aria-pressed", "false");

        card.querySelector(".card-content")?.appendChild(btn);

        btn.addEventListener("click", () => {
            const isSelected = selectedForCompare.has(destId);
            if (isSelected) {
                selectedForCompare.delete(destId);
                btn.classList.remove("selected");
                btn.setAttribute("aria-pressed", "false");
                btn.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Comparar';
            } else {
                if (selectedForCompare.size >= 3) {
                    window.showNotification("Puedes comparar hasta 3 destinos a la vez", "warning");
                    return;
                }
                selectedForCompare.add(destId);
                btn.classList.add("selected");
                btn.setAttribute("aria-pressed", "true");
                btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Seleccionado';
            }
            updateCompareBar();
        });
    });
}

function updateCompareBar() {
    let bar = document.getElementById("compareBar");

    if (selectedForCompare.size < 2) {
        bar?.remove();
        return;
    }

    if (!bar) {
        bar = document.createElement("div");
        bar.id = "compareBar";
        bar.className = "compare-bar";
        bar.innerHTML = `
            <span id="compareBarText"></span>
            <button class="btn btn--small" id="compareBarBtn">
                <i class="fas fa-balance-scale" aria-hidden="true"></i>
                Ver comparación
            </button>
        `;
        document.body.appendChild(bar);
        document.getElementById("compareBarBtn")?.addEventListener("click", showComparisonModal);
    }

    document.getElementById("compareBarText").textContent =
        `${selectedForCompare.size} destinos seleccionados`;
}

function showComparisonModal() {
    const dests = DESTINATIONS.filter((d) => selectedForCompare.has(d.id));
    if (dests.length < 2) return;

    const modal = document.createElement("div");
    modal.className = "comparison-modal";

    const month = new Date().getMonth() + 1;
    const headers = dests.map((d) => `<th>${d.name}</th>`).join("");
    const prices = dests.map((d) => {
        const p = convertPrice(seasonalPrice(d, month), d.currency, currentCurrency);
        return `<td><strong>${formatPrice(p, currentCurrency)}</strong></td>`;
    }).join("");
    const ratings = dests.map((d) => `<td>⭐ ${d.rating}</td>`).join("");
    const features = dests.map((d) =>
        `<td>${d.features.map((f) => `<span class="comparison-badge">${f}</span>`).join("")}</td>`
    ).join("");

    modal.innerHTML = `
        <div class="comparison-modal__backdrop"></div>
        <div class="comparison-modal__content" role="dialog" aria-modal="true" aria-label="Comparación de destinos">
            <div class="comparison-modal__header">
                <h2>Comparación de Destinos</h2>
                <button class="comparison-modal__close" aria-label="Cerrar">
                    <i class="fas fa-times" aria-hidden="true"></i>
                </button>
            </div>
            <div class="comparison-table">
                <table>
                    <thead>
                        <tr><th>Aspecto</th>${headers}</tr>
                    </thead>
                    <tbody>
                        <tr><td>Precio estimado</td>${prices}</tr>
                        <tr><td>Valoración</td>${ratings}</tr>
                        <tr><td>Destacados</td>${features}</tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.querySelector(".comparison-modal__close")?.focus();

    const close = () => modal.remove();
    modal.querySelector(".comparison-modal__close")?.addEventListener("click", close);
    modal.querySelector(".comparison-modal__backdrop")?.addEventListener("click", close);
    document.addEventListener("keydown", function onKey(e) {
        if (e.key === "Escape") { close(); document.removeEventListener("keydown", onKey); }
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
                    }, i * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".destination-card, .tip-card").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
        observer.observe(el);
    });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    new Slider(".slider-wrapper");
    updateCardPrices();
    initCurrencySelector();
    initFilters();
    initCardBooking();
    initPriceEstimate();
    initBookingForm();
    initComparator();
    initAnimations();
});