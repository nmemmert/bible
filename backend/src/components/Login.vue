<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Login Required</h2>
      <p>Please log in to access word studies, study tools, and resources.</p>

      <form @submit.prevent="login" class="form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            id="username"
            v-model="credentials.username"
            type="text"
            required
            placeholder="Enter username"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            id="password"
            v-model="credentials.password"
            type="password"
            required
            placeholder="Enter password"
            class="form-input"
          >
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div class="demo-info">
        <p><strong>Demo Account:</strong></p>
        <p>Username: demo</p>
        <p>Password: demo123</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      this.loading = true
      this.error = null

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.credentials)
        })

        if (!response.ok) {
          throw new Error('Login failed')
        }

        const data = await response.json()

        // Store token in localStorage
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Emit login event
        this.$emit('login', data.user)

        // Redirect to intended page or home
        const redirectTo = this.$route.query.redirect || '/'
        this.$router.push(redirectTo)

      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.login-form {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
}

.login-form h2 {
  margin-top: 0;
  color: #2c3e50;
  text-align: center;
}

.login-form p {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  text-align: center;
}

.demo-info {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.demo-info p {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: #666;
}

.demo-info strong {
  color: #2c3e50;
}
</style>