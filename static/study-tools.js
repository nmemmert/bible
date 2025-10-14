/**
 * Study Tools JavaScript for Bible Study Hub
 * Handles notes, bookmarks, highlights, and interactive features
 */

class StudyTools {
    constructor() {
        this.initEventListeners();
        this.loadUserData();
    }

    initEventListeners() {
        // Bookmark functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('bookmark-btn')) {
                this.toggleBookmark(e.target);
            }
        });

        // Highlight functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('highlight-btn')) {
                this.showHighlightMenu(e.target);
            }
        });

        // Note functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('note-btn')) {
                this.showNoteDialog(e.target);
            }
        });

        // Verse selection for highlighting
        document.addEventListener('mouseup', () => {
            this.handleVerseSelection();
        });
    }

    async loadUserData() {
        // Get current book and chapter from the page
        const bookElement = document.querySelector('[data-book]');
        const chapterElement = document.querySelector('[data-chapter]');
        
        if (!bookElement || !chapterElement) return;
        
        const book = bookElement.dataset.book;
        const chapter = chapterElement.dataset.chapter;
        
        try {
            const response = await fetch(`/study/api/get_user_data/${book}/${chapter}`);
            if (response.ok) {
                const data = await response.json();
                this.applyUserData(data);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    applyUserData(data) {
        // Apply highlights
        data.highlights.forEach(highlight => {
            const verseElement = document.querySelector(`[data-verse="${highlight.verse}"]`);
            if (verseElement) {
                verseElement.classList.add(`highlight-${highlight.color}`);
            }
        });

        // Apply bookmark indicators
        data.bookmarks.forEach(bookmark => {
            const verseElement = document.querySelector(`[data-verse="${bookmark.verse}"]`);
            if (verseElement) {
                verseElement.classList.add('bookmarked');
            }
        });

        // Apply note indicators
        data.notes.forEach(note => {
            const verseElement = document.querySelector(`[data-verse="${note.verse}"]`);
            if (verseElement) {
                verseElement.classList.add('has-note');
                verseElement.setAttribute('data-note', note.text);
            }
        });
    }

    async toggleBookmark(button) {
        const verse = button.dataset.verse;
        const book = button.dataset.book;
        const chapter = button.dataset.chapter;
        
        try {
            const response = await fetch('/study/add_bookmark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ book, chapter, verse })
            });
            
            const result = await response.json();
            if (response.ok) {
                this.showToast(result.message, 'success');
                button.classList.toggle('bookmarked');
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            this.showToast('Error adding bookmark', 'error');
        }
    }

    async addHighlight(verse, book, chapter, color) {
        try {
            const response = await fetch('/study/add_highlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ book, chapter, verse, color })
            });
            
            const result = await response.json();
            if (response.ok) {
                this.showToast(result.message, 'success');
                const verseElement = document.querySelector(`[data-verse="${verse}"]`);
                if (verseElement) {
                    // Remove existing highlight classes
                    verseElement.className = verseElement.className.replace(/highlight-\w+/g, '');
                    verseElement.classList.add(`highlight-${color}`);
                }
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            this.showToast('Error adding highlight', 'error');
        }
    }

    showHighlightMenu(button) {
        const verse = button.dataset.verse;
        const book = button.dataset.book;
        const chapter = button.dataset.chapter;
        
        // Create highlight color menu
        const menu = document.createElement('div');
        menu.className = 'highlight-menu';
        menu.innerHTML = `
            <div class="highlight-colors">
                <button class="highlight-color" data-color="yellow">🟡</button>
                <button class="highlight-color" data-color="blue">🔵</button>
                <button class="highlight-color" data-color="green">🟢</button>
                <button class="highlight-color" data-color="red">🔴</button>
                <button class="highlight-color" data-color="purple">🟣</button>
                <button class="highlight-color" data-color="orange">🟠</button>
                <button class="remove-highlight">❌</button>
            </div>
        `;
        
        // Position menu near button
        const rect = button.getBoundingClientRect();
        menu.style.position = 'absolute';
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '1000';
        
        document.body.appendChild(menu);
        
        // Add event listeners
        menu.querySelectorAll('.highlight-color').forEach(colorBtn => {
            colorBtn.addEventListener('click', () => {
                const color = colorBtn.dataset.color;
                this.addHighlight(verse, book, chapter, color);
                menu.remove();
            });
        });
        
        menu.querySelector('.remove-highlight').addEventListener('click', () => {
            this.removeHighlight(verse, book, chapter);
            menu.remove();
        });
        
        // Remove menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 0);
    }

    async removeHighlight(verse, book, chapter) {
        try {
            const response = await fetch('/study/remove_highlight', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ book, chapter, verse })
            });
            
            const result = await response.json();
            if (response.ok) {
                this.showToast(result.message, 'success');
                const verseElement = document.querySelector(`[data-verse="${verse}"]`);
                if (verseElement) {
                    verseElement.className = verseElement.className.replace(/highlight-\w+/g, '');
                }
            } else {
                this.showToast(result.error, 'error');
            }
        } catch (error) {
            this.showToast('Error removing highlight', 'error');
        }
    }

    showNoteDialog(button) {
        const verse = button.dataset.verse;
        const book = button.dataset.book;
        const chapter = button.dataset.chapter;
        
        // Create note dialog or redirect to add note page
        const url = `/study/add_note?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`;
        window.location.href = url;
    }

    handleVerseSelection() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const selectedText = selection.toString().trim();
            
            if (selectedText.length > 0) {
                // Find verse number from selection
                const verseElement = range.commonAncestorContainer.closest ? 
                    range.commonAncestorContainer.closest('[data-verse]') :
                    range.commonAncestorContainer.parentElement.closest('[data-verse]');
                
                if (verseElement) {
                    this.showSelectionMenu(verseElement.dataset.verse, selectedText);
                }
            }
        }
    }

    showSelectionMenu(verse, selectedText) {
        // Show options for selected text (highlight, note, word study, etc.)
        const menu = document.createElement('div');
        menu.className = 'selection-menu';
        menu.innerHTML = `
            <div class="selection-options">
                <button class="selection-option highlight-selection">Highlight</button>
                <button class="selection-option note-selection">Add Note</button>
                <button class="selection-option word-study">Word Study</button>
            </div>
        `;
        
        // Position menu
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        menu.style.position = 'absolute';
        menu.style.top = (rect.bottom + window.scrollY) + 'px';
        menu.style.left = rect.left + 'px';
        menu.style.zIndex = '1000';
        
        document.body.appendChild(menu);
        
        // Auto-remove after a delay
        setTimeout(() => {
            if (menu.parentNode) {
                menu.remove();
            }
        }, 5000);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Style the toast
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '4px',
            zIndex: '9999',
            color: 'var(--bg-color)',
            fontWeight: 'bold'
        });

        // Use CSS variables for background for theme-awareness
        toast.style.backgroundColor = type === 'success' ? 'var(--success-color)' :
                                    type === 'error' ? 'var(--danger-color)' : 'var(--info-color)';
        
        document.body.appendChild(toast);
        
        // Fade in
        toast.style.opacity = '0';
        setTimeout(() => { toast.style.opacity = '1'; }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.remove(); }, 300);
        }, 3000);
    }

    // Search Strong's numbers in text
    highlightStrongs() {
        const strongsPattern = /([GH]\d{1,4})/g;
        const textNodes = this.getTextNodes(document.body);
        
        textNodes.forEach(node => {
            const text = node.textContent;
            if (strongsPattern.test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(strongsPattern, 
                    '<a href="/study/lexicon/$1" class="strongs-link" title="View in lexicon">$1</a>'
                );
                node.parentNode.replaceChild(span, node);
            }
        });
    }

    getTextNodes(element) {
        const textNodes = [];
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        while (node = walker.nextNode()) {
            if (node.textContent.trim()) {
                textNodes.push(node);
            }
        }
        
        return textNodes;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is logged in
    if (document.querySelector('[data-user-authenticated]')) {
        new StudyTools();
    }
});

// Export for use in other scripts
window.StudyTools = StudyTools;