<template>
  <div class="profile">
    <div class="profile-header">
      <h1>My Profile</h1>
      <div class="user-info">
        <div class="avatar">
          <span>{{ userInitials }}</span>
        </div>
        <div class="user-details">
          <h2>{{ user?.username || 'Guest User' }}</h2>
          <p>{{ user?.email || 'Please log in to access your profile' }}</p>
        </div>
      </div>
    </div>

    <!-- Profile Navigation -->
    <div class="profile-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['nav-tab', { active: activeTab === tab.id }]"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab Content -->
    <div class="profile-content">
      <!-- Overview Tab -->
      <div v-if="activeTab === 'overview'" class="tab-content">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>{{ notes.length }}</h3>
            <p>Notes</p>
          </div>
          <div class="stat-card">
            <h3>{{ bookmarks.length }}</h3>
            <p>Bookmarks</p>
          </div>
          <div class="stat-card">
            <h3>{{ highlights.length }}</h3>
            <p>Highlights</p>
          </div>
          <div class="stat-card">
            <h3>{{ wordStudies.length }}</h3>
            <p>Word Studies</p>
          </div>
          <div class="stat-card">
            <h3>{{ studyGuides.length }}</h3>
            <p>Study Guides</p>
          </div>
        </div>

        <div class="recent-activity">
          <h3>Recent Activity</h3>
          <div v-if="recentActivity.length === 0" class="empty-state">
            <p>No recent activity</p>
          </div>
          <div v-else class="activity-list">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">{{ activity.icon }}</div>
              <div class="activity-content">
                <p>{{ activity.description }}</p>
                <small>{{ formatDate(activity.timestamp) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Tab -->
      <div v-if="activeTab === 'notes'" class="tab-content">
        <div class="content-header">
          <h3>My Notes</h3>
          <div class="header-actions">
            <button @click="exportNotes" class="btn-secondary" :disabled="notes.length === 0">Export</button>
            <button @click="createNewNote" class="btn-primary">+ New Note</button>
          </div>
        </div>

        <!-- Search and Filter -->
        <div v-if="notes.length > 0" class="search-filter-section">
          <div class="search-input-group">
            <input
              v-model="noteSearchQuery"
              type="text"
              placeholder="Search notes..."
              class="search-input"
            >
            <button @click="clearNoteSearch" class="clear-search-btn" v-if="noteSearchQuery">&times;</button>
          </div>
          <div class="filter-group">
            <select v-model="noteSortBy" class="filter-select">
              <option value="updated_at">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="created_at">Sort by Created</option>
            </select>
            <select v-model="noteSortOrder" class="filter-select">
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <!-- Tags Filter -->
        <div v-if="allNoteTags.length > 0" class="tags-filter">
          <span class="filter-label">Filter by tags:</span>
          <div class="tag-buttons">
            <button
              v-for="tag in allNoteTags"
              :key="tag"
              @click="toggleTagFilter(tag)"
              :class="['tag-btn', { active: selectedNoteTags.includes(tag) }]"
            >
              {{ tag }}
            </button>
            <button
              v-if="selectedNoteTags.length > 0"
              @click="clearTagFilters"
              class="tag-btn clear-all"
            >
              Clear All
            </button>
          </div>
        </div>

        <div v-if="notes.length === 0" class="empty-state">
          <p>You haven't created any notes yet.</p>
          <button @click="createNewNote" class="btn-secondary">Create Your First Note</button>
        </div>

        <div v-else-if="filteredNotes.length === 0" class="empty-state">
          <p>No notes match your search criteria.</p>
          <button @click="clearNoteSearch" class="btn-secondary">Clear Search</button>
        </div>

        <div v-else class="notes-grid">
          <div
            v-for="note in paginatedNotes"
            :key="note.id"
            class="note-card"
            @click="openNote(note)"
          >
            <div class="note-header">
              <h4>{{ note.title }}</h4>
              <div class="note-actions">
                <button @click.stop="shareNote(note)" class="action-btn share-btn" title="Share Note">📤</button>
                <button @click.stop="duplicateNote(note)" class="action-btn duplicate-btn" title="Duplicate Note">📋</button>
              </div>
            </div>
            <p v-html="getNotePreview(note.content)"></p>
            <div class="note-meta">
              <small>Last modified: {{ formatDate(note.updated_at) }}</small>
              <div class="note-tags" v-if="note.tags?.length">
                <span v-for="tag in note.tags.slice(0, 3)" :key="tag" class="tag">{{ tag }}</span>
                <span v-if="note.tags.length > 3" class="tag more">+{{ note.tags.length - 3 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalNotePages > 1" class="pagination">
          <button
            @click="currentNotePage--"
            :disabled="currentNotePage === 1"
            class="page-btn"
          >
            Previous
          </button>
          <span class="page-info">
            Page {{ currentNotePage }} of {{ totalNotePages }}
          </span>
          <button
            @click="currentNotePage++"
            :disabled="currentNotePage === totalNotePages"
            class="page-btn"
          >
            Next
          </button>
        </div>
      </div>

      <!-- Bookmarks Tab -->
      <div v-if="activeTab === 'bookmarks'" class="tab-content">
        <div class="content-header">
          <h3>My Bookmarks</h3>
        </div>

        <div v-if="bookmarks.length === 0" class="empty-state">
          <p>You haven't bookmarked any verses yet.</p>
        </div>

        <div v-else class="bookmarks-list">
          <div
            v-for="bookmark in bookmarks"
            :key="bookmark.id"
            class="bookmark-item"
          >
            <div class="bookmark-content">
              <h4>{{ bookmark.reference }}</h4>
              <p>{{ bookmark.text }}</p>
            </div>
            <div class="bookmark-actions">
              <button @click="goToBookmark(bookmark)" class="btn-secondary">View</button>
              <button @click="removeBookmark(bookmark)" class="btn-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Highlights Tab -->
      <div v-if="activeTab === 'highlights'" class="tab-content">
        <div class="content-header">
          <h3>My Highlights</h3>
        </div>

        <div v-if="highlights.length === 0" class="empty-state">
          <p>You haven't highlighted any verses yet.</p>
        </div>

        <div v-else class="highlights-list">
          <div
            v-for="highlight in highlights"
            :key="highlight.id"
            class="highlight-item"
            :style="{ backgroundColor: highlight.color + '20' }"
          >
            <div class="highlight-content">
              <h4>{{ highlight.reference }}</h4>
              <p>{{ highlight.text }}</p>
            </div>
            <div class="highlight-actions">
              <button @click="goToHighlight(highlight)" class="btn-secondary">View</button>
              <button @click="removeHighlight(highlight)" class="btn-danger">Remove</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Word Studies Tab -->
      <div v-if="activeTab === 'word-studies'" class="tab-content">
        <div class="content-header">
          <h3>My Word Studies</h3>
          <button @click="createNewWordStudy" class="btn-primary">+ New Study</button>
        </div>

        <div v-if="wordStudies.length === 0" class="empty-state">
          <p>You haven't created any word studies yet.</p>
        </div>

        <div v-else class="studies-grid">
          <div
            v-for="study in wordStudies"
            :key="study.id"
            class="study-card"
            @click="openWordStudy(study)"
          >
            <h4>{{ study.title }}</h4>
            <p>Strong's: {{ study.strongs_number }}</p>
            <small>Created: {{ formatDate(study.created_at) }}</small>
          </div>
        </div>
      </div>

      <!-- Study Guides Tab -->
      <div v-if="activeTab === 'study-guides'" class="tab-content">
        <div class="content-header">
          <h3>My Study Guides</h3>
          <button @click="createNewStudyGuide" class="btn-primary">+ New Study Guide</button>
        </div>

        <div v-if="studyGuides.length === 0" class="empty-state">
          <p>You haven't created any study guides yet.</p>
        </div>

        <div v-else class="study-guides-grid">
          <div
            v-for="guide in studyGuides"
            :key="guide.id"
            class="study-guide-card"
            @click="openStudyGuide(guide)"
          >
            <h4>{{ guide.title || 'Untitled Study Guide' }}</h4>
            <p>{{ guide.description || 'No description available' }}</p>
            <small>Verses: {{ guide.verses?.length || 0 }} | Created: {{ formatDate(guide.created_at) }}</small>
            <div class="guide-tags" v-if="guide.tags?.length">
              <span v-for="tag in guide.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Settings Tab -->
      <div v-if="activeTab === 'settings'" class="tab-content">
        <h3>Profile Settings</h3>

        <div class="settings-section">
          <h4>Bible Preferences</h4>
          <div class="setting-item">
            <label for="preferredVersion">Preferred Bible Version:</label>
            <select
              id="preferredVersion"
              v-model="preferredVersion"
              @change="updatePreferredVersion"
            >
              <option value="kjv">King James Version (KJV)</option>
              <option value="bsb">Berean Study Bible (BSB)</option>
              <option value="asv">American Standard Version (ASV)</option>
              <option value="esv">English Standard Version (ESV)</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h4>Notifications</h4>
          <div class="setting-item">
            <label>
              <input
                type="checkbox"
                v-model="dailyVerseReminder"
                @change="updateNotificationSettings"
              >
              Daily Verse Reminders
            </label>
          </div>
          <div class="setting-item">
            <label>
              <input
                type="checkbox"
                v-model="studyReminders"
                @change="updateNotificationSettings"
              >
              Study Reminders
            </label>
          </div>
        </div>

        <div class="settings-section">
          <h4>Account</h4>
          <button @click="logout" class="btn-danger">Logout</button>
        </div>
      </div>
    </div>

    <!-- Note Modal (for creating/editing notes) -->
    <div v-if="showNoteModal" class="modal-overlay" @click="closeNoteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingNote ? 'Edit Note' : 'Create New Note' }}</h3>
          <button @click="closeNoteModal" class="close-btn">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="noteTitle">Title:</label>
            <input
              id="noteTitle"
              v-model="noteForm.title"
              type="text"
              placeholder="Enter note title..."
            >
          </div>

          <div class="form-group">
            <label for="noteContent">Content:</label>
            <div class="rich-text-toolbar">
              <button @click="formatText('bold')" type="button" class="format-btn" title="Bold">
                <strong>B</strong>
              </button>
              <button @click="formatText('italic')" type="button" class="format-btn" title="Italic">
                <em>I</em>
              </button>
              <button @click="formatText('underline')" type="button" class="format-btn" title="Underline">
                <u>U</u>
              </button>
              <button @click="insertLink" type="button" class="format-btn" title="Insert Link">
                🔗
              </button>
              <button @click="insertList" type="button" class="format-btn" title="Bullet List">
                •
              </button>
              <button @click="clearFormatting" type="button" class="format-btn" title="Clear Formatting">
                ⌫
              </button>
            </div>
            <div
              id="noteContentEditor"
              contenteditable="true"
              class="rich-text-editor"
              @input="updateNoteContent"
              @paste="handlePaste"
            ></div>
          </div>

          <div class="form-group">
            <label for="noteTags">Tags (comma-separated):</label>
            <input
              id="noteTags"
              v-model="noteForm.tags"
              type="text"
              placeholder="study, prayer, sermon..."
            >
          </div>
        </div>

        <div class="modal-actions">
          <button @click="saveNote" class="btn-primary">Save Note</button>
          <button @click="closeNoteModal" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'

// User data
const user = ref(null)

// Initialize user data
const initializeUser = () => {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
  } catch (error) {
    console.error('Error loading user data:', error)
    user.value = null
  }
}

// Call initialize on component mount
onMounted(() => {
  initializeUser()
  loadUserData()
})

// Tab management
const activeTab = ref('overview')
const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'notes', label: 'Notes' },
  { id: 'bookmarks', label: 'Bookmarks' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'word-studies', label: 'Word Studies' },
  { id: 'settings', label: 'Settings' }
]

// User content data
const notes = ref([])
const bookmarks = ref([])
const highlights = ref([])
const wordStudies = ref([])
const studyGuides = ref([])
const recentActivity = ref([])

// Settings
const preferredVersion = ref(localStorage.getItem('preferredVersion') || 'kjv')
const dailyVerseReminder = ref(localStorage.getItem('dailyVerseReminder') === 'true')
const studyReminders = ref(localStorage.getItem('studyReminders') === 'true')

// Note modal
const showNoteModal = ref(false)
const editingNote = ref(null)
const noteForm = ref({
  title: '',
  content: '',
  tags: ''
})

// Note search and filtering
const noteSearchQuery = ref('')
const selectedNoteTags = ref([])
const noteSortBy = ref('updated_at')
const noteSortOrder = ref('desc')
const currentNotePage = ref(1)
const notesPerPage = ref(12)

// Computed properties
const userInitials = computed(() => {
  if (!user.value?.username) return 'U'
  return user.value.username.substring(0, 2).toUpperCase()
})

// Note filtering and pagination
const allNoteTags = computed(() => {
  const tagSet = new Set()
  notes.value.forEach(note => {
    if (note.tags) {
      note.tags.forEach(tag => tagSet.add(tag))
    }
  })
  return Array.from(tagSet).sort()
})

const filteredNotes = computed(() => {
  let filtered = notes.value

  // Search filter
  if (noteSearchQuery.value.trim()) {
    const query = noteSearchQuery.value.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.replace(/<[^>]*>/g, '').toLowerCase().includes(query) ||
      (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
    )
  }

  // Tag filter
  if (selectedNoteTags.value.length > 0) {
    filtered = filtered.filter(note =>
      note.tags && selectedNoteTags.value.every(tag => note.tags.includes(tag))
    )
  }

  // Sorting
  filtered.sort((a, b) => {
    let aVal = a[noteSortBy.value]
    let bVal = b[noteSortBy.value]

    if (noteSortBy.value === 'title') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (noteSortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return filtered
})

const totalNotePages = computed(() => {
  return Math.ceil(filteredNotes.value.length / notesPerPage.value)
})

const paginatedNotes = computed(() => {
  const start = (currentNotePage.value - 1) * notesPerPage.value
  const end = start + notesPerPage.value
  return filteredNotes.value.slice(start, end)
})

// Router
const router = useRouter()

// Methods
const loadUserData = async () => {
  try {
    // Load notes
    const notesResponse = await fetch('/api/notes', {
      headers: getAuthHeaders()
    })
    if (notesResponse.ok) {
      notes.value = await notesResponse.json()
    }

    // Load bookmarks
    const bookmarksResponse = await fetch('/api/bookmarks', {
      headers: getAuthHeaders()
    })
    if (bookmarksResponse.ok) {
      bookmarks.value = await bookmarksResponse.json()
    }

    // Load highlights
    const highlightsResponse = await fetch('/api/highlights', {
      headers: getAuthHeaders()
    })
    if (highlightsResponse.ok) {
      highlights.value = await highlightsResponse.json()
    }

    // Load word studies
    const wordStudiesResponse = await fetch('/api/word-studies', {
      headers: getAuthHeaders()
    })
    if (wordStudiesResponse.ok) {
      wordStudies.value = await wordStudiesResponse.json()
    }

    // Load study guides
    const studyGuidesResponse = await fetch('/api/study-guides', {
      headers: getAuthHeaders()
    })
    if (studyGuidesResponse.ok) {
      studyGuides.value = await studyGuidesResponse.json()
    }

    // Generate recent activity (simplified)
    generateRecentActivity()
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

const generateRecentActivity = () => {
  const activities = []

  // Add recent notes
  notes.value.slice(0, 3).forEach(note => {
    activities.push({
      id: `note-${note.id}`,
      description: `Created note: "${note.title}"`,
      timestamp: note.created_at,
      icon: '📝'
    })
  })

  // Add recent bookmarks
  bookmarks.value.slice(0, 2).forEach(bookmark => {
    activities.push({
      id: `bookmark-${bookmark.id}`,
      description: `Bookmarked ${bookmark.reference}`,
      timestamp: bookmark.created_at,
      icon: '🔖'
    })
  })

  // Add recent highlights
  highlights.value.slice(0, 2).forEach(highlight => {
    activities.push({
      id: `highlight-${highlight.id}`,
      description: `Highlighted ${highlight.reference}`,
      timestamp: highlight.created_at,
      icon: '✨'
    })
  })

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  recentActivity.value = activities.slice(0, 10)
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const getNotePreview = (content) => {
  // Strip HTML tags and get preview
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  if (textContent.length <= 150) {
    return content // Return original HTML if short enough
  }
  // Get plain text preview and add ellipsis
  const preview = textContent.substring(0, 150) + '...'
  return preview
}

// Note management
const createNewNote = () => {
  editingNote.value = null
  noteForm.value = { title: '', content: '', tags: '' }
  // Clear rich text editor
  nextTick(() => {
    const editor = document.getElementById('noteContentEditor')
    if (editor) {
      editor.innerHTML = ''
    }
  })
  showNoteModal.value = true
}

const openNote = (note) => {
  editingNote.value = note
  noteForm.value = {
    title: note.title,
    content: note.content,
    tags: note.tags ? note.tags.join(', ') : ''
  }
  // Set content in rich text editor after modal is shown
  nextTick(() => {
    const editor = document.getElementById('noteContentEditor')
    if (editor) {
      editor.innerHTML = note.content || ''
    }
  })
  showNoteModal.value = true
}

const saveNote = async () => {
  try {
    const noteData = {
      title: noteForm.value.title,
      content: noteForm.value.content,
      tags: noteForm.value.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    }

    let response
    if (editingNote.value) {
      // Update existing note
      response = await fetch(`/api/notes/${editingNote.value.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(noteData)
      })
    } else {
      // Create new note
      response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(noteData)
      })
    }

    if (response.ok) {
      await loadUserData() // Reload data
      closeNoteModal()
    } else {
      console.error('Failed to save note')
    }
  } catch (error) {
    console.error('Error saving note:', error)
  }
}

const closeNoteModal = () => {
  showNoteModal.value = false
  editingNote.value = null
  noteForm.value = { title: '', content: '', tags: '' }
}

// Rich text formatting methods
const formatText = (command) => {
  document.execCommand(command, false, null)
  document.getElementById('noteContentEditor').focus()
}

const insertLink = () => {
  const url = prompt('Enter the URL:')
  if (url) {
    document.execCommand('createLink', false, url)
  }
  document.getElementById('noteContentEditor').focus()
}

const insertList = () => {
  document.execCommand('insertUnorderedList', false, null)
  document.getElementById('noteContentEditor').focus()
}

const clearFormatting = () => {
  document.execCommand('removeFormat', false, null)
  document.getElementById('noteContentEditor').focus()
}

const updateNoteContent = (event) => {
  noteForm.value.content = event.target.innerHTML
}

const handlePaste = (event) => {
  event.preventDefault()
  const text = event.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
}

// Note search and filtering methods
const clearNoteSearch = () => {
  noteSearchQuery.value = ''
  currentNotePage.value = 1
}

const toggleTagFilter = (tag) => {
  const index = selectedNoteTags.value.indexOf(tag)
  if (index > -1) {
    selectedNoteTags.value.splice(index, 1)
  } else {
    selectedNoteTags.value.push(tag)
  }
  currentNotePage.value = 1
}

const clearTagFilters = () => {
  selectedNoteTags.value = []
  currentNotePage.value = 1
}

// Watch for sort changes
watch([noteSortBy, noteSortOrder], () => {
  currentNotePage.value = 1
})

// Note export functionality
const exportNotes = () => {
  const dataStr = JSON.stringify(filteredNotes.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileDefaultName = `bible-notes-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}

// Note sharing functionality
const shareNote = async (note) => {
  const shareData = {
    title: note.title,
    text: note.content,
    url: window.location.origin + '/profile'
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
      alert('Note copied to clipboard!')
    }
  } catch (error) {
    console.error('Error sharing note:', error)
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`)
      alert('Note copied to clipboard!')
    } catch (clipboardError) {
      alert('Unable to share note. Please copy manually.')
    }
  }
}

// Note duplication
const duplicateNote = async (note) => {
  try {
    const duplicatedNote = {
      title: `${note.title} (Copy)`,
      content: note.content,
      tags: note.tags || []
    }

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(duplicatedNote)
    })

    if (response.ok) {
      await loadUserData() // Reload data
    } else {
      console.error('Failed to duplicate note')
    }
  } catch (error) {
    console.error('Error duplicating note:', error)
  }
}

// Bookmark management
const goToBookmark = (bookmark) => {
  // Navigate to the bookmarked verse
  const [book, chapter, verse] = bookmark.reference.split(' ')
  router.push(`/bible/${preferredVersion.value}/${book}/${chapter}#verse-${verse}`)
}

const removeBookmark = async (bookmark) => {
  try {
    const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (response.ok) {
      await loadUserData() // Reload data
    }
  } catch (error) {
    console.error('Error removing bookmark:', error)
  }
}

// Highlight management
const goToHighlight = (highlight) => {
  const [book, chapter, verse] = highlight.reference.split(' ')
  router.push(`/bible/${preferredVersion.value}/${book}/${chapter}#verse-${verse}`)
}

const removeHighlight = async (highlight) => {
  try {
    const response = await fetch(`/api/highlights/${highlight.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (response.ok) {
      await loadUserData() // Reload data
    }
  } catch (error) {
    console.error('Error removing highlight:', error)
  }
}

// Word study management
const createNewWordStudy = () => {
  router.push('/lexicon') // Navigate to lexicon to create word study
}

const openWordStudy = (study) => {
  router.push(`/word-studies`) // Could add study ID parameter
}

// Study guide management
const createNewStudyGuide = () => {
  router.push('/study-tools') // Navigate to study tools to create study guide
}

const openStudyGuide = (guide) => {
  router.push(`/study-tools`) // Could add guide ID parameter
}

// Settings management
const updatePreferredVersion = () => {
  localStorage.setItem('preferredVersion', preferredVersion.value)
}

const updateNotificationSettings = () => {
  localStorage.setItem('dailyVerseReminder', dailyVerseReminder.value.toString())
  localStorage.setItem('studyReminders', studyReminders.value.toString())
}

const logout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  router.push('/login')
}

// Lifecycle
onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  text-align: center;
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.avatar {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.user-details h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.user-details p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.profile-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #dee2e6;
  overflow-x: auto;
}

.nav-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: #495057;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  transition: all 0.3s;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 500;
}

.nav-tab:hover {
  background: #f8f9fa;
  color: #212529;
}

.nav-tab.active {
  background: #667eea;
  color: white;
  border-bottom: 2px solid #667eea;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid #e9ecef;
}

.stat-card h3 {
  margin: 0;
  font-size: 2.5rem;
  color: #667eea;
  font-weight: 700;
}

.stat-card p {
  margin: 0.5rem 0 0 0;
  color: #495057;
  font-size: 1.1rem;
  font-weight: 500;
}

.recent-activity h3 {
  margin-bottom: 1rem;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.activity-icon {
  font-size: 1.5rem;
}

.activity-content p {
  margin: 0;
  color: #212529;
  font-size: 1rem;
  line-height: 1.5;
}

.activity-content small {
  color: #6c757d;
  font-size: 0.9rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.content-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.search-filter-section {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-group {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
}

.clear-search-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
}

.tags-filter {
  margin-bottom: 1rem;
}

.filter-label {
  font-weight: 600;
  color: #495057;
  margin-right: 0.5rem;
}

.tag-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.tag-btn {
  padding: 0.25rem 0.75rem;
  border: 2px solid #ced4da;
  background: white;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
}

.tag-btn:hover {
  border-color: #667eea;
}

.tag-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.tag-btn.clear-all {
  border-color: #dc3545;
  color: #dc3545;
}

.tag-btn.clear-all:hover {
  background: #dc3545;
  color: white;
}

.note-card {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  position: relative;
}

.note-card:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.note-header h4 {
  margin: 0;
  color: #212529;
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s;
}

.note-card:hover .note-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1rem;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #f8f9fa;
}

.note-meta {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-meta small {
  color: #6c757d;
  font-size: 0.85rem;
}

.note-tags {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag.more {
  background: #667eea;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #ced4da;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-weight: 500;
}

.study-guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.study-guide-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.study-guide-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

.study-guide-card h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.study-guide-card p {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  line-height: 1.4;
}

.study-guide-card small {
  color: #868e96;
  font-size: 0.875rem;
}

.guide-tags {
  margin-top: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.tag {
  background: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.bookmarks-list, .highlights-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bookmark-item, .highlight-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: white;
}

.bookmark-content, .highlight-content {
  flex: 1;
}

.bookmark-content h4, .highlight-content h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.bookmark-content p, .highlight-content p {
  margin: 0;
  color: #6c757d;
  line-height: 1.4;
}

.bookmark-actions, .highlight-actions {
  display: flex;
  gap: 0.5rem;
}

.settings-section {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  color: #212529;
  font-weight: 500;
}

.setting-item select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  color: #212529;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a67d8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #212529;
  font-size: 1.5rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #212529;
  font-size: 1rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
  background: white;
  color: #212529;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 0 0 8px 8px;
}

@media (max-width: 768px) {
  .profile-nav {
    padding-bottom: 0.5rem;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .bookmark-item, .highlight-item {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .bookmark-actions, .highlight-actions {
    justify-content: center;
  }
}

/* Rich text editor styles */
.rich-text-toolbar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.format-btn {
  padding: 0.375rem 0.5rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.format-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.format-btn:active {
  background: #dee2e6;
}

.rich-text-editor {
  min-height: 200px;
  padding: 1rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  background: white;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: auto;
  outline: none;
}

.rich-text-editor:focus {
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.rich-text-editor p {
  margin: 0 0 1rem 0;
}

.rich-text-editor p:last-child {
  margin-bottom: 0;
}

.rich-text-editor ul, .rich-text-editor ol {
  margin: 1rem 0;
  padding-left: 2rem;
}

.rich-text-editor li {
  margin-bottom: 0.5rem;
}

.rich-text-editor a {
  color: #007bff;
  text-decoration: underline;
}

.rich-text-editor a:hover {
  color: #0056b3;
}
</style>