# School Announcements Display System

A full-screen web application designed for displaying morning announcements on classroom TVs. Optimized for 1080p and 4K displays with large, readable text visible from 25 feet away.

## Features

- **Large, Readable Display**: All text is sized for visibility from 25+ feet
- **Weather Integration**: Real-time weather with 5-day forecast
- **Auto-Updating Clock**: Live time and date display in 12-hour format
- **Dynamic Image Slideshow**: Load announcements from a folder of images
- **Auto-Detecting Livestream**: Automatically switches between livestream and slides
- **OBS/YouTube Support**: Works with OBS Studio, YouTube Live, and other streams
- **Docker Persistent Volumes**: Update slides without rebuilding container
- **Responsive Design**: Optimized for both 1080p and 4K displays
- **Auto-Refresh**: Automatically refreshes at 3 AM daily to prevent issues

## Layout

```
┌─────────────────────────────────┬──────────────┐
│                                 │              │
│                                 │   Weather    │
│      Main Content Area          │   Today +    │
│   (Slideshow or Livestream)     │   5-Day      │
│                                 │   Forecast   │
│                                 │              │
├─────────────────────────────────┤              │
│ Harford County    │  Time/Date  │              │
│ Public Schools    │             │              │
└───────────────────┴─────────────┴──────────────┘
```

## Quick Start with Docker (Recommended)

**The easiest deployment method!**

```bash
# 1. Configure weather API in config.js
# 2. Run the startup script
./start.sh

# Access at: http://localhost:8080
```

**See [DOCKER.md](DOCKER.md) for complete Docker deployment guide.**

---

## Manual Setup Instructions

### 1. Get a Weather API Key

1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Generate an API key (free tier allows 1,000 calls/day)
4. Copy your API key

### 2. Configure the Application

Edit the `config.js` file:

```javascript
window.CONFIG = {
    SCHOOL_NAME: 'Your School Name',  // Appears in bottom-left
    WEATHER_API_KEY: 'your_actual_api_key_here',  // Replace with your key

    // Location - Choose ONE method:
    LOCATION: 'Bel Air,MD,US',  // City name (easier)
    CITY_ID: null,              // OR use city ID (more reliable)

    SLIDESHOW_INTERVAL: 8000,   // 8 seconds per slide
    LIVESTREAM_URL: null
};
```

**Location Configuration:**

**Option 1: City Name (LOCATION)** - Easier but sometimes less reliable
- Format: `'City,StateCode,CountryCode'`
- Examples: `'Bel Air,MD,US'`, `'New York,NY,US'`, `'London,,GB'`

