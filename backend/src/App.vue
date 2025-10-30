<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '/src/stores/index.js'
import Navigation from './components/Navigation.vue'

const authStore = useAuthStore()

// Initialize auth store from localStorage on app startup
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  const storedToken = localStorage.getItem('authToken')

  if (storedUser && storedToken) {
    try {
      const userData = JSON.parse(storedUser)
      authStore.setUser(userData)
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      // Clear invalid data
      localStorage.removeItem('user')
      localStorage.removeItem('authToken')
    }
  }
})
</script>

<template>
  <div id="app">
    <Navigation />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 1rem;
}
</style>
