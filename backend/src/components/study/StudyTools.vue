<template>
  <div class="study-tools">
    <h1>Study Tools</h1>

    <div class="tools-grid">
      <div class="tool-card">
        <h3>📝 Notes</h3>
        <p>Personal notes and reflections</p>
        <div class="tool-actions">
          <button @click="showNotes = !showNotes" class="btn-tool">
            {{ showNotes ? 'Hide' : 'View' }} Notes
          </button>
          <button @click="showAddNote = !showAddNote" class="btn-add">
            {{ showAddNote ? 'Cancel' : 'Add Note' }}
          </button>
        </div>
      </div>

      <div class="tool-card">
        <h3>🔖 Bookmarks</h3>
        <p>Save important passages</p>
        <div class="tool-actions">
          <button @click="showBookmarks = !showBookmarks" class="btn-tool">
            {{ showBookmarks ? 'Hide' : 'View' }} Bookmarks
          </button>
          <button @click="showAddBookmark = !showAddBookmark" class="btn-add">
            {{ showAddBookmark ? 'Cancel' : 'Add Bookmark' }}
          </button>
        </div>
      </div>

      <div class="tool-card">
        <h3>✨ Highlights</h3>
        <p>Highlight verses for emphasis</p>
        <div class="tool-actions">
          <button @click="showHighlights = !showHighlights" class="btn-tool">
            {{ showHighlights ? 'Hide' : 'View' }} Highlights
          </button>
          <button @click="showAddHighlight = !showAddHighlight" class="btn-add">
            {{ showAddHighlight ? 'Cancel' : 'Add Highlight' }}
          </button>
        </div>
      </div>

      <div class="tool-card">
        <h3>📚 Study Guides</h3>
        <p>Create and follow study guides</p>
        <div class="tool-actions">
          <button @click="showStudyGuides = !showStudyGuides" class="btn-tool">
            {{ showStudyGuides ? 'Hide' : 'View' }} Study Guides
          </button>
          <button @click="showAddStudyGuide = !showAddStudyGuide" class="btn-add">
            {{ showAddStudyGuide ? 'Cancel' : 'Add Guide' }}
          </button>
        </div>
      </div>

      <div class="tool-card">
        <h3>🔤 Lexicon</h3>
        <p>Greek & Hebrew word definitions</p>
        <div class="tool-actions">
          <router-link to="/lexicon" class="btn-tool">
            Browse Lexicon
          </router-link>
        </div>
      </div>

      <div class="tool-card">
        <h3>📖 Word Studies</h3>
        <p>Personal research on specific words</p>
        <div class="tool-actions">
          <router-link to="/word-studies" class="btn-tool">
            View Studies
          </router-link>
        </div>
      </div>
    </div>

    <!-- Notes Section -->
    <div v-if="showNotes" class="tool-section">
      <h2>My Notes</h2>
      <div v-if="notes.length === 0" class="empty-state">
        No notes yet. Start reading and add some notes!
      </div>
      <div v-else class="notes-list">
        <div v-for="note in notes" :key="note.id" class="note-item">
          <h4>{{ note.book }} {{ note.chapter }}{{ note.verse ? ':' + note.verse : '' }}</h4>
          <p>{{ note.note_text }}</p>
          <small>{{ new Date(note.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>

    <!-- Add Note Form -->
    <div v-if="showAddNote" class="tool-section">
      <h2>Add New Note</h2>
      <form @submit.prevent="addNote" class="add-form">
        <div class="form-row">
          <div class="form-group">
            <label for="noteBook">Book:</label>
            <select id="noteBook" v-model="newNote.book" required class="form-select">
              <option v-for="book in books" :key="book" :value="book">{{ book }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="noteChapter">Chapter:</label>
            <input id="noteChapter" v-model.number="newNote.chapter" type="number" min="1" required class="form-input">
          </div>
          <div class="form-group">
            <label for="noteVerse">Verse (optional):</label>
            <input id="noteVerse" v-model.number="newNote.verse" type="number" min="1" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label for="noteText">Note:</label>
          <textarea id="noteText" v-model="newNote.note_text" required rows="4" class="form-textarea"></textarea>
        </div>
        <div class="form-group">
          <label for="noteTags">Tags (optional):</label>
          <input id="noteTags" v-model="newNote.tags" placeholder="comma separated" class="form-input">
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">Add Note</button>
          <button type="button" @click="cancelAddNote" class="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Bookmarks Section -->
    <div v-if="showBookmarks" class="tool-section">
      <h2>My Bookmarks</h2>
      <div v-if="bookmarks.length === 0" class="empty-state">
        No bookmarks yet. Save some passages for quick access!
      </div>
      <div v-else class="bookmarks-list">
        <div v-for="bookmark in bookmarks" :key="bookmark.id" class="bookmark-item">
          <h4>{{ bookmark.book }} {{ bookmark.chapter }}{{ bookmark.verse ? ':' + bookmark.verse : '' }}</h4>
          <p v-if="bookmark.title">{{ bookmark.title }}</p>
          <small>{{ new Date(bookmark.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>

    <!-- Add Bookmark Form -->
    <div v-if="showAddBookmark" class="tool-section">
      <h2>Add New Bookmark</h2>
      <form @submit.prevent="addBookmark" class="add-form">
        <div class="form-row">
          <div class="form-group">
            <label for="bookmarkBook">Book:</label>
            <select id="bookmarkBook" v-model="newBookmark.book" required class="form-select">
              <option v-for="book in books" :key="book" :value="book">{{ book }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="bookmarkChapter">Chapter:</label>
            <input id="bookmarkChapter" v-model.number="newBookmark.chapter" type="number" min="1" required class="form-input">
          </div>
          <div class="form-group">
            <label for="bookmarkVerse">Verse (optional):</label>
            <input id="bookmarkVerse" v-model.number="newBookmark.verse" type="number" min="1" class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label for="bookmarkTitle">Title (optional):</label>
          <input id="bookmarkTitle" v-model="newBookmark.title" placeholder="Give this bookmark a title" class="form-input">
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">Add Bookmark</button>
          <button type="button" @click="cancelAddBookmark" class="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Highlights Section -->
    <div v-if="showHighlights" class="tool-section">
      <h2>My Highlights</h2>
      <div v-if="highlights.length === 0" class="empty-state">
        No highlights yet. Highlight verses while reading!
      </div>
      <div v-else class="highlights-list">
        <div v-for="highlight in highlights" :key="highlight.id" class="highlight-item">
          <h4>{{ highlight.book }} {{ highlight.chapter }}:{{ highlight.verse }}</h4>
          <div class="highlight-color" :style="{ backgroundColor: highlight.color || 'yellow' }"></div>
          <small>{{ new Date(highlight.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>

    <!-- Add Highlight Form -->
    <div v-if="showAddHighlight" class="tool-section">
      <h2>Add New Highlight</h2>
      <form @submit.prevent="addHighlight" class="add-form">
        <div class="form-row">
          <div class="form-group">
            <label for="highlightBook">Book:</label>
            <select id="highlightBook" v-model="newHighlight.book" required class="form-select">
              <option v-for="book in books" :key="book" :value="book">{{ book }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="highlightChapter">Chapter:</label>
            <input id="highlightChapter" v-model.number="newHighlight.chapter" type="number" min="1" required class="form-input">
          </div>
          <div class="form-group">
            <label for="highlightVerse">Verse:</label>
            <input id="highlightVerse" v-model.number="newHighlight.verse" type="number" min="1" required class="form-input">
          </div>
        </div>
        <div class="form-group">
          <label for="highlightColor">Color:</label>
          <select id="highlightColor" v-model="newHighlight.color" class="form-select">
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
            <option value="pink">Pink</option>
            <option value="orange">Orange</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">Add Highlight</button>
          <button type="button" @click="cancelAddHighlight" class="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Study Guides Section -->
    <div v-if="showStudyGuides" class="tool-section">
      <h2>My Study Guides</h2>
      <div v-if="studyGuides.length === 0" class="empty-state">
        No study guides yet. Create your first study guide!
      </div>
      <div v-else class="study-guides-list">
        <div v-for="guide in studyGuides" :key="guide.id" class="study-guide-item">
          <div class="guide-header">
            <h4>{{ guide.title }}</h4>
            <div class="guide-actions">
              <button @click="editStudyGuide(guide)" class="btn-edit">Edit</button>
              <button @click="deleteStudyGuide(guide)" class="btn-delete">Delete</button>
            </div>
          </div>
          <p>{{ guide.description }}</p>
          <small>{{ new Date(guide.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
    </div>

    <!-- Study Guide Editor -->
    <div v-if="editingStudyGuide" class="tool-section">
      <h2>Edit Study Guide: {{ editingStudyGuide.title }}</h2>

      <!-- Guide Info -->
      <div class="guide-info">
        <div class="form-row">
          <div class="form-group">
            <label for="editGuideTitle">Title:</label>
            <input id="editGuideTitle" v-model="editingStudyGuide.title" class="form-input">
          </div>
          <div class="form-group">
            <label for="editGuideDescription">Description:</label>
            <textarea id="editGuideDescription" v-model="editingStudyGuide.description" rows="2" class="form-textarea"></textarea>
          </div>
        </div>
        <div class="form-actions">
          <button @click="saveStudyGuideChanges" :disabled="loading" class="btn-primary">Save Changes</button>
          <button @click="cancelEditStudyGuide" class="btn-secondary">Cancel</button>
        </div>
      </div>

      <!-- Sections -->
      <div class="guide-sections">
        <div class="section-header">
          <h3>Sections</h3>
          <button @click="addNewSection" class="btn-add">Add Section</button>
        </div>

        <div v-if="editingStudyGuide.sections && editingStudyGuide.sections.length === 0" class="empty-state">
          No sections yet. Add your first section!
        </div>

        <div v-else class="sections-list">
          <div
            v-for="(section, index) in editingStudyGuide.sections"
            :key="section.id || `new-${index}`"
            class="section-item"
            :class="{ 'editing-section': editingSectionIndex === index }"
          >
            <div class="section-header">
              <h4>{{ section.title || 'Untitled Section' }}</h4>
              <div class="section-actions">
                <button @click="editSection(index)" class="btn-edit">Edit</button>
                <button @click="moveSectionUp(index)" :disabled="index === 0" class="btn-move">↑</button>
                <button @click="moveSectionDown(index)" :disabled="index === editingStudyGuide.sections.length - 1" class="btn-move">↓</button>
                <button @click="deleteSection(index)" class="btn-delete">Delete</button>
              </div>
            </div>

            <div class="section-type">{{ getSectionTypeLabel(section.section_type) }}</div>

            <div v-if="editingSectionIndex === index" class="section-editor">
              <div class="form-group">
                <label>Title:</label>
                <input v-model="section.title" class="form-input">
              </div>

              <div class="form-group">
                <label>Type:</label>
                <select v-model="section.section_type" @change="updateSectionFields(section)" class="form-select">
                  <option value="text">Text/Commentary</option>
                  <option value="passage">Bible Passage</option>
                  <option value="questions">Study Questions</option>
                  <option value="notes">Personal Notes</option>
                </select>
              </div>

              <!-- Dynamic fields based on section type -->
              <div v-if="section.section_type === 'passage'" class="form-row">
                <div class="form-group">
                  <label>Book:</label>
                  <select v-model="section.book" class="form-select">
                    <option v-for="book in books" :key="book" :value="book">{{ book }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Chapter:</label>
                  <input v-model.number="section.chapter" type="number" min="1" class="form-input">
                </div>
                <div class="form-group">
                  <label>Verses (optional):</label>
                  <input v-model="section.verse_range" placeholder="e.g., 1-5" class="form-input">
                </div>
              </div>

              <div class="form-group">
                <label>Content:</label>
                <textarea v-model="section.content" :rows="getTextareaRows(section.section_type)" class="form-textarea"></textarea>
              </div>

              <div class="form-actions">
                <button @click="saveSection(index)" class="btn-primary">Save Section</button>
                <button @click="cancelEditSection" class="btn-secondary">Cancel</button>
              </div>
            </div>

            <div v-else class="section-preview">
              <div v-if="section.section_type === 'passage'" class="passage-ref">
                {{ section.book }} {{ section.chapter }}{{ section.verse_range ? ':' + section.verse_range : '' }}
              </div>
              <div class="section-content">{{ section.content ? section.content.substring(0, 200) + '...' : 'No content' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Study Guide Form -->
    <div v-if="showAddStudyGuide" class="tool-section">
      <h2>Create New Study Guide</h2>
      <form @submit.prevent="addStudyGuide" class="add-form">
        <div class="form-group">
          <label for="guideTitle">Title:</label>
          <input id="guideTitle" v-model="newStudyGuide.title" required placeholder="Study guide title" class="form-input">
        </div>
        <div class="form-group">
          <label for="guideDescription">Description:</label>
          <textarea id="guideDescription" v-model="newStudyGuide.description" rows="3" placeholder="Brief description of the study guide" class="form-textarea"></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="guideTemplate">
              <input id="guideTemplate" v-model="newStudyGuide.is_template" type="checkbox">
              Save as template
            </label>
          </div>
          <div class="form-group">
            <label for="guidePublic">
              <input id="guidePublic" v-model="newStudyGuide.is_public" type="checkbox">
              Make public
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="loading" class="btn-primary">Create Study Guide</button>
          <button type="button" @click="cancelAddStudyGuide" class="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '/src/api/index.js'

const showNotes = ref(false)
const showBookmarks = ref(false)
const showHighlights = ref(false)
const showStudyGuides = ref(false)

// Add form visibility
const showAddNote = ref(false)
const showAddBookmark = ref(false)
const showAddHighlight = ref(false)
const showAddStudyGuide = ref(false)

const notes = ref([])
const bookmarks = ref([])
const highlights = ref([])
const studyGuides = ref([])
const loading = ref(false)

// Form data
const newNote = ref({
  book: '',
  chapter: null,
  verse: null,
  note_text: '',
  tags: ''
})

const newBookmark = ref({
  book: '',
  chapter: null,
  verse: null,
  title: ''
})

const newHighlight = ref({
  book: '',
  chapter: null,
  verse: null,
  color: 'yellow'
})

const newStudyGuide = ref({
  title: '',
  description: '',
  is_template: false,
  is_public: false
})

// Study guide editing
const editingStudyGuide = ref(null)
const editingSectionIndex = ref(-1)
const originalSectionData = ref(null)

// Books list
const books = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
]

const loadNotes = async () => {
  try {
    const response = await api.get('/api/notes')
    notes.value = response.data
  } catch (error) {
    console.error('Failed to load notes:', error)
  }
}

const loadBookmarks = async () => {
  try {
    const response = await api.get('/api/bookmarks')
    bookmarks.value = response.data
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
}

const loadHighlights = async () => {
  try {
    const response = await api.get('/api/highlights')
    highlights.value = response.data
  } catch (error) {
    console.error('Failed to load highlights:', error)
  }
}

const loadStudyGuides = async () => {
  try {
    const response = await api.get('/api/study-guides')
    studyGuides.value = response.data
  } catch (error) {
    console.error('Failed to load study guides:', error)
  }
}

// Add item methods
const addNote = async () => {
  loading.value = true
  try {
    await api.post('/api/notes', newNote.value)
    showAddNote.value = false
    newNote.value = { book: '', chapter: null, verse: null, note_text: '', tags: '' }
    if (showNotes.value) {
      await loadNotes()
    }
  } catch (error) {
    console.error('Failed to add note:', error)
  } finally {
    loading.value = false
  }
}

const addBookmark = async () => {
  loading.value = true
  try {
    await api.post('/api/bookmarks', newBookmark.value)
    showAddBookmark.value = false
    newBookmark.value = { book: '', chapter: null, verse: null, title: '' }
    if (showBookmarks.value) {
      await loadBookmarks()
    }
  } catch (error) {
    console.error('Failed to add bookmark:', error)
  } finally {
    loading.value = false
  }
}

const addHighlight = async () => {
  loading.value = true
  try {
    await api.post('/api/highlights', newHighlight.value)
    showAddHighlight.value = false
    newHighlight.value = { book: '', chapter: null, verse: null, color: 'yellow' }
    if (showHighlights.value) {
      await loadHighlights()
    }
  } catch (error) {
    console.error('Failed to add highlight:', error)
  } finally {
    loading.value = false
  }
}

const addStudyGuide = async () => {
  loading.value = true
  try {
    await api.post('/api/study-guides', newStudyGuide.value)
    showAddStudyGuide.value = false
    newStudyGuide.value = { title: '', description: '', is_template: false, is_public: false }
    if (showStudyGuides.value) {
      await loadStudyGuides()
    }
  } catch (error) {
    console.error('Failed to add study guide:', error)
  } finally {
    loading.value = false
  }
}

// Cancel methods
const cancelAddNote = () => {
  showAddNote.value = false
  newNote.value = { book: '', chapter: null, verse: null, note_text: '', tags: '' }
}

const cancelAddBookmark = () => {
  showAddBookmark.value = false
  newBookmark.value = { book: '', chapter: null, verse: null, title: '' }
}

const cancelAddHighlight = () => {
  showAddHighlight.value = false
  newHighlight.value = { book: '', chapter: null, verse: null, color: 'yellow' }
}

const cancelAddStudyGuide = () => {
  showAddStudyGuide.value = false
  newStudyGuide.value = { title: '', description: '', is_template: false, is_public: false }
}

// Study guide editing methods
const editStudyGuide = async (guide) => {
  try {
    // Load the full study guide with sections
    const response = await api.get(`/api/study-guides/${guide.id}`)
    editingStudyGuide.value = response.data
    showStudyGuides.value = false
  } catch (error) {
    console.error('Failed to load study guide:', error)
  }
}

const saveStudyGuideChanges = async () => {
  loading.value = true
  try {
    await api.put(`/api/study-guides/${editingStudyGuide.value.id}`, {
      title: editingStudyGuide.value.title,
      description: editingStudyGuide.value.description
    })
    await loadStudyGuides()
    editingStudyGuide.value = null
  } catch (error) {
    console.error('Failed to save study guide changes:', error)
  } finally {
    loading.value = false
  }
}

const cancelEditStudyGuide = () => {
  editingStudyGuide.value = null
  editingSectionIndex.value = -1
  originalSectionData.value = null
}

const deleteStudyGuide = async (guide) => {
  if (!confirm(`Are you sure you want to delete "${guide.title}"?`)) return

  try {
    await api.delete(`/api/study-guides/${guide.id}`)
    await loadStudyGuides()
  } catch (error) {
    console.error('Failed to delete study guide:', error)
  }
}

const addNewSection = () => {
  const newSection = {
    title: '',
    content: '',
    section_type: 'text',
    book: '',
    chapter: null,
    verse_start: null,
    verse_end: null,
    order_index: editingStudyGuide.value.sections ? editingStudyGuide.value.sections.length : 0
  }
  editingStudyGuide.value.sections = editingStudyGuide.value.sections || []
  editingStudyGuide.value.sections.push(newSection)
  editingSectionIndex.value = editingStudyGuide.value.sections.length - 1
}

const editSection = (index) => {
  editingSectionIndex.value = index
  originalSectionData.value = { ...editingStudyGuide.value.sections[index] }
}

const saveSection = async (index) => {
  const section = editingStudyGuide.value.sections[index]
  loading.value = true

  try {
    const sectionData = {
      title: section.title,
      content: section.content,
      order_index: index,
      section_type: section.section_type,
      book: section.book || null,
      chapter: section.chapter || null,
      verse_start: section.verse_start || null,
      verse_end: section.verse_end || null
    }

    if (section.id) {
      // Update existing section
      await api.put(`/api/study-guide-sections/${section.id}`, sectionData)
    } else {
      // Create new section
      const response = await api.post(`/api/study-guides/${editingStudyGuide.value.id}/sections`, sectionData)
      section.id = response.data.id
    }

    editingSectionIndex.value = -1
    originalSectionData.value = null
  } catch (error) {
    console.error('Failed to save section:', error)
  } finally {
    loading.value = false
  }
}

const cancelEditSection = () => {
  if (originalSectionData.value && editingSectionIndex.value >= 0) {
    // Restore original data
    editingStudyGuide.value.sections[editingSectionIndex.value] = { ...originalSectionData.value }
  }
  editingSectionIndex.value = -1
  originalSectionData.value = null
}

const deleteSection = async (index) => {
  const section = editingStudyGuide.value.sections[index]
  if (!confirm(`Delete section "${section.title || 'Untitled'}"?`)) return

  try {
    if (section.id) {
      await api.delete(`/api/study-guide-sections/${section.id}`)
    }
    editingStudyGuide.value.sections.splice(index, 1)
    // Update order indices
    editingStudyGuide.value.sections.forEach((s, i) => s.order_index = i)
  } catch (error) {
    console.error('Failed to delete section:', error)
  }
}

const moveSectionUp = (index) => {
  if (index > 0) {
    const temp = editingStudyGuide.value.sections[index]
    editingStudyGuide.value.sections[index] = editingStudyGuide.value.sections[index - 1]
    editingStudyGuide.value.sections[index - 1] = temp
    // Update order indices
    editingStudyGuide.value.sections.forEach((s, i) => s.order_index = i)
  }
}

const moveSectionDown = (index) => {
  if (index < editingStudyGuide.value.sections.length - 1) {
    const temp = editingStudyGuide.value.sections[index]
    editingStudyGuide.value.sections[index] = editingStudyGuide.value.sections[index + 1]
    editingStudyGuide.value.sections[index + 1] = temp
    // Update order indices
    editingStudyGuide.value.sections.forEach((s, i) => s.order_index = i)
  }
}

const getSectionTypeLabel = (type) => {
  const labels = {
    text: 'Text/Commentary',
    passage: 'Bible Passage',
    questions: 'Study Questions',
    notes: 'Personal Notes'
  }
  return labels[type] || type
}

const updateSectionFields = (section) => {
  // Reset fields when changing section type
  if (section.section_type === 'passage') {
    section.book = section.book || ''
    section.chapter = section.chapter || null
  }
}

const getTextareaRows = (sectionType) => {
  const rows = {
    text: 6,
    passage: 4,
    questions: 8,
    notes: 6
  }
  return rows[sectionType] || 4
}

// Watch for section visibility changes and load data
watch(showNotes, (newVal) => {
  if (newVal && notes.value.length === 0) {
    loadNotes()
  }
})

watch(showBookmarks, (newVal) => {
  if (newVal && bookmarks.value.length === 0) {
    loadBookmarks()
  }
})

watch(showHighlights, (newVal) => {
  if (newVal && highlights.value.length === 0) {
    loadHighlights()
  }
})

watch(showStudyGuides, (newVal) => {
  if (newVal && studyGuides.value.length === 0) {
    loadStudyGuides()
  }
})
</script>

<style scoped>
.study-tools {
  max-width: 1200px;
  margin: 0 auto;
}

.study-tools h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 2rem;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.tool-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.tool-card:hover {
  transform: translateY(-4px);
}

.tool-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.tool-card p {
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

.btn-tool {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-tool:hover {
  background: #2980b9;
}

.tool-section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.tool-section h2 {
  color: #2c3e50;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 0.5rem;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.notes-list,
.bookmarks-list,
.highlights-list,
.study-guides-list {
  display: grid;
  gap: 1rem;
}

.note-item,
.bookmark-item,
.highlight-item,
.study-guide-item {
  padding: 1rem;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  background: #f8f9fa;
}

.note-item h4,
.bookmark-item h4,
.highlight-item h4,
.study-guide-item h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.note-item p,
.bookmark-item p,
.study-guide-item p {
  margin: 0.5rem 0;
  color: #34495e;
}

.highlight-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: inline-block;
  margin: 0.5rem 0;
}

.tool-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-add {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.btn-add:hover {
  background: #229954;
}

.btn-primary {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #229954;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.add-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

/* Study Guide Editor Styles */
.study-guide-editor {
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
  padding: 2rem;
}

.editor-content {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-header h2 {
  margin: 0;
  color: #2c3e50;
}

.editor-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.editor-footer {
  padding: 1.5rem;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-item {
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
  position: relative;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.section-title {
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.section-type {
  background: #3498db;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.section-content {
  color: #34495e;
  line-height: 1.5;
}

.section-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-edit-section,
.btn-delete-section {
  background: none;
  border: 1px solid #e1e8ed;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-edit-section:hover {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn-delete-section:hover {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.btn-add-section {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.btn-add-section:hover {
  background: #229954;
}

.section-editor {
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  padding: 1rem;
  background: #f8f9fa;
  margin-top: 1rem;
}

.section-editor h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.section-form .form-group {
  margin-bottom: 1rem;
}

.section-form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-save-section {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-save-section:hover {
  background: #229954;
}

.btn-cancel-section {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel-section:hover {
  background: #7f8c8d;
}

.move-buttons {
  display: flex;
  gap: 0.25rem;
}

.btn-move-up,
.btn-move-down {
  background: none;
  border: 1px solid #e1e8ed;
  padding: 0.25rem;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s;
}

.btn-move-up:hover,
.btn-move-down:hover {
  background: #f39c12;
  border-color: #f39c12;
  color: white;
}

.btn-close-editor {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.btn-close-editor:hover {
  background: #ecf0f1;
  color: #2c3e50;
}
</style>