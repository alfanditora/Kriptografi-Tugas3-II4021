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

      // Simpan data kunci terenkripsi untuk unlock setelah refresh
      // API Schema: response.crypto contains nested encryptedPrivateKey and kdf
      if (response.crypto) {
        localStorage.setItem('encryptedPrivateKey', JSON.stringify(response.crypto.encryptedPrivateKey))
        localStorage.setItem('publicKey', JSON.stringify(response.crypto.publicKey))
        localStorage.setItem('kdfSalt', response.crypto.kdf?.salt)
        localStorage.setItem('kdfIterations', String(response.crypto.kdf?.iterations || 100000))
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
      token.value = response.token
      user.value = response.user
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Inisialisasi status crypto store dari data payload registrasi
      const cryptoStore = useCryptoStore()
      cryptoStore.publicKey = payload.crypto.publicKey.x
      cryptoStore.encryptedPrivateKey = payload.crypto.encryptedPrivateKey
      cryptoStore.kdfSalt = payload.crypto.kdf.salt
      cryptoStore.kdfIterations = payload.crypto.kdf.iterations

      // Simpan data kunci terenkripsi untuk unlock setelah refresh
      localStorage.setItem('encryptedPrivateKey', JSON.stringify(payload.crypto.encryptedPrivateKey))
      localStorage.setItem('publicKey', JSON.stringify(payload.crypto.publicKey))
      localStorage.setItem('kdfSalt', payload.crypto.kdf.salt)
      localStorage.setItem('kdfIterations', String(payload.crypto.kdf.iterations))
      
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
