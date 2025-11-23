/**
 * Weather Module
 * Handles weather API integration for current conditions and forecast
 */

(function() {
    'use strict';

    // Import constants
    const CONSTANTS = window.APP_CONSTANTS;

    /**
     * Fetches weather data from OpenWeatherMap API
     */
    async function fetchWeather() {
        if (!validateConfig()) {
            return;
        }

        const { WEATHER_API_KEY, LOCATION, CITY_ID } = window.CONFIG;
        const locationParam = buildLocationParam(LOCATION, CITY_ID);

        if (!locationParam) {
            displayError(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, CONSTANTS.ERROR_MESSAGES.LOCATION_NOT_SET);
            console.error('No location configured - set either LOCATION or CITY_ID in config.js');
            return;
        }

        try {
            await fetchCurrentWeather(locationParam, WEATHER_API_KEY);
            await fetchWeatherForecast(locationParam, WEATHER_API_KEY);
        } catch (error) {
            console.error('Weather fetch error:', error);
            const currentDescElement = document.getElementById(CONSTANTS.ELEMENT_IDS.CURRENT_DESC);
            if (currentDescElement && !currentDescElement.textContent.startsWith('Error:')) {
                displayError(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, CONSTANTS.ERROR_MESSAGES.WEATHER_LOAD_ERROR);
            }
        }
    }

    /**
     * Validates weather API configuration
     * @returns {boolean} True if config is valid
     */
    function validateConfig() {
        if (!window.CONFIG || !window.CONFIG.WEATHER_API_KEY) {
            console.error('Weather API key not configured');
            displayError(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, CONSTANTS.ERROR_MESSAGES.API_KEY_MISSING);
            return false;
        }

        // Check if API key is still the placeholder
        if (window.CONFIG.WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
            console.error('Weather API key not configured - still using placeholder value');
            displayError(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, CONSTANTS.ERROR_MESSAGES.API_KEY_PLACEHOLDER);
            displayError(CONSTANTS.ELEMENT_IDS.CURRENT_TEMP, '--°F');
            displayError(CONSTANTS.ELEMENT_IDS.FEELS_LIKE, '--°F');
            displayError(CONSTANTS.ELEMENT_IDS.HUMIDITY, '--%');
            return false;
        }

        return true;
    }

    /**
     * Builds location parameter for API requests
     * @param {string} location - City name location string
     * @param {number|null} cityId - OpenWeatherMap city ID
     * @returns {string|null} Location parameter string or null
     */
    function buildLocationParam(location, cityId) {
        if (cityId) {
            console.log('Using city ID:', cityId);
            return `id=${cityId}`;
        } else if (location) {
            console.log('Using city name:', location);
            return `q=${location}`;
        }
        return null;
    }

    /**
     * Fetches current weather conditions
     * @param {string} locationParam - Location parameter for API
     * @param {string} apiKey - OpenWeatherMap API key
     */
    async function fetchCurrentWeather(locationParam, apiKey) {
        const url = `${CONSTANTS.WEATHER_API_CURRENT_URL}?${locationParam}&appid=${apiKey}&units=${CONSTANTS.WEATHER_API_UNITS}`;
        console.log('Fetching weather from:', url.replace(apiKey, 'API_KEY_HIDDEN'));

        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            updateCurrentWeather(data);
        } else {
            const errorMsg = data.message || 'Failed to fetch current weather';
            console.error('Weather API error:', errorMsg, '(Code:', data.cod, ')');
            displayError(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, `Error: ${errorMsg}`);
            throw new Error(errorMsg);
        }
    }

    /**
     * Fetches weather forecast
     * @param {string} locationParam - Location parameter for API
     * @param {string} apiKey - OpenWeatherMap API key
     */
    async function fetchWeatherForecast(locationParam, apiKey) {
        const url = `${CONSTANTS.WEATHER_API_FORECAST_URL}?${locationParam}&appid=${apiKey}&units=${CONSTANTS.WEATHER_API_UNITS}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === "200") {
            updateWeekForecast(data);
        } else {
            throw new Error(data.message || 'Failed to fetch forecast');
        }
    }

    /**
     * Updates the current weather display
     * @param {Object} data - Weather data from API
     */
    function updateCurrentWeather(data) {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const description = data.weather[0].description;
        const icon = data.weather[0].icon;

        setElementText(CONSTANTS.ELEMENT_IDS.CURRENT_TEMP, `${temp}°F`);
        setElementText(CONSTANTS.ELEMENT_IDS.CURRENT_DESC, description);
        setElementText(CONSTANTS.ELEMENT_IDS.FEELS_LIKE, `${feelsLike}°F`);
        setElementText(CONSTANTS.ELEMENT_IDS.HUMIDITY, `${humidity}%`);

        const iconElement = document.getElementById(CONSTANTS.ELEMENT_IDS.CURRENT_ICON);
        if (iconElement) {
            iconElement.src = `${CONSTANTS.WEATHER_ICON_BASE_URL}/${icon}@2x.png`;
            iconElement.alt = description;
        }
    }

    /**
     * Updates the week forecast display
     * @param {Object} data - Forecast data from API
     */
    function updateWeekForecast(data) {
        const forecastContainer = document.getElementById(CONSTANTS.ELEMENT_IDS.WEEK_FORECAST);
        if (!forecastContainer) return;

        forecastContainer.innerHTML = '';

        const dailyForecasts = aggregateDailyForecasts(data.list);
        const days = Object.entries(dailyForecasts).slice(0, CONSTANTS.WEATHER_MAX_FORECAST_DAYS);

        days.forEach(([day, forecast]) => {
            const forecastElement = createForecastElement(day, forecast);
            forecastContainer.appendChild(forecastElement);
        });
    }

    /**
     * Aggregates hourly forecast data into daily forecasts
     * @param {Array} forecastList - List of forecast items from API
     * @returns {Object} Daily forecasts keyed by date string
     */
    function aggregateDailyForecasts(forecastList) {
        const dailyForecasts = {};

        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dateKey = date.toLocaleDateString(
                CONSTANTS.LOCALE,
                CONSTANTS.FORECAST_DATE_FORMAT_OPTIONS
            );

            // Use the 12:00 PM forecast for each day, or first available
            if (!dailyForecasts[dateKey]) {
                dailyForecasts[dateKey] = {
                    temp_max: item.main.temp_max,
                    temp_min: item.main.temp_min,
                    icon: item.weather[0].icon,
                    description: item.weather[0].description
                };
            } else {
                // Update min/max temps
                dailyForecasts[dateKey].temp_max = Math.max(
                    dailyForecasts[dateKey].temp_max,
                    item.main.temp_max
                );
                dailyForecasts[dateKey].temp_min = Math.min(
                    dailyForecasts[dateKey].temp_min,
                    item.main.temp_min
                );
            }
        });

        return dailyForecasts;
    }

    /**
     * Creates a forecast day DOM element
     * @param {string} day - Day label
     * @param {Object} forecast - Forecast data
     * @returns {HTMLElement} Forecast element
     */
    function createForecastElement(day, forecast) {
        const forecastDay = document.createElement('div');
        forecastDay.className = CONSTANTS.CSS_CLASSES.FORECAST_DAY;

        forecastDay.innerHTML = `
            <div class="${CONSTANTS.CSS_CLASSES.FORECAST_DAY_NAME}">${day}</div>
            <div class="${CONSTANTS.CSS_CLASSES.FORECAST_ICON}">
                <img src="${CONSTANTS.WEATHER_ICON_BASE_URL}/${forecast.icon}.png"
                     alt="${forecast.description}">
            </div>
            <div class="${CONSTANTS.CSS_CLASSES.FORECAST_TEMPS}">
                <span class="${CONSTANTS.CSS_CLASSES.FORECAST_HIGH}">${Math.round(forecast.temp_max)}°</span>
                <span class="${CONSTANTS.CSS_CLASSES.FORECAST_LOW}">${Math.round(forecast.temp_min)}°</span>
            </div>
        `;

        return forecastDay;
    }

    /**
     * Sets text content of an element by ID
     * @param {string} elementId - Element ID
     * @param {string} text - Text to set
     */
    function setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Displays an error message in a specific element
     * @param {string} elementId - Element ID
     * @param {string} message - Error message
     */
    function displayError(elementId, message) {
        setElementText(elementId, message);
    }

    /**
     * Initializes weather module
     */
    function init() {
        if (window.CONFIG && window.CONFIG.WEATHER_API_KEY) {
            fetchWeather();
            setInterval(fetchWeather, CONSTANTS.WEATHER_UPDATE_INTERVAL_MS);
            console.log('Weather module initialized');
        } else {
            console.warn('Weather module not initialized - no API key configured');
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
