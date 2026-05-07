import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import { useCryptoStore } from './cryptoStore'

/**
 * Store untuk mengelola status autentikasi pengguna.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  /**
   * Menangani proses login pengguna.
   */
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Recovery: backend now returns these fields in LoginResponse.user
      if (response.user && response.user.encryptedPrivateKey) {
        localStorage.setItem('encryptedPrivateKey', JSON.stringify({
          ciphertext: response.user.encryptedPrivateKey,
          iv: response.user.privateKeyIv
        }))
        localStorage.setItem('kdfSalt', response.user.privateKeyKdfSalt)
        // Default iterations (as backend doesn't store this specifically yet)
        localStorage.setItem('kdfIterations', '100000')
      }
      
      return response
    } catch (err) {
      error.value = err.message || 'Login gagal'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Menangani proses registrasi pengguna.
   */
  async function register(payload) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.register(payload)
      
      // Store local crypto material after registration so it's available for the session
      localStorage.setItem('encryptedPrivateKey', JSON.stringify({
        ciphertext: payload.encryptedPrivateKey,
        iv: payload.privateKeyIv
      }))
      localStorage.setItem('publicKey', payload.publicKey)
      localStorage.setItem('kdfSalt', payload.privateKeyKdfSalt)
      localStorage.setItem('kdfIterations', '100000')
      
      return response
    } catch (err) {
      error.value = err.message || 'Registrasi gagal'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Menghapus sesi pengguna.
   */
  function logout() {
    const cryptoStore = useCryptoStore()
    cryptoStore.clearPrivateKey()

    user.value = null
    token.value = null
    error.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('encryptedPrivateKey')
    localStorage.removeItem('kdfSalt')
    localStorage.removeItem('kdfIterations')
    localStorage.removeItem('publicKey')
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    clearError
  }
})
