<template>
  <AuthLayout>
    <v-card
      class="pa-8"
      width="100%"
      max-width="540"
      color="surface"
      elevation="1"
      rounded="xl"
      style="border: 1px solid #DFE2F1;"
    >
      <!-- Bagian Logo -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center pa-3 rounded-xl mb-4"
          style="background-color: #DFF1EE;"
        >
          <!-- Ikon Logo -->
          <v-icon
            icon="mdi-shield-lock"
            size="32"
            color="#1DA88B"
          ></v-icon>
        </div>
        <h1 class="text-2xl font-bold mb-2" style="color: #2D3748;">
          Selamat Datang Kembali
        </h1>
        <p class="text-sm" style="color: #718096;">
          Masukkan detail Anda untuk masuk kembali ke kotak pesan Anda
        </p>
      </div>

      <!-- Peringatan Error -->
      <v-alert
        v-if="authStore.error"
        type="error"
        variant="tonal"
        closable
        @click:close="authStore.clearError"
        class="mb-4 rounded-lg"
        density="compact"
      >
        {{ authStore.error }}
      </v-alert>

      <v-form @submit.prevent="handleSubmit" ref="form">
        <!-- Field Email -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Alamat Email
          </label>
          <v-text-field
            v-model="formData.email"
            type="email"
            placeholder="nama@perusahaan.com"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Field Kata Sandi -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Kata Sandi
          </label>
          <v-text-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[rules.required]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Ingat Saya & Lupa Kata Sandi -->
        <div class="flex items-center justify-between mb-6">
          <v-checkbox
            v-model="rememberMe"
            label="Ingat saya"
            hide-details
            density="compact"
            color="#1DA88B"
            class="text-sm"
            style="color: #718096;"
          ></v-checkbox>
          <!-- <a
            href="#"
            class="text-sm font-medium hover:underline"
            style="color: #1DA88B;"
          >
            Lupa kata sandi?
          </a> -->
        </div>

        <!-- Tombol Masuk -->
        <v-btn
          type="submit"
          block
          size="large"
          :loading="authStore.loading"
          :disabled="authStore.loading"
          class="rounded-lg font-semibold text-none py-3"
          style="background-color: #1DA88B; color: white;"
          elevation="0"
        >
          Masuk
        </v-btn>
      </v-form>

      <!-- Pemisah -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full" style="border-top: 1px solid #DFE2F1;"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white" style="color: #718096;">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <!-- Tombol Masuk Google -->
      <v-btn
        block
        size="large"
        variant="outlined"
        class="rounded-lg font-semibold text-none py-3"
        style="background-color: #DFF1EE; color: #1DA88B; border-color: #DFF1EE;"
        elevation="0"
        @click="handleGoogleClick"
      >
        <v-icon left class="mr-2">mdi-google</v-icon>
        Masuk dengan Google
      </v-btn>

      <!-- Tautan Daftar -->
      <div class="text-center mt-8 text-sm" style="color: #718096;">
        Belum punya akun?
        <router-link
          to="/register"
          class="ml-1 font-semibold hover:underline"
          style="color: #1DA88B;"
        >
          Daftar sekarang
        </router-link>
      </div>
    </v-card>
  </AuthLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useCryptoStore } from '../store/cryptoStore'
import AuthLayout from '../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const cryptoStore = useCryptoStore()

// State formulir
const form = ref(null)
const formData = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const rememberMe = ref(false)

// Ambil email yang diingat saat mount
onMounted(() => {
  const savedEmail = localStorage.getItem('remembered_email')
  if (savedEmail) {
    formData.value.email = savedEmail
    rememberMe.value = true
  }
})

// Aturan validasi
const rules = {
  required: (v) => !!v || 'Field ini wajib diisi',
  email: (v) => /.+@.+\..+/.test(v) || 'Harap masukkan email yang valid'
}

function handleGoogleClick() {
  alert('Whoops! This feature is still under development.');
}

// Menangani pengiriman formulir
async function handleSubmit() {
  const { valid } = await form.value.validate()
  if (!valid) return

  console.log('[Auth] Mencoba login untuk:', formData.value.email);
  
  try {
    const response = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    }, rememberMe.value)
    
    console.log('[Auth] Login berhasil, token JWT diterima.');

    // Inisialisasi kunci privat setelah login berhasil (Phase 5.2)
    // backend sends these in response.user now
    if (response && response.user && response.user.encryptedPrivateKey) {
      console.log('[Kripto] Memulihkan kunci privat dari server...');
      await cryptoStore.decryptPrivateKey(
        formData.value.password, 
        {
          ciphertext: response.user.encryptedPrivateKey,
          iv: response.user.privateKeyIv
        },
        response.user.privateKeyKdfSalt,
        cryptoStore.kdfIterations
      )
      console.log('[Kripto] Kunci privat berhasil dimuat ke memori.');
    } else {
      console.warn('[Kripto] Data pemulihan kunci tidak ditemukan dalam respon server.');
    }

    router.push('/chat')
  } catch (error) {
    console.error('[Auth] Login gagal:', error.message)
  }
}
</script>
