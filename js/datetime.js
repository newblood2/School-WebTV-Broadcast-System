/**
 * DateTime Module
 * Handles clock and date display updates
 */

(function() {
    'use strict';

    // Import constants
    const CONSTANTS = window.APP_CONSTANTS;

    /**
     * Updates the time and date display elements
     */
    function updateDateTime() {
        const now = new Date();

        updateTimeDisplay(now);
        updateDateDisplay(now);
    }

    /**
     * Updates the time display in 12-hour format with AM/PM
     * @param {Date} now - Current date/time
     */
    function updateTimeDisplay(now) {
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        hours = hours % 12;
        hours = hours ? hours : 12; // Convert 0 to 12
        const displayHours = String(hours).padStart(2, '0');

        const timeElement = document.getElementById(CONSTANTS.ELEMENT_IDS.TIME_DISPLAY);
        if (timeElement) {
            timeElement.textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;
        }
    }

    /**
     * Updates the date display with full weekday and date
     * @param {Date} now - Current date/time
     */
    function updateDateDisplay(now) {
        const dateString = now.toLocaleDateString(
            CONSTANTS.LOCALE,
            CONSTANTS.DATE_FORMAT_OPTIONS
        );

        const dateElement = document.getElementById(CONSTANTS.ELEMENT_IDS.DATE_DISPLAY);
        if (dateElement) {
            dateElement.textContent = dateString;
        }
    }

    /**
     * Initializes the date/time display and starts the update interval
     */
    function init() {
        updateDateTime(); // Initial call
        setInterval(updateDateTime, CONSTANTS.DATETIME_UPDATE_INTERVAL_MS);
        console.log('DateTime module initialized');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
