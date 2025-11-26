/**
 * Admin Panel JavaScript
 * Handles authentication, theme management, slide editing, and livestream configuration
 */

// ========================================
// Authentication
// ========================================

const loginScreen = document.getElementById('loginScreen');
const adminPanel = document.getElementById('adminPanel');
const loginForm = document.getElementById('loginForm');
const passwordInput = document.getElementById('passwordInput');
const loginError = document.getElementById('loginError');
const logoutBtn = document.getElementById('logoutBtn');

// Check if already logged in - but validate session with server first
(async function() {
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        // Validate that the session is still valid with the server
        const isValid = await window.SettingsAPI.validateSession();
        if (isValid) {
            showAdminPanel();
        } else {
            // Session is invalid - clear local state and show login
            console.log('Session expired or invalid - requiring re-login');
            sessionStorage.removeItem('adminLoggedIn');
            window.SettingsAPI.clearSession();
            // Show a message to the user
            if (loginError) {
                loginError.textContent = 'Session expired. Please log in again.';
                loginError.style.display = 'block';
            }
        }
    }
})();

// Expose showToast globally for other modules
window.showToast = showToast;

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const password = passwordInput.value;

    if (password === window.CONFIG.ADMIN_PASSWORD) {
        // Login to API with password as API key
        try {
            await window.SettingsAPI.login(password);
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } catch (error) {
            console.error('API login failed:', error);
            loginError.textContent = 'Failed to authenticate with API. Check console.';
        }
    } else {
        loginError.textContent = 'Incorrect password. Please try again.';
        passwordInput.value = '';
        passwordInput.focus();
    }
});

logoutBtn.addEventListener('click', async () => {
    // Logout from API
    if (window.SettingsAPI) {
        await window.SettingsAPI.logout();
    }
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
});

function showAdminPanel() {
    loginScreen.style.display = 'none';
    adminPanel.style.display = 'block';
    initializeAdmin();
    startHealthCheck();
}

// ========================================
// Health Check
// ========================================

async function checkHealth() {
    const healthStatus = document.getElementById('healthStatus');
    const indicator = healthStatus.querySelector('.health-indicator');
    const text = healthStatus.querySelector('.health-text');

    try {
        const response = await fetch('/api/health');
        const data = await response.json();

        if (data.status === 'ok') {
            indicator.className = 'health-indicator healthy';
            text.textContent = `${data.connections.sse_clients} displays connected`;
            healthStatus.title = `Uptime: ${Math.floor(data.uptime / 60)}m | Memory: ${data.memory.heap_used_mb}MB | Sessions: ${data.connections.active_sessions}`;
        } else {
            indicator.className = 'health-indicator error';
            text.textContent = 'API Error';
            healthStatus.title = 'Click to retry';
        }
    } catch (error) {
        indicator.className = 'health-indicator error';
        text.textContent = 'API Offline';
        healthStatus.title = 'Cannot connect to API';
        console.error('Health check failed:', error);
    }
}

function startHealthCheck() {
    checkHealth(); // Initial check
    setInterval(checkHealth, 30000); // Check every 30 seconds
}

// Manual refresh on click
document.addEventListener('DOMContentLoaded', () => {
    const healthStatus = document.getElementById('healthStatus');
    if (healthStatus) {
        healthStatus.addEventListener('click', checkHealth);
    }
});

// ========================================
// Tab Navigation
// ========================================

const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');

        // Update active nav button
        navBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update active tab content
        tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

// ========================================
// Theme Management
// ========================================

