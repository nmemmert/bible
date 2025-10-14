// Bible Overview JavaScript
// Advanced grid functionality with synchronized navigation and enhanced UX

class BibleOverview {
    constructor() {
        this.bookChapters = {
            'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
            'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
            '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
            'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
            'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
            'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
            'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
            'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
            'Zechariah': 14, 'Malachi': 4, 'Matthew': 28, 'Mark': 16, 'Luke': 24,
            'John': 21, 'Acts': 28, 'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13,
            'Galatians': 6, 'Ephesians': 6, 'Philippians': 4, 'Colossians': 4,
            '1 Thessalonians': 5, '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4,
            'Titus': 3, 'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5,
            '2 Peter': 3, '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
        };
        
        this.panels = [];
        this.syncMode = false;
        this.fullscreenPanel = null;
        
        this.init();
    }

    init() {
        this.setupPanels();
        this.setupControls();
        this.setupPresets();
        this.setupKeyboardNavigation();
        this.setupFullscreenModal();
        this.loadSavedState();
    }

    setupPanels() {
        for (let i = 0; i < 4; i++) {
            const panel = {
                index: i,
                bookSelect: document.getElementById(`book-${i}`),
                chapterSelect: document.getElementById(`chapter-${i}`),
                versionSelect: document.getElementById(`version-${i}`),
                iframe: document.getElementById(`bible-frame-${i}`),
                loading: document.getElementById(`loading-${i}`),
                prevBtn: document.querySelector(`[data-panel="${i}"][data-action="prev"]`),
                nextBtn: document.querySelector(`[data-panel="${i}"][data-action="next"]`),
                expandBtn: document.querySelector(`[data-panel="${i}"][data-action="expand"]`)
            };
            
            this.panels.push(panel);
            this.setupPanelEvents(panel);
            this.initializeChapterDropdown(panel);
        }
    }

