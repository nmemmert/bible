<template>
  <div class="bible-search">
    <div class="search-header">
      <h1>Bible Search</h1>
      <div class="search-form">
        <div class="search-input-group">
          <input
            v-model="searchQuery"
            @keyup.enter="performSearch"
            type="text"
            placeholder="Search the Bible..."
            class="search-input"
          />
          <button @click="performSearch" :disabled="loading" class="search-button">
            {{ loading ? 'Searching...' : 'Search' }}
          </button>
        </div>

        <div class="search-options">
          <select v-model="selectedVersion" class="version-select">
            <option value="">All Versions</option>
            <option v-for="version in availableVersions" :key="version.id" :value="version.id">
              {{ version.abbreviation }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length > 0" class="search-results">
      <div class="results-header">
        <h2>Found {{ totalResults }} results for "{{ lastQuery }}"</h2>
      </div>

      <div class="results-list">
        <div
          v-for="result in searchResults"
          :key="`${result.book}-${result.chapter}-${result.verse}`"
          class="result-item"
          @click="goToVerse(result)"
        >
          <div class="result-header">
            <span class="result-reference">
              {{ result.book }} {{ result.chapter }}:{{ result.verse }}
              <span class="result-version">({{ selectedVersion || 'KJV' }})</span>
            </span>
          </div>
          <div class="result-text" v-html="highlightText(result.text, lastQuery)"></div>
        </div>
      </div>

      <div v-if="hasMoreResults" class="load-more">
        <button @click="loadMoreResults" :disabled="loading" class="load-more-button">
          Load More Results
        </button>
      </div>
    </div>

    <div v-else-if="searched && !loading" class="no-results">
      <h2>No results found for "{{ lastQuery }}"</h2>
      <p>Try different keywords or check your spelling.</p>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '/src/api/index.js'

const router = useRouter()

const searchQuery = ref('')
const selectedVersion = ref('')
const loading = ref(false)
const searched = ref(false)
const error = ref('')
const searchResults = ref([])
const availableVersions = ref([])
const lastQuery = ref('')
const totalResults = ref(0)
const currentPage = ref(0)
const hasMoreResults = ref(false)

const loadVersions = async () => {
  try {
    const response = await api.getVersions()
    availableVersions.value = response.data
  } catch (err) {
    console.error('Failed to load versions:', err)
    // Fallback
    availableVersions.value = [
      { id: 'kjv', abbreviation: 'KJV' },
      { id: 'esv', abbreviation: 'ESV' },
      { id: 'niv', abbreviation: 'NIV' },
      { id: 'nkjv', abbreviation: 'NKJV' },
      { id: 'nlt', abbreviation: 'NLT' }
    ]
  }
}

const performSearch = async () => {
  if (!searchQuery.value.trim()) return

  loading.value = true
  error.value = ''
  searched.value = true
  lastQuery.value = searchQuery.value

  try {
    const params = new URLSearchParams({
      q: searchQuery.value,
      version: selectedVersion.value || 'kjv'
    })

    const response = await api.search(selectedVersion.value || 'kjv', searchQuery.value)
    const data = response.data
    // Convert Node.js response format to our expected format
    searchResults.value = data.results.map(result => ({
      book: result.book,
      chapter: result.chapter,
      verse: result.verse,
      text: result.text,
      reference: `${result.book} ${result.chapter}:${result.verse}`,
      highlights: result.highlights || []
    }))
    totalResults.value = searchResults.value.length
    hasMoreResults.value = false
  } catch (err) {
    error.value = 'Search failed. Please try again.'
    console.error('Search error:', err)
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

const loadMoreResults = async () => {
  // API doesn't support pagination yet, so this is a placeholder
  if (loading.value) return

  loading.value = true
  // For now, just show a message that more results aren't available
  loading.value = false
}

const goToVerse = (result) => {
  const version = selectedVersion.value || 'kjv'
  router.push(`/bible/${version}/${result.book}/${result.chapter}`)
}

const highlightText = (text, query) => {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

onMounted(() => {
  loadVersions()
})
</script>

<style scoped>
.bible-search {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.search-header {
  margin-bottom: 2rem;
}

.search-header h1 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  text-align: center;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
}

.search-button {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.search-button:hover:not(:disabled) {
  background: #2980b9;
}

.search-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.search-options {
  display: flex;
  justify-content: center;
}

.version-select {
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  background: white;
}

.search-results {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.results-header {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e1e8ed;
}

.results-header h2 {
  margin: 0;
  color: #2c3e50;
}

.results-list {
  max-height: 600px;
  overflow-y: auto;
}

.result-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background: #f8f9fa;
}

.result-item:last-child {
  border-bottom: none;
}

.result-header {
  margin-bottom: 0.5rem;
}

.result-reference {
  font-weight: 600;
  color: #2c3e50;
}

.result-version {
  color: #7f8c8d;
  font-weight: normal;
  font-size: 0.9rem;
}

.result-text {
  color: #34495e;
  line-height: 1.6;
}

.result-text :deep(mark) {
  background: #fff3cd;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}

.load-more {
  padding: 1.5rem;
  text-align: center;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
}

.load-more-button {
  padding: 0.75rem 1.5rem;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.load-more-button:hover:not(:disabled) {
  background: #229954;
}

.no-results {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.no-results h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.no-results p {
  color: #7f8c8d;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}
</style>