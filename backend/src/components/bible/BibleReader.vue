<template>
  <div class="bible-reader">
    <div class="reader-controls">
      <div class="version-selector">
        <label for="version">Version:</label>
        <select
          id="version"
          v-model="bibleStore.currentVersion"
          @change="onVersionChange"
          class="form-select"
        >
          <option v-for="version in bibleStore.availableVersions" :key="version.id" :value="version.id">
            {{ version.abbreviation }}
          </option>
        </select>
      </div>

      <div class="book-selector">
        <label for="book">Book:</label>
        <select
          id="book"
          v-model="bibleStore.currentBook"
          @change="loadChapter"
          class="form-select"
        >
          <option v-for="book in books" :key="book" :value="book">
            {{ book }}
          </option>
        </select>
      </div>

      <div class="chapter-selector">
        <label for="chapter">Chapter:</label>
        <input
          id="chapter"
          v-model.number="bibleStore.currentChapter"
          @change="loadChapter"
          type="number"
          min="1"
          :max="maxChapters"
          class="form-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading...
    </div>

    <div v-else-if="bibleStore.chapterData" class="chapter-content">
      <h2 class="chapter-title">
        {{ bibleStore.currentBook }} {{ bibleStore.currentChapter }}
      </h2>

      <div class="verses">
        <div
          v-for="verse in bibleStore.chapterData.verses"
          :key="verse.verse"
          class="verse"
          :id="`verse-${verse.verse}`"
        >
          <div class="verse-content">
            <span class="verse-number">{{ verse.verse }}</span>
            <span
              class="verse-text"
              :ref="`verse-text-${verse.verse}`"
              @mouseup="handleTextSelection(bibleStore.currentBook, bibleStore.currentChapter, verse.verse)"
              @contextmenu.prevent="showHighlightMenu(bibleStore.currentBook, bibleStore.currentChapter, verse.verse, $event)"
            >
              {{ verse.text }}
            </span>
          </div>
          <div class="verse-actions">
            <button
              @click="addNote(bibleStore.currentBook, bibleStore.currentChapter, verse.verse)"
              class="action-btn note-btn"
              title="Add Note"
            >
              📝
            </button>
            <button
              @click="addBookmark(bibleStore.currentBook, bibleStore.currentChapter, verse.verse)"
              class="action-btn bookmark-btn"
              title="Add Bookmark"
            >
              🔖
            </button>
            <button
              @click="addHighlight(bibleStore.currentBook, bibleStore.currentChapter, verse.verse)"
              class="action-btn highlight-btn"
              title="Add Highlight"
            >
              ✨
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="error">
      Failed to load chapter. Please try again.
    </div>

    <!-- Highlight Menu -->
    <div
      v-if="highlightMenu.visible"
      class="highlight-menu"
      :style="{ left: highlightMenu.x + 'px', top: highlightMenu.y + 'px' }"
    >
      <div class="highlight-colors">
        <button
          v-for="color in highlightColors"
          :key="color.name"
          @click="applyHighlight(color.name)"
          :class="`highlight-color ${color.name}`"
          :title="color.label"
        >
          {{ color.emoji }}
        </button>
      </div>
      <button @click="hideHighlightMenu" class="cancel-btn">Cancel</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useBibleStore } from '/src/stores/index.js'
import api from '/src/api/index.js'

const props = defineProps({
  version: String,
  book: String,
  chapter: String
})

const bibleStore = useBibleStore()

const loading = ref(true)

// Highlight menu state
const highlightMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  book: '',
  chapter: 0,
  verse: 0,
  selectedText: '',
  startOffset: 0,
  endOffset: 0
})

const highlightColors = [
  { name: 'yellow', label: 'Yellow', emoji: '🟡' },
  { name: 'green', label: 'Green', emoji: '🟢' },
  { name: 'blue', label: 'Blue', emoji: '🔵' },
  { name: 'pink', label: 'Pink', emoji: '🩷' },
  { name: 'orange', label: 'Orange', emoji: '🟠' }
]

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

const maxChapters = computed(() => {
  // This is a simplified mapping - in a real app you'd have a proper mapping
  const bookChapterCounts = {
    'Genesis': 50, 'Exodus': 40, 'Matthew': 28, 'Psalms': 150,
    'Revelation': 22
  }
  return bookChapterCounts[bibleStore.currentBook] || 50
})

const onVersionChange = () => {
  // Version change will trigger the watcher to reload chapter
}

