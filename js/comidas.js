const state = {
    cart: [],
    favorites: new Set(),
    activeCategory: "all",
    activeFilters: new Set(),
    serviceCharge: 5.00,
    taxRate: 0.10,
};

/* UTILIDADES DE PRECIO */
function fmt(n) { return `$${n.toFixed(2)}`; }

function calcTotals() {
    const subtotal = state.cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = subtotal * state.taxRate;
    const total = subtotal + state.serviceCharge + tax;
    return { subtotal, service: state.serviceCharge, tax, total };
}

/* PERSISTENCIA */
function saveCart() { try { localStorage.setItem("menuCart", JSON.stringify(state.cart)); } catch { } }
function saveFavorites() { try { localStorage.setItem("menuFavorites", JSON.stringify([...state.favorites])); } catch { } }

function loadSaved() {
    try {
        const c = localStorage.getItem("menuCart");
        if (c) state.cart = JSON.parse(c);
    } catch { state.cart = []; }

    try {
        const f = localStorage.getItem("menuFavorites");
        if (f) state.favorites = new Set(JSON.parse(f));
    } catch { }
}

/* CARRITO — LÓGICA */
function addToCart(btn) {
    const { id, name, price } = btn.dataset;
    const parsedPrice = parseFloat(price);

    const existing = state.cart.find((i) => i.id === id);
    if (existing) {
        existing.quantity++;
    } else {
        state.cart.push({ id, name, price: parsedPrice, quantity: 1 });
    }

    animateAddButton(btn);
    updateCartBar();
    saveCart();
    window.showNotification(`${name} añadido al carrito`, "success");
}

function removeFromCart(id) {
    state.cart = state.cart.filter((i) => i.id !== id);
    updateCartBar();
    renderCartItems();
    saveCart();
}

function updateQuantity(id, qty) {
    if (qty <= 0) { removeFromCart(id); return; }
    const item = state.cart.find((i) => i.id === id);
    if (item) {
        item.quantity = qty;
        updateCartBar();
        renderCartItems();
        saveCart();
    }
}

function clearCart() {
    state.cart = [];
    updateCartBar();
    renderCartItems();
    saveCart();
    window.showNotification("Carrito vaciado", "info");
}

/* CARRITO — UI */
function updateCartBar() {
    const totalItems = state.cart.reduce((s, i) => s + i.quantity, 0);
    const { subtotal } = calcTotals();

    const countEl = document.getElementById("cartCount");
    const totalEl = document.getElementById("cartTotal");
    const bar = document.getElementById("cartSummary");

    if (countEl) countEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = subtotal.toFixed(2);
    if (bar) bar.classList.toggle("visible", totalItems > 0);
}

function renderCartItems() {
    const container = document.getElementById("cartItems");
    const emptyEl = document.getElementById("emptyCart");
    if (!container) return;

    const { subtotal, service, tax, total } = calcTotals();

    /* Totales */
    document.getElementById("modalSubtotal").textContent = fmt(subtotal);
    document.getElementById("modalService").textContent = fmt(service);
    document.getElementById("modalTax").textContent = fmt(tax);
    document.getElementById("modalTotal").textContent = fmt(total);

    if (state.cart.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        /* Eliminar items previos */
        container.querySelectorAll(".cart-item").forEach((el) => el.remove());
        return;
    }

    if (emptyEl) emptyEl.hidden = true;

    /* Reconstruir items usando delegación — sin onclick inline */
    container.querySelectorAll(".cart-item").forEach((el) => el.remove());

    state.cart.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.dataset.id = item.id;

        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">${fmt(item.price)} c/u</p>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn js-qty-down" aria-label="Reducir cantidad">
                    <i class="fas fa-minus" aria-hidden="true"></i>
                </button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn js-qty-up" aria-label="Aumentar cantidad">
                    <i class="fas fa-plus" aria-hidden="true"></i>
                </button>
                <button class="remove-btn js-remove" aria-label="Eliminar ${item.name}">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            </div>
            <div class="cart-item-total">${fmt(item.price * item.quantity)}</div>
        `;

        /* Delegación local — sin onclick global */
        div.querySelector(".js-qty-down").addEventListener("click", () => updateQuantity(item.id, item.quantity - 1));
        div.querySelector(".js-qty-up").addEventListener("click", () => updateQuantity(item.id, item.quantity + 1));
        div.querySelector(".js-remove").addEventListener("click", () => removeFromCart(item.id));

        container.appendChild(div);
    });
}

function animateAddButton(btn) {
    const menuItem = btn.closest(".menu-item");
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Añadiendo…';

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Añadido';
        menuItem?.classList.add("item-added");

        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-plus" aria-hidden="true"></i> Agregar';
            btn.disabled = false;
            menuItem?.classList.remove("item-added");
        }, 1400);
    }, 700);
}

/* MODALES */
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-close, #closeSuccessModal")?.focus();
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
}

function openCartModal() {
    renderCartItems();
    openModal("cartModal");
}

function confirmOrder() {
    if (state.cart.length === 0) {
        window.showNotification("Tu carrito está vacío", "warning");
        return;
    }

    const year = new Date().getFullYear();
    const num = String(Math.floor(Math.random() * 900) + 100);
    const orderN = `#ORD-${year}-${num}`;

    try {
        localStorage.setItem("lastOrder", JSON.stringify({
            orderNumber: orderN,
            items: [...state.cart],
            totals: calcTotals(),
            timestamp: new Date().toISOString(),
        }));
    } catch { }

    clearCart();
    closeModal("cartModal");

    const numEl = document.getElementById("orderNumber");
    if (numEl) numEl.textContent = orderN;
    openModal("successModal");
}

