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
            <span class="language-tag" :class="entry.language">{{ entry.language }}</span>
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
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          Previous
        </button>

        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>

        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
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
        </div>

        <div class="modal-actions">
          <button @click="createWordStudy(selectedEntry)" class="btn-primary">
            Create Word Study
          </button>
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
      searchTimeout: null
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredEntries.length / this.pageSize)
    },
    paginatedEntries() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredEntries.slice(start, end)
    }
  },
  async mounted() {
    await this.loadLexicon()
  },
  methods: {
    async loadLexicon() {
      try {
        this.loading = true
        const response = await fetch('/api/lexicon')
        if (!response.ok) {
          throw new Error('Failed to load lexicon')
        }
        this.entries = await response.json()
        this.filteredEntries = [...this.entries]
      } catch (error) {
        this.error = error.message
        console.error('Error loading lexicon:', error)
      } finally {
        this.loading = false
      }
    },

    debouncedSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.filterLexicon()
      }, 300)
    },

    filterLexicon() {
      let filtered = [...this.entries]

      // Language filter
      if (this.languageFilter) {
        filtered = filtered.filter(entry => entry.language === this.languageFilter)
      }

      // Search filter
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(entry =>
          entry.strongs_number.toLowerCase().includes(query) ||
          entry.original_word.toLowerCase().includes(query) ||
          entry.transliteration.toLowerCase().includes(query) ||
          entry.definition.toLowerCase().includes(query) ||
          entry.usage.toLowerCase().includes(query)
        )
      }

      this.filteredEntries = filtered
      this.currentPage = 1 // Reset to first page
    },

    selectEntry(entry) {
      this.selectedEntry = entry
    },

    closeModal() {
      this.selectedEntry = null
    },

    createWordStudy(entry) {
      // Emit event to parent component or navigate to word study creation
      this.$emit('create-word-study', entry)
      this.closeModal()
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
  background: white;
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

.original-word {
  font-size: 24px;
  margin-bottom: 8px;
}

.transliteration {
  color: #666;
  font-style: italic;
}

.pronunciation {
  color: #888;
  font-style: italic;
  margin-bottom: 8px;
}

.part-of-speech {
  color: #666;
  font-size: 14px;
  margin-bottom: 12px;
  text-transform: capitalize;
}

.definition {
  line-height: 1.5;
  color: #333;
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
}

.detail-row strong {
  display: inline-block;
  width: 140px;
  color: #555;
}

.modal-actions {
  padding: 20px;
  border-top: 1px solid #ddd;
  text-align: right;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
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