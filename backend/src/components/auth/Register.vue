<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Create Account</h2>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            type="password"
            required
            class="form-input"
          />
        </div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>
      </form>

      <p class="auth-link">
        Already have an account?
        <router-link to="/login">Login here</router-link>
      </p>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-if="success" class="success-message">
        Account created successfully! You can now login.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '/src/api/index.js'

const router = useRouter()

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')
const success = ref(false)

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }

  loading.value = true
  error.value = ''
  success.value = false

  try {
    const response = await api.post('/auth/register', {
      username: form.value.username,
      email: form.value.email,
      password: form.value.password
    })

    success.value = true

    // Clear form
    form.value = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }

    // Redirect to login after a delay
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (err) {
    error.value = err.response?.data?.error || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 2rem;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #34495e;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.btn-primary {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: #229954;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.auth-link {
  text-align: center;
  margin-top: 1.5rem;
  color: #7f8c8d;
}

.auth-link a {
  color: #27ae60;
  text-decoration: none;
}

.auth-link a:hover {
  text-decoration: underline;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}

.success-message {
  background: #27ae60;
  color: white;
  padding: 0.75rem;
  border-radius: 4px;
  margin-top: 1rem;
  text-align: center;
}
</style>