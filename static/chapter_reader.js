// Bible Chapter Reader JavaScript
// Enhanced navigation and interaction for the reading experience

class ChapterReader {
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
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.updateChapterDropdown();
        this.enhanceReadingExperience();
    }

    setupElements() {
        this.bookSelect = document.querySelector('#book');
        this.chapterSelect = document.querySelector('#chapter');
        this.versionSelect = document.querySelector('#select_version');
        this.prevButtons = document.querySelectorAll('.prev-btn, .footer-btn.prev');
        this.nextButtons = document.querySelectorAll('.next-btn, .footer-btn.next');
    }

    setupEventListeners() {
        // Book selection change
        if (this.bookSelect) {
            this.bookSelect.addEventListener('change', () => {
                this.updateChapterDropdown();
                this.saveReadingPosition();
            });
        }

        // Chapter selection change
        if (this.chapterSelect) {
            this.chapterSelect.addEventListener('change', () => {
                this.saveReadingPosition();
            });
        }

        // Version selection change
        if (this.versionSelect) {
            this.versionSelect.addEventListener('change', () => {
                this.saveReadingPosition();
            });
        }

        // Smooth scrolling for internal navigation
        this.setupSmoothScrolling();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Only activate when not typing in form fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key) {
                case 'ArrowLeft':
                case 'h':
                    e.preventDefault();
                    this.navigatePrevious();
                    break;
                case 'ArrowRight':
                case 'l':
                    e.preventDefault();
                    this.navigateNext();
                    break;
                case 'ArrowUp':
                case 'k':
                    e.preventDefault();
                    this.scrollUp();
                    break;
                case 'ArrowDown':
                case 'j':
                    e.preventDefault();
                    this.scrollDown();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.scrollToTop();
                    break;
                case 'End':
                    e.preventDefault();
                    this.scrollToBottom();
                    break;
            }
        });
    }

    updateChapterDropdown() {
        if (!this.bookSelect || !this.chapterSelect) return;

        const selectedBook = this.bookSelect.value;
        const currentChapter = window.chapterNumber || 1;
        const maxChapters = this.bookChapters[selectedBook] || 1;

        // Clear existing options
        this.chapterSelect.innerHTML = '';

        // Add chapter options
        for (let i = 1; i <= maxChapters; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            
            if (i == currentChapter && i <= maxChapters) {
                option.selected = true;
            }
            
            this.chapterSelect.appendChild(option);
        }
    }

    navigatePrevious() {
        const prevBtn = document.querySelector('.prev-btn') || document.querySelector('.footer-btn.prev');
        if (prevBtn && !prevBtn.disabled) {
            this.addNavigationFeedback('previous');
            prevBtn.click();
        }
    }

    navigateNext() {
        const nextBtn = document.querySelector('.next-btn') || document.querySelector('.footer-btn.next');
        if (nextBtn && !nextBtn.disabled) {
            this.addNavigationFeedback('next');
            nextBtn.click();
        }
    }

    addNavigationFeedback(direction) {
        const feedback = document.createElement('div');
        feedback.className = `nav-feedback ${direction}`;
        feedback.textContent = direction === 'next' ? '→' : '←';
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 1000);
    }

    scrollUp() {
        window.scrollBy({
            top: -200,
            behavior: 'smooth'
        });
    }

    scrollDown() {
        window.scrollBy({
            top: 200,
            behavior: 'smooth'
        });
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom() {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
    }

    setupSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    saveReadingPosition() {
        // Save current reading position to localStorage
        const position = {
            book: this.bookSelect?.value || window.book,
            chapter: this.chapterSelect?.value || window.chapterNumber,
            version: this.versionSelect?.value,
            timestamp: Date.now()
        };

        localStorage.setItem('bibleReadingPosition', JSON.stringify(position));
    }

    loadReadingPosition() {
        // Load saved reading position
        try {
            const saved = localStorage.getItem('bibleReadingPosition');
            if (saved) {
                const position = JSON.parse(saved);
                return position;
            }
        } catch (e) {
            console.log('Could not load reading position:', e);
        }
        return null;
    }

    enhanceReadingExperience() {
        // Add verse highlighting on hover
        this.setupVerseHighlighting();
        
        // Add reading progress indicator
        this.setupReadingProgress();
        
        // Add focus mode toggle
        this.setupFocusMode();
    }

    setupVerseHighlighting() {
        document.querySelectorAll('.verse').forEach(verse => {
            verse.addEventListener('mouseenter', function() {
                this.style.background = 'var(--dropdown-hover-bg)';
                this.style.borderLeft = '3px solid var(--primary-accent)';
                this.style.paddingLeft = '1rem';
                this.style.transition = 'all 0.3s ease';
            });

            verse.addEventListener('mouseleave', function() {
                this.style.background = '';
                this.style.borderLeft = '';
                this.style.paddingLeft = '';
            });
        });
    }

    setupReadingProgress() {
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);

        // Update progress on scroll
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = Math.min(scrollPercent, 100) + '%';
            }
        });
    }

    setupFocusMode() {
        // Create focus mode toggle
        const focusToggle = document.createElement('button');
        focusToggle.className = 'focus-toggle';
        focusToggle.innerHTML = '🎯 Focus Mode';
        focusToggle.setAttribute('aria-label', 'Toggle focus mode');
        
        const readerHeader = document.querySelector('.reader-header');
        if (readerHeader) {
            readerHeader.appendChild(focusToggle);
        }

        focusToggle.addEventListener('click', () => {
            document.body.classList.toggle('focus-mode');
            focusToggle.innerHTML = document.body.classList.contains('focus-mode') 
                ? '👁️ Normal Mode' 
                : '🎯 Focus Mode';
        });
    }
}

