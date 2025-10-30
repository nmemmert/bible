<template>
  <div class="word-studies">
    <h1>Word Studies</h1>

    <!-- Create New Word Study Button -->
    <div class="actions-bar">
      <button @click="showCreateForm = !showCreateForm" class="btn-primary">
        {{ showCreateForm ? 'Cancel' : 'Create Word Study' }}
      </button>
    </div>

    <!-- Create Word Study Form -->
    <div v-if="showCreateForm" class="create-form">
      <h2>Create New Word Study</h2>
      <form @submit.prevent="createWordStudy" class="form">
        <div class="form-row">
          <div class="form-group">
            <label for="strongsNumber">Strong's Number:</label>
            <input
              id="strongsNumber"
              v-model="newStudy.strongs_number"
              type="text"
              required
              placeholder="e.g., G25, H3068"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label for="studyTitle">Title:</label>
            <input
              id="studyTitle"
              v-model="newStudy.title"
              type="text"
              required
              placeholder="Personal study title"
              class="form-input"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="studyNotes">Notes:</label>
          <textarea
            id="studyNotes"
            v-model="newStudy.notes"
            rows="6"
            placeholder="Your personal research, observations, and insights about this word..."
            class="form-textarea"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="creating" class="btn-primary">
            {{ creating ? 'Creating...' : 'Create Study' }}
          </button>
          <button type="button" @click="cancelCreate" class="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading word studies...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>

    <!-- Word Studies List -->
    <div v-else class="studies-list">
      <div v-if="studies.length === 0" class="empty-state">
        <p>No word studies yet. Create your first word study!</p>
      </div>

      <div v-else>
        <div
          v-for="study in studies"
          :key="study.id"
          class="study-card"
          @click="selectStudy(study)"
        >
          <div class="study-header">
            <h3>{{ study.title }}</h3>
            <span class="strongs-number">{{ study.strongs_number }}</span>
          </div>

          <div class="study-meta">
            <small>Created: {{ new Date(study.created_at).toLocaleDateString() }}</small>
            <small v-if="study.updated_at !== study.created_at">
              Updated: {{ new Date(study.updated_at).toLocaleDateString() }}
            </small>
          </div>

          <div class="study-preview">
            <p>{{ study.notes ? study.notes.substring(0, 150) + '...' : 'No notes yet' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Study Detail Modal -->
    <div v-if="selectedStudy" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedStudy.title }}</h2>
          <button @click="closeModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="study-detail">
            <div class="detail-section">
              <h3>Strong's Reference</h3>
              <p class="strongs-ref">{{ selectedStudy.strongs_number }}</p>
            </div>

            <div class="detail-section">
              <h3>Your Notes</h3>
              <div v-if="editing" class="edit-mode">
                <textarea
                  v-model="editNotes"
                  rows="10"
                  class="edit-textarea"
                ></textarea>
                <div class="edit-actions">
                  <button @click="saveEdit" :disabled="saving" class="btn-primary">
                    {{ saving ? 'Saving...' : 'Save' }}
                  </button>
                  <button @click="cancelEdit" class="btn-secondary">Cancel</button>
                </div>
              </div>
              <div v-else class="view-mode">
                <p v-if="selectedStudy.notes" class="notes-content">{{ selectedStudy.notes }}</p>
                <p v-else class="no-notes">No notes added yet.</p>
                <button @click="startEdit" class="btn-edit">Edit Notes</button>
              </div>
            </div>

            <div class="detail-section">
              <h3>Lexicon Information</h3>
              <div v-if="lexiconEntry" class="lexicon-info">
                <div class="lexicon-word">
                  <strong>{{ lexiconEntry.original_word }}</strong>
                  <span class="transliteration">({{ lexiconEntry.transliteration }})</span>
                </div>
                <div class="lexicon-details">
                  <p><strong>Definition:</strong> {{ lexiconEntry.definition }}</p>
                  <p><strong>Part of Speech:</strong> {{ lexiconEntry.part_of_speech }}</p>
                  <p><strong>Pronunciation:</strong> /{{ lexiconEntry.pronunciation }}/</p>
                </div>
              </div>
              <div v-else class="lexicon-loading">
                <p>Loading lexicon information...</p>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="deleteStudy" :disabled="deleting" class="btn-danger">
            {{ deleting ? 'Deleting...' : 'Delete Study' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WordStudies',
  data() {
    return {
      studies: [],
      selectedStudy: null,
      lexiconEntry: null,
      showCreateForm: false,
      editing: false,
      editNotes: '',
      loading: true,
      error: null,
      creating: false,
      saving: false,
      deleting: false,
      newStudy: {
        strongs_number: '',
        title: '',
        notes: ''
      }
    }
  },
  async mounted() {
    await this.loadWordStudies()
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('authToken')
      return token ? { 'Authorization': `Bearer ${token}` } : {}
    },

    async loadWordStudies() {
      try {
        this.loading = true
        const response = await fetch('/api/word-studies', {
          headers: this.getAuthHeaders()
        })
        if (!response.ok) {
          throw new Error('Failed to load word studies')
        }
        this.studies = await response.json()
      } catch (error) {
        this.error = error.message
        console.error('Error loading word studies:', error)
      } finally {
        this.loading = false
      }
    },

    async createWordStudy() {
      try {
        this.creating = true
        const response = await fetch('/api/word-studies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify(this.newStudy)
        })

        if (!response.ok) {
          throw new Error('Failed to create word study')
        }

        // Reset form
        this.newStudy = { strongs_number: '', title: '', notes: '' }
        this.showCreateForm = false

        // Reload studies
        await this.loadWordStudies()
      } catch (error) {
        this.error = error.message
        console.error('Error creating word study:', error)
      } finally {
        this.creating = false
      }
    },

    cancelCreate() {
      this.newStudy = { strongs_number: '', title: '', notes: '' }
      this.showCreateForm = false
    },

    async selectStudy(study) {
      this.selectedStudy = study
      this.editing = false
      await this.loadLexiconEntry(study.strongs_number)
    },

    async loadLexiconEntry(strongsNumber) {
      try {
        const response = await fetch(`/api/lexicon/${strongsNumber}`)
        if (response.ok) {
          this.lexiconEntry = await response.json()
        } else {
          this.lexiconEntry = null
        }
      } catch (error) {
        console.error('Error loading lexicon entry:', error)
        this.lexiconEntry = null
      }
    },

    closeModal() {
      this.selectedStudy = null
      this.lexiconEntry = null
      this.editing = false
    },

    startEdit() {
      this.editing = true
      this.editNotes = this.selectedStudy.notes || ''
    },

    cancelEdit() {
      this.editing = false
      this.editNotes = ''
    },

    async saveEdit() {
      try {
        this.saving = true
        const response = await fetch(`/api/word-studies/${this.selectedStudy.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders()
          },
          body: JSON.stringify({
            title: this.selectedStudy.title,
            notes: this.editNotes
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update word study')
        }

        // Update local data
        this.selectedStudy.notes = this.editNotes
        this.selectedStudy.updated_at = new Date().toISOString()

        this.editing = false
        this.editNotes = ''

        // Reload studies to get updated timestamp
        await this.loadWordStudies()
      } catch (error) {
        this.error = error.message
        console.error('Error updating word study:', error)
      } finally {
        this.saving = false
      }
    },

    async deleteStudy() {
      if (!confirm('Are you sure you want to delete this word study?')) {
        return
      }

      try {
        this.deleting = true
        const response = await fetch(`/api/word-studies/${this.selectedStudy.id}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders()
        })

        if (!response.ok) {
          throw new Error('Failed to delete word study')
        }

        this.closeModal()
        await this.loadWordStudies()
      } catch (error) {
        this.error = error.message
        console.error('Error deleting word study:', error)
      } finally {
        this.deleting = false
      }
    }
  }
}
</script>

