/**
 * Scheduled Slides Module
 * Handles scheduling slides to appear at specific times/dates
 */

(function() {
    'use strict';

    let scheduledSlides = [];
    let scheduleCheckInterval = null;

    /**
     * Load scheduled slides from settings
     */
    function loadScheduledSlides() {
        try {
            const saved = localStorage.getItem('scheduledSlides');
            if (saved) {
                scheduledSlides = JSON.parse(saved);
                console.log(`Loaded ${scheduledSlides.length} scheduled slides`);
            }
        } catch (error) {
            console.error('Error loading scheduled slides:', error);
            scheduledSlides = [];
        }
    }

    /**
     * Check if a scheduled slide should be shown now
     * @param {Object} schedule - Schedule configuration
     * @returns {boolean} True if the slide should be shown
     */
    function shouldShowSlide(schedule) {
        if (!schedule || !schedule.enabled) return false;

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
        const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

        // Check date range if specified
        if (schedule.startDate && currentDate < schedule.startDate) return false;
        if (schedule.endDate && currentDate > schedule.endDate) return false;

        // Check days of week if specified
        if (schedule.daysOfWeek && schedule.daysOfWeek.length > 0) {
            if (!schedule.daysOfWeek.includes(currentDay)) return false;
        }

        // Check time range
        if (schedule.startTime) {
            const [startHour, startMin] = schedule.startTime.split(':').map(Number);
            const startMinutes = startHour * 60 + startMin;
            if (currentTime < startMinutes) return false;
        }

        if (schedule.endTime) {
            const [endHour, endMin] = schedule.endTime.split(':').map(Number);
            const endMinutes = endHour * 60 + endMin;
            if (currentTime > endMinutes) return false;
        }

        return true;
    }

    /**
     * Get all currently active scheduled slides
     * @returns {Array} Array of active slide configurations
     */
    function getActiveScheduledSlides() {
        return scheduledSlides.filter(slide => shouldShowSlide(slide.schedule));
    }

    /**
     * Filter slides based on schedule
     * @param {Array} allSlides - All configured slides
     * @returns {Array} Filtered slides that should be shown now
     */
    function filterScheduledSlides(allSlides) {
        if (!allSlides || !Array.isArray(allSlides)) return allSlides;

        return allSlides.filter((slide, index) => {
            // Check if this slide has a schedule
            const scheduleConfig = scheduledSlides.find(s => s.slideIndex === index);

            if (!scheduleConfig) {
                // No schedule = always show
                return true;
            }

            return shouldShowSlide(scheduleConfig.schedule);
        });
    }

    /**
     * Start checking schedule periodically
     */
    function startScheduleCheck() {
        if (scheduleCheckInterval) {
            clearInterval(scheduleCheckInterval);
        }

        // Check every minute
        scheduleCheckInterval = setInterval(() => {
            // Notify slideshow to re-check active slides
            if (window.Slideshow && window.Slideshow.checkSchedule) {
                window.Slideshow.checkSchedule();
            }
        }, 60000);

        console.log('Schedule checking started (every minute)');
    }

    /**
     * Stop schedule checking
     */
    function stopScheduleCheck() {
        if (scheduleCheckInterval) {
            clearInterval(scheduleCheckInterval);
            scheduleCheckInterval = null;
        }
    }

    /**
     * Add or update a slide schedule
     * @param {number} slideIndex - Index of the slide
     * @param {Object} schedule - Schedule configuration
     */
    function setSlideSchedule(slideIndex, schedule) {
        const existingIndex = scheduledSlides.findIndex(s => s.slideIndex === slideIndex);

        if (existingIndex >= 0) {
            scheduledSlides[existingIndex].schedule = schedule;
        } else {
            scheduledSlides.push({ slideIndex, schedule });
        }

        localStorage.setItem('scheduledSlides', JSON.stringify(scheduledSlides));
    }

    /**
     * Remove a slide schedule
     * @param {number} slideIndex - Index of the slide
     */
    function removeSlideSchedule(slideIndex) {
        scheduledSlides = scheduledSlides.filter(s => s.slideIndex !== slideIndex);
        localStorage.setItem('scheduledSlides', JSON.stringify(scheduledSlides));
    }

    /**
     * Get schedule for a specific slide
     * @param {number} slideIndex - Index of the slide
     * @returns {Object|null} Schedule configuration or null
     */
    function getSlideSchedule(slideIndex) {
        const found = scheduledSlides.find(s => s.slideIndex === slideIndex);
        return found ? found.schedule : null;
    }

    // Initialize
    loadScheduledSlides();
    startScheduleCheck();

    // Expose public API
    window.ScheduledSlides = {
        shouldShowSlide,
        getActiveScheduledSlides,
        filterScheduledSlides,
        setSlideSchedule,
        removeSlideSchedule,
        getSlideSchedule,
        reload: loadScheduledSlides,
        startCheck: startScheduleCheck,
        stopCheck: stopScheduleCheck
    };

    console.log('Scheduled Slides module loaded');
})();
