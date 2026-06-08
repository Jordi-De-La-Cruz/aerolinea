const cart = {
    items: [],

    add(id, price, name, img) {
        const existing = this.items.find((i) => i.id === id);
        if (existing) {
            existing.qty++;
        } else {
            this.items.push({ id, price: parseFloat(price), name, img, qty: 1 });
        }
        this.save();
    },

    remove(id) {
        this.items = this.items.filter((i) => i.id !== id);
        this.save();
    },

    updateQty(id, qty) {
        if (qty <= 0) { this.remove(id); return; }
        const item = this.items.find((i) => i.id === id);
        if (item) { item.qty = qty; this.save(); }
    },

    total() {
        return this.items.reduce((s, i) => s + i.price * i.qty, 0);
    },

    count() {
        return this.items.reduce((s, i) => s + i.qty, 0);
    },

    save() {
        try { localStorage.setItem("navCart", JSON.stringify(this.items)); } catch { }
    },

    load() {
        try {
            const saved = localStorage.getItem("navCart");
            if (saved) this.items = JSON.parse(saved);
        } catch { this.items = []; }
    },
};

/* Carrito UI */
function renderCart() {
    const container = document.getElementById("cartItems");
    const emptyEl = document.getElementById("cartEmpty");
    const totalEl = document.getElementById("cartTotal");
    const countEl = document.getElementById("cartCount");
    const floatingEl = document.getElementById("cartFloating");

    if (!container) return;

    const count = cart.count();
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = cart.total().toFixed(2);
    if (floatingEl) floatingEl.classList.toggle("has-items", count > 0);

    /* Limpiar items anteriores */
    container.querySelectorAll(".cart-line").forEach((el) => el.remove());

    if (cart.items.length === 0) {
        if (emptyEl) emptyEl.hidden = false;
        return;
    }

    if (emptyEl) emptyEl.hidden = true;

    cart.items.forEach((item) => {
        const div = document.createElement("div");
        div.className = "cart-line";
        div.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="cart-line__img" />
            <div class="cart-line__info">
                <span class="cart-line__name">${item.name}</span>
                <span class="cart-line__price">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
            <div class="cart-line__controls">
                <button class="qty-btn js-qty-down" aria-label="Reducir cantidad">−</button>
                <span>${item.qty}</span>
                <button class="qty-btn js-qty-up" aria-label="Aumentar cantidad">+</button>
                <button class="qty-btn js-remove" aria-label="Eliminar ${item.name}">
                    <i class="fas fa-trash" aria-hidden="true"></i>
                </button>
            </div>`;

        div.querySelector(".js-qty-down").addEventListener("click", () => {
            cart.updateQty(item.id, item.qty - 1);
            renderCart();
        });
        div.querySelector(".js-qty-up").addEventListener("click", () => {
            cart.updateQty(item.id, item.qty + 1);
            renderCart();
        });
        div.querySelector(".js-remove").addEventListener("click", () => {
            cart.remove(item.id);
            renderCart();
            window.showNotification(`${item.name} eliminado del carrito`, "info");
        });

        container.appendChild(div);
    });
}

/* Toggle carrito */
function initCartToggle() {
    const dropdown = document.getElementById("cartDropdown");
    const toggleBtn = document.getElementById("cartToggleBtn");
    const closeBtn = document.getElementById("cartCloseBtn");

    if (!dropdown) return;

    function open() { dropdown.hidden = false; toggleBtn?.setAttribute("aria-expanded", "true"); }
    function close() { dropdown.hidden = true; toggleBtn?.setAttribute("aria-expanded", "false"); }
    function toggle() { dropdown.hidden ? open() : close(); }

    toggleBtn?.addEventListener("click", toggle);
    closeBtn?.addEventListener("click", close);

    /* Cerrar con Escape */
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !dropdown.hidden) close();
    });

    /* Cerrar al hacer clic fuera */
    document.addEventListener("click", (e) => {
        const floating = document.getElementById("cartFloating");
        if (floating && !floating.contains(e.target) && !dropdown.hidden) close();
    });
}

/* Botones "Agregar al carrito" */
function initAddToCartButtons() {
    document.querySelectorAll(".js-add-cart").forEach((btn) => {
        btn.addEventListener("click", () => {
            const { id, price, name, img } = btn.dataset;
            cart.add(id, price, name, img);
            renderCart();
            window.showNotification(`${name} añadido al carrito`, "success");

            /* Micro-animación */
            btn.disabled = true;
            const original = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Añadido';
            setTimeout(() => {
                btn.innerHTML = original;
                btn.disabled = false;
            }, 1400);
        });
    });
}

/* Botones de favorito */
function initFavoriteButtons() {
    document.querySelectorAll(".js-favorite").forEach((btn) => {
        btn.addEventListener("click", () => {
            const active = btn.getAttribute("aria-pressed") === "true";
            const icon = btn.querySelector("i");

            btn.setAttribute("aria-pressed", !active);
            icon?.classList.toggle("far", active);
            icon?.classList.toggle("fas", !active);
            icon?.classList.toggle("text-danger", !active);

            btn.style.transform = "scale(1.2)";
            setTimeout(() => { btn.style.transform = ""; }, 200);

            window.showNotification(
                active ? "Eliminado de favoritos" : "¡Guardado en favoritos!",
                active ? "info" : "success"
            );
        });
    });
}

/* Checkout */
function initCheckout() {
    document.getElementById("checkoutBtn")?.addEventListener("click", () => {
        if (cart.items.length === 0) {
            window.showNotification("Tu carrito está vacío", "warning");
            return;
        }
        window.showNotification("Redirigiendo al pago...", "success");
        setTimeout(() => { window.location.href = "tarjeta.html"; }, 1200);
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    cart.load();
    renderCart();
    initCartToggle();
    initAddToCartButtons();
    initFavoriteButtons();
    initCheckout();
});

window.addEventListener("beforeunload", () => cart.save());