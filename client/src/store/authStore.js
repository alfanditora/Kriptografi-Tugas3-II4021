import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

export const useAuthStore = defineStore('auth', () => {
  // State (like useState in React)
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  // Getters (like computed values)
  const isAuthenticated = computed(() => !!token.value)

  // Actions (like functions in a hook)
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authApi.register(userData)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      return response
    } catch (err) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('token')
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    // Actions
    login,
    register,
    logout,
    clearError
  }
})