**Option 2: City ID (CITY_ID)** - More reliable if city names don't work
- Find your city ID: Visit [OpenWeatherMap City Finder](https://openweathermap.org/find)
- Search for your city, copy the ID from the URL or results
- Example: `4347778` for Bel Air, MD
- Set `LOCATION: null` and `CITY_ID: 4347778`

### 3. Add Your Announcement Images

**Option 1: Use Image Slides (Recommended)**

1. Create announcement images (see [Image Specifications](#image-specifications) below)
2. Place images in the `slides/` folder
3. Update `slides/slides.json` with your image filenames:
   ```json
   {
     "images": [
       "monday-announcements.png",
       "upcoming-events.jpg",
       "lunch-menu.png"
     ]
   }
   ```
4. Set `USE_IMAGE_SLIDES: true` in `config.js`

**Option 2: Use HTML Slides**

Edit `index.html` and modify the slides in the `<div class="slideshow-container">` section. Set `USE_IMAGE_SLIDES: false` in `config.js`.

### 4. Configure Livestream (Optional)

**Auto-switching between livestream and slides:**

1. Set your livestream URL in `config.js`:
   ```javascript
   LIVESTREAM_URL: 'https://www.youtube.com/embed/YOUR_VIDEO_ID',
   AUTO_DETECT_LIVESTREAM: true,
   ```

2. The system will automatically:
   - Show livestream when it's online
   - Fall back to slides when offline
   - Check every minute (configurable)

**Supported stream types:**
- YouTube Live embed URLs
- OBS Studio (see [OBS Setup Guide](#obs-studio-setup) below)
- Local network streams (HLS/m3u8)
- Any iframe-compatible video source

### 5. Deploy the Application

#### Option A: Simple File Server (Local Testing)

If you have Python installed:

```bash
# Python 3
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option B: Web Server (Production)

Upload all files to a web server (Apache, Nginx, etc.) and navigate to the URL.

#### Option C: GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select the main branch as source
4. Access via the provided URL

### 4. Display on TV

1. Open the URL in a web browser on the TV
2. Press `F` to enter fullscreen mode
3. Consider using a device like:
   - Raspberry Pi
   - Amazon Fire Stick with Silk Browser
   - Chrome device in kiosk mode
   - Smart TV's built-in browser

## Image Specifications

### Recommended Dimensions and Format

**Resolution:**
- **1920 x 1080 pixels (1080p)** - Standard HD displays
- **3840 x 2160 pixels (4K)** - For 4K displays
- **Aspect Ratio: 16:9** - Matches TV/monitor displays

**File Format:**
- **PNG** - Best for text-heavy slides (lossless)
- **JPG** - Good for photo-based announcements (smaller file size)
- **WebP** - Modern format, good compression
- **File Size:** < 2MB recommended for fast loading

### Design Guidelines

**Text Readability:**
- Minimum font size: **48pt** for body text
- Minimum font size: **72pt+** for headers
- Must be readable from **25+ feet away**
- Use **high contrast** (dark text on light background or vice versa)

**Safe Area:**
- Keep important content **100px from edges**
- Some TVs have overscan that crops edges
- Test on your display to verify

**Color Tips:**
- Avoid pure white backgrounds (harsh on eyes)
- Consider color blindness (avoid red/green only)
- Use school colors for branding
- High contrast is essential

### Creating Announcement Images

**Canva (Easiest):**
1. Create custom size: 1920 x 1080 px
2. Use large, bold fonts
3. Export as PNG

**PowerPoint/Google Slides:**
1. Set slide size to 16:9 widescreen
2. Design: File → Page Setup → Widescreen (16:9)
3. Export: File → Export → PNG

**Photoshop/GIMP:**
1. New document: 1920 x 1080 px, 72 DPI, RGB
2. Design with large fonts
3. Save as PNG or JPG

See `slides/README.md` for more detailed examples and templates.

## OBS Studio Setup

OBS Studio is free software for streaming and can be used to show live video feeds (ceremonies, events, etc.).

### Basic OBS Setup

1. **Install OBS Studio**
   - Download from: https://obsproject.com/
   - Available for Windows, Mac, Linux

2. **Configure OBS Output**

   **Option A: YouTube Live (Easiest)**
   - Stream to YouTube Live
   - Use the embed URL in config.js
   - Auto-detection will switch when live

   **Option B: Local Network Stream (Advanced)**
   - Use nginx-rtmp or similar server
   - Stream to local network
   - Set URL in config: `http://192.168.1.100:8080/stream.m3u8`

3. **Start Streaming**
   - Configure your scenes (camera, screen capture, etc.)
   - Click "Start Streaming"
   - Display will auto-switch if `AUTO_DETECT_LIVESTREAM: true`

### OBS with Local Network

For streaming within your school network without internet:

1. **Set up nginx-rtmp server** (on a local machine):
   ```bash
   # Install nginx with RTMP module
   # Configure to accept RTMP stream and output HLS
   ```

2. **Point OBS to local server**:
   - Server: `rtmp://192.168.1.100/live`
   - Stream Key: `mystream`

3. **Configure announcement display**:
   ```javascript
   LIVESTREAM_URL: 'http://192.168.1.100:8080/hls/mystream.m3u8'
   ```

See [OBS Forums](https://obsproject.com/forum/) for detailed local streaming guides.

## Customization

### Changing Colors

Edit `styles.css` to customize:
- Background gradient (line 14-15)
- Text colors
- Panel transparency
- Font sizes

### Manual Livestream Control

To manually control livestream:

**JavaScript Console:**
```javascript
// Show livestream
showLivestream('https://www.youtube.com/embed/YOUR_VIDEO_ID');

// Return to slideshow
showLivestream(null);
```

## Keyboard Shortcuts

- `←/→` Arrow Keys: Navigate slides manually
- `F`: Toggle fullscreen
- `L`: Toggle livestream (configure URL first)

## Browser Recommendations

**Best Performance:**
- Chrome/Chromium (recommended)
- Microsoft Edge
- Firefox

**Settings for Long-term Display:**
- Disable browser sleep/idle timeout
- Disable screensaver
- Set power management to never sleep
- Enable auto-start on boot (for kiosk setups)

## Kiosk Mode Setup

### Chrome/Chromium (Linux/Windows)
```bash
chromium-browser --kiosk --app=http://your-url-here
```

### Windows - Auto-start Script
Create a batch file (`start_announcements.bat`):
```batch
@echo off
start chrome --kiosk --app=http://your-url-here
```
Place in Startup folder: `%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`

### Raspberry Pi Kiosk Mode

1. Install Chromium:
```bash
sudo apt-get install chromium-browser unclutter
```

2. Edit autostart:
```bash
nano ~/.config/lxsession/LXDE-pi/autostart
```

3. Add:
```
@chromium-browser --kiosk --app=http://your-url-here
@unclutter -idle 0
```

## Troubleshooting

### Weather Not Showing

**If you see "Configure API Key" or "--°F":**
- Your `config.js` still has the placeholder value `'YOUR_API_KEY_HERE'`
- Replace it with your actual API key from OpenWeatherMap
- Save the file and refresh the page

**If you see "Error Loading Weather" or "Error: city not found":**
- Open the browser console (F12) to see the specific error message
- Common causes:
  - **Invalid API key** - verify your key at OpenWeatherMap dashboard
  - **City name not recognized** - Try using city ID instead (see config instructions above)
  - **Incorrect location format** - Should be: `City,StateCode,CountryCode`
  - **API rate limit exceeded** - 1000 calls/day on free tier
  - **Network connectivity issues** - Check internet connection
  - **API key not activated yet** - New keys can take 10-15 minutes to activate

**Solution: Try City ID instead of city name**
1. Visit https://openweathermap.org/find
2. Search for your city
3. Copy the city ID (number in URL or results)
4. In `config.js`, set `LOCATION: null` and `CITY_ID: your_city_id`

**If you see "API Key Missing":**
- The `config.js` file is not loading properly
- Check browser console for JavaScript errors
- Verify the `config.js` file exists in the same directory as `index.html`

### Slides Not Auto-Advancing
- Check browser console for JavaScript errors
- Verify `SLIDESHOW_INTERVAL` is set in `config.js`
- Try refreshing the page

### Text Too Small/Large
- Edit font sizes in `styles.css`
- Base sizes are optimized for 1080p, with automatic scaling for 4K
- Adjust the `@media` query breakpoint (line 195) if needed

### Display Issues on TV
- Ensure TV is set to the correct HDMI input
- Check TV's picture mode (use "Standard" or "PC" mode, not "Cinema")
- Adjust overscan settings if edges are cut off

## Technical Details

- **No backend required**: Pure HTML/CSS/JavaScript
- **API calls**: Weather updates every 10 minutes
- **Auto-refresh**: Reloads at 3 AM daily to prevent memory leaks
- **Responsive**: Automatically scales for 1080p and 4K displays
- **Lightweight**: Minimal dependencies (only Google Fonts)

## File Structure

```
SchoolAnnouncements/
├── index.html          # Main HTML structure
├── styles.css          # All styling and responsive design
├── script.js           # JavaScript functionality
├── config.js           # Configuration settings
└── README.md           # This file
```

## Support

For issues or questions:
- Check the browser console (F12) for errors
- Verify all configuration settings in `config.js`
- Ensure internet connectivity for weather and fonts

## License

Free to use and modify for educational purposes.

## Credits

- Weather data: [OpenWeatherMap](https://openweathermap.org/)
- Font: [Poppins by Google Fonts](https://fonts.google.com/specimen/Poppins)

---

**Harford County Public Schools**
