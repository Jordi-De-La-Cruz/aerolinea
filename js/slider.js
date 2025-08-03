let currentSlideIndex = 0;
let slideInterval;

// Inicializar slider cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function () {
    initializeSlider();
});

function initializeSlider() {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    showSlide(currentSlideIndex);

    startAutoPlay();

    const sliderContainer = document.querySelector('.slider-container');
    if (sliderContainer) {
        sliderContainer.addEventListener('mouseenter', stopAutoPlay);
        sliderContainer.addEventListener('mouseleave', startAutoPlay);
    }

    let touchStartX = 0;
    let touchEndX = 0;

    if (sliderContainer) {
        sliderContainer.addEventListener('touchstart', function (e) {
            touchStartX = e.changedTouches[0].screenX;
        });

        sliderContainer.addEventListener('touchend', function (e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                changeSlide(1);
            } else {
                changeSlide(-1);
            }
        }
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));

    if (slides[index]) {
        slides[index].classList.add('active');
    }

    if (indicators[index]) {
        indicators[index].classList.add('active');
    }
}

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');

    if (slides.length === 0) return;

    currentSlideIndex += direction;

    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }

    showSlide(currentSlideIndex);

    stopAutoPlay();
    startAutoPlay();
}

function currentSlide(index) {
    currentSlideIndex = index - 1;
    showSlide(currentSlideIndex);

    stopAutoPlay();
    startAutoPlay();
}

function startAutoPlay() {
    const autoPlayDelay = 4000;

    slideInterval = setInterval(function () {
        changeSlide(1);
    }, autoPlayDelay);
}

function stopAutoPlay() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

function addSlide(imageSrc, title, description) {
    const slider = document.querySelector('.slider');
    const indicators = document.querySelector('.slider-indicators');

    if (!slider || !indicators) return;

    const newSlide = document.createElement('div');
    newSlide.className = 'slide';
    newSlide.innerHTML = `
    <img src="${imageSrc}" alt="${title}">
    <div class="slide-info">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
  `;

    // Crear nuevo indicador
    const newIndicator = document.createElement('span');
    newIndicator.className = 'indicator';
    const slideCount = document.querySelectorAll('.slide').length + 1;
    newIndicator.onclick = function () { currentSlide(slideCount); };

    slider.appendChild(newSlide);
    indicators.appendChild(newIndicator);
}

function preloadSliderImages() {
    const slides = document.querySelectorAll('.slide img');

    slides.forEach(function (img) {
        const imageLoader = new Image();
        imageLoader.src = img.src;
    });
}

function setupLazyLoading() {
    const slides = document.querySelectorAll('.slide img[data-src]');

    const imageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });

    slides.forEach(function (img) {
        imageObserver.observe(img);
    });
}

function updateSliderForMobile() {
    const sliderContainer = document.querySelector('.slider-container');

    if (!sliderContainer) return;

    function checkScreenSize() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            sliderContainer.classList.add('mobile-slider');
            stopAutoPlay();
        } else {
            // Configuración para desktop
            sliderContainer.classList.remove('mobile-slider');
            startAutoPlay();
        }
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
}

// Inicializar funcionalidades adicionales
document.addEventListener('DOMContentLoaded', function () {
    preloadSliderImages();
    setupLazyLoading();
    updateSliderForMobile();
});

document.addEventListener('DOMContentLoaded', function () {
    const sliderImages = document.querySelectorAll('.slide img');

    sliderImages.forEach(function (img) {
        img.addEventListener('error', function () {
            this.src = 'img/placeholder.jpg';
            this.alt = 'Imagen no disponible';
            console.warn('Error cargando imagen del slider:', this.src);
        });
    });
});

window.changeSlide = changeSlide;
window.currentSlide = currentSlide;