import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'
import { useCryptoStore } from './cryptoStore'

/**
 * Store untuk mengelola status autentikasi pengguna.
 */
export const useAuthStore = defineStore('auth', () => {
  // Cek token di localStorage (persistent) atau sessionStorage (non-persistent)
  const token = ref(localStorage.getItem('token') || sessionStorage.getItem('token') || null)
  
  // Ambil user data
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  /**
   * Menangani proses login pengguna.
   */
  async function login(credentials, rememberMe = false) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(credentials)
      token.value = response.token
      user.value = response.user
      
      const storage = rememberMe ? localStorage : sessionStorage
      
      // Bersihkan storage lainnya untuk menghindari duplikasi/konflik
      const otherStorage = rememberMe ? sessionStorage : localStorage
      otherStorage.removeItem('token')
      otherStorage.removeItem('user')
      otherStorage.removeItem('encryptedPrivateKey')
      otherStorage.removeItem('kdfSalt')
      otherStorage.removeItem('kdfIterations')
      otherStorage.removeItem('publicKey')

      // Simpan ke storage yang dipilih
      storage.setItem('token', response.token)
      storage.setItem('user', JSON.stringify(response.user))

      // Simpan email untuk pre-fill jika rememberMe aktif
      if (rememberMe) {
        localStorage.setItem('remembered_email', credentials.email)
      } else {
        localStorage.removeItem('remembered_email')
      }

      // Recovery: simpan metadata crypto ke storage yang sama
      if (response.user && response.user.encryptedPrivateKey) {
        storage.setItem('encryptedPrivateKey', JSON.stringify({
          ciphertext: response.user.encryptedPrivateKey,
          iv: response.user.privateKeyIv
        }))
        storage.setItem('kdfSalt', response.user.privateKeyKdfSalt)
        storage.setItem('kdfIterations', '600000')

        // Fetch public key sendiri karena tidak ada di LoginResponse
        try {
          const { messageApi } = await import('../api/messages')
          const pubKeyResponse = await messageApi.getConversationCrypto(response.user.id)
          storage.setItem('publicKey', pubKeyResponse.publicKey)
          
          // Push to cryptoStore memory immediately
          const cryptoStore = useCryptoStore()
          cryptoStore.publicKey = pubKeyResponse.publicKey
          console.log('[Auth] Kunci publik sendiri berhasil dimuat ke memori.');
        } catch (err) {
          console.error('[Auth] Gagal mengambil kunci publik sendiri:', err)
        }
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
      
      // Registrasi selalu menyimpan metadata secara lokal untuk sementara
      // agar bisa lanjut ke setup/login
      localStorage.setItem('encryptedPrivateKey', JSON.stringify({
        ciphertext: payload.encryptedPrivateKey,
        iv: payload.privateKeyIv
      }))
      localStorage.setItem('publicKey', payload.publicKey)
      localStorage.setItem('kdfSalt', payload.privateKeyKdfSalt)
      localStorage.setItem('kdfIterations', '600000')
      
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
    
    // Bersihkan kedua storage
    const storages = [localStorage, sessionStorage]
    storages.forEach(s => {
      s.removeItem('token')
      s.removeItem('user')
      s.removeItem('encryptedPrivateKey')
      s.removeItem('kdfSalt')
      s.removeItem('kdfIterations')
      s.removeItem('publicKey')
    })
    // Note: 'remembered_email' tidak dihapus saat logout agar tetap ada di form login
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