/* FILTROS DE CATEGORÍA Y DIETA */
function initFilters() {
    document.querySelectorAll(".filter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            state.activeCategory = tab.dataset.category;
            applyFilters();

            if (state.activeCategory !== "all") {
                document.querySelector(`[data-category="${state.activeCategory}"]`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    document.querySelectorAll(".dietary-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const f = btn.dataset.filter;
            if (state.activeFilters.has(f)) {
                state.activeFilters.delete(f);
                btn.classList.remove("active");
            } else {
                state.activeFilters.add(f);
                btn.classList.add("active");
            }
            applyFilters();
        });
    });
}

function applyFilters() {
    document.querySelectorAll(".menu-section").forEach((section) => {
        const cat = section.dataset.category;
        const show = state.activeCategory === "all" || state.activeCategory === cat;
        section.hidden = !show;
    });

    document.querySelectorAll(".menu-item").forEach((item) => {
        const section = item.closest(".menu-section");
        if (section?.hidden) return;

        const itemDiets = (item.dataset.dietary || "").split(" ");
        const dietMatch = state.activeFilters.size === 0
            || [...state.activeFilters].some((f) => itemDiets.includes(f));

        item.classList.toggle("filtered-out", !dietMatch);
    });
}

/* BÚSQUEDA */
function initSearch() {
    const input = document.getElementById("menuSearch");
    const clear = document.getElementById("clearSearch");
    if (!input) return;

    input.addEventListener("input", () => {
        const q = input.value.trim().toLowerCase();
        clear.hidden = !q;
        filterBySearch(q);
    });

    clear?.addEventListener("click", () => {
        input.value = "";
        clear.hidden = true;
        filterBySearch("");
        input.focus();
    });
}

function filterBySearch(query) {
    document.querySelectorAll(".menu-item").forEach((item) => {
        const name = item.querySelector("h3")?.textContent.toLowerCase() || "";
        const desc = item.querySelector(".item-description")?.textContent.toLowerCase() || "";
        const match = !query || name.includes(query) || desc.includes(query);
        item.classList.toggle("filtered-out", !match);
    });

    /* Ocultar secciones sin items visibles */
    document.querySelectorAll(".menu-section").forEach((section) => {
        const visible = section.querySelectorAll(".menu-item:not(.filtered-out)").length;
        section.hidden = visible === 0;
    });
}

/* FAVORITOS */
function initFavorites() {
    state.favorites.forEach((id) => {
        const btn = document.querySelector(`.favorite-btn[data-id="${id}"]`);
        if (btn) {
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
        }
    });

    document.querySelectorAll(".favorite-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const active = state.favorites.has(id);

            if (active) {
                state.favorites.delete(id);
                btn.classList.remove("active");
                btn.setAttribute("aria-pressed", "false");
            } else {
                state.favorites.add(id);
                btn.classList.add("active");
                btn.setAttribute("aria-pressed", "true");
            }

            /* Micro-animación */
            btn.style.transform = "scale(1.25)";
            setTimeout(() => { btn.style.transform = ""; }, 200);

            saveFavorites();
        });
    });
}

function initStatCounters() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll(".stat-number[data-count]").forEach((el) => {
            el.textContent = el.dataset.count;
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.6 }
    );

    document.querySelectorAll(".stat-number[data-count]").forEach((el) => observer.observe(el));
}

function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const steps = 50;
    const interval = 1800 / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(current);
        }
    }, interval);
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
                    }, i * 60);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".menu-item").forEach((el) => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.45s ease, transform 0.45s ease";
        observer.observe(el);
    });
}

/* EVENTOS GLOBALES */
function initEvents() {
    /* Botones "Agregar al carrito" */
    document.querySelectorAll(".add-to-cart").forEach((btn) => {
        btn.addEventListener("click", () => addToCart(btn));
    });

    /* Abrir carrito */
    document.getElementById("viewCartBtn")?.addEventListener("click", openCartModal);

    /* Cerrar carrito */
    document.getElementById("closeCartModal")?.addEventListener("click", () => closeModal("cartModal"));
    document.getElementById("cartBackdrop")?.addEventListener("click", () => closeModal("cartModal"));

    /* Limpiar carrito */
    document.getElementById("clearCartBtn")?.addEventListener("click", clearCart);

    /* Confirmar pedido */
    document.getElementById("confirmOrderBtn")?.addEventListener("click", confirmOrder);

    /* Cerrar modal de éxito */
    document.getElementById("closeSuccessModal")?.addEventListener("click", () => {
        closeModal("successModal");
        window.location.href = "index.html";
    });
    document.getElementById("successBackdrop")?.addEventListener("click", () => closeModal("successModal"));

    /* Escape para cerrar modales */
    document.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        if (!document.getElementById("cartModal")?.hidden) closeModal("cartModal");
        if (!document.getElementById("successModal")?.hidden) closeModal("successModal");
    });
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    loadSaved();
    initEvents();
    initFilters();
    initSearch();
    initFavorites();
    initStatCounters();
    initScrollAnimations();
    updateCartBar();
});

/* Guardar al salir */
window.addEventListener("beforeunload", () => {
    saveCart();
    saveFavorites();
});