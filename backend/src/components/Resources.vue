<template>
  <div class="resources">
    <h1>Study Resources</h1>

    <div class="resources-intro">
      <p>Access additional Bible study materials and reference works. Search through the extracted text content of these resources.</p>
    </div>

    <!-- Upload Section -->
    <div class="upload-section">
      <div class="upload-header">
        <button @click="showUploadSection = !showUploadSection" class="btn-secondary toggle-btn">
          {{ showUploadSection ? '📁 Hide Upload Form' : '📤 Upload New Resource' }}
        </button>
      </div>

      <div v-if="showUploadSection" class="upload-form">
        <div class="form-group">
          <label for="pdfFile">Select PDF File:</label>
          <input
            type="file"
            id="pdfFile"
            ref="pdfFileInput"
            accept=".pdf"
            @change="handleFileSelect"
            class="file-input"
          >
        </div>

        <div class="form-group">
          <label for="resourceTitle">Title:</label>
          <input
            v-model="uploadTitle"
            type="text"
            id="resourceTitle"
            placeholder="Enter resource title..."
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label for="resourceDescription">Description:</label>
          <textarea
            v-model="uploadDescription"
            id="resourceDescription"
            placeholder="Enter resource description..."
            class="text-area"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="resourceType">Type:</label>
          <select v-model="uploadType" id="resourceType" class="select-input">
            <option value="concordance">Concordance</option>
            <option value="bible_text">Bible Text</option>
            <option value="interlinear">Interlinear</option>
            <option value="commentary">Commentary</option>
            <option value="study_guide">Study Guide</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="upload-actions">
          <button
            @click="uploadResource"
            :disabled="!canUpload"
            class="btn-primary"
          >
            {{ uploadLoading ? 'Uploading...' : '📤 Upload Resource' }}
          </button>
          <button
            @click="clearUploadForm"
            class="btn-secondary"
          >
            Clear
          </button>
        </div>

        <div v-if="uploadProgress > 0" class="upload-progress">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <span>{{ uploadProgress }}% complete</span>
        </div>

        <div v-if="uploadMessage" class="upload-message" :class="uploadMessageType">
          {{ uploadMessage }}
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-controls">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search within resource content..."
          class="search-input"
        >
        <select v-model="resourceFilter" class="filter-select">
          <option value="">All Resources</option>
          <option value="concordance">Concordance</option>
          <option value="bible_text">Bible Text</option>
          <option value="interlinear">Interlinear</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading resources...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- Resources List -->
    <div v-else class="resources-list">
      <div v-if="resources.length === 0" class="empty-state">
        <p>No resources available at this time.</p>
      </div>

      <div v-else class="resource-cards">
        <div
          v-for="resource in filteredResources"
          :key="resource.filename"
          class="resource-card"
        >
          <div class="resource-header">
            <h3>{{ resource.title }}</h3>
            <span class="resource-type" :class="resource.type">{{ resource.type.replace('_', ' ') }}</span>
          </div>

          <div class="resource-meta">
            <div class="meta-item">
              <strong>Pages:</strong> {{ resource.pages || resource.analysis?.pages || 'N/A' }}
            </div>
            <div class="meta-item">
              <strong>Words:</strong> {{ resource.analysis?.totalWords || resource.totalWords || 'N/A' }}
            </div>
            <div class="meta-item">
              <strong>Language:</strong> {{ resource.analysis?.language || resource.language || 'Unknown' }}
            </div>
          </div>

          <div class="resource-description">
            <p>{{ resource.description }}</p>
          </div>

          <!-- Text Content Toggle -->
          <div class="content-toggle">
            <button
              @click="toggleContent(resource)"
              class="btn-secondary"
            >
              {{ isViewingContent(resource) ? '📖 Hide Text Content' : '� View Text Content' }}
            </button>
          </div>

          <!-- Text Content Viewer -->
          <div v-if="isViewingContent(resource)" class="text-viewer">
            <div class="text-content">
              <pre>{{ getDisplayText(resource) }}</pre>
            </div>
          </div>

          <div class="resource-actions">
            <button
              @click="findVerses(resource)"
              :disabled="verseLoading"
              class="btn-secondary"
            >
              {{ verseLoading ? '🔍 Searching...' : '🔍 Find Verses' }}
            </button>
            <a
              :href="resource.downloadUrl"
              download
              class="btn-primary"
              @click="trackDownload(resource)"
            >
              ⬇️ Download PDF
            </a>
          </div>

          <!-- Verse Results -->
          <div v-if="verseSearchAttempted && selectedResourceForVerses === resource.filename" class="verse-results">
            <h4>Verse Results</h4>
            <div v-if="verseResults.length === 0" class="no-verses">
              <p>No verses found containing this word.</p>
            </div>
            <div v-else class="verses-list">
              <div
                v-for="(result, index) in verseResults"
                :key="index"
                class="verse-item"
              >
                <div class="verse-reference">
                  <strong>{{ result.book }} {{ result.chapter }}:{{ result.verse }}</strong>
                </div>
                <div class="verse-text" v-html="highlightText(result.text, result.query)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resource Information -->
    <div class="resource-info">
      <h2>About These Resources</h2>
      <div class="info-grid">
        <div class="info-item">
          <h4>📚 BSB Concordance</h4>
          <p>A comprehensive alphabetical index of words and phrases found in the Berean Study Bible, with references to their locations in Scripture.</p>
        </div>
        <div class="info-item">
          <h4>📖 Greek New Testament (Bib)</h4>
          <p>The complete Greek New Testament text, useful for advanced study and comparison with English translations.</p>
        </div>
        <div class="info-item">
          <h4>🔍 Interlinear Bible (BGB)</h4>
          <p>An interlinear presentation showing the original Greek text with English translation, ideal for detailed word studies.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Resources',
  data() {
    return {
      resources: [],
      loading: true,
      error: null,
      searchQuery: '',
      resourceFilter: '',
      viewingContent: new Set(), // Track which resources have content displayed
      showUploadSection: false, // Track if upload section is expanded
      // Upload related data
      selectedFile: null,
      uploadTitle: '',
      uploadDescription: '',
      uploadType: 'concordance',
      uploadLoading: false,
      uploadProgress: 0,
      uploadMessage: '',
      uploadMessageType: '',
      // Find verses related data
      verseLoading: false,
      verseResults: [],
      verseSearchAttempted: false,
      selectedResourceForVerses: null
    }
  },
  async mounted() {
    await this.loadResources()
  },
  computed: {
    filteredResources() {
      let filtered = [...this.resources]

      // Filter by resource type
      if (this.resourceFilter) {
        filtered = filtered.filter(resource => resource.type === this.resourceFilter)
      }

      // Filter by search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(resource => {
          const text = resource.extractedText || resource.content || ''
          return text.toLowerCase().includes(query) ||
                 resource.title.toLowerCase().includes(query) ||
                 resource.description.toLowerCase().includes(query)
        })
      }

      return filtered
    }
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('authToken')
      return token ? { 'Authorization': `Bearer ${token}` } : {}
    },

    async loadResources() {
      try {
        this.loading = true
        const response = await fetch('/api/resources', {
          headers: this.getAuthHeaders()
        })
        if (!response.ok) {
          throw new Error('Failed to load resources')
        }
        this.resources = await response.json()
      } catch (error) {
        this.error = error.message
        console.error('Error loading resources:', error)
      } finally {
        this.loading = false
      }
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },

    trackDownload(resource) {
      // Optional: Track downloads for analytics
      console.log(`Downloading: ${resource.title}`)
    },

    toggleContent(resource) {
      const filename = resource.filename
      if (this.viewingContent.has(filename)) {
        this.viewingContent.delete(filename)
      } else {
        this.viewingContent.add(filename)
      }
    },

    isViewingContent(resource) {
      return this.viewingContent.has(resource.filename)
    },

    getDisplayText(resource) {
      const text = resource.extractedText || resource.content || 'No text content available'
      // Decode HTML entities
      const decodedText = text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      // Limit display to first 2000 characters to avoid overwhelming the UI
      return decodedText.length > 2000 ? decodedText.substring(0, 2000) + '...' : decodedText
    },

    // Upload methods
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file && file.type === 'application/pdf') {
        this.selectedFile = file
        // Auto-fill title if empty
        if (!this.uploadTitle.trim()) {
          this.uploadTitle = file.name.replace('.pdf', '')
        }
      } else {
        this.selectedFile = null
        this.uploadMessage = 'Please select a valid PDF file.'
        this.uploadMessageType = 'error'
        setTimeout(() => {
          this.uploadMessage = ''
        }, 3000)
      }
    },

    clearUploadForm() {
      this.selectedFile = null
      this.uploadTitle = ''
      this.uploadDescription = ''
      this.uploadType = 'concordance'
      this.uploadProgress = 0
      this.uploadMessage = ''
      if (this.$refs.pdfFileInput) {
        this.$refs.pdfFileInput.value = ''
      }
    },

    get canUpload() {
      return this.selectedFile &&
             this.uploadTitle.trim() &&
             this.uploadDescription.trim() &&
             !this.uploadLoading
    },

    async uploadResource() {
      if (!this.canUpload) return

      try {
        this.uploadLoading = true
        this.uploadProgress = 0
        this.uploadMessage = ''

        const formData = new FormData()
        formData.append('pdf', this.selectedFile)
        formData.append('title', this.uploadTitle.trim())
        formData.append('description', this.uploadDescription.trim())
        formData.append('type', this.uploadType)

        const response = await fetch('/api/resources/upload', {
          method: 'POST',
          headers: {
            ...this.getAuthHeaders()
          },
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()

        this.uploadMessage = 'Resource uploaded successfully!'
        this.uploadMessageType = 'success'
        this.clearUploadForm()

        // Reload resources to show the new one
        await this.loadResources()

      } catch (error) {
        console.error('Upload error:', error)
        this.uploadMessage = error.message || 'Upload failed. Please try again.'
        this.uploadMessageType = 'error'
      } finally {
        this.uploadLoading = false
        this.uploadProgress = 0
      }
    },

    async findVerses(resource) {
      try {
        this.verseLoading = true
        this.verseSearchAttempted = false
        this.selectedResourceForVerses = resource.filename

        // Get the search query from the search input
        const query = this.searchQuery.trim()
        if (!query) {
          this.verseResults = []
          this.verseSearchAttempted = true
          return
        }

        // Search in the resource's text file
        const response = await fetch(`/api/bible/search-text?q=${encodeURIComponent(query)}&file=${resource.filename}.txt`)

        if (!response.ok) {
          throw new Error('Failed to search for verses')
        }

        const results = await response.json()
        // Add the query to each result for highlighting
        this.verseResults = (results || []).map(result => ({ ...result, query }))
        this.verseSearchAttempted = true

        console.log(`Found ${this.verseResults.length} verses for "${query}" in ${resource.filename}`)
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
.resources {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.resources-intro {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  text-align: center;
}

.upload-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.upload-header {
  margin-bottom: 15px;
}

.toggle-btn {
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: #0056b3;
}

.upload-section h2 {
  margin-top: 0;
  color: #333;
}

.upload-form {
  display: grid;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.file-input, .text-input, .text-area, .select-input {
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.text-area {
  resize: vertical;
  min-height: 80px;
}

.upload-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.upload-progress {
  margin-top: 10px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #ddd;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 5px;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.upload-message {
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}

.upload-message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.upload-message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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

.resources-intro p {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.resources-list {
  margin-bottom: 40px;
}

.resource-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.resource-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease;
}

.resource-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.resource-header h3 {
  margin: 0;
  color: #333;
  flex: 1;
}

.resource-type {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  white-space: nowrap;
}

.resource-type.concordance {
  background: #e3f2fd;
  color: #1976d2;
}

.resource-type.bible_version {
  background: #f3e5f5;
  color: #7b1fa2;
}

.resource-type.interlinear {
  background: #e8f5e8;
  color: #388e3c;
}

.resource-meta {
  margin-bottom: 15px;
}

.meta-item {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.resource-description {
  margin-bottom: 20px;
}

.resource-description p {
  color: #555;
  line-height: 1.5;
  margin: 0;
}

.resource-actions {
  text-align: center;
}

.btn-primary {
  display: inline-block;
  background: #007bff;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
  color: white;
  text-decoration: none;
}

.btn-secondary {
  display: inline-block;
  background: #6c757d;
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  margin-bottom: 15px;
}

.btn-secondary:hover {
  background: #545b62;
  color: white;
}

.content-toggle {
  margin: 15px 0;
}

.text-viewer {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.text-content {
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.text-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #2c3e50;
}

.resource-info {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-top: 40px;
}

.resource-info h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  background: white;
  padding: 20px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.info-item h4 {
  margin: 0 0 10px 0;
  color: #007bff;
}

.info-item p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .resource-cards {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

/* Verse Results Styles */
.verse-results {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.verse-results h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.no-verses {
  text-align: center;
  color: #666;
  font-style: italic;
  padding: 20px;
}

.verses-list {
  max-height: 400px;
  overflow-y: auto;
}

.verse-item {
  margin-bottom: 15px;
  padding: 12px;
  background: white;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.verse-reference {
  margin-bottom: 8px;
  font-weight: bold;
  color: #007bff;
}

.verse-text {
  line-height: 1.5;
  color: #333;
}

.verse-text mark {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 2px;
  font-weight: bold;
}
</style>