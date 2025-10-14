// Bible Search JavaScript
// Advanced search functionality with real-time results and enhanced UX

class BibleSearch {
    constructor() {
        this.searchBox = null;
        this.searchResults = null;
        this.versionSelection = null;
        this.searchTimeout = null;
        this.currentQuery = '';
        this.isSearching = false;
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupSearchTips();
        this.setupKeyboardShortcuts();
    }

    setupElements() {
        this.searchBox = document.getElementById('search-box');
        this.searchResults = document.getElementById('search-results');
        this.versionSelection = document.getElementById('version-selection');
        this.searchStatus = document.getElementById('search-status');
        this.searchResultsContainer = document.getElementById('search-results-container');
        this.noResults = document.getElementById('no-results');
        this.resultsCount = document.getElementById('results-count');
        this.clearResultsBtn = document.getElementById('clear-results');
    }

    setupEventListeners() {
        if (!this.searchBox) return;

        // Real-time search as user types
        this.searchBox.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                this.clearSearch();
                return;
            }

            if (query.length < 2) {
                this.showStatus('Type at least 2 characters to search...');
                return;
            }

            // Debounce search requests
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Version change triggers new search
        this.versionSelection.addEventListener('change', () => {
            if (this.searchBox.value.trim().length >= 2) {
                this.performSearch(this.searchBox.value.trim());
            }
        });

        // Clear results button
        if (this.clearResultsBtn) {
            this.clearResultsBtn.addEventListener('click', () => {
                this.clearSearch();
                this.searchBox.focus();
            });
        }