const PRESET_THEMES = {
    default: {
        name: 'Default Blue',
        bgGradientStart: '#1e3c72',
        bgGradientEnd: '#2a5298',
        mainContentBg: '#ffffff',
        mainContentOpacity: 10,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 30,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 40,
        accentColor: '#ffd700'
    },
    sunset: {
        name: 'Sunset Orange',
        bgGradientStart: '#fc4a1a',
        bgGradientEnd: '#f7b733',
        mainContentBg: '#ffffff',
        mainContentOpacity: 15,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 35,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 45,
        accentColor: '#fff5e6'
    },
    forest: {
        name: 'Forest Green',
        bgGradientStart: '#134e5e',
        bgGradientEnd: '#71b280',
        mainContentBg: '#ffffff',
        mainContentOpacity: 12,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 32,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 42,
        accentColor: '#a8e6cf'
    },
    purple: {
        name: 'Purple Dream',
        bgGradientStart: '#667eea',
        bgGradientEnd: '#764ba2',
        mainContentBg: '#ffffff',
        mainContentOpacity: 13,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 33,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 43,
        accentColor: '#e0c3fc'
    },
    ocean: {
        name: 'Deep Ocean',
        bgGradientStart: '#0f2027',
        bgGradientEnd: '#2c5364',
        mainContentBg: '#ffffff',
        mainContentOpacity: 11,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 31,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 41,
        accentColor: '#8dd4e8'
    },
    crimson: {
        name: 'Royal Crimson',
        bgGradientStart: '#8e2de2',
        bgGradientEnd: '#4a00e0',
        mainContentBg: '#ffffff',
        mainContentOpacity: 14,
        weatherPanelBg: '#000000',
        weatherPanelOpacity: 34,
        bottomPanelBg: '#000000',
        bottomPanelOpacity: 44,
        accentColor: '#ffd700'
    }
};

// Theme color inputs
const bgGradientStart = document.getElementById('bgGradientStart');
const bgGradientStartText = document.getElementById('bgGradientStartText');
const bgGradientEnd = document.getElementById('bgGradientEnd');
const bgGradientEndText = document.getElementById('bgGradientEndText');
const mainContentBg = document.getElementById('mainContentBg');
const mainContentOpacity = document.getElementById('mainContentOpacity');
const mainContentOpacityValue = document.getElementById('mainContentOpacityValue');
const weatherPanelBg = document.getElementById('weatherPanelBg');
const weatherPanelOpacity = document.getElementById('weatherPanelOpacity');
const weatherPanelOpacityValue = document.getElementById('weatherPanelOpacityValue');
const bottomPanelBg = document.getElementById('bottomPanelBg');
const bottomPanelOpacity = document.getElementById('bottomPanelOpacity');
const bottomPanelOpacityValue = document.getElementById('bottomPanelOpacityValue');
const accentColor = document.getElementById('accentColor');
const accentColorText = document.getElementById('accentColorText');

// Sync color picker with text input
function syncColorInputs(colorPicker, textInput) {
    colorPicker.addEventListener('input', () => {
        textInput.value = colorPicker.value;
    });

    textInput.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
            colorPicker.value = textInput.value;
        }
    });
}

syncColorInputs(bgGradientStart, bgGradientStartText);
syncColorInputs(bgGradientEnd, bgGradientEndText);
syncColorInputs(accentColor, accentColorText);

// Update opacity value displays
mainContentOpacity.addEventListener('input', () => {
    mainContentOpacityValue.textContent = `${mainContentOpacity.value}%`;
});

weatherPanelOpacity.addEventListener('input', () => {
    weatherPanelOpacityValue.textContent = `${weatherPanelOpacity.value}%`;
});

bottomPanelOpacity.addEventListener('input', () => {
    bottomPanelOpacityValue.textContent = `${bottomPanelOpacity.value}%`;
});

// Apply preset theme
const themePresetBtns = document.querySelectorAll('.theme-preset-btn');
themePresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const themeName = btn.getAttribute('data-theme');
        const theme = PRESET_THEMES[themeName];
        applyThemeToInputs(theme);
    });
});

