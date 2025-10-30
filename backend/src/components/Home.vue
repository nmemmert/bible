<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to Bible Study Hub</h1>
      <p>Your comprehensive tool for Bible study and spiritual growth</p>

      <div class="hero-actions">
        <router-link to="/bible" class="btn-primary">
          Start Reading
        </router-link>
        <router-link to="/study" class="btn-secondary">
          Study Tools
        </router-link>
      </div>
    </div>

    <!-- Verse of the Day Section -->
    <div class="verse-of-the-day">
      <h2>Verse of the Day</h2>
      <div v-if="verseLoading" class="verse-loading">
        <p>Loading today's verse...</p>
      </div>
      <div v-else-if="verseError" class="verse-error">
        <p>{{ verseError }}</p>
      </div>
      <div v-else-if="dailyVerse" class="verse-content">
        <div class="verse-text">
          <blockquote>{{ dailyVerse.verse.text }}</blockquote>
          <cite>{{ dailyVerse.reference }} ({{ dailyVerse.version.toUpperCase() }})</cite>
        </div>

        <div class="verse-actions">
          <button @click="shareVerse" class="btn-share">
            📤 Share
          </button>
          <button @click="generateImage" class="btn-image">
            🖼️ Generate Image
          </button>
          <button @click="customizeVerse" class="btn-customize">
            🎨 Customize
          </button>
          <button @click="setReminder" class="btn-reminder">
            🔔 Set Reminder
          </button>
        </div>

        <!-- Generated Image Display -->
        <div v-if="generatedImage" class="generated-image-container">
          <img :src="generatedImage" alt="Verse of the Day" class="verse-image" />
          <div class="image-actions">
            <button @click="downloadImage" class="btn-download">
              ⬇️ Download Image
            </button>
            <button @click="shareImage" class="btn-share-image">
              📤 Share Image
            </button>
          </div>
        </div>

        <!-- Customization Panel -->
        <div v-if="showCustomization" class="customization-panel">
          <h3>Customize Display</h3>
          <div class="custom-options">
            <div class="option-group">
              <label>Font Size:</label>
              <select v-model="fontSize" @change="updateVerseStyle">
                <option value="14px">Small</option>
                <option value="16px">Medium</option>
                <option value="18px">Large</option>
                <option value="20px">Extra Large</option>
              </select>
            </div>

            <div class="option-group">
              <label>Font Family:</label>
              <select v-model="fontFamily" @change="updateVerseStyle">
                <option value="serif">Serif</option>
                <option value="sans-serif">Sans Serif</option>
                <option value="monospace">Monospace</option>
              </select>
            </div>

            <div class="option-group">
              <label>Background:</label>
              <select v-model="backgroundStyle" @change="updateVerseStyle">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="gradient">Gradient</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="features">
      <div class="feature-card">
        <h3>📖 Bible Reading</h3>
        <p>Read from multiple Bible versions with easy navigation</p>
      </div>

      <div class="feature-card">
        <h3>🔍 Search & Study</h3>
        <p>Powerful search functionality across all versions</p>
      </div>

      <div class="feature-card">
        <h3>📝 Study Tools</h3>
        <p>Notes, bookmarks, highlights, and study guides</p>
      </div>

      <div class="feature-card">
        <h3>📚 Word Studies</h3>
        <p>Deep dive into Greek and Hebrew words</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component logic here
import { ref, onMounted } from 'vue'

// Verse of the Day data
const dailyVerse = ref(null)
const verseLoading = ref(true)
const verseError = ref(null)
const showCustomization = ref(false)
const generatedImage = ref(null)

// Customization options
const fontSize = ref('16px')
const fontFamily = ref('serif')
const backgroundStyle = ref('light')

// Load verse of the day
const loadVerseOfTheDay = async () => {
  try {
    verseLoading.value = true
    verseError.value = null

    const response = await fetch('/api/verse-of-the-day?version=bsb')
    if (!response.ok) {
      throw new Error('Failed to load verse of the day')
    }

    const data = await response.json()
    dailyVerse.value = data
  } catch (error) {
    console.error('Error loading verse of the day:', error)
    verseError.value = error.message || 'Failed to load verse of the day'
  } finally {
    verseLoading.value = false
  }
}

// Share verse functionality
const shareVerse = async () => {
  if (!dailyVerse.value) return

  const shareText = `"${dailyVerse.value.verse.text}" - ${dailyVerse.value.reference} (${dailyVerse.value.version.toUpperCase()})`

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Verse of the Day',
        text: shareText,
        url: window.location.href
      })
    } catch (error) {
      console.log('Error sharing:', error)
      fallbackShare(shareText)
    }
  } else {
    fallbackShare(shareText)
  }
}

const fallbackShare = (text) => {
  // Copy to clipboard as fallback
  navigator.clipboard.writeText(text).then(() => {
    alert('Verse copied to clipboard!')
  }).catch(() => {
    alert('Share this verse: ' + text)
  })
}

