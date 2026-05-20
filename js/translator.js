function googleTranslateElementInit() {
    new google.translate.TranslateElement(
        {
            pageLanguage: "es",
            includedLanguages: "en,es,fr,de,it,pt,ja,ko,zh",
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
        },
        "google_translate_element"
    );
}

/* ESTILOS DEL WIDGET */
function styleTranslator() {
    /* Ocultar el banner nativo de Google */
    const banner = document.querySelector(".goog-te-banner-frame");
    if (banner) banner.style.display = "none";
    document.body.style.marginTop = "0";

    const select = document.querySelector(".goog-te-combo");
    if (!select) return;

    Object.assign(select.style, {
        background: "white",
        border: "none",
        borderRadius: "0.5rem",
        padding: "0.5rem",
        fontSize: "1.4rem",
        color: "#333",
        outline: "none",
        cursor: "pointer",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    });

    /* Envolver en contenedor con ícono */
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
        display: "flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "0.5rem",
        padding: "0.5rem",
        backdropFilter: "blur(10px)",
    });

    const icon = document.createElement("i");
    icon.className = "fas fa-globe";
    icon.setAttribute("aria-hidden", "true");
    icon.style.cssText = "margin-right: 0.5rem; color: #2193b0;";

    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(icon);
    wrapper.appendChild(select);

    /* Ocultar elementos innecesarios del gadget */
    document.querySelectorAll(
        ".goog-te-gadget-icon, .goog-te-gadget-simple .goog-te-menu-value span:first-child"
    ).forEach((el) => (el.style.display = "none"));
}

/* OBSERVAR LA CARGA DEL WIDGET */
document.addEventListener("DOMContentLoaded", () => {
    const observer = new MutationObserver((mutations, obs) => {
        const combo = document.querySelector("#google_translate_element .goog-te-combo");
        if (combo) {
            styleTranslator();
            obs.disconnect();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

/* SUGERENCIA DE TRADUCCIÓN AUTOMÁTICA */
function detectUserLanguage() {
    const langCode = (navigator.language || navigator.userLanguage || "").split("-")[0];
    const supported = ["en", "fr", "de", "it", "pt", "ja", "ko", "zh"];

    if (supported.includes(langCode)) {
        setTimeout(() => showTranslationSuggestion(langCode), 2000);
    }
}

function showTranslationSuggestion(langCode) {
    if (localStorage.getItem("translation-suggestion-dismissed")) return;

    const messages = {
        en: "Would you like to translate this page to English?",
        fr: "Souhaitez-vous traduire cette page en français?",
        de: "Möchten Sie diese Seite ins Deutsche übersetzen?",
        it: "Vuoi tradurre questa pagina in italiano?",
        pt: "Gostaria de traduzir esta página para português?",
    };

    const message = messages[langCode];
    if (!message) return;

    const banner = document.createElement("div");
    banner.className = "translation-suggestion";
    banner.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        font-size: 1.4rem;
    `;

    banner.innerHTML = `
        <p style="margin: 0 0 1rem 0;">${message}</p>
        <div style="display: flex; gap: 0.5rem;">
            <button
                onclick="window.acceptTranslation('${langCode}')"
                style="background:white; color:var(--primary); border:none; padding:0.5rem 1rem; border-radius:0.25rem; cursor:pointer; font-size:1.2rem; font-weight:600;">
                Yes
            </button>
            <button
                onclick="window.dismissTranslationSuggestion()"
                style="background:transparent; color:white; border:1px solid white; padding:0.5rem 1rem; border-radius:0.25rem; cursor:pointer; font-size:1.2rem;">
                No
            </button>
        </div>
    `;

    document.body.appendChild(banner);

    /* Auto-cerrar después de 10 segundos */
    setTimeout(() => window.dismissTranslationSuggestion(), 10000);
}

window.acceptTranslation = function (langCode) {
    const select = document.querySelector(".goog-te-combo");
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event("change"));
    }
    window.dismissTranslationSuggestion();
};

window.dismissTranslationSuggestion = function () {
    document.querySelector(".translation-suggestion")?.remove();
    localStorage.setItem("translation-suggestion-dismissed", "true");
};

/* LIMPIAR PREFERENCIAS UNA VEZ AL DÍA */
function cleanupTranslationPreferences() {
    const lastCleanup = localStorage.getItem("translation-cleanup");
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastCleanup || now - parseInt(lastCleanup, 10) > oneDay) {
        localStorage.removeItem("translation-suggestion-dismissed");
        localStorage.setItem("translation-cleanup", String(now));
    }
}

cleanupTranslationPreferences();

document.addEventListener("DOMContentLoaded", () => {
    setTimeout(detectUserLanguage, 1000);
});