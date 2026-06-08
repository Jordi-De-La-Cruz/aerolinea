function goToPayment() {
    window.location.href = "tarjeta.html";
}

function initFavoriteButton() {
    const btn = document.getElementById("addToFavoritesBtn");
    if (!btn) return;

    /* Recuperar estado guardado */
    const isSaved = localStorage.getItem("emiratos_saved") === "true";
    if (isSaved) {
        btn.classList.add("active");
        btn.querySelector("i")?.classList.replace("fa-heart", "fa-heart");
        btn.style.color = "var(--danger)";
    }

    btn.addEventListener("click", () => {
        const active = btn.classList.toggle("active");
        btn.style.color = active ? "var(--danger)" : "";
        localStorage.setItem("emiratos_saved", active);

        window.showNotification(
            active ? "¡Destino guardado en tus favoritos!" : "Destino eliminado de favoritos",
            active ? "success" : "info"
        );
    });
}

/* Botones "Agregar" de extras */
function initExtraButtons() {
    const transferBtn = document.getElementById("addTransferBtn");
    const insuranceBtn = document.getElementById("addInsuranceBtn");

    transferBtn?.addEventListener("click", () => {
        window.showNotification("Traslado agregado al paquete (+$45)", "success");
        transferBtn.textContent = "✓ Agregado";
        transferBtn.disabled = true;
    });

    insuranceBtn?.addEventListener("click", () => {
        window.showNotification("Seguro de viaje agregado (+$89)", "success");
        insuranceBtn.textContent = "✓ Agregado";
        insuranceBtn.disabled = true;
    });
}

function initBookingButtons() {
    const ids = ["bookNowBtn", "finalBookingBtn"];

    ids.forEach((id) => {
        document.getElementById(id)?.addEventListener("click", goToPayment);
    });
}

/* Inicialización */
document.addEventListener("DOMContentLoaded", () => {
    initBookingButtons();
    initFavoriteButton();
    initExtraButtons();
});