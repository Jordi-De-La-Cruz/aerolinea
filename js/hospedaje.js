class HospedajeManager {
    constructor() {
        this.searchForm = document.getElementById("hotelSearchForm");
        this.destinationInput = document.getElementById("destinationInput");
        this.suggestionsBox = document.getElementById("destinationSuggestions");
        this.checkinDate = document.getElementById("checkinDate");
        this.checkoutDate = document.getElementById("checkoutDate");
        this.guestsSelect = document.getElementById("guestsSelect");
        this.roomsSelect = document.getElementById("roomsSelect");
        this.loadMoreBtn = document.getElementById("loadMoreBtn");
        this.hotelCards = document.querySelectorAll(".hotel-card");

        this.favorites = this.loadFavorites();
        this.currentPage = 1;

        this.destinations = [
            "Buenos Aires, Argentina",
            "Medellín, Colombia",
            "Cusco, Perú",
            "Caracas, Venezuela",
            "Quito, Ecuador",
            "Miami, Estados Unidos",
            "Puerto Plata, República Dominicana",
            "París, Francia",
            "Madrid, España",
            "Roma, Italia",
            "Londres, Reino Unido",
            "Tokio, Japón",
            "Bangkok, Tailandia",
            "Bali, Indonesia",
            "Cancún, México",
        ];

        this.init();
    }

    init() {
        this.setupSearch();
        this.setupDateInputs();
        this.setupDestinationAutocomplete();
        this.setupFavoriteButtons(this.hotelCards);
        this.setupLoadMore();
        this.setupCardAnimations();
        this.initDates();
    }

    /* BÚSQUEDA */
    setupSearch() {
        if (!this.searchForm) return;

        this.searchForm.addEventListener("submit", (e) => this.handleSubmit(e));

        [this.checkinDate, this.checkoutDate].forEach((input) => {
            input?.addEventListener("change", () => this.validateDates());
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        const dest = this.destinationInput?.value.trim();
        const checkin = this.checkinDate?.value;
        const checkout = this.checkoutDate?.value;

        if (!dest || !checkin || !checkout) {
            window.showNotification("Por favor completa todos los campos de búsqueda", "warning");
            return;
        }

        if (!this.validateDates()) return;

        this.setSearchLoading(true);

        try {
            await new Promise((res) => setTimeout(res, 1400));

            this.filterCards(dest);
            window.showNotification(`Mostrando hoteles para: ${dest}`, "success");

            document.querySelector(".featured-hotels")?.scrollIntoView({ behavior: "smooth" });
        } catch {
            window.showNotification("Error al buscar hoteles. Intenta nuevamente.", "error");
        } finally {
            this.setSearchLoading(false);
        }
    }

    filterCards(destination) {
        const query = destination.toLowerCase();

        this.hotelCards.forEach((card) => {
            const location = card.querySelector(".hotel-location span")?.textContent.toLowerCase() || "";
            const matches = location.includes(query) || query.includes(location.split(",")[0].trim());

            card.style.display = matches ? "" : "none";
            card.classList.toggle("search-match", matches);
        });
    }

    setSearchLoading(active) {
        const btn = this.searchForm?.querySelector(".search-btn");
        if (!btn) return;

        btn.disabled = active;
        btn.innerHTML = active
            ? '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Buscando...'
            : '<i class="fas fa-search" aria-hidden="true"></i> Buscar Hoteles';
    }

    /* VALIDACIÓN DE FECHAS */
    setupDateInputs() {
        const todayStr = new Date().toISOString().split("T")[0];

        if (this.checkinDate) this.checkinDate.min = todayStr;
        if (this.checkoutDate) this.checkoutDate.min = todayStr;

        this.checkinDate?.addEventListener("change", () => {
            if (!this.checkoutDate) return;
            const next = new Date(this.checkinDate.value);
            next.setDate(next.getDate() + 1);
            this.checkoutDate.min = next.toISOString().split("T")[0];

            /* Corregir checkout si queda antes del checkin */
            if (this.checkoutDate.value && this.checkoutDate.value <= this.checkinDate.value) {
                this.checkoutDate.value = next.toISOString().split("T")[0];
            }
        });
    }

    initDates() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (this.checkinDate && !this.checkinDate.value)
            this.checkinDate.value = today.toISOString().split("T")[0];
        if (this.checkoutDate && !this.checkoutDate.value)
            this.checkoutDate.value = tomorrow.toISOString().split("T")[0];
    }

    validateDates() {
        this.clearFieldErrors();

        const checkin = new Date(this.checkinDate?.value);
        const checkout = new Date(this.checkoutDate?.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkin < today) {
            this.showFieldError(this.checkinDate, "La fecha de entrada no puede ser anterior a hoy");
            return false;
        }

        if (checkout <= checkin) {
            this.showFieldError(this.checkoutDate, "La salida debe ser posterior a la entrada");
            return false;
        }

        return true;
    }

    showFieldError(field, message) {
        if (!field) return;
        field.style.borderColor = "var(--danger)";

        const err = document.createElement("div");
        err.className = "field-error";
        err.textContent = message;
        field.parentNode.appendChild(err);
    }

    clearFieldErrors() {
        document.querySelectorAll(".field-error").forEach((el) => el.remove());
        [this.checkinDate, this.checkoutDate].forEach((f) => {
            if (f) f.style.borderColor = "";
        });
    }

    /* AUTOCOMPLETE DE DESTINO */
    setupDestinationAutocomplete() {
        if (!this.destinationInput || !this.suggestionsBox) return;

        this.destinationInput.addEventListener("input", () => {
            const q = this.destinationInput.value.trim();
            if (q.length < 2) { this.hideSuggestions(); return; }

            const matches = this.destinations.filter((d) =>
                d.toLowerCase().includes(q.toLowerCase())
            );
            this.showSuggestions(matches);
        });

        this.destinationInput.addEventListener("focus", () => {
            if (!this.destinationInput.value) {
                this.showSuggestions(this.destinations.slice(0, 6));
            }
        });

        /* Cerrar al hacer clic fuera */
        document.addEventListener("click", (e) => {
            if (!e.target.closest(".search-field")) this.hideSuggestions();
        });
    }

    showSuggestions(list) {
        if (!list.length) { this.hideSuggestions(); return; }

        this.suggestionsBox.innerHTML = list
            .map((dest) => `
                <div class="suggestion-item" role="option" tabindex="0"
                     data-value="${dest}">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    ${dest}
                </div>
            `)
            .join("");

        /* Delegación de eventos en lugar de onclick inline */
        this.suggestionsBox.querySelectorAll(".suggestion-item").forEach((item) => {
            item.addEventListener("click", () => this.selectDestination(item.dataset.value));
            item.addEventListener("keydown", (e) => {
                if (e.key === "Enter") this.selectDestination(item.dataset.value);
            });
        });

        this.suggestionsBox.style.display = "block";
    }

    selectDestination(value) {
        if (this.destinationInput) this.destinationInput.value = value;
        this.hideSuggestions();
    }

    hideSuggestions() {
        if (this.suggestionsBox) this.suggestionsBox.style.display = "none";
    }

    /* FAVORITOS */
    loadFavorites() {
        try {
            return JSON.parse(localStorage.getItem("hotelFavorites") || "[]");
        } catch {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem("hotelFavorites", JSON.stringify(this.favorites));
        } catch { /* Storage bloqueado */ }
    }

    setupFavoriteButtons(cards) {
        cards.forEach((card) => {
            const btn = card.querySelector(".hotel-card__favorite");
            const name = card.querySelector("h3")?.textContent.trim() || "";
            if (!btn) return;

            if (this.favorites.includes(name)) this.markFavorite(btn, true);

            btn.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleFavorite(btn, name);
            });
        });
    }

    toggleFavorite(btn, name) {
        const isFav = this.favorites.includes(name);

        if (isFav) {
            this.favorites = this.favorites.filter((n) => n !== name);
            this.markFavorite(btn, false);
            window.showNotification(`${name} eliminado de favoritos`, "info");
        } else {
            this.favorites.push(name);
            this.markFavorite(btn, true);
            window.showNotification(`${name} añadido a favoritos`, "success");
        }

        this.saveFavorites();
    }

    markFavorite(btn, active) {
        const icon = btn.querySelector("i");
        if (icon) {
            icon.className = active ? "fas fa-heart" : "far fa-heart";
        }
        btn.classList.toggle("is-favorite", active);
        btn.setAttribute("aria-label", active ? "Quitar de favoritos" : "Agregar a favoritos");
    }

    /* CARGAR MÁS HOTELES */
    setupLoadMore() {
        if (!this.loadMoreBtn) return;

        this.loadMoreBtn.addEventListener("click", () => this.loadMore());
    }

    async loadMore() {
        const original = this.loadMoreBtn.innerHTML;
        this.loadMoreBtn.disabled = true;
        this.loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Cargando...';

        try {
            /* Simulación — reemplazar con fetch real */
            await new Promise((res) => setTimeout(res, 1400));

            const extras = this.getExtraHotels();
            this.appendCards(extras);
            this.currentPage++;
            window.showNotification("¡Más hoteles cargados!", "success");

            if (this.currentPage >= 3) this.loadMoreBtn.style.display = "none";
        } catch {
            window.showNotification("Error al cargar más hoteles", "error");
        } finally {
            this.loadMoreBtn.innerHTML = original;
            this.loadMoreBtn.disabled = false;
        }
    }

    getExtraHotels() {
        return [
            { name: "Hotel Paradise Resort", location: "Cancún, México", price: "$180", stars: 4, reviews: 234, amenities: ["Playa", "Spa", "Todo incluido"] },
            { name: "Urban Boutique Hotel", location: "Barcelona, España", price: "€160", stars: 4, reviews: 156, amenities: ["Centro", "Diseño", "Rooftop"] },
            { name: "Mountain Lodge", location: "Aspen, Estados Unidos", price: "$320", stars: 5, reviews: 89, amenities: ["Montaña", "Ski", "Spa"] },
        ];
    }

    appendCards(hotels) {
        const grid = document.querySelector(".hotels-grid");
        if (!grid) return;

        hotels.forEach((hotel, i) => {
            const card = this.buildCard(hotel);
            card.style.opacity = "0";
            card.style.transform = "translateY(24px)";
            grid.appendChild(card);

            /* Animar entrada escalonada */
            setTimeout(() => {
                card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            }, i * 150);
        });
    }

    buildCard(hotel) {
        const filled = "fas fa-star";
        const empty = "far fa-star";
        const stars = Array.from({ length: 5 }, (_, i) =>
            `<i class="${i < hotel.stars ? filled : empty}" aria-hidden="true"></i>`
        ).join("");

        const amenityTags = hotel.amenities.map((a) =>
            `<span class="amenity-tag"><i class="fas fa-check" aria-hidden="true"></i> ${a}</span>`
        ).join("");

        const card = document.createElement("article");
        card.className = "hotel-card hover-lift";
        card.innerHTML = `
            <div class="hotel-card__image">
                <img src="img/hotel-placeholder.jpg" alt="${hotel.name}" loading="lazy" />
                <button class="hotel-card__favorite" aria-label="Agregar a favoritos">
                    <i class="far fa-heart" aria-hidden="true"></i>
                </button>
            </div>
            <div class="hotel-card__content">
                <h3>${hotel.name}</h3>
                <div class="hotel-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                    <span>${hotel.location}</span>
                </div>
                <div class="hotel-rating">
                    <div class="stars" aria-label="${hotel.stars} de 5 estrellas">${stars}</div>
                    <span>${hotel.stars}.0/5 (${hotel.reviews} reseñas)</span>
                </div>
                <div class="hotel-amenities">${amenityTags}</div>
                <div class="hotel-price">
                    <span class="price-from">Desde</span>
                    <span class="price-amount">${hotel.price}</span>
                    <span class="price-period">/ noche</span>
                </div>
                <a href="#" class="btn btn--secondary">Ver Detalles</a>
            </div>
        `;

        /* Conectar favoritos a la nueva card */
        this.setupFavoriteButtons([card]);
        return card;
    }

    /* ANIMACIONES DE ENTRADA */
    setupCardAnimations() {
        if (!("IntersectionObserver" in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("fade-in");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
        );

        document.querySelectorAll(".hotel-card, .premium-card, .feature-item")
            .forEach((el) => observer.observe(el));
    }
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    window.hospedajeManager = new HospedajeManager();
});