// Additional CSS for enhanced features
const additionalCSS = `
.nav-feedback {
    position: fixed;
    top: 50%;
    font-size: 3rem;
    color: var(--primary-accent);
    pointer-events: none;
    z-index: 1000;
    animation: navFeedback 1s ease-out forwards;
}

.nav-feedback.next {
    right: 2rem;
}

.nav-feedback.previous {
    left: 2rem;
}

@keyframes navFeedback {
    0% {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-50%) scale(1.5);
    }
}

.reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: color-mix(in srgb, var(--primary-accent) 20%, transparent 80%);
    z-index: 1000;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-accent) 0%, var(--secondary-accent) 100%);
    width: 0%;
    transition: width 0.1s ease;
}

.focus-toggle {
    background: rgba(255,255,255,0.2);
    border: 1px solid rgba(255,255,255,0.3);
    color: white;
    padding: 0.4rem 0.8rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.3s ease;
    position: absolute;
    right: 1rem;
    top: 1rem;
}

.focus-toggle:hover {
    background: rgba(255,255,255,0.3);
}

/* Focus Mode Styles */
body.focus-mode .reader-header,
body.focus-mode .reader-footer {
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all 0.5s ease;
}

body.focus-mode .reader-content {
    padding-top: 4rem;
    font-size: 1.2rem;
    line-height: 2;
}

body.focus-mode .chapter-title {
    font-size: 3rem;
}

/* Keyboard Navigation Help */
.keyboard-help {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 0.7rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 1000;
    pointer-events: none;
}

.keyboard-help.show {
    opacity: 1;
}

@media (max-width: 768px) {
    .focus-toggle {
        position: static;
        margin-top: 0.5rem;
        font-size: 0.7rem;
        padding: 0.3rem 0.6rem;
    }
    
    .nav-feedback {
        font-size: 2rem;
    }
    
    .nav-feedback.next {
        right: 1rem;
    }
    
    .nav-feedback.previous {
        left: 1rem;
    }
}
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ChapterReader();
    
    // Show keyboard help briefly
    const keyboardHelp = document.createElement('div');
    keyboardHelp.className = 'keyboard-help';
    keyboardHelp.innerHTML = `
        <div>📋 <strong>Keyboard Navigation:</strong></div>
        <div>← → or H L: Previous/Next • ↑ ↓ or K J: Scroll • Home/End: Top/Bottom</div>
    `;
    document.body.appendChild(keyboardHelp);
    
    setTimeout(() => keyboardHelp.classList.add('show'), 1000);
    setTimeout(() => keyboardHelp.classList.remove('show'), 5000);
});