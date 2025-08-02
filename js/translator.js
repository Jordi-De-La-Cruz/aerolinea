// Configuración del traductor de Google
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'es', // Cambié a español ya que el contenido está en español
        includedLanguages: 'en,es,fr,de,it,pt,ja,ko,zh', // Idiomas más comunes para turismo
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false,
        multilanguagePage: true
    }, 'google_translate_element');
}

// Mejorar la apariencia del traductor cuando se cargue
document.addEventListener('DOMContentLoaded', function () {
    // Esperar a que el traductor se cargue
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === 'childList') {
                const translateElement = document.querySelector('#google_translate_element');
                if (translateElement && translateElement.querySelector('.goog-te-combo')) {
                    styleTranslator();
                    observer.disconnect(); // Dejar de observar una vez que se apliquen los estilos
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Función para aplicar estilos personalizados al traductor
function styleTranslator() {
    // Ocultar el banner de Google Translate
    const banner = document.querySelector('.goog-te-banner-frame');
    if (banner) {
        banner.style.display = 'none';
    }

    // Ajustar el margin-top del body que Google Translate añade
    document.body.style.marginTop = '0';

    // Estilizar el select del traductor
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.style.background = 'white';
        selectElement.style.border = 'none';
        selectElement.style.borderRadius = '0.5rem';
        selectElement.style.padding = '0.5rem';
        selectElement.style.fontSize = '1.4rem';
        selectElement.style.color = '#333';
        selectElement.style.outline = 'none';
        selectElement.style.cursor = 'pointer';
        selectElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

        // Añadir un icono de globo antes del select
        const icon = document.createElement('i');
        icon.className = 'fas fa-globe';
        icon.style.marginRight = '0.5rem';
        icon.style.color = '#2193b0';

        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.background = 'rgba(255, 255, 255, 0.9)';
        wrapper.style.borderRadius = '0.5rem';
        wrapper.style.padding = '0.5rem';
        wrapper.style.backdropFilter = 'blur(10px)';

        selectElement.parentNode.insertBefore(wrapper, selectElement);
        wrapper.appendChild(icon);
        wrapper.appendChild(selectElement);
    }

    // Ocultar elementos no deseados
    const unwantedElements = document.querySelectorAll(
        '.goog-te-gadget-icon, .goog-te-gadget-simple .goog-te-menu-value span:first-child'
    );
    unwantedElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Funciones adicionales para mejorar la experiencia del traductor
function detectUserLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh'];
    const langCode = userLang.split('-')[0];

    if (supportedLanguages.includes(langCode) && langCode !== 'es') {
        // Opcionalmente, podrías mostrar una sugerencia para traducir
        setTimeout(() => {
            showTranslationSuggestion(langCode);
        }, 2000);
    }
}

function showTranslationSuggestion(langCode) {
    const suggestions = {
        'en': 'Would you like to translate this page to English?',
        'fr': 'Souhaitez-vous traduire cette page en français?',
        'de': 'Möchten Sie diese Seite ins Deutsche übersetzen?',
        'it': 'Vuoi tradurre questa pagina in italiano?',
        'pt': 'Gostaria de traduzir esta página para português?'
    };

    const message = suggestions[langCode];
    if (message && !localStorage.getItem('translation-suggestion-dismissed')) {
        const notification = document.createElement('div');
        notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        max-width: 300px;
        font-size: 1.4rem;
      ">
        <p style="margin: 0 0 1rem 0;">${message}</p>
        <div style="display: flex; gap: 0.5rem;">
          <button onclick="acceptTranslation('${langCode}')" style="
            background: white;
            color: var(--primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 1.2rem;
          ">Yes</button>
          <button onclick="dismissTranslationSuggestion()" style="
            background: transparent;
            color: white;
            border: 1px solid white;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-size: 1.2rem;
          ">No</button>
        </div>
      </div>
    `;

        document.body.appendChild(notification);

        // Auto-dismiss después de 10 segundos
        setTimeout(() => {
            dismissTranslationSuggestion();
        }, 10000);
    }
}

// Funciones globales para los botones de sugerencia
window.acceptTranslation = function (langCode) {
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change'));
    }
    dismissTranslationSuggestion();
};

window.dismissTranslationSuggestion = function () {
    const notification = document.querySelector('.translation-suggestion');
    if (notification) {
        notification.remove();
    }
    localStorage.setItem('translation-suggestion-dismissed', 'true');
};

// Inicializar detección de idioma cuando la página esté cargada
document.addEventListener('DOMContentLoaded', function () {
    // Pequeño delay para asegurar que el traductor esté listo
    setTimeout(detectUserLanguage, 1000);
});

// Limpiar el localStorage de sugerencias cada 24 horas
function cleanupTranslationPreferences() {
    const lastCleanup = localStorage.getItem('translation-cleanup');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastCleanup || (now - parseInt(lastCleanup)) > oneDay) {
        localStorage.removeItem('translation-suggestion-dismissed');
        localStorage.setItem('translation-cleanup', now.toString());
    }
}

// Ejecutar cleanup al cargar la página
cleanupTranslationPreferences();