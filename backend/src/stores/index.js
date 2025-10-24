import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  const setUser = (userData) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    setUser,
    logout
  }
})

export const useBibleStore = defineStore('bible', () => {
  const currentVersion = ref('kjv')
  const currentBook = ref('')
  const currentChapter = ref(1)
  const chapterData = ref(null)
  const availableVersions = ref([])

  const setVersion = (version) => {
    currentVersion.value = version
  }

  const setBook = (book) => {
    currentBook.value = book
  }

  const setChapter = (chapter) => {
    currentChapter.value = chapter
  }

  const setChapterData = (data) => {
    chapterData.value = data
  }

  const setAvailableVersions = (versions) => {
    availableVersions.value = versions
  }

  return {
    currentVersion,
    currentBook,
    currentChapter,
    chapterData,
    availableVersions,
    setVersion,
    setBook,
    setChapter,
    setChapterData,
    setAvailableVersions
  }
})