        // Enter key focuses first result
        this.searchBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstResult = this.searchResults.querySelector('.result-reference');
                if (firstResult) {
                    firstResult.click();
                }
            }
        });
    }

    async performSearch(query) {
        if (this.isSearching) return;
        
        this.isSearching = true;
        this.currentQuery = query;
        
        this.showSearching();
        
        try {
            const version = this.versionSelection.value;
            const results = await this.fetchSearchResults(query, version);
            
            if (this.currentQuery === query) { // Only update if this is still the current search
                this.displayResults(results.results, query);
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed. Please try again.');
        } finally {
            this.isSearching = false;
        }
    }

    async fetchSearchResults(query, version) {
        const response = await fetch(`/search_endpoint/?query=${encodeURIComponent(query)}&version=${encodeURIComponent(version)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    }

    displayResults(results, query) {
        this.hideStatus();
        
        if (!results || results.length === 0) {
            this.showNoResults();
            return;
        }

        this.showResultsContainer();
        this.updateResultsCount(results.length, query);
        this.renderResults(results);
    }

    renderResults(results) {
        this.searchResults.innerHTML = '';
        
        results.forEach((result, index) => {
            const resultItem = this.createResultItem(result, index);
            this.searchResults.appendChild(resultItem);
        });
    }

    createResultItem(result, index) {
        const [reference, text] = result;
        
        const li = document.createElement('li');
        li.className = 'result-item';
        li.setAttribute('data-index', index);

        // Parse reference for navigation
        const book = reference.substring(0, reference.lastIndexOf(" "));
        const chapter = reference.substring(reference.lastIndexOf(" ") + 1, reference.indexOf(":"));
        
        const version = encodeURIComponent(this.versionSelection.value);
        const bookEncoded = encodeURIComponent(book);
        const chapterEncoded = encodeURIComponent(chapter);
        const url = `/goto/?version=${version}&book=${bookEncoded}&chapter=${chapterEncoded}`;

        // Create reference link
        const refLink = document.createElement('a');
        refLink.href = url;
        refLink.className = 'result-reference';
        refLink.textContent = reference;
        refLink.setAttribute('aria-label', `Go to ${reference}`);

        // Highlight search terms in the text
        const highlightedText = this.highlightSearchTerms(text, this.currentQuery);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'result-text';
        textDiv.innerHTML = highlightedText;

        li.appendChild(refLink);
        li.appendChild(textDiv);

        // Add click analytics
        li.addEventListener('click', () => {
            this.trackSearchClick(reference, index);
        });

        return li;
    }

    highlightSearchTerms(text, query) {
        if (!query) return text;
        
        // Remove quotes and split into terms
        const terms = query.replace(/['"]/g, '').split(/\s+/).filter(term => term.length > 0);
        
        let highlighted = text;
        
        terms.forEach(term => {
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            highlighted = highlighted.replace(regex, '<mark>$1</mark>');
        });
        
        return highlighted;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    updateResultsCount(count, query) {
        const plural = count === 1 ? '' : 's';
        this.resultsCount.textContent = `${count} result${plural} for "${query}"`;
    }

    showSearching() {
        this.hideStatus();
        this.hideNoResults();
        this.showResultsContainer();
        
        this.searchResults.innerHTML = `
            <div class="search-loading">
                <div class="loading"></div>
                <p>Searching the scriptures...</p>
            </div>
        `;
    }

    showStatus(message) {
        this.searchStatus.innerHTML = `
            <div class="status-content">
                <div class="status-icon">📖</div>
                <p>${message}</p>
            </div>
        `;
        this.searchStatus.style.display = 'block';
        this.hideResultsContainer();
    }

    hideStatus() {
        this.searchStatus.style.display = 'none';
    }

    showNoResults() {
        this.hideStatus();
        this.showResultsContainer();
        this.searchResults.innerHTML = '';
        this.noResults.classList.remove('hidden');
        this.resultsCount.textContent = 'No results found';
    }

    hideNoResults() {
        this.noResults.classList.add('hidden');
    }

    showResultsContainer() {
        this.searchResultsContainer.classList.remove('hidden');
    }

    hideResultsContainer() {
        this.searchResultsContainer.classList.add('hidden');
    }

    showError(message) {
        this.showStatus(`❌ ${message}`);
    }

    clearSearch() {
        this.searchBox.value = '';
        this.currentQuery = '';
        this.hideResultsContainer();
        this.hideNoResults();
        this.showStatus('Ready to search the scriptures. Enter your search terms above.');
        clearTimeout(this.searchTimeout);
    }

    setupSearchTips() {
        const tipsBtn = document.getElementById('search-tips-btn');
        const tipsPanel = document.getElementById('search-tips');
        
        if (tipsBtn && tipsPanel) {
            tipsBtn.addEventListener('click', () => {
                tipsPanel.classList.toggle('hidden');
                tipsBtn.textContent = tipsPanel.classList.contains('hidden') 
                    ? '💡 Search Tips' 
                    : '❌ Hide Tips';
            });
        }
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.searchBox.focus();
                this.searchBox.select();
            }

            // Escape to clear search
            if (e.key === 'Escape' && document.activeElement === this.searchBox) {
                this.clearSearch();
            }

            // Arrow key navigation in results
            if (e.key === 'ArrowDown' && document.activeElement === this.searchBox) {
                e.preventDefault();
                const firstResult = this.searchResults.querySelector('.result-reference');
                if (firstResult) {
                    firstResult.focus();
                }
            }
        });

        // Navigate results with arrow keys
        this.searchResults.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateResults(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }

    navigateResults(direction) {
        const results = Array.from(this.searchResults.querySelectorAll('.result-reference'));
        const currentIndex = results.findIndex(result => result === document.activeElement);
        
        let newIndex = currentIndex + direction;
        
        if (newIndex < 0) {
            this.searchBox.focus();
        } else if (newIndex >= results.length) {
            newIndex = results.length - 1;
        }
        
        if (results[newIndex]) {
            results[newIndex].focus();
        }
    }

    trackSearchClick(reference, index) {
        // Analytics tracking for search interactions
        console.log(`Search result clicked: ${reference} (position ${index + 1})`);
    }
}

// Additional search enhancements
class SearchEnhancements {
    constructor(searchInstance) {
        this.search = searchInstance;
        this.setupAutoComplete();
        this.setupSearchHistory();
        this.setupQuickSearch();
    }

    setupAutoComplete() {
        // Common Bible search terms for autocomplete
        this.commonTerms = [
            'love', 'faith', 'hope', 'peace', 'joy', 'salvation', 'grace', 'mercy',
            'righteousness', 'truth', 'light', 'darkness', 'heart', 'soul', 'spirit',
            'prayer', 'worship', 'praise', 'glory', 'kingdom', 'heaven', 'eternal',
            'Jesus', 'Christ', 'Lord', 'God', 'Father', 'Holy Spirit',
            'Jerusalem', 'Israel', 'David', 'Moses', 'Abraham', 'Paul'
        ];
        
        // Implement autocomplete functionality
        this.createAutoCompleteDropdown();
    }

    createAutoCompleteDropdown() {
        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.display = 'none';
        
        this.search.searchBox.parentNode.appendChild(dropdown);
        
        this.search.searchBox.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length < 2) {
                dropdown.style.display = 'none';
                return;
            }
            
            const matches = this.commonTerms.filter(term => 
                term.toLowerCase().includes(query) && term.toLowerCase() !== query
            ).slice(0, 5);
            
            if (matches.length > 0) {
                this.showAutoComplete(dropdown, matches, query);
            } else {
                dropdown.style.display = 'none';
            }
        });
    }

    showAutoComplete(dropdown, matches, query) {
        dropdown.innerHTML = matches.map(term => `
            <div class="autocomplete-item" data-term="${term}">
                ${term}
            </div>
        `).join('');
        
        dropdown.style.display = 'block';
        
        dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
            item.addEventListener('click', () => {
                this.search.searchBox.value = item.dataset.term;
                dropdown.style.display = 'none';
                this.search.performSearch(item.dataset.term);
            });
        });
    }

    setupSearchHistory() {
        this.searchHistory = JSON.parse(localStorage.getItem('bibleSearchHistory') || '[]');
        this.addHistoryButton();
    }

    addHistoryButton() {
        const historyBtn = document.createElement('button');
        historyBtn.className = 'history-btn';
        historyBtn.innerHTML = '🕐 History';
        historyBtn.type = 'button';
        
        const searchOptions = document.querySelector('.search-options');
        if (searchOptions) {
            searchOptions.appendChild(historyBtn);
        }
        
        historyBtn.addEventListener('click', () => {
            this.showSearchHistory();
        });
    }

    showSearchHistory() {
        if (this.searchHistory.length === 0) {
            alert('No search history found.');
            return;
        }
        
        const historyModal = document.createElement('div');
        historyModal.className = 'history-modal';
        historyModal.innerHTML = `
            <div class="history-content">
                <h3>Search History</h3>
                <div class="history-list">
                    ${this.searchHistory.slice(0, 10).map(term => `
                        <button class="history-item" data-term="${term}">${term}</button>
                    `).join('')}
                </div>
                <button class="close-history">Close</button>
            </div>
        `;
        
        document.body.appendChild(historyModal);
        
        historyModal.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-item')) {
                this.search.searchBox.value = e.target.dataset.term;
                this.search.performSearch(e.target.dataset.term);
                historyModal.remove();
            } else if (e.target.classList.contains('close-history') || e.target === historyModal) {
                historyModal.remove();
            }
        });
    }

    setupQuickSearch() {
        const quickSearches = [
            { label: 'Love Verses', query: 'love one another' },
            { label: 'Faith & Hope', query: 'faith hope' },
            { label: 'Peace', query: 'peace be with you' },
            { label: 'Salvation', query: 'salvation grace' },
            { label: 'Prayer', query: 'prayer ask receive' }
        ];
        
        const quickSearchDiv = document.createElement('div');
        quickSearchDiv.className = 'quick-searches';
        quickSearchDiv.innerHTML = `
            <h4>Quick Searches:</h4>
            <div class="quick-search-buttons">
                ${quickSearches.map(qs => `
                    <button class="quick-search-btn" data-query="${qs.query}">${qs.label}</button>
                `).join('')}
            </div>
        `;
        
        const searchTips = document.getElementById('search-tips');
        if (searchTips) {
            searchTips.appendChild(quickSearchDiv);
        }
        
        quickSearchDiv.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-search-btn')) {
                const query = e.target.dataset.query;
                this.search.searchBox.value = query;
                this.search.performSearch(query);
            }
        });
    }
}

// Additional CSS for search enhancements
const searchCSS = `
.search-loading {
    text-align: center;
    padding: 2rem;
    color: var(--text-color);
}

.result-text mark {
    background-color: var(--dropdown-hover-bg);
    padding: 0.1rem 0.2rem;
    border-radius: 3px;
    font-weight: 500;
    color: var(--text-color);
}

[data-theme="dark"] .result-text mark {
    background-color: color-mix(in srgb, var(--dropdown-hover-bg) 60%, black);
    color: var(--text-color);
}

.autocomplete-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--dropdown-bg);
    border: 1px solid var(--border-color);
    border-top: none;
    border-radius: 0 0 10px 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.08);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
}