const loadVersions = async () => {
  try {
    const response = await api.getVersions()
    bibleStore.setAvailableVersions(response.data)
    // Set default version if not set
    if (!bibleStore.currentVersion && response.data.length > 0) {
      bibleStore.setVersion(response.data[0].id)
    }
  } catch (error) {
    console.error('Failed to load versions:', error)
    // Fallback to hardcoded versions
    const fallbackVersions = [
      { id: 'kjv', name: 'King James Version', abbreviation: 'KJV' },
      { id: 'esv', name: 'English Standard Version', abbreviation: 'ESV' },
      { id: 'niv', name: 'New International Version', abbreviation: 'NIV' },
      { id: 'nkjv', name: 'New King James Version', abbreviation: 'NKJV' },
      { id: 'nlt', name: 'New Living Translation', abbreviation: 'NLT' }
    ]
    bibleStore.setAvailableVersions(fallbackVersions)
    if (!bibleStore.currentVersion) {
      bibleStore.setVersion('kjv')
    }
  }
}

const loadChapter = async () => {
  loading.value = true
  try {
    const response = await api.getChapter(bibleStore.currentVersion, bibleStore.currentBook, bibleStore.currentChapter)
    bibleStore.setChapterData(response.data)
  } catch (error) {
    console.error('Failed to load chapter:', error)
    bibleStore.setChapterData(null)
  } finally {
    loading.value = false
  }
}

// Study tool creation methods
const addNote = async (book, chapter, verse) => {
  const noteText = prompt(`Add a note for ${book} ${chapter}:${verse}:`)
  if (noteText && noteText.trim()) {
    try {
      await api.post('/api/notes', {
        book,
        chapter,
        verse,
        note_text: noteText.trim()
      })
      alert('Note added successfully!')
    } catch (error) {
      console.error('Failed to add note:', error)
      alert('Failed to add note. Please try again.')
    }
  }
}

const addBookmark = async (book, chapter, verse) => {
  const title = prompt(`Add a bookmark title for ${book} ${chapter}:${verse} (optional):`)
  try {
    await api.post('/api/bookmarks', {
      book,
      chapter,
      verse,
      title: title ? title.trim() : ''
    })
    alert('Bookmark added successfully!')
  } catch (error) {
    console.error('Failed to add bookmark:', error)
    alert('Failed to add bookmark. Please try again.')
  }
}

const addHighlight = async (book, chapter, verse) => {
  const colors = ['yellow', 'green', 'blue', 'pink', 'orange']
  const colorChoice = prompt(`Choose highlight color for ${book} ${chapter}:${verse}:\n1. Yellow\n2. Green\n3. Blue\n4. Pink\n5. Orange\n\nEnter number (1-5):`)

  const colorIndex = parseInt(colorChoice) - 1
  if (colorChoice && colorIndex >= 0 && colorIndex < colors.length) {
    try {
      await api.post('/api/highlights', {
        book,
        chapter,
        verse,
        color: colors[colorIndex]
      })
      alert('Highlight added successfully!')
    } catch (error) {
      console.error('Failed to add highlight:', error)
      alert('Failed to add highlight. Please try again.')
    }
  } else if (colorChoice) {
    alert('Invalid choice. Please enter a number between 1-5.')
  }
}

const handleTextSelection = (book, chapter, verse) => {
  const selection = window.getSelection()
  const selectedText = selection.toString().trim()

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0)
    const verseElement = range.commonAncestorContainer.parentElement?.closest('.verse-text') ||
                        range.commonAncestorContainer?.closest('.verse-text')

    if (verseElement) {
      const verseText = verseElement.textContent
      const startOffset = verseText.indexOf(selectedText)
      const endOffset = startOffset + selectedText.length

      if (startOffset !== -1) {
        highlightMenu.value = {
          visible: true,
          x: range.getBoundingClientRect().left + window.scrollX,
          y: range.getBoundingClientRect().bottom + window.scrollY + 5,
          book,
          chapter,
          verse,
          selectedText,
          startOffset,
          endOffset
        }
      }
    }
  }
}

const showHighlightMenu = (book, chapter, verse, event) => {
  // Right-click context menu for existing highlights
  event.preventDefault()
  // For now, just hide any existing menu
  hideHighlightMenu()
}

const applyHighlight = async (color) => {
  try {
    await api.post('/api/highlights', {
      book: highlightMenu.value.book,
      chapter: highlightMenu.value.chapter,
      verse: highlightMenu.value.verse,
      color,
      text: highlightMenu.value.selectedText,
      startOffset: highlightMenu.value.startOffset,
      endOffset: highlightMenu.value.endOffset
    })

    hideHighlightMenu()
    alert('Text highlighted successfully!')
  } catch (error) {
    console.error('Failed to add highlight:', error)
    alert('Failed to add highlight. Please try again.')
  }
}

const hideHighlightMenu = () => {
  highlightMenu.value.visible = false
}

