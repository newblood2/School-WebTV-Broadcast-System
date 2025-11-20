// ========================================
// Configuration File
// ========================================

window.CONFIG = {
    // School/District Name
    // This appears in the bottom-left corner of the display
    SCHOOL_NAME: 'Harford County Public Schools',

    // Weather API Configuration
    // Get your free API key from: https://openweathermap.org/api
    // IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual API key
    // If you see "Configure API Key" or "Error Loading Weather", check this value
    WEATHER_API_KEY: 'API KEY HERE',

    // Location for weather - Use ONE of these two options:

    // OPTION 1: City name (City, State Code, Country Code)
    // Examples: 'Bel Air,MD,US' or 'Baltimore,MD,US' or 'New York,NY,US'
    LOCATION: 'Bel Air,MD,US',

    // OPTION 2: City ID (more reliable, find yours at: https://openweathermap.org/find)
    // Example: 4347778 for Bel Air, MD
    // Set LOCATION to null and use CITY_ID instead if you have issues with city names
    CITY_ID: null,  // e.g., 4347778

    // Slideshow Settings
    SLIDESHOW_INTERVAL: 8000, // Time in milliseconds (8000 = 8 seconds)

    // Image slides folder (relative to index.html)
    // Put your announcement images in this folder
    // Supported formats: jpg, jpeg, png, gif, webp
    SLIDES_FOLDER: 'slides',

    // Use folder images instead of HTML slides (set to true to enable)
    USE_IMAGE_SLIDES: false,

    // Livestream Configuration
    // The system will auto-detect if the stream is online and switch automatically

    // Livestream URL (YouTube, OBS, etc.)
    // YouTube example: 'https://www.youtube.com/embed/LIVE_STREAM_ID'
    // Local OBS/RTMP example: 'http://192.168.1.100:8080/stream.m3u8'
    LIVESTREAM_URL: null,

    // Auto-switch to livestream when online (checks every minute)
    AUTO_DETECT_LIVESTREAM: true,

    // Check interval for livestream status (milliseconds)
    LIVESTREAM_CHECK_INTERVAL: 60000  // 1 minute
};