function applyThemeToInputs(theme) {
    bgGradientStart.value = theme.bgGradientStart;
    bgGradientStartText.value = theme.bgGradientStart;
    bgGradientEnd.value = theme.bgGradientEnd;
    bgGradientEndText.value = theme.bgGradientEnd;
    mainContentBg.value = theme.mainContentBg;
    mainContentOpacity.value = theme.mainContentOpacity;
    mainContentOpacityValue.textContent = `${theme.mainContentOpacity}%`;
    weatherPanelBg.value = theme.weatherPanelBg;
    weatherPanelOpacity.value = theme.weatherPanelOpacity;
    weatherPanelOpacityValue.textContent = `${theme.weatherPanelOpacity}%`;
    bottomPanelBg.value = theme.bottomPanelBg;
    bottomPanelOpacity.value = theme.bottomPanelOpacity;
    bottomPanelOpacityValue.textContent = `${theme.bottomPanelOpacity}%`;
    accentColor.value = theme.accentColor;
    accentColorText.value = theme.accentColor;
}

// Get current theme from inputs
function getCurrentTheme() {
    return {
        bgGradientStart: bgGradientStart.value,
        bgGradientEnd: bgGradientEnd.value,
        mainContentBg: mainContentBg.value,
        mainContentOpacity: parseInt(mainContentOpacity.value),
        weatherPanelBg: weatherPanelBg.value,
        weatherPanelOpacity: parseInt(weatherPanelOpacity.value),
        bottomPanelBg: bottomPanelBg.value,
        bottomPanelOpacity: parseInt(bottomPanelOpacity.value),
        accentColor: accentColor.value
    };
}

// Apply theme button
document.getElementById('applyThemeBtn').addEventListener('click', async () => {
    const theme = getCurrentTheme();
    localStorage.setItem('customTheme', JSON.stringify(theme));

    // Save to API
    try {
        await window.SettingsAPI.save('customTheme', theme);
        showToast('Theme saved to server!', 'success');
    } catch (error) {
        console.error('Failed to save theme to API:', error);
        showToast('Theme applied locally, but failed to sync to server', 'warning');
    }
});

// Save custom theme
document.getElementById('saveCustomThemeBtn').addEventListener('click', async () => {
    const themeName = prompt('Enter a name for this custom theme:');
    if (themeName && themeName.trim()) {
        const theme = getCurrentTheme();
        theme.name = themeName.trim();

        // Get existing custom themes
        const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
        customThemes.push(theme);
        localStorage.setItem('customThemes', JSON.stringify(customThemes));

        // Save to API
        try {
            await window.SettingsAPI.save('customThemes', customThemes);
        } catch (error) {
            console.error('Failed to save custom themes to API:', error);
        }

        showToast(`Custom theme "${themeName}" saved!`, 'success');
        loadCustomThemes();
    }
});

// Reset theme
document.getElementById('resetThemeBtn').addEventListener('click', async () => {
    if (confirm('Reset to default theme? This will remove any applied custom theme.')) {
        localStorage.removeItem('customTheme');
        applyThemeToInputs(PRESET_THEMES.default);

        // Remove from API
        try {
            await window.SettingsAPI.save('customTheme', null);
        } catch (error) {
            console.error('Failed to reset theme on API:', error);
        }

        showToast('Theme reset to default!', 'success');
    }
});

// Load and display custom themes
function loadCustomThemes() {
    const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
    const customThemesList = document.getElementById('customThemesList');
    const customThemeSection = document.getElementById('customThemeSection');

    if (customThemes.length > 0) {
        customThemeSection.style.display = 'block';
        customThemesList.innerHTML = '';

        customThemes.forEach((theme, index) => {
            const themeItem = document.createElement('div');
            themeItem.className = 'custom-theme-item';

            const gradient = `linear-gradient(135deg, ${theme.bgGradientStart}, ${theme.bgGradientEnd})`;

            themeItem.innerHTML = `
                <div class="theme-preview">
                    <div style="background: ${gradient};"></div>
                </div>
                <div class="theme-name">${theme.name}</div>
                <div class="theme-actions">
                    <button class="btn btn-primary btn-load" data-index="${index}">Load</button>
                    <button class="btn btn-danger btn-delete" data-index="${index}">Delete</button>
                </div>
            `;

            customThemesList.appendChild(themeItem);
        });

        // Add event listeners
        document.querySelectorAll('.btn-load').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                applyThemeToInputs(customThemes[index]);
                showToast('Custom theme loaded!', 'success');
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                if (confirm(`Delete theme "${customThemes[index].name}"?`)) {
                    customThemes.splice(index, 1);
                    localStorage.setItem('customThemes', JSON.stringify(customThemes));
                    loadCustomThemes();
                    showToast('Theme deleted!', 'success');
                }
            });
        });
    } else {
        customThemeSection.style.display = 'none';
    }
}

