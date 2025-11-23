/**
 * Constants Module
 * Centralized configuration for all magic numbers and default values
 */

(function() {
    'use strict';

    /**
     * Application-wide constants
     */
    window.APP_CONSTANTS = {
        // ========================================
        // Time and Date Configuration
        // ========================================

        /** Time display update interval in milliseconds (1 second) */
        DATETIME_UPDATE_INTERVAL_MS: 1000,

        /** Hour of day (0-23) for automatic page refresh to prevent memory leaks */
        AUTO_REFRESH_HOUR: 3,

        // ========================================
        // Weather Configuration
        // ========================================

        /** Weather data update interval in milliseconds (10 minutes) */
        WEATHER_UPDATE_INTERVAL_MS: 600000,

        /** Maximum number of days to show in forecast */
        WEATHER_MAX_FORECAST_DAYS: 5,

        // ========================================
        // Slideshow Configuration
        // ========================================

        /** Default time each slide is displayed in milliseconds (8 seconds) */
        SLIDESHOW_DEFAULT_INTERVAL_MS: 8000,

        /** Default folder path for slide images */
        SLIDESHOW_DEFAULT_FOLDER: 'slides',

        // ========================================
        // Livestream Configuration
        // ========================================

        /** Default interval for checking livestream status in milliseconds (1 minute) */
        LIVESTREAM_CHECK_INTERVAL_MS: 60000,

        /** Timeout for livestream availability check in milliseconds (5 seconds) */
        LIVESTREAM_CHECK_TIMEOUT_MS: 5000,

        // ========================================
        // Display Configuration
        // ========================================

        /** Default school name if not configured */
        DEFAULT_SCHOOL_NAME: 'School Name',

        /** Breakpoint for 4K display scaling (pixels) */
        DISPLAY_4K_BREAKPOINT_PX: 2560,

        // ========================================
        // API Configuration
        // ========================================

        /** OpenWeatherMap API base URL for current weather */
        WEATHER_API_CURRENT_URL: 'https://api.openweathermap.org/data/2.5/weather',

        /** OpenWeatherMap API base URL for forecast */
        WEATHER_API_FORECAST_URL: 'https://api.openweathermap.org/data/2.5/forecast',

        /** Weather API units (imperial = Fahrenheit) */
        WEATHER_API_UNITS: 'imperial',

        /** OpenWeatherMap icon base URL */
        WEATHER_ICON_BASE_URL: 'https://openweathermap.org/img/wn',

        // ========================================
        // Element IDs (for reference and validation)
        // ========================================

        ELEMENT_IDS: {
            // Time and Date
            TIME_DISPLAY: 'timeDisplay',
            DATE_DISPLAY: 'dateDisplay',

            // School Name
            SCHOOL_NAME: 'schoolName',
            WELCOME_MESSAGE: 'welcomeMessage',

            // Weather
            CURRENT_TEMP: 'currentTemp',
            CURRENT_DESC: 'currentDesc',
            CURRENT_ICON: 'currentIcon',
            FEELS_LIKE: 'feelsLike',
            HUMIDITY: 'humidity',
            WEEK_FORECAST: 'weekForecast',

            // Slideshow and Livestream
            SLIDESHOW_CONTAINER: 'slideshowContainer',
            LIVESTREAM_FRAME: 'livestreamFrame'
        },

        // ========================================
        // CSS Class Names
        // ========================================

        CSS_CLASSES: {
            SLIDE: 'slide',
            SLIDE_ACTIVE: 'active',
            FORECAST_DAY: 'forecast-day',
            FORECAST_DAY_NAME: 'forecast-day-name',
            FORECAST_ICON: 'forecast-icon',
            FORECAST_TEMPS: 'forecast-temps',
            FORECAST_HIGH: 'forecast-high',
            FORECAST_LOW: 'forecast-low'
        },

        // ========================================
        // Error Messages
        // ========================================

        ERROR_MESSAGES: {
            API_KEY_MISSING: 'API Key Missing',
            API_KEY_PLACEHOLDER: 'Configure API Key',
            LOCATION_NOT_SET: 'Location Not Set',
            WEATHER_LOAD_ERROR: 'Error Loading Weather',
            LIVESTREAM_FRAME_NOT_FOUND: 'Livestream frame element not found',
            NO_LIVESTREAM_URL: 'No livestream URL configured. Set LIVESTREAM_URL in config.js'
        },

        // ========================================
        // Keyboard Shortcuts
        // ========================================

        KEYBOARD: {
            ARROW_RIGHT: 'ArrowRight',
            ARROW_LEFT: 'ArrowLeft',
            LIVESTREAM_TOGGLE: 'l',
            LIVESTREAM_TOGGLE_UPPER: 'L',
            FULLSCREEN: 'f',
            FULLSCREEN_UPPER: 'F'
        },

        // ========================================
        // Date/Time Formatting
        // ========================================

        DATE_FORMAT_OPTIONS: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        },

        FORECAST_DATE_FORMAT_OPTIONS: {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        },

        /** Locale for date/time formatting */
        LOCALE: 'en-US'
    };

    // Freeze the constants object to prevent modifications
    Object.freeze(window.APP_CONSTANTS);
    Object.freeze(window.APP_CONSTANTS.ELEMENT_IDS);
    Object.freeze(window.APP_CONSTANTS.CSS_CLASSES);
    Object.freeze(window.APP_CONSTANTS.ERROR_MESSAGES);
    Object.freeze(window.APP_CONSTANTS.KEYBOARD);
    Object.freeze(window.APP_CONSTANTS.DATE_FORMAT_OPTIONS);
    Object.freeze(window.APP_CONSTANTS.FORECAST_DATE_FORMAT_OPTIONS);

    console.log('Application constants loaded');

})();
