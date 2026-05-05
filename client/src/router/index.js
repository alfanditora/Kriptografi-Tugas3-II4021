import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useCryptoStore } from '../store/cryptoStore'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ChatView from '../views/ChatView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/chat/:userId?',
      name: 'chat',
      component: ChatView,
      meta: { requiresAuth: true, requiresCrypto: true }
    },
    {
      path: '/contacts',
      redirect: '/chat'
    }
  ]
})

// Guard navigasi (Route guards)
router.beforeEach((to) => {
  const authStore = useAuthStore()
  const cryptoStore = useCryptoStore()

  // Cek jika rute membutuhkan autentikasi
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return { name: 'login' }
    }
  }

  // Cek jika rute membutuhkan inisialisasi kriptografi (kunci privat di memori)
  // Catatan: Jika user sudah login tapi kunci hilang (refresh), biarkan masuk ke route
  // dan tampilkan unlock modal di layout. Jangan redirect ke login.
  if (to.meta.requiresCrypto) {
    if (!authStore.isAuthenticated) {
      return { name: 'login' }
    }
    // Jika token ada tapi crypto belum siap, biarkan masuk - unlock modal akan handle
  }

  // Cek jika rute khusus untuk guest (seperti login/registrasi)
  if (to.meta.requiresGuest) {
    // Hanya arahkan ke /chat jika user SUDAH login DAN kunci SUDAH siap
    if (authStore.isAuthenticated && cryptoStore.isInitialized) {
      return { name: 'chat' }
    }
  }

  return true
})

export default router