// ========================================
// Slide Editor
// ========================================

const DEFAULT_SLIDES = [
    {
        type: 'welcome',
        content: '<h1>Welcome</h1><p>Morning Announcements</p>'
    },
    {
        type: 'events',
        content: '<h2>Today\'s Events</h2><ul><li>Student Council Meeting - 3:00 PM</li><li>Basketball Practice - 4:00 PM</li><li>Drama Club Rehearsal - 3:30 PM</li></ul>'
    },
    {
        type: 'reminders',
        content: '<h2>Important Reminders</h2><ul><li>Report cards available next week</li><li>Picture day retakes on Friday</li><li>Winter break begins December 23rd</li></ul>'
    }
];

let slides = [];

function loadSlides() {
    const savedSlides = localStorage.getItem('customSlides');
    slides = savedSlides ? JSON.parse(savedSlides) : [...DEFAULT_SLIDES];
    renderSlides();
}

function renderSlides() {
    const slidesList = document.getElementById('slidesList');
    slidesList.innerHTML = '';

    slides.forEach((slide, index) => {
        const slideEditor = document.createElement('div');
        slideEditor.className = 'slide-editor';
        slideEditor.innerHTML = `
            <div class="slide-editor-header">
                <h4>Slide ${index + 1}</h4>
                <button onclick="deleteSlide(${index})">Delete Slide</button>
            </div>
            <div class="slide-editor-content">
                <textarea id="slide-${index}" placeholder="Enter HTML content for this slide">${slide.content}</textarea>
            </div>
        `;
        slidesList.appendChild(slideEditor);
    });
}

function deleteSlide(index) {
    if (confirm('Delete this slide?')) {
        slides.splice(index, 1);
        renderSlides();
        showToast('Slide deleted! Remember to save changes.', 'success');
    }
}

document.getElementById('addSlideBtn').addEventListener('click', () => {
    slides.push({
        type: 'custom',
        content: '<h2>New Slide</h2><p>Edit this content...</p>'
    });
    renderSlides();
    showToast('New slide added! Remember to save changes.', 'success');
});

document.getElementById('saveSlidesBtn').addEventListener('click', () => {
    // Collect content from all textareas
    slides.forEach((slide, index) => {
        const textarea = document.getElementById(`slide-${index}`);
        if (textarea) {
            slide.content = textarea.value;
        }
    });

    localStorage.setItem('customSlides', JSON.stringify(slides));
    showToast('Slides saved! Refresh the main display to see changes.', 'success');
});

document.getElementById('resetSlidesBtn').addEventListener('click', () => {
    if (confirm('Reset all slides to default content?')) {
        localStorage.removeItem('customSlides');
        slides = [...DEFAULT_SLIDES];
        renderSlides();
        showToast('Slides reset to default!', 'success');
    }
});

// Slide mode toggle
const slideModeInputs = document.querySelectorAll('input[name="slideMode"]');
const htmlSlidesSection = document.getElementById('htmlSlidesSection');

