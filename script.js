// ========================================
// Initialize School Name
// ========================================

function initializeSchoolName() {
    const schoolName = (window.CONFIG && window.CONFIG.SCHOOL_NAME) || 'School Name';

    // Update bottom panel school name
    const schoolNameElement = document.getElementById('schoolName');
    if (schoolNameElement) {
        schoolNameElement.textContent = schoolName;
    }

    // Update welcome message
    const welcomeElement = document.getElementById('welcomeMessage');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome to ${schoolName}`;
    }

    // Update page title
    document.title = `School Announcements - ${schoolName}`;
}

// Initialize on load
initializeSchoolName();

// ========================================
// Clock and Date Display
// ========================================

function updateDateTime() {
    const now = new Date();

    // Update time (12-hour format with AM/PM)
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    const displayHours = String(hours).padStart(2, '0');

    document.getElementById('timeDisplay').textContent = `${displayHours}:${minutes}:${seconds} ${ampm}`;

    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', options);
    document.getElementById('dateDisplay').textContent = dateString;
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

// ========================================
// Weather Integration
// ========================================

async function fetchWeather() {
    if (!window.CONFIG || !window.CONFIG.WEATHER_API_KEY) {
        console.error('Weather API key not configured');
        document.getElementById('currentDesc').textContent = 'API Key Missing';
        return;
    }

    const { WEATHER_API_KEY, LOCATION, CITY_ID } = window.CONFIG;

    // Check if API key is still the placeholder
    if (WEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
        console.error('Weather API key not configured - still using placeholder value');
        document.getElementById('currentDesc').textContent = 'Configure API Key';
        document.getElementById('currentTemp').textContent = '--°F';
        document.getElementById('feelsLike').textContent = '--°F';
        document.getElementById('humidity').textContent = '--%';
        return;
    }

    // Build location parameter - prefer city ID if provided, otherwise use city name
    let locationParam;
    if (CITY_ID) {
        locationParam = `id=${CITY_ID}`;
        console.log('Using city ID:', CITY_ID);
    } else if (LOCATION) {
        locationParam = `q=${LOCATION}`;
        console.log('Using city name:', LOCATION);
    } else {
        console.error('No location configured - set either LOCATION or CITY_ID in config.js');
        document.getElementById('currentDesc').textContent = 'Location Not Set';
        return;
    }

    try {
        // Fetch current weather
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?${locationParam}&appid=${WEATHER_API_KEY}&units=imperial`;
        console.log('Fetching weather from:', currentWeatherUrl.replace(WEATHER_API_KEY, 'API_KEY_HIDDEN'));

        const currentResponse = await fetch(currentWeatherUrl);
        const currentData = await currentResponse.json();

        if (currentData.cod === 200) {
            updateCurrentWeather(currentData);
        } else {
            // Show specific API error
            const errorMsg = currentData.message || 'Failed to fetch current weather';
            console.error('Weather API error:', errorMsg, '(Code:', currentData.cod, ')');
            document.getElementById('currentDesc').textContent = `Error: ${errorMsg}`;
            throw new Error(errorMsg);
        }

        // Fetch forecast
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?${locationParam}&appid=${WEATHER_API_KEY}&units=imperial`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod === "200") {
            updateWeekForecast(forecastData);
        } else {
            throw new Error(forecastData.message || 'Failed to fetch forecast');
        }

    } catch (error) {
        console.error('Weather fetch error:', error);
        // If the error message hasn't been set yet, show a generic message
        if (document.getElementById('currentDesc').textContent !== `Error: ${error.message}`) {
            document.getElementById('currentDesc').textContent = 'Error Loading Weather';
        }
    }
}

function updateCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const humidity = data.main.humidity;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    document.getElementById('currentTemp').textContent = `${temp}°F`;
    document.getElementById('currentDesc').textContent = description;
    document.getElementById('feelsLike').textContent = `${feelsLike}°F`;
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('currentIcon').src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
    document.getElementById('currentIcon').alt = description;
}

function updateWeekForecast(data) {
    const forecastContainer = document.getElementById('weekForecast');
    forecastContainer.innerHTML = '';

    // Get daily forecasts (one per day, using noon data)
    const dailyForecasts = {};

    data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

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
            dailyForecasts[dateKey].temp_max = Math.max(dailyForecasts[dateKey].temp_max, item.main.temp_max);
            dailyForecasts[dateKey].temp_min = Math.min(dailyForecasts[dateKey].temp_min, item.main.temp_min);
        }
    });

    // Display up to 5 days
    const days = Object.entries(dailyForecasts).slice(0, 5);

    days.forEach(([day, forecast]) => {
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';

        forecastDay.innerHTML = `
            <div class="forecast-day-name">${day}</div>
            <div class="forecast-icon">
                <img src="https://openweathermap.org/img/wn/${forecast.icon}.png" alt="${forecast.description}">
            </div>
            <div class="forecast-temps">
                <span class="forecast-high">${Math.round(forecast.temp_max)}°</span>
                <span class="forecast-low">${Math.round(forecast.temp_min)}°</span>
            </div>
        `;

        forecastContainer.appendChild(forecastDay);
    });
}

// Update weather every 10 minutes
if (window.CONFIG && window.CONFIG.WEATHER_API_KEY) {
    fetchWeather();
    setInterval(fetchWeather, 600000); // 10 minutes
}

// ========================================
// Slideshow Functionality
// ========================================

let currentSlide = 0;
let slides = [];
let slideshowInterval;
let imageSlides = [];

async function loadImageSlides() {
    const slidesFolder = (window.CONFIG && window.CONFIG.SLIDES_FOLDER) || 'slides';
    const useImageSlides = (window.CONFIG && window.CONFIG.USE_IMAGE_SLIDES) || false;

    if (!useImageSlides) {
        console.log('Using HTML slides');
        return;
    }

    try {
        // Fetch the list of images from the slides.json file
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

        // Clear existing HTML slides
        const slideshowContainer = document.getElementById('slideshowContainer');
        slideshowContainer.innerHTML = '';

        // Create image slides
        imageSlides.forEach((imageName, index) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = 'slide';
            if (index === 0) slideDiv.classList.add('active');

            const img = document.createElement('img');
            img.src = `${slidesFolder}/${imageName}`;
            img.alt = `Slide ${index + 1}`;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'contain';

            slideDiv.appendChild(img);
            slideshowContainer.appendChild(slideDiv);
        });

    } catch (error) {
        console.error('Error loading image slides:', error);
        console.log('Falling back to HTML slides');
    }
}

function initSlideshow() {
    slides = document.querySelectorAll('.slide');

    if (slides.length > 0) {
        showSlide(0);

        // Auto-advance slides
        const interval = (window.CONFIG && window.CONFIG.SLIDESHOW_INTERVAL) || 8000;
        slideshowInterval = setInterval(nextSlide, interval);
    }
}

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));

    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    slides[currentSlide].classList.add('active');
}

function nextSlide() {
    showSlide(currentSlide + 1);
}

function previousSlide() {
    showSlide(currentSlide - 1);
}

// Initialize slideshow on load
document.addEventListener('DOMContentLoaded', async () => {
    await loadImageSlides();
    initSlideshow();
    if (window.CONFIG && window.CONFIG.AUTO_DETECT_LIVESTREAM) {
        startLivestreamMonitoring();
    }
});

// ========================================
// Livestream Toggle and Auto-Detection
// ========================================

let livestreamMonitorInterval;
let isLivestreamActive = false;

function showLivestream(url) {
    const slideshowContainer = document.getElementById('slideshowContainer');
    const livestreamFrame = document.getElementById('livestreamFrame');

    if (url) {
        // Stop slideshow
        clearInterval(slideshowInterval);

        // Hide slideshow, show livestream
        slideshowContainer.style.display = 'none';
        livestreamFrame.src = url;
        livestreamFrame.style.display = 'block';
        isLivestreamActive = true;
        console.log('Switched to livestream:', url);
    } else {
        // Hide livestream, show slideshow
        livestreamFrame.style.display = 'none';
        livestreamFrame.src = '';
        slideshowContainer.style.display = 'flex';
        isLivestreamActive = false;

        // Restart slideshow
        initSlideshow();
        console.log('Switched to slideshow');
    }
}

// Check if livestream is accessible
async function checkLivestreamStatus(url) {
    if (!url) return false;

    try {
        // For YouTube embeds, check if the video is available
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // YouTube embeds are tricky to check without API
            // We'll use iframe load events instead
            return true; // Assume available, iframe will handle errors
        }

        // For other streams (OBS, RTMP, etc.), try to fetch
        // This works for HTTP-based streams like HLS (.m3u8)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors', // Avoid CORS issues
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return true; // If we get here, stream is likely available

    } catch (error) {
        console.log('Livestream not available:', error.message);
        return false;
    }
}

// Monitor livestream status and auto-switch
async function startLivestreamMonitoring() {
    const livestreamUrl = window.CONFIG && window.CONFIG.LIVESTREAM_URL;
    const checkInterval = (window.CONFIG && window.CONFIG.LIVESTREAM_CHECK_INTERVAL) || 60000;

    if (!livestreamUrl) {
        console.log('No livestream URL configured, auto-detection disabled');
        return;
    }

    console.log('Livestream auto-detection enabled. Checking every', checkInterval / 1000, 'seconds');

    // Initial check
    checkAndSwitch();

    // Periodic checks
    livestreamMonitorInterval = setInterval(checkAndSwitch, checkInterval);
}

async function checkAndSwitch() {
    const livestreamUrl = window.CONFIG && window.CONFIG.LIVESTREAM_URL;

    if (!livestreamUrl) return;

    const isOnline = await checkLivestreamStatus(livestreamUrl);

    if (isOnline && !isLivestreamActive) {
        console.log('Livestream detected online, switching...');
        showLivestream(livestreamUrl);
    } else if (!isOnline && isLivestreamActive) {
        console.log('Livestream went offline, switching to slideshow...');
        showLivestream(null);
    }
}

// Expose function globally for easy control
window.showLivestream = showLivestream;

// ========================================
// Keyboard Controls (for testing/management)
// ========================================

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowRight':
            nextSlide();
            break;
        case 'ArrowLeft':
            previousSlide();
            break;
        case 'l':
        case 'L':
            // Toggle livestream (example URL - update as needed)
            const currentlyShowingStream = document.getElementById('livestreamFrame').style.display === 'block';
            if (currentlyShowingStream) {
                showLivestream(null);
            } else {
                // Example: showLivestream('https://www.youtube.com/embed/LIVE_STREAM_ID');
                console.log('Press L to toggle livestream. Configure URL in script.js or config.js');
            }
            break;
        case 'f':
        case 'F':
            // Toggle fullscreen
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
            break;
    }
});

// ========================================
// Auto-refresh daily to prevent memory leaks
// ========================================

// Refresh at 3 AM daily
function scheduleDaily3AMRefresh() {
    const now = new Date();
    const next3AM = new Date();
    next3AM.setHours(3, 0, 0, 0);

    if (now >= next3AM) {
        next3AM.setDate(next3AM.getDate() + 1);
    }

    const timeUntil3AM = next3AM - now;

    setTimeout(() => {
        location.reload();
    }, timeUntil3AM);
}

scheduleDaily3AMRefresh();

console.log('School Announcements Display - Ready');
console.log('Keyboard shortcuts:');
console.log('  Arrow keys: Navigate slides');
console.log('  F: Toggle fullscreen');
console.log('  L: Toggle livestream (configure URL first)');
