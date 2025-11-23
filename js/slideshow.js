/**
 * Slideshow Module
 * Handles slideshow functionality including image slides and HTML slides
 */

(function() {
    'use strict';

    // Import constants
    const CONSTANTS = window.APP_CONSTANTS;

    // State
    let currentSlide = 0;
    let slides = [];
    let slideshowInterval = null;
    let imageSlides = [];

    /**
     * Loads image slides from the slides folder
     */
    async function loadImageSlides() {
        const slidesFolder = (window.CONFIG && window.CONFIG.SLIDES_FOLDER) || CONSTANTS.SLIDESHOW_DEFAULT_FOLDER;
        const useImageSlides = (window.CONFIG && window.CONFIG.USE_IMAGE_SLIDES) || false;

        if (!useImageSlides) {
            console.log('Using HTML slides');
            return;
        }

        try {
            const response = await fetch(`${slidesFolder}/slides.json`);
            if (!response.ok) {
                console.warn('slides.json not found, falling back to HTML slides');
                return;
            }

            const data = await response.json();
            imageSlides = data.images || [];

            if (imageSlides.length === 0) {
                console.warn('No images found in slides.json, using HTML slides');
                return;
            }

            console.log(`Loaded ${imageSlides.length} image slides from ${slidesFolder}`);
            createImageSlides(slidesFolder, imageSlides);

        } catch (error) {
            console.error('Error loading image slides:', error);
            console.log('Falling back to HTML slides');
        }
    }

    /**
     * Creates image slide elements in the DOM
     * @param {string} slidesFolder - Path to slides folder
     * @param {Array} images - Array of image filenames
     */
    function createImageSlides(slidesFolder, images) {
        const slideshowContainer = document.getElementById(CONSTANTS.ELEMENT_IDS.SLIDESHOW_CONTAINER);
        if (!slideshowContainer) return;

        // Clear existing HTML slides
        slideshowContainer.innerHTML = '';

        // Create image slides
        images.forEach((imageName, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = CONSTANTS.CSS_CLASSES.SLIDE;
            if (index === 0) slideDiv.classList.add(CONSTANTS.CSS_CLASSES.SLIDE_ACTIVE);

            const img = document.createElement('img');
            img.src = `${slidesFolder}/${imageName}`;
            img.alt = `Slide ${index + 1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';

            slideDiv.appendChild(img);
            slideshowContainer.appendChild(slideDiv);
        });
    }

    /**
     * Initializes the slideshow
     */
    function initSlideshow() {
        slides = document.querySelectorAll(`.${CONSTANTS.CSS_CLASSES.SLIDE}`);

        if (slides.length > 0) {
            showSlide(0);

            // Auto-advance slides
            const interval = (window.CONFIG && window.CONFIG.SLIDESHOW_INTERVAL) || CONSTANTS.SLIDESHOW_DEFAULT_INTERVAL_MS;
            slideshowInterval = setInterval(nextSlide, interval);
        }
    }

    /**
     * Displays a specific slide by index
     * @param {number} index - Slide index to display
     */
    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove(CONSTANTS.CSS_CLASSES.SLIDE_ACTIVE));

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides[currentSlide].classList.add(CONSTANTS.CSS_CLASSES.SLIDE_ACTIVE);
    }

    /**
     * Advances to the next slide
     */
    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    /**
     * Goes back to the previous slide
     */
    function previousSlide() {
        showSlide(currentSlide - 1);
    }

    /**
     * Stops the slideshow
     */
    function stopSlideshow() {
        if (slideshowInterval) {
            clearInterval(slideshowInterval);
            slideshowInterval = null;
        }
    }

    /**
     * Restarts the slideshow
     */
    function restartSlideshow() {
        stopSlideshow();
        initSlideshow();
    }

    /**
     * Shows the slideshow container
     */
    function show() {
        const slideshowContainer = document.getElementById(CONSTANTS.ELEMENT_IDS.SLIDESHOW_CONTAINER);
        if (slideshowContainer) {
            slideshowContainer.style.display = 'flex';
        }
        restartSlideshow();
    }

    /**
     * Hides the slideshow container
     */
    function hide() {
        const slideshowContainer = document.getElementById(CONSTANTS.ELEMENT_IDS.SLIDESHOW_CONTAINER);
        if (slideshowContainer) {
            slideshowContainer.style.display = 'none';
        }
        stopSlideshow();
    }

    /**
     * Initializes the slideshow module
     */
    async function init() {
        await loadImageSlides();
        initSlideshow();
        console.log('Slideshow module initialized');
    }

    // Export public API
    window.Slideshow = {
        init,
        next: nextSlide,
        previous: previousSlide,
        show,
        hide,
        restart: restartSlideshow
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
