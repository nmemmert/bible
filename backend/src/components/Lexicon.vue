<template>
  <div class="lexicon">
    <h1>Greek & Hebrew Lexicon</h1>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-controls">
        <input
          v-model="searchQuery"
          @input="debouncedSearch"
          type="text"
          placeholder="Search by Strong's number, word, or definition..."
          class="search-input"
        >
        <select v-model="languageFilter" @change="filterLexicon" class="filter-select">
          <option value="">All Languages</option>
          <option value="greek">Greek</option>
          <option value="hebrew">Hebrew</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading lexicon...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- Results -->
    <div v-else class="lexicon-results">
      <div v-if="filteredEntries.length === 0" class="no-results">
        <p>No entries found matching your search.</p>
      </div>

      <div v-else class="entries-list">
        <div
          v-for="entry in paginatedEntries"
          :key="entry.strongs_number"
          class="lexicon-entry"
          @click="selectEntry(entry)"
          :class="{ selected: selectedEntry && selectedEntry.strongs_number === entry.strongs_number }"
        >
          <div class="entry-header">
            <h3>{{ entry.strongs_number }}</h3>
            <div class="entry-badges">
              <span class="language-tag" :class="entry.language">{{ entry.language }}</span>
              <span v-if="hasWordStudy(entry.strongs_number)" class="study-indicator">📖 Study</span>
            </div>
          </div>

          <div class="entry-content">
            <div class="original-word">
              <strong>{{ entry.original_word }}</strong>
              <span class="transliteration">({{ entry.transliteration }})</span>
            </div>

            <div class="pronunciation">/{{ entry.pronunciation }}/</div>

            <div class="part-of-speech">{{ entry.part_of_speech }}</div>

            <div class="definition">{{ entry.definition }}</div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1 || loading"
          class="page-btn"
        >
          Previous
        </button>

        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ totalEntries }} total entries)
        </span>

        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages || loading"
          class="page-btn"
        >
          Next
        </button>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="selectedEntry" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedEntry.strongs_number }} - {{ selectedEntry.original_word }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="detail-row">
            <strong>Transliteration:</strong> {{ selectedEntry.transliteration }}
          </div>
          <div class="detail-row">
            <strong>Pronunciation:</strong> /{{ selectedEntry.pronunciation }}/
          </div>
          <div class="detail-row">
            <strong>Part of Speech:</strong> {{ selectedEntry.part_of_speech }}
          </div>
          <div class="detail-row">
            <strong>Language:</strong>
            <span class="language-tag" :class="selectedEntry.language">{{ selectedEntry.language }}</span>
          </div>
          <div class="detail-row">
            <strong>Definition:</strong> {{ selectedEntry.definition }}
          </div>
          <div class="detail-row">
            <strong>Usage:</strong> {{ selectedEntry.usage }}
          </div>

          <!-- Verses Section -->
          <div class="verses-section">
            <div class="verses-header">
              <h3>Verses Containing This Word</h3>
              <button @click="findVerses(selectedEntry)" :disabled="verseLoading" class="btn-secondary">
                {{ verseLoading ? 'Searching...' : 'Find Verses' }}
              </button>
            </div>

            <div v-if="verseResults.length > 0" class="verses-list">
              <div
                v-for="verse in verseResults.slice(0, 10)"
                :key="`${verse.book}-${verse.chapter}-${verse.verse}`"
                class="verse-item"
              >
                <div class="verse-reference">
                  {{ verse.book }} {{ verse.chapter }}:{{ verse.verse }}
                </div>
                <div class="verse-text" v-html="highlightText(verse.text, selectedEntry.original_word)"></div>
              </div>
              <div v-if="verseResults.length > 10" class="more-results">
                And {{ verseResults.length - 10 }} more verses...
              </div>
            </div>

            <div v-else-if="verseSearchAttempted && !verseLoading" class="no-verses">
              No verses found containing this word.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Lexicon',
  data() {
    return {
      entries: [],
      filteredEntries: [],
      selectedEntry: null,
      searchQuery: '',
      languageFilter: '',
      loading: true,
      error: null,
      currentPage: 1,
      pageSize: 20,
      totalEntries: 0,
      totalPages: 1,
      searchTimeout: null,
      wordStudies: [],
      verseResults: [],
      verseLoading: false,
      verseSearchAttempted: false
    }
  },
  computed: {
    paginatedEntries() {
      return this.filteredEntries
    },
    hasWordStudy() {
      return (strongsNumber) => {
        // Temporarily disable word study indicators until properly implemented
        return false;
        // return this.wordStudies.some(study => study.strongs_number === strongsNumber)
      }
    }
  },
  async mounted() {
    await Promise.all([
      this.loadLexicon(),
      this.loadWordStudies()
    ])
  },
  methods: {
    async loadLexicon() {
      try {
        this.loading = true
        const response = await fetch(`/api/lexicon?page=${this.currentPage}&limit=${this.pageSize}`)
        if (!response.ok) {
          throw new Error('Failed to load lexicon')
        }
        const data = await response.json()
        this.filteredEntries = data.entries || []
        this.totalEntries = data.total || 0
        this.totalPages = data.totalPages || 1
        this.currentPage = data.page || 1
      } catch (error) {
        this.error = error.message
        console.error('Error loading lexicon:', error)
      } finally {
        this.loading = false
      }
    },

    async loadWordStudies() {
      try {
        const response = await fetch('/api/word-studies')
        if (!response.ok) {
          throw new Error('Failed to load word studies')
        }
        const data = await response.json()
        this.wordStudies = data.studies || []
        console.log('Loaded word studies:', this.wordStudies.length)
      } catch (error) {
        console.error('Error loading word studies:', error)
        // Don't set main error state for word studies failure
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.filterLexicon()
      }, 300)
    },

    async filterLexicon() {
      try {
        this.loading = true
        this.currentPage = 1 // Reset to first page when filtering
        const params = new URLSearchParams({
          page: this.currentPage,
          limit: this.pageSize
        })

        if (this.searchQuery.trim()) {
          params.append('search', this.searchQuery.trim())
        }

        if (this.languageFilter) {
          params.append('language', this.languageFilter)
        }

        const response = await fetch(`/api/lexicon?${params}`)
        if (!response.ok) {
          throw new Error('Failed to search lexicon')
        }
        const data = await response.json()
        this.filteredEntries = data.entries || []
        this.totalEntries = data.total || 0
        this.totalPages = data.totalPages || 1
        this.currentPage = data.page || 1
      } catch (error) {
        this.error = error.message
        console.error('Error filtering lexicon:', error)
      } finally {
        this.loading = false
      }
    },

    selectEntry(entry) {
      this.selectedEntry = entry
      // Show modal only - navigation is now optional via button in modal
    },

    closeModal() {
      this.selectedEntry = null
    },

    async changePage(newPage) {
      if (newPage < 1 || newPage > this.totalPages) return

      try {
        this.loading = true
        this.currentPage = newPage
        const params = new URLSearchParams({
          page: this.currentPage,
          limit: this.pageSize
        })

        if (this.searchQuery.trim()) {
          params.append('search', this.searchQuery.trim())
        }

        if (this.languageFilter) {
          params.append('language', this.languageFilter)
        }

        const response = await fetch(`/api/lexicon?${params}`)
        if (!response.ok) {
          throw new Error('Failed to load page')
        }
        const data = await response.json()
        this.filteredEntries = data.entries || []
        this.totalEntries = data.total || 0
        this.totalPages = data.totalPages || 1
        this.currentPage = data.page || 1
      } catch (error) {
        this.error = error.message
        console.error('Error changing page:', error)
      } finally {
        this.loading = false
      }
    },

    async createWordStudy(entry) {
      try {
        const response = await fetch('/api/word-studies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            strongs_number: entry.strongs_number,
            title: `Study of ${entry.original_word} (${entry.strongs_number})`,
            notes: ''
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create word study')
        }

        const result = await response.json()
        console.log('Word study created:', result)

        // Reload word studies to update indicators
        await this.loadWordStudies()

        // Close modal
        this.closeModal()

        // Optionally emit event for parent components
        this.$emit('word-study-created', entry)
      } catch (error) {
        console.error('Error creating word study:', error)
        // Could show an error message to user here
      }
    },

    async findVerses(entry) {
      try {
        this.verseLoading = true
        this.verseSearchAttempted = false

        // Check if the word contains Greek characters
        const hasGreekChars = /[\u0370-\u03FF\u1F00-\u1FFF]/.test(entry.original_word)

        let response
        if (hasGreekChars) {
          // Search Greek words in text files (bib.txt for interlinear Bible)
          response = await fetch(`/api/bible/search-text?q=${encodeURIComponent(entry.original_word)}&file=bib.txt`)
        } else {
          // Search English words in KJV Bible
          response = await fetch(`/api/bible/search?q=${encodeURIComponent(entry.original_word)}&version=kjv`)
        }

        if (!response.ok) {
          throw new Error('Failed to search for verses')
        }

        const results = await response.json()
        this.verseResults = results || []
        this.verseSearchAttempted = true

        console.log(`Found ${this.verseResults.length} verses for "${entry.original_word}"${hasGreekChars ? ' (Greek search)' : ' (KJV search)'}`)
      } catch (error) {
        console.error('Error finding verses:', error)
        this.verseResults = []
        this.verseSearchAttempted = true
      } finally {
        this.verseLoading = false
      }
    },

    highlightText(text, searchTerm) {
      if (!searchTerm) return text

      // Simple case-insensitive highlighting
      const regex = new RegExp(`(${searchTerm})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    }
  }
}
</script>

<style scoped>
.lexicon {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.search-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.search-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.search-input:focus {
  outline: none;
  border-color: #007bff;
}

.filter-select {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  min-width: 150px;
}

.lexicon-results {
  margin-top: 20px;
}

.entries-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.lexicon-entry {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #2c3e50;
}

.lexicon-entry:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.lexicon-entry.selected {
  border-color: #007bff;
  background: #f8f9ff;
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.entry-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.entry-header h3 {
  margin: 0;
  color: #007bff;
  font-size: 18px;
}

.language-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.language-tag.greek {
  background: #e3f2fd;
  color: #1976d2;
}

.language-tag.hebrew {
  background: #f3e5f5;
  color: #7b1fa2;
}

.study-indicator {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.original-word {
  font-size: 24px;
  margin-bottom: 8px;
  color: #1a252f;
}

.transliteration {
  color: #5a6c7d !important;
  font-style: italic;
}

.pronunciation {
  color: #7f8c9a !important;
  font-style: italic;
  margin-bottom: 8px;
}

.part-of-speech {
  color: #5a6c7d !important;
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: capitalize;
}

.definition {
  line-height: 1.5;
  color: #34495e !important;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-weight: bold;
  color: #666;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.detail-row {
  margin-bottom: 15px;
  line-height: 1.5;
  color: #333;
}

.detail-row strong {
  display: inline-block;
  width: 140px;
  color: #555;
}

.modal-actions {
  padding: 20px;
  border-top: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-primary:disabled, .btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verses-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.verses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.verses-header h3 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.verses-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: #fafafa;
}

.verse-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.verse-item:last-child {
  border-bottom: none;
}

.verse-reference {
  font-weight: bold;
  color: #007bff;
  margin-bottom: 5px;
  font-size: 14px;
}

.verse-text {
  line-height: 1.4;
  color: #333;
}

.verse-text mark {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 2px;
}

.more-results {
  padding: 10px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
}

.no-verses {
  padding: 20px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  border-radius: 5px;
}

.loading, .error, .no-results {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .entries-list {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>