// Image generation functionality
const generateImage = () => {
  if (!dailyVerse.value) return

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Set canvas size
  canvas.width = 800
  canvas.height = 600

  // Set background
  if (backgroundStyle.value === 'dark') {
    ctx.fillStyle = '#2c3e50'
  } else if (backgroundStyle.value === 'gradient') {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
  } else {
    ctx.fillStyle = '#f8f9fa'
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Set text properties
  ctx.fillStyle = backgroundStyle.value === 'dark' ? '#ecf0f1' : '#2c3e50'
  ctx.font = `bold ${fontSize.value} ${fontFamily.value}`
  ctx.textAlign = 'center'

  // Draw verse text (with word wrapping)
  const maxWidth = 700
  const lineHeight = parseInt(fontSize.value) + 8
  const words = dailyVerse.value.verse.text.split(' ')
  let line = ''
  let y = 150

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, canvas.width / 2, y)
      line = words[i] + ' '
      y += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, canvas.width / 2, y)

  // Draw reference
  ctx.font = `italic ${Math.max(14, parseInt(fontSize.value) - 4)}px ${fontFamily.value}`
  ctx.fillText(dailyVerse.value.reference, canvas.width / 2, y + 60)

  // Draw version
  ctx.font = `14px ${fontFamily.value}`
  ctx.fillText(`(${dailyVerse.value.version.toUpperCase()})`, canvas.width / 2, y + 90)

  // Draw title
  ctx.font = `bold 24px ${fontFamily.value}`
  ctx.fillText('Verse of the Day', canvas.width / 2, 80)

  // Convert to data URL
  generatedImage.value = canvas.toDataURL('image/png')
}

const downloadImage = () => {
  if (!generatedImage.value) return

  const link = document.createElement('a')
  link.download = `verse-of-the-day-${new Date().toISOString().split('T')[0]}.png`
  link.href = generatedImage.value
  link.click()
}

const shareImage = async () => {
  if (!generatedImage.value) return

  try {
    // Convert data URL to blob
    const response = await fetch(generatedImage.value)
    const blob = await response.blob()
    const file = new File([blob], 'verse-of-the-day.png', { type: 'image/png' })

    if (navigator.share) {
      await navigator.share({
        title: 'Verse of the Day',
        text: dailyVerse.value.reference,
        files: [file]
      })
    } else {
      alert('Image sharing not supported in this browser. Use the download button instead.')
    }
  } catch (error) {
    console.error('Error sharing image:', error)
    alert('Failed to share image. Use the download button instead.')
  }
}

// Customization methods
const customizeVerse = () => {
  showCustomization.value = !showCustomization.value
}

const updateVerseStyle = () => {
  // This will be handled by CSS variables or inline styles
  // The verse content will use these values
}

// Reminder functionality (placeholder for now)
const setReminder = () => {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        alert('Daily verse reminders enabled! You will receive notifications at 8 AM.')
        // In a real implementation, this would schedule notifications
      } else {
        alert('Notification permission denied. Please enable notifications in your browser settings.')
      }
    })
  } else {
    alert('Notifications not supported in this browser.')
  }
}

// Load verse on component mount
onMounted(() => {
  loadVerseOfTheDay()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
}

.btn-secondary {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card h3 {
  color: #667eea;
  margin-bottom: 1rem;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

/* Verse of the Day Styles */
.verse-of-the-day {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}

.verse-of-the-day h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 1.8rem;
}

.verse-loading, .verse-error {
  padding: 2rem;
  color: #666;
}

.verse-error {
  color: #dc3545;
}

.verse-content {
  max-width: 600px;
  margin: 0 auto;
}

.verse-text {
  margin-bottom: 2rem;
}

.verse-text blockquote {
  font-size: 1.2rem;
  line-height: 1.6;
  color: #333;
  font-style: italic;
  margin: 0 0 1rem 0;
  padding: 1rem;
  border-left: 4px solid #667eea;
  background: #f8f9fa;
  border-radius: 0 8px 8px 0;
}

.verse-text cite {
  display: block;
  font-size: 0.9rem;
  color: #667eea;
  font-weight: 600;
  margin-top: 0.5rem;
}

.verse-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-share, .btn-customize, .btn-reminder, .btn-image {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-share {
  background: #25d366;
  color: white;
}

.btn-share:hover {
  background: #128c7e;
  transform: translateY(-2px);
}

.btn-image {
  background: #6f42c1;
  color: white;
}

.btn-image:hover {
  background: #5a32a3;
  transform: translateY(-2px);
}

.btn-customize {
  background: #6c757d;
  color: white;
}

.btn-customize:hover {
  background: #545b62;
  transform: translateY(-2px);
}

.btn-reminder {
  background: #ffc107;
  color: #212529;
}

.btn-reminder:hover {
  background: #e0a800;
  transform: translateY(-2px);
}

.generated-image-container {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.verse-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.image-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-download, .btn-share-image {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-download {
  background: #28a745;
  color: white;
}

.btn-download:hover {
  background: #218838;
  transform: translateY(-1px);
}

.btn-share-image {
  background: #007bff;
  color: white;
}

.btn-share-image:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.customization-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #dee2e6;
}

.customization-panel h3 {
  margin-top: 0;
  color: #495057;
  font-size: 1.2rem;
}

.custom-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-group label {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
}

.option-group select {
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .verse-actions {
    flex-direction: column;
    align-items: center;
  }

  .custom-options {
    grid-template-columns: 1fr;
  }
}
</style>