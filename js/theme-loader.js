/**
 * @fileoverview Theme Loader Module - Loads custom settings from centralized server
 * @module theme-loader
 * @description Loads and applies custom themes, slides, and settings from the API server.
 * Uses Server-Sent Events for real-time updates across all displays.
 * This module runs before other initialization to ensure custom settings are applied early.
 */

(function() {
    'use strict';

    let eventSource = null;
    let reconnectTimeout = null;
    let settings = {};

    /**
     * Converts hex color to RGB object
     * @param {string} hex - Hex color code (e.g., '#1e3c72')
     * @returns {object} RGB object {r, g, b}
     */
    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Apply custom theme to the page
     * @param {object} theme - Theme object with color settings
     */
    function applyTheme(theme) {
        if (!theme) return;

        try {
            const root = document.documentElement;

            // Apply background gradient
            if (theme.bgGradientStart && theme.bgGradientEnd) {
                root.style.setProperty('--color-bg-gradient-start', theme.bgGradientStart);
                root.style.setProperty('--color-bg-gradient-end', theme.bgGradientEnd);
            }

            // Apply main content panel background
            if (theme.mainContentBg !== undefined && theme.mainContentOpacity !== undefined) {
                const rgb = hexToRgb(theme.mainContentBg);
                const opacity = theme.mainContentOpacity / 100;
                root.style.setProperty('--color-panel-bg', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
            }

            // Apply weather panel background
            if (theme.weatherPanelBg !== undefined && theme.weatherPanelOpacity !== undefined) {
                const rgb = hexToRgb(theme.weatherPanelBg);
                const opacity = theme.weatherPanelOpacity / 100;
                root.style.setProperty('--color-panel-dark', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
            }

            // Apply bottom panel background
            if (theme.bottomPanelBg !== undefined && theme.bottomPanelOpacity !== undefined) {
                const rgb = hexToRgb(theme.bottomPanelBg);
                const opacity = theme.bottomPanelOpacity / 100;
                root.style.setProperty('--color-panel-darker', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`);
            }

            // Apply accent color
            if (theme.accentColor) {
                root.style.setProperty('--color-accent-gold', theme.accentColor);
            }

            console.log('✓ Custom theme applied');
        } catch (error) {
            console.error('Error applying custom theme:', error);
        }
    }

    /**
     * Apply custom slides to the slideshow
     * @param {array} slides - Array of slide objects
     */
    function applySlides(slides) {
        if (!slides || !Array.isArray(slides) || slides.length === 0) return;

        try {
            const slideshowContainer = document.getElementById('slideshowContainer');
            if (!slideshowContainer) return;

            // Clear existing slides
            slideshowContainer.innerHTML = '';

            // Add custom slides
            slides.forEach((slide, index) => {
                const slideElement = document.createElement('article');
                slideElement.className = 'slide';
                if (index === 0) slideElement.classList.add('active');
                slideElement.setAttribute('role', 'article');
                slideElement.setAttribute('aria-label', `Slide ${index + 1}`);
                slideElement.innerHTML = slide.content;
                slideshowContainer.appendChild(slideElement);
            });

            console.log(`✓ Loaded ${slides.length} custom slides`);

            // Reinitialize slideshow if it exists
            if (window.Slideshow && window.Slideshow.restart) {
                window.Slideshow.restart();
            }
        } catch (error) {
            console.error('Error applying custom slides:', error);
        }
    }

    /**
     * Apply general settings
     * @param {object} config - General configuration object
     */
    function applyGeneralSettings(config) {
        if (!config) return;

        try {
            if (config.schoolName) {
                window.CONFIG.SCHOOL_NAME = config.schoolName;

                // Update the DOM element directly
                const schoolNameElement = document.getElementById('schoolName');
                if (schoolNameElement) {
                    schoolNameElement.textContent = config.schoolName;
                    console.log('✓ School name updated to:', config.schoolName);
                }
            }

            if (config.slideshowInterval) {
                window.CONFIG.SLIDESHOW_INTERVAL = config.slideshowInterval;

                // Restart slideshow with new interval if it's running
                if (window.Slideshow && window.Slideshow.restart) {
                    window.Slideshow.restart();
                    console.log('✓ Slideshow interval updated to:', config.slideshowInterval / 1000, 'seconds');
                }
            }

            console.log('✓ General settings applied');
        } catch (error) {
            console.error('Error applying general settings:', error);
        }
    }

    /**
     * Apply livestream settings
     * @param {object} config - Livestream configuration object
     */
    function applyLivestreamSettings(config) {
        if (!config) return;

        try {
            if (config.enabled) {
                window.CONFIG.LIVESTREAM_URL = config.url || null;
                window.CONFIG.AUTO_DETECT_LIVESTREAM = config.autoDetect || false;
                window.CONFIG.LIVESTREAM_CHECK_INTERVAL = config.checkInterval || 60000;

                // Restart livestream monitoring with new settings
                if (window.Livestream) {
                    window.Livestream.stopMonitoring();
                    if (config.autoDetect) {
                        window.Livestream.startMonitoring();
                        console.log('✓ Livestream auto-detection restarted with interval:', config.checkInterval / 1000, 'seconds');
                    }
                }

                console.log('✓ Livestream settings applied');
            } else {
                // Livestream disabled, stop monitoring
                window.CONFIG.LIVESTREAM_URL = null;
                window.CONFIG.AUTO_DETECT_LIVESTREAM = false;

                if (window.Livestream) {
                    window.Livestream.stopMonitoring();
                    // Hide livestream if currently showing
                    if (window.Livestream.isActive()) {
                        window.Livestream.show(null);
                    }
                }

                console.log('✓ Livestream disabled');
            }
        } catch (error) {
            console.error('Error applying livestream settings:', error);
        }
    }

    /**
     * Apply all settings from the server
     * @param {object} allSettings - Complete settings object from API
     */
    function applyAllSettings(allSettings) {
        settings = allSettings || {};

        applyTheme(settings.customTheme);
        applyGeneralSettings(settings.generalConfig);
        applyLivestreamSettings(settings.livestreamConfig);

        // Apply slides after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => applySlides(settings.customSlides));
        } else {
            applySlides(settings.customSlides);
        }

        // Apply slide mode
        if (settings.USE_IMAGE_SLIDES !== undefined) {
            window.CONFIG.USE_IMAGE_SLIDES = settings.USE_IMAGE_SLIDES === true || settings.USE_IMAGE_SLIDES === 'true';
            console.log(`✓ Slide mode: ${window.CONFIG.USE_IMAGE_SLIDES ? 'Images' : 'HTML'}`);
        }
    }

    /**
     * Load settings from API
     */
    async function loadSettingsFromAPI() {
        try {
            const response = await fetch('/api/settings');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const allSettings = await response.json();
            console.log('✓ Settings loaded from server:', Object.keys(allSettings));
            applyAllSettings(allSettings);
        } catch (error) {
            console.error('Error loading settings from API:', error);
            console.log('Falling back to localStorage...');
            loadFromLocalStorage();
        }
    }

    /**
     * Fallback: Load from localStorage if API fails
     */
    function loadFromLocalStorage() {
        const customTheme = localStorage.getItem('customTheme');
        const customSlides = localStorage.getItem('customSlides');
        const generalConfig = localStorage.getItem('generalConfig');
        const livestreamConfig = localStorage.getItem('livestreamConfig');
        const useImageSlides = localStorage.getItem('USE_IMAGE_SLIDES');

        if (customTheme) applyTheme(JSON.parse(customTheme));
        if (generalConfig) applyGeneralSettings(JSON.parse(generalConfig));
        if (livestreamConfig) applyLivestreamSettings(JSON.parse(livestreamConfig));

        if (customSlides) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => applySlides(JSON.parse(customSlides)));
            } else {
                applySlides(JSON.parse(customSlides));
            }
        }

        if (useImageSlides !== null) {
            window.CONFIG.USE_IMAGE_SLIDES = useImageSlides === 'true';
        }

        console.log('✓ Settings loaded from localStorage (fallback mode)');
    }

    /**
     * Connect to SSE stream for real-time updates
     */
    function connectSSE() {
        if (eventSource) {
            eventSource.close();
        }

        console.log('Connecting to real-time settings stream...');

        eventSource = new EventSource('/api/settings/stream');

        eventSource.onopen = function() {
            console.log('✓ Connected to real-time settings stream');
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
        };

        eventSource.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'initial') {
                    console.log('✓ Received initial settings from stream');
                    applyAllSettings(data.settings);

                    // Check for active emergency alert on initial load
                    checkEmergencyStatus();
                } else if (data.type === 'settings_update') {
                    console.log('✓ Settings updated from server!');
                    console.log('Updated keys:', data.key || 'all settings');
                    applyAllSettings(data.settings);

                    // Visual feedback that settings were updated
                    if (typeof showNotification === 'function') {
                        showNotification('Settings updated from admin panel');
                    }
                } else if (data.type === 'emergency_alert') {
                    // Emergency alert received
                    console.log('⚠️ EMERGENCY ALERT RECEIVED');
                    if (window.EmergencyAlert) {
                        window.EmergencyAlert.show(data.alert);
                    }
                } else if (data.type === 'emergency_cancel') {
                    // Emergency alert cancelled
                    console.log('✓ Emergency alert cancelled');
                    if (window.EmergencyAlert) {
                        window.EmergencyAlert.hide();
                    }
                } else if (data.type === 'server_shutdown') {
                    console.log('Server is shutting down, will reconnect...');
                }
            } catch (error) {
                console.error('Error processing SSE message:', error);
            }
        };

        eventSource.onerror = function(error) {
            console.error('SSE connection error:', error);
            eventSource.close();

            // Reconnect after 5 seconds
            if (!reconnectTimeout) {
                reconnectTimeout = setTimeout(() => {
                    console.log('Reconnecting to settings stream...');
                    connectSSE();
                }, 5000);
            }
        };
    }

    /**
     * Check for active emergency alert on page load
     */
    async function checkEmergencyStatus() {
        try {
            const response = await fetch('/api/emergency/status');
            const data = await response.json();

            if (data.active && data.alert && window.EmergencyAlert) {
                console.log('⚠️ Active emergency alert found');
                window.EmergencyAlert.show(data.alert);
            }
        } catch (error) {
            console.error('Error checking emergency status:', error);
        }
    }

    /**
     * Initialize theme loader
     */
    function init() {
        // First, try to load from API
        loadSettingsFromAPI();

        // Then connect to SSE for real-time updates
        connectSSE();
    }

    // Run immediately
    init();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (eventSource) {
            eventSource.close();
        }
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
    });

    console.log('Theme Loader initialized with real-time updates');

})();