    setupPanelEvents(panel) {
        // Book selection change
        panel.bookSelect.addEventListener('change', () => {
            this.updateChapterDropdown(panel);
            this.updatePanel(panel);
            this.saveState();
        });

        // Chapter selection change
        panel.chapterSelect.addEventListener('change', () => {
            this.updatePanel(panel);
            this.saveState();
            
            if (this.syncMode) {
                this.syncChaptersToPanel(panel);
            }
        });

        // Version selection change
        panel.versionSelect.addEventListener('change', () => {
            this.updatePanel(panel);
            this.saveState();
        });

        // Navigation buttons
        panel.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateChapter(panel, -1);
        });

        panel.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.navigateChapter(panel, 1);
        });

        // Expand button
        panel.expandBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.expandPanel(panel);
        });

        // Iframe load event
        panel.iframe.addEventListener('load', () => {
            this.hideLoading(panel);
        });
    }

    initializeChapterDropdown(panel) {
        this.updateChapterDropdown(panel);
        this.updatePanel(panel);
    }

    updateChapterDropdown(panel) {
        const selectedBook = panel.bookSelect.value;
        const currentChapter = panel.chapterSelect.value || 1;
        const maxChapters = this.bookChapters[selectedBook] || 1;

        // Clear existing options
        panel.chapterSelect.innerHTML = '';

        // Add chapter options
        for (let i = 1; i <= maxChapters; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            
            if (i == currentChapter && i <= maxChapters) {
                option.selected = true;
            }
            
            panel.chapterSelect.appendChild(option);
        }
    }

    updatePanel(panel) {
        this.showLoading(panel);
        
        const book = panel.bookSelect.value;
        const chapter = panel.chapterSelect.value;
        const version = panel.versionSelect.value;
        
        const url = `/embed?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`;
        panel.iframe.src = url;
        
        // Update panel title
        const panelTitle = document.querySelector(`[data-panel="${panel.index}"] .panel-label`);
        if (panelTitle) {
            panelTitle.textContent = `${book} ${chapter} (${version})`;
        }
    }

    navigateChapter(panel, direction) {
        const currentChapter = parseInt(panel.chapterSelect.value);
        const maxChapters = this.bookChapters[panel.bookSelect.value];
        
        let newChapter = currentChapter + direction;
        
        if (newChapter < 1 || newChapter > maxChapters) {
            // Navigate to different book if needed
            this.navigateBook(panel, direction, newChapter);
        } else {
            panel.chapterSelect.value = newChapter;
            this.updatePanel(panel);
            this.saveState();
            
            if (this.syncMode) {
                this.syncChaptersToPanel(panel);
            }
        }
    }

    navigateBook(panel, direction, targetChapter) {
        const books = Array.from(panel.bookSelect.options).map(opt => opt.value);
        const currentBookIndex = books.indexOf(panel.bookSelect.value);
        
        let newBookIndex = currentBookIndex;
        let newChapter = targetChapter;
        
        if (direction > 0 && targetChapter > this.bookChapters[panel.bookSelect.value]) {
            // Move to next book, chapter 1
            newBookIndex = currentBookIndex + 1;
            newChapter = 1;
        } else if (direction < 0 && targetChapter < 1) {
            // Move to previous book, last chapter
            newBookIndex = currentBookIndex - 1;
            if (newBookIndex >= 0) {
                const prevBook = books[newBookIndex];
                newChapter = this.bookChapters[prevBook];
            }
        }
        
        if (newBookIndex >= 0 && newBookIndex < books.length) {
            panel.bookSelect.value = books[newBookIndex];
            this.updateChapterDropdown(panel);
            panel.chapterSelect.value = newChapter;
            this.updatePanel(panel);
            this.saveState();
            
            if (this.syncMode) {
                this.syncChaptersToPanel(panel);
            }
        }
    }

    showLoading(panel) {
        if (panel.loading) {
            panel.loading.style.display = 'flex';
        }
    }

    hideLoading(panel) {
        if (panel.loading) {
            panel.loading.style.display = 'none';
        }
    }

    setupControls() {
        // Reset all panels
        const resetBtn = document.getElementById('reset-all');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetAllPanels();
            });
        }

        // Sync chapters toggle
        const syncBtn = document.getElementById('sync-chapters');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.toggleSync();
                this.updateSyncButton(syncBtn);
            });
        }

        // Fullscreen mode
        const fullscreenBtn = document.getElementById('fullscreen-mode');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleGridFullscreen();
            });
        }
    }

    resetAllPanels() {
        const defaultSettings = [
            { book: 'Genesis', chapter: '1', version: 'KJV' },
            { book: 'Matthew', chapter: '1', version: 'KJV' },
            { book: 'Psalms', chapter: '23', version: 'KJV' },
            { book: 'John', chapter: '3', version: 'KJV' }
        ];

        this.panels.forEach((panel, index) => {
            const settings = defaultSettings[index] || defaultSettings[0];
            
            panel.bookSelect.value = settings.book;
            this.updateChapterDropdown(panel);
            panel.chapterSelect.value = settings.chapter;
            panel.versionSelect.value = settings.version;
            this.updatePanel(panel);
        });

        this.saveState();
        this.showNotification('All panels reset to default settings');
    }

    toggleSync() {
        this.syncMode = !this.syncMode;
        this.showNotification(this.syncMode ? 'Chapter sync enabled' : 'Chapter sync disabled');
    }

    updateSyncButton(btn) {
        btn.innerHTML = this.syncMode ? '🔗 Sync ON' : '🔗 Sync OFF';
        btn.style.background = this.syncMode ? 'rgba(40, 167, 69, 0.3)' : 'rgba(255,255,255,0.2)';
    }

    syncChaptersToPanel(sourcePanel) {
        if (!this.syncMode) return;
        
        const targetChapter = sourcePanel.chapterSelect.value;
        
        this.panels.forEach(panel => {
            if (panel !== sourcePanel) {
                const maxChapters = this.bookChapters[panel.bookSelect.value];
                if (targetChapter <= maxChapters) {
                    panel.chapterSelect.value = targetChapter;
                    this.updatePanel(panel);
                }
            }
        });
    }

    toggleGridFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    expandPanel(panel) {
        this.fullscreenPanel = panel;
        const modal = document.getElementById('fullscreen-modal');
        const modalTitle = document.getElementById('modal-title');
        const modalIframe = document.getElementById('modal-iframe');
        
        modalTitle.textContent = `${panel.bookSelect.value} ${panel.chapterSelect.value} (${panel.versionSelect.value})`;
        modalIframe.src = panel.iframe.src;
        
        modal.style.display = 'block';
    }

    setupFullscreenModal() {
        const modal = document.getElementById('fullscreen-modal');
        const closeBtn = document.getElementById('close-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
                this.fullscreenPanel = null;
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    this.fullscreenPanel = null;
                }
            });
        }
        
        // ESC key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                this.fullscreenPanel = null;
            }
        });
    }

    setupPresets() {
        const presetButtons = document.querySelectorAll('[data-preset]');
        
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                this.applyPreset(preset);
            });
        });
    }

    applyPreset(presetName) {
        const presets = {
            gospels: [
                { book: 'Matthew', chapter: '5', version: 'KJV' },
                { book: 'Mark', chapter: '1', version: 'KJV' },
                { book: 'Luke', chapter: '2', version: 'KJV' },
                { book: 'John', chapter: '1', version: 'KJV' }
            ],
            psalms: [
                { book: 'Psalms', chapter: '23', version: 'KJV' },
                { book: 'Psalms', chapter: '91', version: 'KJV' },
                { book: 'Psalms', chapter: '139', version: 'KJV' },
                { book: 'Psalms', chapter: '121', version: 'KJV' }
            ],
            prophets: [
                { book: 'Isaiah', chapter: '53', version: 'KJV' },
                { book: 'Jeremiah', chapter: '29', version: 'KJV' },
                { book: 'Ezekiel', chapter: '37', version: 'KJV' },
                { book: 'Daniel', chapter: '3', version: 'KJV' }
            ],
            creation: [
                { book: 'Genesis', chapter: '1', version: 'KJV' },
                { book: 'Genesis', chapter: '2', version: 'KJV' },
                { book: 'John', chapter: '1', version: 'KJV' },
                { book: 'Colossians', chapter: '1', version: 'KJV' }
            ]
        };

        const preset = presets[presetName];
        if (!preset) return;

        preset.forEach((settings, index) => {
            if (this.panels[index]) {
                const panel = this.panels[index];
                panel.bookSelect.value = settings.book;
                this.updateChapterDropdown(panel);
                panel.chapterSelect.value = settings.chapter;
                panel.versionSelect.value = settings.version;
                this.updatePanel(panel);
            }
        });

        this.saveState();
        this.showNotification(`Applied ${presetName} preset`);
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only activate when not in form fields or modal
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || 
                e.target.tagName === 'TEXTAREA' || document.getElementById('fullscreen-modal').style.display === 'block') {
                return;
            }

            switch(e.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault();
                    const panelIndex = parseInt(e.key) - 1;
                    this.focusPanel(panelIndex);
                    break;
                case 's':
                    e.preventDefault();
                    this.toggleSync();
                    break;
                case 'r':
                    e.preventDefault();
                    this.resetAllPanels();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleGridFullscreen();
                    break;
            }
        });
    }

    focusPanel(index) {
        if (this.panels[index]) {
            this.panels[index].bookSelect.focus();
            this.highlightPanel(index);
        }
    }

    highlightPanel(index) {
        // Remove existing highlights
        document.querySelectorAll('.bible-panel').forEach(panel => {
            panel.classList.remove('highlighted');
        });
        
        // Add highlight to selected panel
        const panel = document.querySelector(`[data-panel="${index}"]`);
        if (panel) {
            panel.classList.add('highlighted');
            setTimeout(() => {
                panel.classList.remove('highlighted');
            }, 2000);
        }
    }

    saveState() {
        const state = this.panels.map(panel => ({
            book: panel.bookSelect.value,
            chapter: panel.chapterSelect.value,
            version: panel.versionSelect.value
        }));
        
        localStorage.setItem('bibleOverviewState', JSON.stringify({
            panels: state,
            syncMode: this.syncMode,
            timestamp: Date.now()
        }));
    }

    loadSavedState() {
        try {
            const saved = localStorage.getItem('bibleOverviewState');
            if (!saved) return;
            
            const state = JSON.parse(saved);
            
            // Only load if saved within last 7 days
            if (Date.now() - state.timestamp > 7 * 24 * 60 * 60 * 1000) return;
            
            state.panels.forEach((panelState, index) => {
                if (this.panels[index]) {
                    const panel = this.panels[index];
                    panel.bookSelect.value = panelState.book;
                    this.updateChapterDropdown(panel);
                    panel.chapterSelect.value = panelState.chapter;
                    panel.versionSelect.value = panelState.version;
                    this.updatePanel(panel);
                }
            });
            
            this.syncMode = state.syncMode || false;
            const syncBtn = document.getElementById('sync-chapters');
            if (syncBtn) {
                this.updateSyncButton(syncBtn);
            }
            
        } catch (e) {
            console.log('Could not load saved state:', e);
        }
    }

    showNotification(message) {
        // Remove existing notifications
        const existing = document.querySelector('.overview-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'overview-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Additional CSS for overview enhancements
const overviewCSS = `
.bible-panel.highlighted {
    transform: scale(1.02);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2) !important;
    border-color: var(--primary-accent) !important;
    transition: all 0.5s ease;
}

.overview-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--success-color);
    color: var(--bg-color);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 2000;
    font-weight: 500;
}

.overview-notification.show {
    transform: translateX(0);
    opacity: 1;
}

.keyboard-shortcuts-help {
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.8rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1500;
    pointer-events: none;
    max-width: 300px;
}

.keyboard-shortcuts-help.show {
    opacity: 1;
}

.sync-indicator {
    position: absolute;
    top: 10px;
    right: 10px;
    background: var(--success-color);
    color: var(--bg-color);
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
}

/* Enhanced loading animation */
.loading-spinner .spinner {
    background: linear-gradient(45deg, transparent, transparent, var(--primary-accent), transparent, transparent);
}

/* Quick preset hover effects */
.quick-btn {
    position: relative;
    overflow: hidden;
}

.quick-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
}

.quick-btn:hover::before {
    left: 100%;
}

/* Panel animation on content change */
.bible-frame {
    transition: opacity 0.3s ease;
}

.panel-updating .bible-frame {
    opacity: 0.5;
}

/* Responsive grid adjustments */
@media (max-width: 1200px) {
    .panels-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    }
}

@media (max-width: 992px) {
    .panels-grid {
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
    
    .panel-content {
        height: 400px;
    }
}

@media (max-width: 768px) {
    .overview-notification {
        right: 10px;
        top: 10px;
        left: 10px;
        transform: translateY(-100px);
    }
    
    .overview-notification.show {
        transform: translateY(0);
    }
    
    .keyboard-shortcuts-help {
        bottom: 10px;
        left: 10px;
        right: 10px;
        max-width: none;
    }
}

/* Dark mode enhancements */
[data-theme="dark"] .overview-notification {
    background: var(--success-color);
}

[data-theme="dark"] .sync-indicator {
    background: var(--success-color);
}

/* Accessibility improvements */
.panel-header button:focus,
.panel-controls select:focus {
    outline: 2px solid var(--primary-accent);
    outline-offset: 2px;
}

.action-btn[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-btn[disabled]:hover {
    transform: none;
    background: var(--muted-bg);
}
`;

// Add the CSS
const overviewStyle = document.createElement('style');
overviewStyle.textContent = overviewCSS;
document.head.appendChild(overviewStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BibleOverview();
    
    // Show keyboard shortcuts help briefly
    setTimeout(() => {
        const keyboardHelp = document.createElement('div');
        keyboardHelp.className = 'keyboard-shortcuts-help';
        keyboardHelp.innerHTML = `
            <div><strong>⌨️ Keyboard Shortcuts:</strong></div>
            <div>1-4: Focus Panel • S: Toggle Sync • R: Reset All • F: Fullscreen</div>
        `;
        document.body.appendChild(keyboardHelp);
        
        setTimeout(() => keyboardHelp.classList.add('show'), 500);
        setTimeout(() => keyboardHelp.classList.remove('show'), 4000);
        setTimeout(() => keyboardHelp.remove(), 4500);
    }, 1000);
});