onMounted(async () => {
  await loadVersions()
  
  // Set initial values from route props
  if (props.version) {
    bibleStore.setVersion(props.version)
  } else if (!bibleStore.currentVersion) {
    bibleStore.setVersion('kjv')
  }
  
  if (props.book) {
    bibleStore.setBook(props.book)
  } else if (!bibleStore.currentBook) {
    bibleStore.setBook('Genesis')
  }
  
  if (props.chapter) {
    bibleStore.setChapter(parseInt(props.chapter))
  } else if (!bibleStore.currentChapter) {
    bibleStore.setChapter(1)
  }
  
  await loadChapter()
  
  // Scroll to verse if hash is present in URL
  const hash = window.location.hash
  if (hash && hash.startsWith('#verse-')) {
    const verseNum = hash.replace('#verse-', '')
    setTimeout(() => {
      const verseElement = document.getElementById(`verse-${verseNum}`)
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add temporary highlight
        verseElement.style.backgroundColor = '#fff3cd'
        verseElement.style.borderLeft = '4px solid #ffc107'
        setTimeout(() => {
          verseElement.style.backgroundColor = ''
          verseElement.style.borderLeft = ''
        }, 3000)
      }
    }, 500) // Wait for DOM to render
  }
})

watch(() => bibleStore.currentVersion, loadChapter)
watch(() => bibleStore.currentBook, loadChapter)
watch(() => bibleStore.currentChapter, async (newChapter) => {
  await loadChapter()
  
  // Scroll to verse if hash is present in URL after chapter change
  const hash = window.location.hash
  if (hash && hash.startsWith('#verse-')) {
    const verseNum = hash.replace('#verse-', '')
    setTimeout(() => {
      const verseElement = document.getElementById(`verse-${verseNum}`)
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Add temporary highlight
        verseElement.style.backgroundColor = '#fff3cd'
        verseElement.style.borderLeft = '4px solid #ffc107'
        setTimeout(() => {
          verseElement.style.backgroundColor = ''
          verseElement.style.borderLeft = ''
        }, 3000)
      }
    }, 500)
  }
})

// Watch for route parameter changes
watch(() => props.version, (newVersion) => {
  if (newVersion && newVersion !== bibleStore.currentVersion) {
    bibleStore.setVersion(newVersion)
  }
})

watch(() => props.book, (newBook) => {
  if (newBook && newBook !== bibleStore.currentBook) {
    bibleStore.setBook(newBook)
  }
})

watch(() => props.chapter, (newChapter) => {
  if (newChapter && parseInt(newChapter) !== bibleStore.currentChapter) {
    bibleStore.setChapter(parseInt(newChapter))
  }
})
</script>

<style scoped>
.bible-reader {
  max-width: 800px;
  margin: 0 auto;
}

.reader-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  flex-wrap: wrap;
}

.version-selector,
.book-selector,
.chapter-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.version-selector label,
.book-selector label,
.chapter-selector label {
  font-weight: 500;
  color: #34495e;
  font-size: 0.9rem;
}

.form-select,
.form-input {
  padding: 0.5rem;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  font-size: 1rem;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.loading {
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background: #fdf2f2;
  border-radius: 4px;
  margin: 2rem 0;
}

.chapter-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.chapter-title {
  text-align: center;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 2rem;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 1rem;
}

.verses {
  line-height: 1.8;
  font-size: 1.1rem;
}

.verse {
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.verse:last-child {
  border-bottom: none;
}

.verse-content {
  flex: 1;
}

.verse-number {
  font-weight: bold;
  color: #3498db;
  margin-right: 0.5rem;
  font-size: 0.9rem;
}

.verse-text {
  color: #2c3e50;
  user-select: text;
  cursor: text;
}

.verse-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.verse:hover .verse-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 3px;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: rgba(0,0,0,0.1);
}

.note-btn:hover {
  background: rgba(52, 152, 219, 0.2);
}

.bookmark-btn:hover {
  background: rgba(155, 89, 182, 0.2);
}

.highlight-btn:hover {
  background: rgba(46, 204, 113, 0.2);
}

/* Highlight Menu Styles */
.highlight-menu {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 0.5rem;
  z-index: 1000;
  min-width: 200px;
}

.highlight-colors {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.highlight-color {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  transition: transform 0.2s;
}

.highlight-color:hover {
  transform: scale(1.1);
}

.highlight-color.yellow {
  background: #fff3cd;
  border: 2px solid #ffc107;
}

.highlight-color.green {
  background: #d4edda;
  border: 2px solid #28a745;
}

.highlight-color.blue {
  background: #cce7ff;
  border: 2px solid #007bff;
}

.highlight-color.pink {
  background: #f8d7da;
  border: 2px solid #dc3545;
}

.highlight-color.orange {
  background: #ffeaa7;
  border: 2px solid #fd7e14;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  width: 100%;
}

.cancel-btn:hover {
  background: #5a6268;
}
</style>