.autocomplete-item {
    padding: 0.8rem 1rem;
    cursor: pointer;
    border-bottom: 1px solid var(--border-color);
    transition: background-color 0.2s ease;
}

.autocomplete-item:hover {
    background-color: var(--search-accent-1);
    color: var(--bg-color);
}

.autocomplete-item:last-child {
    border-bottom: none;
}

.history-btn {
    background: rgba(0,0,0,0.06);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.5rem 1rem;
    border-radius: 25px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    font-size: 0.9rem;
}

.history-btn:hover {
    background: rgba(0,0,0,0.12);
}

.history-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.history-content {
    background: var(--input-bg);
    padding: 2rem;
    border-radius: 15px;
    max-width: 400px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.history-content h3 {
    margin-bottom: 1rem;
    text-align: center;
    color: var(--text-color);
}

.history-list {
    margin-bottom: 1rem;
}

.history-item {
    display: block;
    width: 100%;
    padding: 0.8rem;
    margin-bottom: 0.5rem;
    background: var(--dropdown-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: all 0.3s ease;
}

.history-item:hover {
    background: var(--search-accent-1);
    color: var(--bg-color);
    border-color: var(--search-accent-1);
}

.close-history {
    width: 100%;
    padding: 0.8rem;
    background: var(--muted-bg);
    color: var(--bg-color);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
}

.close-history:hover {
    filter: brightness(0.9);
}

.quick-searches {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color);
}

.quick-searches h4 {
    color: var(--search-accent-1);
    margin-bottom: 1rem;
}

.quick-search-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.quick-search-btn {
    background: var(--dropdown-bg);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    padding: 0.4rem 0.8rem;
    border-radius: 15px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.3s ease;
}

.quick-search-btn:hover {
    background: var(--search-accent-1);
    color: var(--bg-color);
    border-color: var(--search-accent-1);
}

[data-theme="dark"] .autocomplete-dropdown,
[data-theme="dark"] .history-content {
    background: var(--input-bg);
    border-color: var(--border-color);
    color: var(--text-color);
}

[data-theme="dark"] .autocomplete-item:hover {
    background: var(--dropdown-hover-bg);
}

[data-theme="dark"] .history-item {
    background: var(--dropdown-hover-bg);
    border-color: var(--border-color);
    color: var(--text-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .quick-search-buttons {
        flex-direction: column;
    }
    
    .quick-search-btn {
        width: 100%;
        text-align: center;
    }
}
`;

// Add the CSS
const searchStyle = document.createElement('style');
searchStyle.textContent = searchCSS;
document.head.appendChild(searchStyle);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const search = new BibleSearch();
    new SearchEnhancements(search);
    
    // Focus search box on load
    const searchBox = document.getElementById('search-box');
    if (searchBox) {
        setTimeout(() => searchBox.focus(), 100);
    }
});