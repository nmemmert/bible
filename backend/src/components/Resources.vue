<template>
  <div class="resources">
    <h1>Study Resources</h1>

    <div class="resources-intro">
      <p>Access additional Bible study materials and reference works. These resources are provided as downloadable PDFs for your study convenience.</p>
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
          v-for="resource in resources"
          :key="resource.filename"
          class="resource-card"
        >
          <div class="resource-header">
            <h3>{{ resource.title }}</h3>
            <span class="resource-type" :class="resource.type">{{ resource.type.replace('_', ' ') }}</span>
          </div>

          <div class="resource-meta">
            <div class="meta-item">
              <strong>File Size:</strong> {{ formatFileSize(resource.fileSize) }}
            </div>
            <div class="meta-item" v-if="resource.analysis && resource.analysis.pages > 0">
              <strong>Pages:</strong> {{ resource.analysis.pages }}
            </div>
            <div class="meta-item">
              <strong>Added:</strong> {{ formatDate(resource.created_at) }}
            </div>
          </div>

          <div class="resource-description">
            <p>{{ resource.description }}</p>
          </div>

          <!-- PDF Viewer Toggle -->
          <div class="viewer-toggle">
            <button
              @click="toggleViewer(resource)"
              class="btn-secondary"
            >
              {{ isViewing(resource) ? '📖 Hide PDF Viewer' : '👁️ View PDF Online' }}
            </button>
          </div>

          <!-- PDF Viewer -->
          <div v-if="isViewing(resource)" class="pdf-viewer">
            <iframe
              :src="resource.downloadUrl"
              width="100%"
              height="600px"
              style="border: 1px solid #ddd; border-radius: 4px;"
              title="PDF Viewer"
            ></iframe>
          </div>

          <div class="resource-actions">
            <a
              :href="resource.downloadUrl"
              download
              class="btn-primary"
              @click="trackDownload(resource)"
            >
              ⬇️ Download PDF
            </a>
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
      viewingResources: new Set() // Track which resources are being viewed
    }
  },
  async mounted() {
    await this.loadResources()
  },
  methods: {
    async loadResources() {
      try {
        this.loading = true
        const response = await fetch('/api/resources')
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

    toggleViewer(resource) {
      const filename = resource.filename
      if (this.viewingResources.has(filename)) {
        this.viewingResources.delete(filename)
      } else {
        this.viewingResources.add(filename)
      }
    },

    isViewing(resource) {
      return this.viewingResources.has(resource.filename)
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

.viewer-toggle {
  margin: 15px 0;
}

.pdf-viewer {
  margin: 20px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
</style>