<style scoped>
.word-studies {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.actions-bar {
  margin-bottom: 30px;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s ease;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-edit {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
}

.btn-edit:hover {
  background: #218838;
}

.create-form {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.create-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form {
  max-width: none;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

.form-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.form-actions {
  margin-top: 20px;
  text-align: right;
}

.studies-list {
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-size: 18px;
}

.study-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.study-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.1);
}

.study-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.study-header h3 {
  margin: 0;
  color: #333;
}

.strongs-number {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 14px;
}

.study-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.study-meta small {
  color: #666;
  font-size: 14px;
}

.study-preview {
  color: #555;
  line-height: 1.5;
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
  max-width: 800px;
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

.study-detail {
  max-width: none;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 5px;
}

.strongs-ref {
  font-family: monospace;
  font-size: 18px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  display: inline-block;
}

.edit-mode {
  margin-top: 15px;
}

.edit-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

.edit-textarea:focus {
  outline: none;
  border-color: #007bff;
}

.edit-actions {
  margin-top: 15px;
  text-align: right;
}

.view-mode {
  margin-top: 15px;
}

.notes-content {
  line-height: 1.6;
  white-space: pre-wrap;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.no-notes {
  color: #666;
  font-style: italic;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.lexicon-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}

.lexicon-word {
  font-size: 24px;
  margin-bottom: 15px;
  text-align: center;
}

.transliteration {
  color: #666;
  font-style: italic;
}

.lexicon-details p {
  margin-bottom: 10px;
  line-height: 1.5;
}

.lexicon-loading {
  text-align: center;
  color: #666;
  padding: 20px;
}

.modal-actions {
  padding: 20px;
  border-top: 1px solid #ddd;
  text-align: right;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  color: #dc3545;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .study-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>