/**
 * Visual Slide Editor Module
 * User-friendly WYSIWYG slide editor for non-technical users
 */

(function() {
    'use strict';

    // ========================================
    // QUILL EDITORS
    // ========================================
    let quillEditors = {};

    function initializeQuillEditors() {
        // Clean up existing editors
        Object.keys(quillEditors).forEach(key => {
            if (quillEditors[key]) {
                delete quillEditors[key];
            }
        });
        quillEditors = {};

        // Initialize new Quill editors
        document.querySelectorAll('.quill-editor').forEach(editorEl => {
            const fieldId = editorEl.dataset.field;
            const hiddenInput = document.getElementById(`field_${fieldId}`);

            if (!hiddenInput) return;

            const quill = new Quill(editorEl, {
                theme: 'snow',
                placeholder: 'Enter your content here...',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                }
            });

            // Set initial content
            const initialContent = hiddenInput.value;
            if (initialContent) {
                quill.root.innerHTML = initialContent;
            }

            // Update hidden input and preview on change
            quill.on('text-change', function() {
                const html = quill.root.innerHTML;
                hiddenInput.value = html;
                hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
            });

            quillEditors[fieldId] = quill;
        });
    }

    // ========================================
    // SCHEDULE MANAGEMENT
    // ========================================
    let slideSchedules = {};

    function loadSchedules() {
        try {
            const saved = localStorage.getItem('slideSchedules');
            if (saved) {
                slideSchedules = JSON.parse(saved);
            }
        } catch (e) {
            slideSchedules = {};
        }
    }

    function saveSchedules() {
        localStorage.setItem('slideSchedules', JSON.stringify(slideSchedules));

        // Also save to API
        if (window.SettingsAPI) {
            window.SettingsAPI.save('slideSchedules', slideSchedules).catch(err => {
                console.error('Failed to save schedules to API:', err);
            });
        }
    }

    function getScheduleForSlide(slideId) {
        return slideSchedules[slideId] || null;
    }

    function setScheduleForSlide(slideId, schedule) {
        if (schedule && schedule.enabled) {
            slideSchedules[slideId] = schedule;
        } else {
            delete slideSchedules[slideId];
        }
        saveSchedules();
    }

    // ========================================
    // SLIDE TEMPLATES
    // ========================================
    const SLIDE_TEMPLATES = {
        welcome: {
            name: 'Welcome Message',
            icon: '👋',
            description: 'A welcoming title slide',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: 'Welcome!', placeholder: 'Enter welcome message' },
                { id: 'subtitle', label: 'Subtitle', type: 'text', default: 'Morning Announcements', placeholder: 'Enter subtitle' }
            ],
            render: (data) => `<h1>${escapeHtml(data.title)}</h1><p class="subtitle">${escapeHtml(data.subtitle)}</p>`
        },
        announcement: {
            name: 'Announcement',
            icon: '📢',
            description: 'Important announcement with title and message',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: 'Announcement', placeholder: 'Enter title' },
                { id: 'message', label: 'Message', type: 'textarea', default: 'Enter your announcement here...', placeholder: 'Enter announcement details' }
            ],
            render: (data) => `<h2>${escapeHtml(data.title)}</h2><p class="announcement-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>`
        },
        events: {
            name: 'Events List',
            icon: '📅',
            description: 'List of upcoming events with times',
            fields: [
                { id: 'title', label: 'Section Title', type: 'text', default: "Today's Events", placeholder: 'Enter section title' },
                { id: 'events', label: 'Events', type: 'eventlist', default: [
                    { name: 'Morning Assembly', time: '8:00 AM' },
                    { name: 'Student Council', time: '3:00 PM' }
                ]}
            ],
            render: (data) => {
                const eventsList = data.events.map(e =>
                    `<li><span class="event-name">${escapeHtml(e.name)}</span><span class="event-time">${escapeHtml(e.time)}</span></li>`
                ).join('');
                return `<h2>${escapeHtml(data.title)}</h2><ul class="events-list">${eventsList}</ul>`;
            }
        },
        bulletList: {
            name: 'Bullet Points',
            icon: '📝',
            description: 'Simple list of items',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: 'Reminders', placeholder: 'Enter title' },
                { id: 'items', label: 'List Items', type: 'simplelist', default: ['First item', 'Second item', 'Third item'] }
            ],
            render: (data) => {
                const itemsList = data.items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
                return `<h2>${escapeHtml(data.title)}</h2><ul class="bullet-list">${itemsList}</ul>`;
            }
        },
        lunch: {
            name: 'Lunch Menu',
            icon: '🍽️',
            description: 'Display lunch options',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: "Today's Lunch", placeholder: 'Enter title' },
                { id: 'mainDish', label: 'Main Dish', type: 'text', default: 'Pizza', placeholder: 'Main dish' },
                { id: 'sides', label: 'Sides', type: 'text', default: 'Salad, Fruit Cup', placeholder: 'Side dishes' },
                { id: 'drink', label: 'Drink', type: 'text', default: 'Milk or Juice', placeholder: 'Beverage options' }
            ],
            render: (data) => `
                <h2>${escapeHtml(data.title)}</h2>
                <div class="lunch-menu">
                    <div class="lunch-item"><span class="lunch-label">Main:</span> ${escapeHtml(data.mainDish)}</div>
                    <div class="lunch-item"><span class="lunch-label">Sides:</span> ${escapeHtml(data.sides)}</div>
                    <div class="lunch-item"><span class="lunch-label">Drink:</span> ${escapeHtml(data.drink)}</div>
                </div>
            `
        },
        birthday: {
            name: 'Birthdays',
            icon: '🎂',
            description: 'Celebrate student birthdays',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: 'Happy Birthday!', placeholder: 'Enter title' },
                { id: 'names', label: 'Birthday Names', type: 'simplelist', default: ['John S.', 'Sarah M.'] }
            ],
            render: (data) => {
                const namesList = data.names.map(name => `<span class="birthday-name">${escapeHtml(name)}</span>`).join('');
                return `<h2>🎂 ${escapeHtml(data.title)} 🎂</h2><div class="birthday-names">${namesList}</div>`;
            }
        },
        countdown: {
            name: 'Countdown',
            icon: '⏰',
            description: 'Count down to an event',
            fields: [
                { id: 'eventName', label: 'Event Name', type: 'text', default: 'Winter Break', placeholder: 'What are we counting down to?' },
                { id: 'daysLeft', label: 'Days Left', type: 'number', default: '10', placeholder: 'Number of days' }
            ],
            render: (data) => `
                <div class="countdown-slide">
                    <h2>${escapeHtml(data.daysLeft)} Days Until</h2>
                    <h1 class="countdown-event">${escapeHtml(data.eventName)}!</h1>
                </div>
            `
        },
        quote: {
            name: 'Quote of the Day',
            icon: '💬',
            description: 'Inspirational quote',
            fields: [
                { id: 'quote', label: 'Quote', type: 'textarea', default: 'Be the change you wish to see in the world.', placeholder: 'Enter the quote' },
                { id: 'author', label: 'Author', type: 'text', default: 'Mahatma Gandhi', placeholder: 'Who said this?' }
            ],
            render: (data) => `
                <div class="quote-slide">
                    <blockquote>"${escapeHtml(data.quote)}"</blockquote>
                    <cite>— ${escapeHtml(data.author)}</cite>
                </div>
            `
        },
        image: {
            name: 'Image Slide',
            icon: '🖼️',
            description: 'Display an image with optional caption',
            fields: [
                { id: 'imageUrl', label: 'Image', type: 'imageupload', default: '', placeholder: 'Upload or enter image URL' },
                { id: 'caption', label: 'Caption (optional)', type: 'text', default: '', placeholder: 'Enter image caption' }
            ],
            render: (data) => {
                const caption = data.caption ? `<p class="image-caption">${escapeHtml(data.caption)}</p>` : '';
                return `<div class="image-slide"><img src="${escapeHtml(data.imageUrl)}" alt="${escapeHtml(data.caption || 'Slide image')}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22><rect fill=%22%23ddd%22 width=%22400%22 height=%22300%22/><text fill=%22%23999%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22>Image not found</text></svg>'">${caption}</div>`;
            }
        },
        richcontent: {
            name: 'Rich Content',
            icon: '✨',
            description: 'Create content with rich text editor',
            fields: [
                { id: 'title', label: 'Title', type: 'text', default: 'Announcement', placeholder: 'Enter slide title' },
                { id: 'content', label: 'Content', type: 'richtext', default: '<p>Click here to start editing...</p>', placeholder: 'Use the toolbar to format your content' }
            ],
            render: (data) => `
                <div class="rich-content-slide">
                    ${data.title ? `<h2>${escapeHtml(data.title)}</h2>` : ''}
                    <div class="rich-content">${data.content}</div>
                </div>
            `
        },
        custom: {
            name: 'Custom HTML',
            icon: '🔧',
            description: 'Advanced: Write your own HTML',
            fields: [
                { id: 'html', label: 'HTML Content', type: 'code', default: '<h2>Custom Slide</h2>\n<p>Your content here...</p>', placeholder: 'Enter HTML code' }
            ],
            render: (data) => data.html
        }
    };

    // ========================================
    // STATE
    // ========================================
    let slides = [];
    let selectedSlideIndex = -1;
    let draggedSlideIndex = -1;

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function generateId() {
        return 'slide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========================================
    // SLIDE MANAGEMENT
    // ========================================
    function loadSlides() {
        const saved = localStorage.getItem('visualSlides');
        if (saved) {
            try {
                slides = JSON.parse(saved);
            } catch (e) {
                slides = getDefaultSlides();
            }
        } else {
            // Try to migrate from old format
            const oldSlides = localStorage.getItem('customSlides');
            if (oldSlides) {
                slides = migrateOldSlides(JSON.parse(oldSlides));
            } else {
                slides = getDefaultSlides();
            }
        }
        renderSlideList();
        if (slides.length > 0) {
            selectSlide(0);
        }
    }

    function getDefaultSlides() {
        return [
            {
                id: generateId(),
                template: 'welcome',
                data: { title: 'Good Morning!', subtitle: 'Welcome to Morning Announcements' }
            },
            {
                id: generateId(),
                template: 'events',
                data: {
                    title: "Today's Events",
                    events: [
                        { name: 'Student Council Meeting', time: '3:00 PM' },
                        { name: 'Basketball Practice', time: '4:00 PM' },
                        { name: 'Drama Club Rehearsal', time: '3:30 PM' }
                    ]
                }
            },
            {
                id: generateId(),
                template: 'bulletList',
                data: {
                    title: 'Important Reminders',
                    items: [
                        'Report cards available next week',
                        'Picture day retakes on Friday',
                        'Winter break begins December 23rd'
                    ]
                }
            }
        ];
    }

    function migrateOldSlides(oldSlides) {
        return oldSlides.map(slide => ({
            id: generateId(),
            template: 'custom',
            data: { html: slide.content }
        }));
    }

    function saveSlides() {
        localStorage.setItem('visualSlides', JSON.stringify(slides));

        // Also save in the old format for backward compatibility with the display
        const oldFormat = slides.map(slide => {
            const template = SLIDE_TEMPLATES[slide.template];
            return {
                type: slide.template,
                content: template ? template.render(slide.data) : slide.data.html || ''
            };
        });
        localStorage.setItem('customSlides', JSON.stringify(oldFormat));

        showToast('Slides saved! Changes will appear on the display.', 'success');
    }

    // ========================================
    // RENDER FUNCTIONS
    // ========================================
    function renderSlideList() {
        const container = document.getElementById('slideListContainer');
        if (!container) return;

        if (slides.length === 0) {
            container.innerHTML = `
                <div class="no-slides-message">
                    <p>No slides yet!</p>
                    <p>Click "Add New Slide" to get started.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = slides.map((slide, index) => {
            const template = SLIDE_TEMPLATES[slide.template] || SLIDE_TEMPLATES.custom;
            const isSelected = index === selectedSlideIndex;
            return `
                <div class="slide-list-item ${isSelected ? 'selected' : ''}"
                     data-index="${index}"
                     draggable="true"
                     onclick="window.SlideEditor.selectSlide(${index})">
                    <div class="slide-list-drag-handle" title="Drag to reorder">⋮⋮</div>
                    <div class="slide-list-icon">${template.icon}</div>
                    <div class="slide-list-info">
                        <div class="slide-list-title">${escapeHtml(slide.data.title || slide.data.eventName || template.name)}</div>
                        <div class="slide-list-type">${template.name}</div>
                    </div>
                    <div class="slide-list-number">${index + 1}</div>
                </div>
            `;
        }).join('');

        // Add drag and drop handlers
        setupDragAndDrop();
    }

    function renderSlideEditor() {
        const container = document.getElementById('slideEditorContainer');
        if (!container) return;

        if (selectedSlideIndex < 0 || selectedSlideIndex >= slides.length) {
            container.innerHTML = `
                <div class="no-slide-selected">
                    <div class="no-slide-icon">👈</div>
                    <p>Select a slide from the list to edit it</p>
                    <p>or add a new slide to get started</p>
                </div>
            `;
            return;
        }

        const slide = slides[selectedSlideIndex];
        const template = SLIDE_TEMPLATES[slide.template] || SLIDE_TEMPLATES.custom;
        const schedule = getScheduleForSlide(slide.id) || {};

        container.innerHTML = `
            <div class="slide-editor-header">
                <div class="slide-editor-title">
                    <span class="slide-editor-icon">${template.icon}</span>
                    <span>Editing: ${template.name}</span>
                    ${schedule.enabled ? '<span class="schedule-badge">📅 Scheduled</span>' : ''}
                </div>
                <div class="slide-editor-actions">
                    <button class="btn btn-secondary btn-sm" onclick="window.SlideEditor.duplicateSlide(${selectedSlideIndex})">
                        Duplicate
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="window.SlideEditor.deleteSlide(${selectedSlideIndex})">
                        Delete
                    </button>
                </div>
            </div>

            <div class="slide-editor-fields">
                ${renderFields(template.fields, slide.data)}
            </div>

            <!-- Schedule Section -->
            <div class="slide-schedule-section">
                <h4>📅 Schedule</h4>
                <p class="schedule-help">Set when this slide should appear. Leave empty to always show.</p>

                <div class="schedule-toggle">
                    <label class="toggle-label">
                        <input type="checkbox" id="scheduleEnabled" ${schedule.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                        <span>Enable Schedule</span>
                    </label>
                </div>

                <div class="schedule-options" id="scheduleOptions" style="display: ${schedule.enabled ? 'block' : 'none'};">
                    <div class="schedule-row">
                        <div class="schedule-field">
                            <label for="scheduleStartDate">Start Date</label>
                            <input type="date" id="scheduleStartDate" class="form-input" value="${schedule.startDate || ''}">
                        </div>
                        <div class="schedule-field">
                            <label for="scheduleEndDate">End Date</label>
                            <input type="date" id="scheduleEndDate" class="form-input" value="${schedule.endDate || ''}">
                        </div>
                    </div>

                    <div class="schedule-row">
                        <div class="schedule-field">
                            <label for="scheduleStartTime">Start Time</label>
                            <input type="time" id="scheduleStartTime" class="form-input" value="${schedule.startTime || ''}">
                        </div>
                        <div class="schedule-field">
                            <label for="scheduleEndTime">End Time</label>
                            <input type="time" id="scheduleEndTime" class="form-input" value="${schedule.endTime || ''}">
                        </div>
                    </div>

                    <div class="schedule-field">
                        <label>Days of Week</label>
                        <div class="days-of-week">
                            ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => `
                                <label class="day-checkbox">
                                    <input type="checkbox" value="${i}" ${(schedule.daysOfWeek || []).includes(i) ? 'checked' : ''}>
                                    <span>${day}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>

                    <button class="btn btn-primary btn-sm" id="saveScheduleBtn">Save Schedule</button>
                    <button class="btn btn-secondary btn-sm" id="clearScheduleBtn">Clear Schedule</button>
                </div>
            </div>

            <div class="slide-editor-preview">
                <h4>Preview</h4>
                <div class="slide-preview-frame">
                    <div class="slide-preview-content" id="slidePreviewContent">
                        ${template.render(slide.data)}
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for field changes
        setupFieldListeners();
        setupScheduleListeners(slide.id);
    }

    function setupScheduleListeners(slideId) {
        const enabledCheckbox = document.getElementById('scheduleEnabled');
        const optionsDiv = document.getElementById('scheduleOptions');
        const saveBtn = document.getElementById('saveScheduleBtn');
        const clearBtn = document.getElementById('clearScheduleBtn');

        if (enabledCheckbox) {
            enabledCheckbox.addEventListener('change', () => {
                if (optionsDiv) {
                    optionsDiv.style.display = enabledCheckbox.checked ? 'block' : 'none';
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const schedule = {
                    enabled: document.getElementById('scheduleEnabled').checked,
                    startDate: document.getElementById('scheduleStartDate').value || null,
                    endDate: document.getElementById('scheduleEndDate').value || null,
                    startTime: document.getElementById('scheduleStartTime').value || null,
                    endTime: document.getElementById('scheduleEndTime').value || null,
                    daysOfWeek: Array.from(document.querySelectorAll('.days-of-week input:checked'))
                        .map(cb => parseInt(cb.value))
                };

                setScheduleForSlide(slideId, schedule);
                renderSlideList();
                showToast('Schedule saved!', 'success');
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                setScheduleForSlide(slideId, null);
                renderSlideEditor();
                renderSlideList();
                showToast('Schedule cleared!', 'success');
            });
        }
    }

    function renderFields(fields, data) {
        return fields.map(field => {
            const value = data[field.id] !== undefined ? data[field.id] : field.default;

            switch (field.type) {
                case 'text':
                    return `
                        <div class="editor-field">
                            <label for="field_${field.id}">${field.label}</label>
                            <input type="text"
                                   id="field_${field.id}"
                                   class="form-input field-input"
                                   data-field="${field.id}"
                                   value="${escapeHtml(value)}"
                                   placeholder="${field.placeholder || ''}">
                        </div>
                    `;

                case 'number':
                    return `
                        <div class="editor-field">
                            <label for="field_${field.id}">${field.label}</label>
                            <input type="number"
                                   id="field_${field.id}"
                                   class="form-input field-input"
                                   data-field="${field.id}"
                                   value="${escapeHtml(value)}"
                                   placeholder="${field.placeholder || ''}">
                        </div>
                    `;

                case 'textarea':
                    return `
                        <div class="editor-field">
                            <label for="field_${field.id}">${field.label}</label>
                            <textarea id="field_${field.id}"
                                      class="form-input field-input"
                                      data-field="${field.id}"
                                      rows="4"
                                      placeholder="${field.placeholder || ''}">${escapeHtml(value)}</textarea>
                        </div>
                    `;

                case 'richtext':
                    return `
                        <div class="editor-field">
                            <label>${field.label}</label>
                            <div class="quill-wrapper">
                                <div id="quill_${field.id}" class="quill-editor" data-field="${field.id}"></div>
                                <input type="hidden" id="field_${field.id}" class="field-input" data-field="${field.id}" value="${escapeHtml(value)}">
                            </div>
                            <small class="field-hint">Use the toolbar above to format text, add lists, and more</small>
                        </div>
                    `;

                case 'imageupload':
                    return `
                        <div class="editor-field">
                            <label for="field_${field.id}">${field.label}</label>
                            <div class="image-upload-wrapper">
                                <div class="image-preview-box" id="preview_${field.id}">
                                    ${value ? `<img src="${escapeHtml(value)}" alt="Preview">` : '<span class="preview-placeholder">No image selected</span>'}
                                </div>
                                <div class="image-upload-controls">
                                    <input type="file"
                                           id="file_${field.id}"
                                           class="image-file-input"
                                           data-field="${field.id}"
                                           accept="image/*">
                                    <label for="file_${field.id}" class="btn btn-primary btn-sm">
                                        Upload Image
                                    </label>
                                    <span class="upload-or">or</span>
                                    <input type="text"
                                           id="field_${field.id}"
                                           class="form-input field-input image-url-input"
                                           data-field="${field.id}"
                                           value="${escapeHtml(value)}"
                                           placeholder="Enter image URL">
                                </div>
                                <small class="field-hint">Upload an image or enter a URL. Max file size: 10MB</small>
                            </div>
                        </div>
                    `;

                case 'code':
                    return `
                        <div class="editor-field">
                            <label for="field_${field.id}">${field.label}</label>
                            <textarea id="field_${field.id}"
                                      class="form-input field-input code-input"
                                      data-field="${field.id}"
                                      rows="8"
                                      placeholder="${field.placeholder || ''}">${escapeHtml(value)}</textarea>
                            <small class="field-hint">⚠️ Advanced: HTML code will be rendered directly</small>
                        </div>
                    `;

                case 'simplelist':
                    return `
                        <div class="editor-field">
                            <label>${field.label}</label>
                            <div class="list-editor" data-field="${field.id}">
                                ${(value || []).map((item, i) => `
                                    <div class="list-item">
                                        <input type="text" class="form-input list-item-input" value="${escapeHtml(item)}" data-index="${i}">
                                        <button type="button" class="btn-icon btn-remove-item" onclick="window.SlideEditor.removeListItem('${field.id}', ${i})">✕</button>
                                    </div>
                                `).join('')}
                                <button type="button" class="btn btn-secondary btn-sm btn-add-item" onclick="window.SlideEditor.addListItem('${field.id}')">
                                    + Add Item
                                </button>
                            </div>
                        </div>
                    `;

                case 'eventlist':
                    return `
                        <div class="editor-field">
                            <label>${field.label}</label>
                            <div class="event-list-editor" data-field="${field.id}">
                                ${(value || []).map((event, i) => `
                                    <div class="event-item">
                                        <input type="text" class="form-input event-name-input" value="${escapeHtml(event.name)}" placeholder="Event name" data-index="${i}" data-prop="name">
                                        <input type="text" class="form-input event-time-input" value="${escapeHtml(event.time)}" placeholder="Time" data-index="${i}" data-prop="time">
                                        <button type="button" class="btn-icon btn-remove-item" onclick="window.SlideEditor.removeEventItem('${field.id}', ${i})">✕</button>
                                    </div>
                                `).join('')}
                                <button type="button" class="btn btn-secondary btn-sm btn-add-item" onclick="window.SlideEditor.addEventItem('${field.id}')">
                                    + Add Event
                                </button>
                            </div>
                        </div>
                    `;

                default:
                    return '';
            }
        }).join('');
    }

    function renderTemplateSelector() {
        const container = document.getElementById('templateSelectorModal');
        if (!container) return;

        const templateHtml = Object.entries(SLIDE_TEMPLATES).map(([key, template]) => `
            <div class="template-option" onclick="window.SlideEditor.addSlideFromTemplate('${key}')">
                <div class="template-icon">${template.icon}</div>
                <div class="template-info">
                    <div class="template-name">${template.name}</div>
                    <div class="template-desc">${template.description}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="modal-content template-selector-content">
                <div class="modal-header">
                    <h3>Choose a Slide Type</h3>
                    <button class="modal-close" onclick="window.SlideEditor.closeTemplateSelector()">&times;</button>
                </div>
                <div class="template-grid">
                    ${templateHtml}
                </div>
            </div>
        `;
    }

    // ========================================
    // EVENT HANDLERS
    // ========================================
    function setupFieldListeners() {
        // Text and textarea inputs
        document.querySelectorAll('.field-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const field = e.target.dataset.field;
                if (selectedSlideIndex >= 0 && field) {
                    slides[selectedSlideIndex].data[field] = e.target.value;
                    updatePreview();
                }
            });
        });

        // Simple list inputs
        document.querySelectorAll('.list-item-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const listEditor = e.target.closest('.list-editor');
                const field = listEditor?.dataset.field;
                const index = parseInt(e.target.dataset.index);
                if (selectedSlideIndex >= 0 && field !== undefined && !isNaN(index)) {
                    slides[selectedSlideIndex].data[field][index] = e.target.value;
                    updatePreview();
                }
            });
        });

        // Event list inputs
        document.querySelectorAll('.event-name-input, .event-time-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const listEditor = e.target.closest('.event-list-editor');
                const field = listEditor?.dataset.field;
                const index = parseInt(e.target.dataset.index);
                const prop = e.target.dataset.prop;
                if (selectedSlideIndex >= 0 && field !== undefined && !isNaN(index) && prop) {
                    slides[selectedSlideIndex].data[field][index][prop] = e.target.value;
                    updatePreview();
                }
            });
        });

        // Initialize Quill editors for richtext fields
        initializeQuillEditors();

        // Image upload handlers
        document.querySelectorAll('.image-file-input').forEach(input => {
            input.addEventListener('change', async (e) => {
                const fieldId = e.target.dataset.field;
                const file = e.target.files[0];

                if (!file) return;

                // Show loading state
                const previewBox = document.getElementById(`preview_${fieldId}`);
                if (previewBox) {
                    previewBox.innerHTML = '<span class="preview-placeholder">Uploading...</span>';
                }

                try {
                    const formData = new FormData();
                    formData.append('image', file);

                    const response = await fetch('/api/upload/image', {
                        method: 'POST',
                        headers: {
                            'X-Session-Token': window.SettingsAPI.getSessionToken()
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const result = await response.json();

                    // Update the URL input and data
                    const urlInput = document.getElementById(`field_${fieldId}`);
                    if (urlInput) {
                        urlInput.value = result.url;
                        urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }

                    // Update preview
                    if (previewBox) {
                        previewBox.innerHTML = `<img src="${result.url}" alt="Preview">`;
                    }

                    showToast('Image uploaded successfully!', 'success');
                } catch (error) {
                    console.error('Upload failed:', error);
                    showToast('Failed to upload image', 'error');
                    if (previewBox) {
                        previewBox.innerHTML = '<span class="preview-placeholder">Upload failed</span>';
                    }
                }
            });
        });

        // URL input change - update preview
        document.querySelectorAll('.image-url-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const fieldId = e.target.dataset.field;
                const previewBox = document.getElementById(`preview_${fieldId}`);
                const url = e.target.value;

                if (previewBox) {
                    if (url) {
                        previewBox.innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<span class=\\'preview-placeholder\\'>Invalid image URL</span>'">`;
                    } else {
                        previewBox.innerHTML = '<span class="preview-placeholder">No image selected</span>';
                    }
                }
            });
        });
    }

    function setupDragAndDrop() {
        const items = document.querySelectorAll('.slide-list-item');

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedSlideIndex = parseInt(item.dataset.index);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedSlideIndex = -1;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const targetIndex = parseInt(item.dataset.index);
                if (draggedSlideIndex !== -1 && draggedSlideIndex !== targetIndex) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const targetIndex = parseInt(item.dataset.index);
                if (draggedSlideIndex !== -1 && draggedSlideIndex !== targetIndex) {
                    moveSlide(draggedSlideIndex, targetIndex);
                }
            });
        });
    }

    function updatePreview() {
        const previewContainer = document.getElementById('slidePreviewContent');
        if (!previewContainer || selectedSlideIndex < 0) return;

        const slide = slides[selectedSlideIndex];
        const template = SLIDE_TEMPLATES[slide.template] || SLIDE_TEMPLATES.custom;
        previewContainer.innerHTML = template.render(slide.data);
    }

    // ========================================
    // SLIDE ACTIONS
    // ========================================
    function selectSlide(index) {
        selectedSlideIndex = index;
        renderSlideList();
        renderSlideEditor();
    }

    function addSlideFromTemplate(templateKey) {
        const template = SLIDE_TEMPLATES[templateKey];
        if (!template) return;

        // Build default data from template fields
        const data = {};
        template.fields.forEach(field => {
            data[field.id] = JSON.parse(JSON.stringify(field.default));
        });

        const newSlide = {
            id: generateId(),
            template: templateKey,
            data: data
        };

        slides.push(newSlide);
        closeTemplateSelector();
        renderSlideList();
        selectSlide(slides.length - 1);
        showToast('New slide added!', 'success');
    }

    function deleteSlide(index) {
        if (!confirm('Delete this slide?')) return;

        slides.splice(index, 1);

        if (selectedSlideIndex >= slides.length) {
            selectedSlideIndex = slides.length - 1;
        }

        renderSlideList();
        renderSlideEditor();
        showToast('Slide deleted!', 'success');
    }

    function duplicateSlide(index) {
        const original = slides[index];
        const duplicate = {
            id: generateId(),
            template: original.template,
            data: JSON.parse(JSON.stringify(original.data))
        };

        // Add "Copy" to the title if it exists
        if (duplicate.data.title) {
            duplicate.data.title += ' (Copy)';
        }

        slides.splice(index + 1, 0, duplicate);
        renderSlideList();
        selectSlide(index + 1);
        showToast('Slide duplicated!', 'success');
    }

    function moveSlide(fromIndex, toIndex) {
        const [slide] = slides.splice(fromIndex, 1);
        slides.splice(toIndex, 0, slide);

        // Update selected index
        if (selectedSlideIndex === fromIndex) {
            selectedSlideIndex = toIndex;
        } else if (fromIndex < selectedSlideIndex && toIndex >= selectedSlideIndex) {
            selectedSlideIndex--;
        } else if (fromIndex > selectedSlideIndex && toIndex <= selectedSlideIndex) {
            selectedSlideIndex++;
        }

        renderSlideList();
        showToast('Slide moved!', 'info');
    }

    function addListItem(fieldId) {
        if (selectedSlideIndex < 0) return;

        if (!slides[selectedSlideIndex].data[fieldId]) {
            slides[selectedSlideIndex].data[fieldId] = [];
        }
        slides[selectedSlideIndex].data[fieldId].push('New item');
        renderSlideEditor();
    }

    function removeListItem(fieldId, index) {
        if (selectedSlideIndex < 0) return;
        slides[selectedSlideIndex].data[fieldId].splice(index, 1);
        renderSlideEditor();
    }

    function addEventItem(fieldId) {
        if (selectedSlideIndex < 0) return;

        if (!slides[selectedSlideIndex].data[fieldId]) {
            slides[selectedSlideIndex].data[fieldId] = [];
        }
        slides[selectedSlideIndex].data[fieldId].push({ name: 'New Event', time: 'TBD' });
        renderSlideEditor();
    }

    function removeEventItem(fieldId, index) {
        if (selectedSlideIndex < 0) return;
        slides[selectedSlideIndex].data[fieldId].splice(index, 1);
        renderSlideEditor();
    }

    // ========================================
    // MODAL FUNCTIONS
    // ========================================
    function openTemplateSelector() {
        renderTemplateSelector();
        document.getElementById('templateSelectorModal').classList.add('active');
    }

    function closeTemplateSelector() {
        document.getElementById('templateSelectorModal').classList.remove('active');
    }

    // ========================================
    // UTILITY
    // ========================================
    function showToast(message, type) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
        }
    }

    function resetToDefaults() {
        if (!confirm('Reset all slides to defaults? This will delete all your current slides.')) return;

        slides = getDefaultSlides();
        selectedSlideIndex = 0;
        saveSlides();
        renderSlideList();
        renderSlideEditor();
        showToast('Slides reset to defaults!', 'success');
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        // Create the template selector modal if it doesn't exist
        if (!document.getElementById('templateSelectorModal')) {
            const modal = document.createElement('div');
            modal.id = 'templateSelectorModal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        loadSchedules();
        loadSlides();
        renderTemplateSelector();

        // Set up button handlers
        const addSlideBtn = document.getElementById('addNewSlideBtn');
        if (addSlideBtn) {
            addSlideBtn.addEventListener('click', openTemplateSelector);
        }

        const saveBtn = document.getElementById('saveSlidesBtn2');
        if (saveBtn) {
            saveBtn.addEventListener('click', saveSlides);
        }

        const resetBtn = document.getElementById('resetSlidesBtn2');
        if (resetBtn) {
            resetBtn.addEventListener('click', resetToDefaults);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Small delay to ensure other scripts have loaded
        setTimeout(init, 100);
    }

    // Expose public API
    window.SlideEditor = {
        selectSlide,
        addSlideFromTemplate,
        deleteSlide,
        duplicateSlide,
        addListItem,
        removeListItem,
        addEventItem,
        removeEventItem,
        openTemplateSelector,
        closeTemplateSelector,
        saveSlides,
        loadSlides
    };

})();
