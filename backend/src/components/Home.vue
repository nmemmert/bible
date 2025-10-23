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
  border: 2px solid white;
}

.btn-secondary:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-2px);
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feature-card p {
  color: #7f8c8d;
  line-height: 1.6;
}
</style>