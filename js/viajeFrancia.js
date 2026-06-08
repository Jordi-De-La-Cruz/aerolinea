function initBookButton() {
    document.getElementById("bookNowBtn")?.addEventListener("click", () => {
        window.showNotification("Redirigiendo al pago...", "success");
        setTimeout(() => { window.location.href = "tarjeta.html"; }, 1200);
    });
}

/* Botón Guardar Favorito */
function initSaveButton() {
    const btn = document.getElementById("saveBtn");
    if (!btn) return;

    const key = "francia_saved";
    const icon = btn.querySelector("i");
    const saved = localStorage.getItem(key) === "true";

    if (saved) {
        btn.classList.add("active");
        if (icon) icon.style.color = "var(--danger)";
    }

    btn.addEventListener("click", () => {
        const active = btn.classList.toggle("active");
        if (icon) icon.style.color = active ? "var(--danger)" : "";
        localStorage.setItem(key, active);

        window.showNotification(
            active ? "¡Francia guardada en tus favoritos!" : "Eliminado de favoritos",
            active ? "success" : "info"
        );
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    initBookButton();
    initSaveButton();
});