<template>
  <div class="study-tools">
    <h1>Study Tools</h1>

    <div class="tools-grid">
      <div class="tool-card">
        <h3>📝 Notes</h3>
        <p>Personal notes and reflections</p>
        <button @click="showNotes = !showNotes" class="btn-tool">
          {{ showNotes ? 'Hide' : 'View' }} Notes
        </button>
      </div>

      <div class="tool-card">
        <h3>🔖 Bookmarks</h3>
        <p>Save important passages</p>
        <button @click="showBookmarks = !showBookmarks" class="btn-tool">
          {{ showBookmarks ? 'Hide' : 'View' }} Bookmarks
        </button>
      </div>

      <div class="tool-card">
        <h3>✨ Highlights</h3>
        <p>Highlight verses for emphasis</p>
        <button @click="showHighlights = !showHighlights" class="btn-tool">
          {{ showHighlights ? 'Hide' : 'View' }} Highlights
        </button>
      </div>

      <div class="tool-card">
        <h3>📚 Study Guides</h3>
        <p>Create and follow study guides</p>
        <button @click="showStudyGuides = !showStudyGuides" class="btn-tool">
          {{ showStudyGuides ? 'Hide' : 'View' }} Study Guides
        </button>
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

    <!-- Study Guides Section -->
    <div v-if="showStudyGuides" class="tool-section">
      <h2>My Study Guides</h2>
      <div v-if="studyGuides.length === 0" class="empty-state">
        No study guides yet. Create your first study guide!
      </div>
      <div v-else class="study-guides-list">
        <div v-for="guide in studyGuides" :key="guide.id" class="study-guide-item">
          <h4>{{ guide.title }}</h4>
          <p>{{ guide.description }}</p>
          <small>{{ new Date(guide.created_at).toLocaleDateString() }}</small>
        </div>
      </div>
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

const notes = ref([])
const bookmarks = ref([])
const highlights = ref([])
const studyGuides = ref([])

const loadNotes = async () => {
  try {
    const response = await api.get('/notes')
    notes.value = response.data
  } catch (error) {
    console.error('Failed to load notes:', error)
  }
}

const loadBookmarks = async () => {
  try {
    const response = await api.get('/bookmarks')
    bookmarks.value = response.data
  } catch (error) {
    console.error('Failed to load bookmarks:', error)
  }
}

const loadHighlights = async () => {
  try {
    const response = await api.get('/highlights')
    highlights.value = response.data
  } catch (error) {
    console.error('Failed to load highlights:', error)
  }
}

const loadStudyGuides = async () => {
  try {
    const response = await api.get('/study-guides')
    studyGuides.value = response.data
  } catch (error) {
    console.error('Failed to load study guides:', error)
  }
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

small {
  color: #7f8c8d;
  font-size: 0.8rem;
}
</style>