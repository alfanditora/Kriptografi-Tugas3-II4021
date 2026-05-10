import { ref, computed } from 'vue'
import { useCryptoStore } from '../store/cryptoStore'
import { useAuthStore } from '../store/authStore'

/**
 * Composable untuk menampilkan modal unlock saat kunci privat perlu didekripsi.
 * Digunakan saat user refresh halaman - token masih valid tapi private key hilang dari memori.
 */
export function useUnlockModal() {
  const cryptoStore = useCryptoStore()
  const authStore = useAuthStore()

  const showModal = ref(false)
  const password = ref('')
  const error = ref('')
  const loading = ref(false)

  // Cek apakah unlock diperlukan: token ada tapi private key belum didekripsi
  const needsUnlock = computed(() => {
    return authStore.token && !cryptoStore.isInitialized
  })

  // Tampilkan modal jika perlu unlock
  function checkAndShow() {
    if (needsUnlock.value) {
      showModal.value = true
      password.value = ''
      error.value = ''
    }
  }

  // Tutup modal (hanya jika sudah ter-unlock)
  function hide() {
    if (cryptoStore.isInitialized) {
      showModal.value = false
      password.value = ''
      error.value = ''
    }
  }

  // Proses dekripsi private key
  async function unlock() {
    if (!password.value.trim()) {
      error.value = 'Password wajib diisi'
      return
    }

    loading.value = true
    error.value = ''

    try {
      // Ambil data dari localStorage atau sessionStorage
      const getStoredItem = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);
      
      const encryptedDataStr = getStoredItem('encryptedPrivateKey')
      const publicKey = getStoredItem('publicKey') // This is a raw base64 string
      const salt = getStoredItem('kdfSalt')
      const iterations = parseInt(getStoredItem('kdfIterations') || '600000')

      if (!encryptedDataStr || !salt) {
        throw new Error('Data kunci tidak ditemukan. Silakan login ulang.')
      }

      const encryptedData = JSON.parse(encryptedDataStr)

      // Dekripsi private key
      await cryptoStore.decryptPrivateKey(
        password.value,
        encryptedData,
        salt,
        iterations
      )

      // Pulihkan public key: Cek storage, jika tidak ada, ambil dari backend
      if (publicKey) {
        cryptoStore.publicKey = publicKey
      } else if (authStore.user?.id) {
        try {
          const { messageApi } = await import('../api/messages')
          const pubKeyResponse = await messageApi.getConversationCrypto(authStore.user.id)
          cryptoStore.publicKey = pubKeyResponse.publicKey
          localStorage.setItem('publicKey', pubKeyResponse.publicKey)
        } catch (pubKeyErr) {
          console.error('[Kripto] Gagal mengambil kunci publik sendiri dari server:', pubKeyErr);
        }
      }

      // Sukses - tutup modal
      hide()
    } catch (err) {
      error.value = err.message || 'Password salah atau gagal membuka kunci'
    } finally {
      loading.value = false
    }
  }

  // Logout dan redirect ke login
  function logout() {
    authStore.logout()
    showModal.value = false
    window.location.href = '/login'
  }

  return {
    showModal,
    password,
    error,
    loading,
    needsUnlock,
    checkAndShow,
    unlock,
    hide,
    logout
  }
}
