# School Announcements Display System

A modern, real-time digital signage system designed for schools. Display announcements, weather, livestreams, and manage student dismissal across multiple screens with centralized control.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

## Features

### Display System
- **Real-time Sync** - All displays update instantly via Server-Sent Events (SSE)
- **Custom Themes** - Fully customizable color schemes with preset and custom themes
- **Slideshow** - Multiple slide types (welcome, events, reminders, quotes, images, custom HTML)
- **Weather Widget** - Current conditions and forecast display
- **Clock & Date** - Large, readable time display

### Livestream Integration
- **WebRTC Streaming** - Ultra-low latency via WHIP protocol
- **OBS Integration** - Direct streaming from OBS Studio
- **Auto-Detection** - Automatically switches to livestream when active
- **Fallback Support** - RTMP streaming as backup option

### Emergency Alerts
- **One-Click Alerts** - Lockdown, Evacuation, Shelter in Place, Severe Weather, Medical
- **Custom Alerts** - Create custom emergency messages with configurable colors
- **Instant Override** - Immediately takes over all connected displays
- **Audio Alerts** - Optional sound notification

### Student Dismissal
- **Roster Management** - Import/manage student lists with grades and transportation
- **Visual Display** - Large, clear display of students being called
- **Batch Calling** - Call multiple students at once
- **Fuzzy Search** - Quick student lookup with fuzzy matching

### Admin Features
- **Scheduled Slides** - Set date/time ranges for slides to appear
- **Rich Text Editor** - WYSIWYG editor for slide content
- **Image Upload** - Direct image upload for slides
- **Live Preview** - See changes before publishing
- **Display Manager** - Monitor and control all connected displays

## Screenshots

<!-- Add screenshots here -->
<details>
<summary>Click to view screenshots</summary>

### Main Display
*Screenshot of the main announcement display*

### Admin Panel
*Screenshot of the admin panel*

### Emergency Alert
*Screenshot of emergency alert mode*

### Dismissal Display
*Screenshot of student dismissal display*

</details>

## Quick Start

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [OBS Studio](https://obsproject.com/) (optional, for livestreaming)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/school-announcements.git
   cd school-announcements
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the system**
   ```bash
   docker-compose up -d
   ```

4. **Access the displays**
   - Main Display: http://localhost:8080
   - Admin Panel: http://localhost:8080/admin.html
   - Dismissal Manager: http://localhost:8080/dismissal.html

### Default Credentials
- **Admin Password**: Set via `ADMIN_PASSWORD` in `.env` (default: `admin123`)
- **API Key**: Set via `API_KEY` in `.env` (default: `change-this-in-production`)

> **Important**: Change the default credentials before deploying!

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADMIN_PASSWORD` | Admin panel login password | `admin123` |
| `API_KEY` | API authentication key | `change-this-in-production` |
| `TZ` | Timezone | `America/New_York` |
| `WEATHER_API_KEY` | OpenWeatherMap API key | (optional) |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

### Weather Setup

1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. Add to your `.env` file:
   ```
   WEATHER_API_KEY=your_api_key_here
   ```
3. Configure location in `config.js`

### Livestream Setup

See [OBS-MEDIAMTX-SETUP.md](docs/OBS-MEDIAMTX-SETUP.md) for detailed streaming configuration.

**Quick WHIP Setup (Recommended):**
1. In OBS, go to Settings > Stream
2. Set Service to "WHIP"
3. Set Server to `http://your-server:8080/stream/mystream/whip`
4. Start streaming

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Docker Network                        │
├─────────────────┬─────────────────┬─────────────────────────┤
│                 │                 │                         │
│  ┌───────────┐  │  ┌───────────┐  │  ┌───────────────────┐  │
│  │  Nginx    │  │  │  Node.js  │  │  │    MediaMTX       │  │
│  │  :8080    │◄─┼─►│  API      │  │  │  Streaming Server │  │
│  │           │  │  │  :3000    │  │  │  :8889 (WebRTC)   │  │
│  └───────────┘  │  └───────────┘  │  │  :1935 (RTMP)     │  │
│       ▲         │       ▲         │  └───────────────────┘  │
│       │         │       │         │           ▲             │
└───────┼─────────┴───────┼─────────┴───────────┼─────────────┘
        │                 │                     │
   ┌────┴────┐      ┌─────┴─────┐         ┌─────┴─────┐
   │ Browser │      │ Settings  │         │    OBS    │
   │ Display │      │   JSON    │         │  Studio   │
   └─────────┘      └───────────┘         └───────────┘
```

## File Structure

```
school-announcements/
├── api/                    # Node.js API server
│   ├── server.js          # Main API server
│   ├── security.js        # Security utilities
│   ├── settings.json      # Persistent settings
│   └── uploads/           # Uploaded images
├── js/                     # Frontend JavaScript modules
│   ├── theme-loader.js    # Real-time theme updates
│   ├── emergency-alert.js # Emergency alert display
│   ├── livestream.js      # Livestream integration
│   └── ...
├── streaming-server/       # MediaMTX configuration
├── docs/                   # Documentation
├── docker-compose.yml      # Docker orchestration
├── Dockerfile             # Nginx frontend container
├── nginx.conf             # Nginx configuration
├── config.js              # Frontend configuration
└── .env                   # Environment variables
```

## Security Considerations

### For Local Network Use
This system is designed for local network deployment. For local-only use:
- Change default passwords in `.env`
- Ensure your network is properly secured

### For Internet-Facing Deployment
If exposing to the internet, additional steps are required:

1. **Use HTTPS** - Put behind a reverse proxy with SSL (nginx, Traefik, Caddy)
2. **Strong Passwords** - Use strong, unique passwords
3. **Firewall** - Only expose necessary ports (8080)
4. **Updates** - Keep Docker images updated
5. **Rate Limiting** - Already implemented in API

See [docs/DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md) for production deployment instructions.

## API Documentation

### Authentication
All write operations require authentication via session token:
```
POST /api/auth/login
Body: { "apiKey": "your-api-key" }
Returns: { "sessionToken": "..." }
```

Use the session token in subsequent requests:
```
Header: X-Session-Token: your-session-token
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| POST | `/api/settings` | Update all settings |
| GET | `/api/settings/stream` | SSE stream for real-time updates |
| POST | `/api/emergency/alert` | Send emergency alert |
| POST | `/api/emergency/cancel` | Cancel emergency alert |
| GET | `/api/displays` | List connected displays |
| POST | `/api/upload/image` | Upload image |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MediaMTX](https://github.com/bluenviron/mediamtx) - Streaming server
- [Quill](https://quilljs.com/) - Rich text editor
- [OpenWeatherMap](https://openweathermap.org/) - Weather data

## Support

If you encounter any issues or have questions:
1. Check the existing issues
2. Create a new issue with detailed information

---

Made with care for schools everywhere.
