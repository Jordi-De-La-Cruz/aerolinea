class IndexManager {
    constructor() {
        this.serviceCards = document.querySelectorAll(".service-card");
        this.statNumbers = document.querySelectorAll(".stat-number");
        this.isStatsAnimated = false;

        this.init();
    }

    init() {
        this.setupServiceCards();
        this.setupStatsCounter();
        this.setupScrollEffects();
        this.setupNavigationHighlight();
        this.setupKeyboardNavigation();
        this.setupImageErrorHandling();
        this.setupPagePreloading();
    }

    /* TARJETAS DE SERVICIOS */
    setupServiceCards() {
        this.serviceCards.forEach((card) => {
            card.addEventListener("mouseenter", () => this.onCardEnter(card));
            card.addEventListener("mouseleave", () => this.onCardLeave(card));
            card.addEventListener("click", () => this.onCardClick(card));
        });
    }

    onCardEnter(card) {
        const dropdown = card.querySelector(".service-dropdown");
        if (dropdown) {
            dropdown.style.display = "flex";
            dropdown.style.opacity = "0";
            dropdown.style.transform = "translateY(-10px)";

            requestAnimationFrame(() => {
                dropdown.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                dropdown.style.opacity = "1";
                dropdown.style.transform = "translateY(0)";
            });
        }
    }

    onCardLeave(card) {
        const dropdown = card.querySelector(".service-dropdown");
        if (!dropdown) return;

        dropdown.style.opacity = "0";
        dropdown.style.transform = "translateY(-10px)";

        setTimeout(() => {
            if (!card.matches(":hover")) {
                dropdown.style.display = "none";
                dropdown.style.transition = "";
            }
        }, 300);
    }

    onCardClick(card) {
        card.style.transform = "scale(0.98)";
        setTimeout(() => {
            card.style.transform = "";
        }, 150);
    }

    /* CONTADOR DE ESTADÍSTICAS */
    setupStatsCounter() {
        if (!("IntersectionObserver" in window)) {
            this.setStatsFinal();
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.isStatsAnimated) {
                        this.animateStats();
                        this.isStatsAnimated = true;
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.5 }
        );

        const aboutSection = document.querySelector(".about");
        if (aboutSection) observer.observe(aboutSection);
    }

    animateStats() {
        this.statNumbers.forEach((stat) => {
            const target = parseInt(stat.dataset.count, 10);
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const tick = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(tick);
                } else {
                    stat.textContent = target.toLocaleString();
                }
            };

            requestAnimationFrame(tick);
        });
    }

    setStatsFinal() {
        this.statNumbers.forEach((stat) => {
            stat.textContent = parseInt(stat.dataset.count, 10).toLocaleString();
        });
    }

    /* EFECTOS DE SCROLL */
    setupScrollEffects() {
        let lastScrollTop = 0;
        const header = document.querySelector(".header");
        if (!header) return;

        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;

            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = "translateY(-100%)";
            } else {
                header.style.transform = "translateY(0)";
            }

            lastScrollTop = scrollTop;
        }, { passive: true });
    }

    /* RESALTAR SECCIÓN ACTIVA EN NAVEGACIÓN */
    setupNavigationHighlight() {
        if (!("IntersectionObserver" in window)) return;

        const sections = document.querySelectorAll("section[id]");
        const navLinks = document.querySelectorAll('a[href^="#"]');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute("id");
                        navLinks.forEach((link) => link.classList.remove("active"));

                        const activeLink = document.querySelector(`a[href="#${id}"]`);
                        activeLink?.classList.add("active");
                    }
                });
            },
            { threshold: 0.6 }
        );

        sections.forEach((section) => observer.observe(section));
    }

    /* NAVEGACIÓN POR TECLADO */
    setupKeyboardNavigation() {
        document.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "h") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    /* MANEJO DE ERRORES EN IMÁGENES */
    setupImageErrorHandling() {
        document.querySelectorAll("img").forEach((img) => {
            img.addEventListener("error", () => {
                const placeholder = document.createElement("div");
                placeholder.style.cssText = `
                    width: 100%;
                    height: ${img.offsetHeight || 200}px;
                    background: var(--gray-light);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--gray);
                    font-size: 1.4rem;
                    border-radius: var(--border-radius);
                `;
                placeholder.textContent = "Imagen no disponible";
                img.parentNode?.replaceChild(placeholder, img);
            });
        });
    }

    /* PRECARGA DE PÁGINAS AL HOVER */
    setupPagePreloading() {
        document.querySelectorAll('a[href$=".html"]').forEach((link) => {
            link.addEventListener("mouseenter", () => {
                const href = link.getAttribute("href");
                if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
                    const preload = document.createElement("link");
                    preload.rel = "prefetch";
                    preload.href = href;
                    document.head.appendChild(preload);
                }
            });
        });
    }
}

/* INICIALIZACIÓN */
document.addEventListener("DOMContentLoaded", () => {
    window.indexManager = new IndexManager();
});

/* EVENTO: CAMBIO DE TEMA */
window.addEventListener("themeChanged", (e) => {
    const isDark = e.detail?.theme === "dark";
    document.querySelectorAll(".service-card").forEach((card) => {
        card.classList.toggle("dark-variant", isDark);
    });
});