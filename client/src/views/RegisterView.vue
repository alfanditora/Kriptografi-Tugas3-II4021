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
      <!-- Bagian Logo & Header -->
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
          Buat akun baru
        </h1>
        <p class="text-sm" style="color: #718096;">
          Bergabung dengan SEChatbox - Kotak obrolan aman untuk semua kebutuhan Anda
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
        <v-row dense>
          <!-- Nama Depan -->
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
                Nama Depan
              </label>
              <v-text-field
                v-model="formData.firstName"
                placeholder="Jane"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="rounded-lg"
                bg-color="#F7F9FC"
                style="--v-field-border-color: #CBD5E0;"
              ></v-text-field>
            </div>
          </v-col>

          <!-- Nama Belakang -->
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
                Nama Belakang
              </label>
              <v-text-field
                v-model="formData.lastName"
                placeholder="Doe"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                hide-details="auto"
                class="rounded-lg"
                bg-color="#F7F9FC"
                style="--v-field-border-color: #CBD5E0;"
              ></v-text-field>
            </div>
          </v-col>
        </v-row>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Alamat Email
          </label>
          <v-text-field
            v-model="formData.email"
            type="email"
            placeholder="jane@example.com"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Kata Sandi -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Kata Sandi
          </label>
          <v-text-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Minimal 8 karakter"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            :rules="[rules.required, rules.minLength]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Konfirmasi Kata Sandi -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Konfirmasi Kata Sandi
          </label>
          <v-text-field
            v-model="formData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            :rules="[rules.required, rules.matchPassword]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Teks Persyaratan -->
        <p class="text-xs mb-6" style="color: #718096;">
          Dengan mengklik "Buat Akun", Anda menyetujui
          <a href="#" class="hover:underline" style="color: #1DA88B;">Ketentuan Layanan</a> kami.
        </p>

        <!-- Tombol Buat Akun -->
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
          Buat Akun
        </v-btn>
      </v-form>

      <!-- Pemisah -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full" style="border-top: 1px solid #DFE2F1;"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white" style="color: #718096;">
            Atau daftar dengan
          </span>
        </div>
      </div>

      <!-- Tombol Daftar Google -->
      <v-btn
        block
        size="large"
        variant="outlined"
        class="rounded-lg font-semibold text-none py-3"
        style="background-color: #DFF1EE; color: #1DA88B; border-color: #DFF1EE;"
        elevation="0"
      >
        <v-icon left class="mr-2">mdi-google</v-icon>
        Daftar dengan Google
      </v-btn>

      <!-- Tautan Masuk -->
      <div class="text-center mt-8 text-sm" style="color: #718096;">
        Sudah punya akun?
        <router-link
          to="/login"
          class="ml-1 font-semibold hover:underline"
          style="color: #1DA88B;"
        >
          Masuk sekarang
        </router-link>
      </div>
    </v-card>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { useCryptoStore } from '../store/cryptoStore'
import * as crypto from '../services/crypto'
import AuthLayout from '../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const cryptoStore = useCryptoStore()

// State formulir
const formData = ref({
  email: '',
  password: '',
  confirmPassword: ''
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Aturan validasi
const rules = {
  required: (v) => !!v || 'Field ini wajib diisi',
  email: (v) => /.+@.+\..+/.test(v) || 'Harap masukkan email yang valid',
  minLength: (v) => v.length >= 8 || 'Kata sandi minimal 8 karakter',
  matchPassword: (v) => v === formData.value.password || 'Kata sandi tidak cocok'
}

function handleGoogleClick() {
  alert('Whoops! This feature is still under development.');
}

// Menangani pengiriman formulir
async function handleSubmit() {
  if (formData.value.password !== formData.value.confirmPassword) {
    console.error('[Auth] Password tidak cocok');
    return
  }

  console.log('[Auth] Memulai proses registrasi untuk:', formData.value.email);

  try {
    // Siapkan data kriptografi (Phase 5.1)
    console.log('[Kripto] Menghasilkan pasangan kunci ECDH dan mengenkripsi private key...');
    const cryptoData = await crypto.prepareRegistrationData(
      formData.value.email,
      formData.value.password
    )
    console.log('[Kripto] Data kriptografi siap dikirim ke server.');

    // Susun payload sesuai backend schemas.py (UserRegister)
    const payload = {
      email: formData.value.email,
      password: formData.value.password,
      publicKey: crypto.arrayBufferToBase64(cryptoData.publicKey),
      encryptedPrivateKey: crypto.arrayBufferToBase64(cryptoData.encryptedPrivateKey),
      privateKeyIv: crypto.arrayBufferToBase64(cryptoData.iv),
      privateKeyKdfSalt: crypto.arrayBufferToBase64(cryptoData.kdfSalt)
    }

    console.log('[Auth] Mengirim data registrasi ke API...');
    await authStore.register(payload)
    console.log('[Auth] Registrasi berhasil.');

    // Inisialisasi kunci privat agar isInitialized menjadi true (Phase 5.1)
    console.log('[Kripto] Menyiapkan kunci privat untuk sesi aktif...');
    await cryptoStore.decryptPrivateKey(
      formData.value.password,
      {
        ciphertext: payload.encryptedPrivateKey,
        iv: payload.privateKeyIv
      },
      payload.privateKeyKdfSalt,
      cryptoData.kdfIterations
    )
    console.log('[Kripto] Kunci privat siap digunakan.');

    // Redirect ke login karena backend tidak mengembalikan token saat register
    router.push('/login')
  } catch (error) {
    console.error('[Auth] Registrasi gagal:', error.message)
  }
}
</script>
