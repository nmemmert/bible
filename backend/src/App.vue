<script setup>
import { ref } from 'vue'
import { useAuthStore } from '/src/stores/index.js'
import Navigation from './components/Navigation.vue'

const authStore = useAuthStore()
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