slideModeInputs.forEach(input => {
    input.addEventListener('change', () => {
        if (input.value === 'html') {
            htmlSlidesSection.style.display = 'block';
            window.CONFIG.USE_IMAGE_SLIDES = false;
        } else {
            htmlSlidesSection.style.display = 'none';
            window.CONFIG.USE_IMAGE_SLIDES = true;
        }
        localStorage.setItem('USE_IMAGE_SLIDES', window.CONFIG.USE_IMAGE_SLIDES);
    });
});

// ========================================
// Livestream Configuration
// ========================================

const enableLivestream = document.getElementById('enableLivestream');
const livestreamOptions = document.getElementById('livestreamOptions');
const livestreamUrl = document.getElementById('livestreamUrl');
const autoDetectLivestream = document.getElementById('autoDetectLivestream');
const livestreamCheckInterval = document.getElementById('livestreamCheckInterval');

// Set initial state and add change listener
function updateLivestreamOptionsVisibility() {
    if (livestreamOptions) {
        livestreamOptions.style.display = enableLivestream.checked ? 'block' : 'none';
    }
}

enableLivestream.addEventListener('change', updateLivestreamOptionsVisibility);

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateLivestreamOptionsVisibility);

document.getElementById('testStreamBtn').addEventListener('click', () => {
    const url = livestreamUrl.value.trim();
    if (!url) {
        showToast('Please enter a stream URL first', 'error');
        return;
    }

    // Open stream URL in new tab
    window.open(url, '_blank', 'width=1280,height=720');
    showToast('Opening stream in new window...', 'info');
});

document.getElementById('saveLivestreamBtn').addEventListener('click', async () => {
    const livestreamConfig = {
        enabled: enableLivestream.checked,
        url: livestreamUrl.value,
        autoDetect: autoDetectLivestream.checked,
        checkInterval: parseInt(livestreamCheckInterval.value) * 1000
    };

    // Save to localStorage (backup)
    localStorage.setItem('livestreamConfig', JSON.stringify(livestreamConfig));

    // Save to API (persistent storage)
    try {
        await window.SettingsAPI.save('livestreamConfig', livestreamConfig);
        showToast('Livestream settings saved to server!', 'success');
    } catch (error) {
        console.error('Failed to save to API:', error);
        showToast('Saved locally, but failed to sync to server', 'warning');
    }

    // Update CONFIG
    window.CONFIG.LIVESTREAM_URL = livestreamConfig.enabled ? livestreamConfig.url : null;
    window.CONFIG.AUTO_DETECT_LIVESTREAM = livestreamConfig.autoDetect;
    window.CONFIG.LIVESTREAM_CHECK_INTERVAL = livestreamConfig.checkInterval;
});

// ========================================
// General Settings
// ========================================

const schoolName = document.getElementById('schoolName');
const slideshowInterval = document.getElementById('slideshowInterval');

document.getElementById('saveGeneralBtn').addEventListener('click', async () => {
    const generalConfig = {
        schoolName: schoolName.value,
        slideshowInterval: parseInt(slideshowInterval.value) * 1000
    };

    // Save to localStorage (backup)
    localStorage.setItem('generalConfig', JSON.stringify(generalConfig));

    // Save to API (persistent storage)
    try {
        await window.SettingsAPI.save('generalConfig', generalConfig);
        showToast('General settings saved to server!', 'success');
    } catch (error) {
        console.error('Failed to save to API:', error);
        showToast('Saved locally, but failed to sync to server', 'warning');
    }

    // Update CONFIG
    window.CONFIG.SCHOOL_NAME = generalConfig.schoolName;
    window.CONFIG.SLIDESHOW_INTERVAL = generalConfig.slideshowInterval;
});

// ========================================
// Toast Notification
// ========================================

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// Initialization
// ========================================

async function initializeAdmin() {
    // Load settings from API first, fallback to localStorage
    let settings = {};
    try {
        settings = await window.SettingsAPI.getAll();
        console.log('Loaded settings from API:', Object.keys(settings));
    } catch (error) {
        console.warn('Failed to load from API, using localStorage:', error);
    }

    // Load current theme (API first, then localStorage)
    const savedTheme = settings.customTheme || JSON.parse(localStorage.getItem('customTheme') || 'null');
    if (savedTheme) {
        applyThemeToInputs(savedTheme);
    } else {
        applyThemeToInputs(PRESET_THEMES.default);
    }

    // Load custom themes list
    loadCustomThemes();

    // Load slides
    loadSlides();

    // Load slide mode (API first, then localStorage)
    const useImageSlides = settings.USE_IMAGE_SLIDES !== undefined
        ? settings.USE_IMAGE_SLIDES
        : localStorage.getItem('USE_IMAGE_SLIDES') === 'true';
    if (useImageSlides) {
        document.querySelector('input[name="slideMode"][value="images"]').checked = true;
        htmlSlidesSection.style.display = 'none';
    }

    // Load livestream config (API first, then localStorage)
    const livestreamConfig = settings.livestreamConfig || JSON.parse(localStorage.getItem('livestreamConfig') || '{}');
    enableLivestream.checked = livestreamConfig.enabled || false;
    livestreamUrl.value = livestreamConfig.url || '';
    autoDetectLivestream.checked = livestreamConfig.autoDetect || false;
    livestreamCheckInterval.value = (livestreamConfig.checkInterval || 60000) / 1000;

    // Update visibility based on enabled state
    updateLivestreamOptionsVisibility();

    // Load general settings (API first, then localStorage)
    const generalConfig = settings.generalConfig || JSON.parse(localStorage.getItem('generalConfig') || '{}');
    schoolName.value = generalConfig.schoolName || window.CONFIG.SCHOOL_NAME;
    slideshowInterval.value = (generalConfig.slideshowInterval || window.CONFIG.SLIDESHOW_INTERVAL) / 1000;

    console.log('Admin panel initialized with settings');

    // Initialize preview
    initializePreview();
}

// Make deleteSlide available globally
window.deleteSlide = deleteSlide;

// ========================================
// Preview Mode
// ========================================

function initializePreview() {
    const previewFrame = document.getElementById('previewFrame');
    const fullPreviewModal = document.getElementById('fullPreviewModal');
    const fullPreviewFrame = document.getElementById('fullPreviewFrame');
    const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    const openFullPreviewBtn = document.getElementById('openFullPreviewBtn');
    const openNewTabBtn = document.getElementById('openNewTabBtn');
    const closeFullPreviewBtn = document.getElementById('closeFullPreviewBtn');

    if (!previewFrame) return;

    // Refresh preview
    if (refreshPreviewBtn) {
        refreshPreviewBtn.addEventListener('click', () => {
            previewFrame.src = previewFrame.src;
            showToast('Preview refreshed!', 'success');
        });
    }

    // Open full screen preview
    if (openFullPreviewBtn && fullPreviewModal && fullPreviewFrame) {
        openFullPreviewBtn.addEventListener('click', () => {
            fullPreviewFrame.src = '/';
            fullPreviewModal.style.display = 'flex';
        });
    }

    // Close full screen preview
    if (closeFullPreviewBtn && fullPreviewModal) {
        closeFullPreviewBtn.addEventListener('click', () => {
            fullPreviewModal.style.display = 'none';
            fullPreviewFrame.src = 'about:blank';
        });
    }

    // ESC key to close full screen preview
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullPreviewModal && fullPreviewModal.style.display !== 'none') {
            fullPreviewModal.style.display = 'none';
            fullPreviewFrame.src = 'about:blank';
        }
    });

    // Open in new tab
    if (openNewTabBtn) {
        openNewTabBtn.addEventListener('click', () => {
            window.open('/', '_blank');
        });
    }

    // Auto-refresh preview when switching to preview tab
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.tab === 'preview' && previewFrame) {
                // Small delay to ensure tab is visible before refreshing
                setTimeout(() => {
                    previewFrame.src = previewFrame.src;
                }, 100);
            }
        });
    });
}
