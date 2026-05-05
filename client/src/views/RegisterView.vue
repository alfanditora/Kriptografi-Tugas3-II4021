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
      <!-- Logo & Header Section -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center pa-3 rounded-xl mb-4"
          style="background-color: #DFF1EE;"
        >
          <!-- Logo Icon -->
          <v-icon
            icon="mdi-shield-lock"
            size="32"
            color="#1DA88B"
          ></v-icon>
        </div>
        <h1 class="text-2xl font-bold mb-2" style="color: #2D3748;">
          Create an account
        </h1>
        <p class="text-sm" style="color: #718096;">
          Join SEChatbox - A Safely Encrypted box for all your chatting needs
        </p>
      </div>

      <!-- Error Alert -->
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
          <!-- First Name -->
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
                First Name
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

          <!-- Last Name -->
          <v-col cols="12" sm="6">
            <div class="mb-4">
              <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
                Last Name
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
            Email Address
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

        <!-- Password -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Password
          </label>
          <v-text-field
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Minimum 8 characters"
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

        <!-- Confirm Password -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Confirm Password
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

        <!-- Terms Text -->
        <p class="text-xs mb-6" style="color: #718096;">
          By clicking "Create Account", you agree to our
          <a href="#" class="hover:underline" style="color: #1DA88B;">Terms of Service</a>.
        </p>

        <!-- Create Account Button -->
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
          Create Account
        </v-btn>
      </v-form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full" style="border-top: 1px solid #DFE2F1;"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white" style="color: #718096;">
            Or sign up with
          </span>
        </div>
      </div>

      <!-- Google Sign Up Button -->
      <v-btn
        block
        size="large"
        variant="outlined"
        class="rounded-lg font-semibold text-none py-3"
        style="background-color: #DFF1EE; color: #1DA88B; border-color: #DFF1EE;"
        elevation="0"
      >
        <v-icon left class="mr-2">mdi-google</v-icon>
        Sign up with Google
      </v-btn>

      <!-- Sign In Link -->
      <div class="text-center mt-8 text-sm" style="color: #718096;">
        Already have an account?
        <router-link
          to="/login"
          class="ml-1 font-semibold hover:underline"
          style="color: #1DA88B;"
        >
          Sign in
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

// Menangani pengiriman formulir
async function handleSubmit() {
  if (formData.value.password !== formData.value.confirmPassword) {
    console.error('Password tidak cocok');
    return
  }

  console.log('Memulai proses registrasi untuk:', formData.value.email);

  try {
    // Siapkan data kriptografi (Phase 5.1)
    console.log('Men-generate key pair dan mengenkripsi private key...');
    const cryptoData = await crypto.prepareRegistrationData(
      formData.value.email,
      formData.value.password
    )
    console.log('Data kriptografi siap.');

    // Susun payload sesuai API & Table Schema.md
    const payload = {
      email: formData.value.email,
      password: formData.value.password,
      crypto: {
        publicKey: {
          kty: "OKP",
          crv: "X25519",
          x: crypto.arrayBufferToBase64(cryptoData.publicKey)
        },
        encryptedPrivateKey: {
          ciphertext: crypto.arrayBufferToBase64(cryptoData.encryptedPrivateKey),
          iv: crypto.arrayBufferToBase64(cryptoData.iv),
          alg: "AES-256-CBC"
        },
        kdf: {
          name: "PBKDF2",
          hash: "SHA-256",
          salt: crypto.arrayBufferToBase64(cryptoData.kdfSalt),
          iterations: cryptoData.kdfIterations
        }
      }
    }

    console.log('Mengirim payload registrasi ke mock API...');
    await authStore.register(payload)
    console.log('Registrasi berhasil.');

    // Inisialisasi kunci privat agar isInitialized menjadi true (Phase 5.1)
    console.log('Menyiapkan kunci privat untuk sesi ini...');
    await cryptoStore.decryptPrivateKey(
      formData.value.password,
      payload.crypto.encryptedPrivateKey,
      payload.crypto.kdf.salt,
      payload.crypto.kdf.iterations
    )
    console.log('Kunci privat siap di memori.');

    router.push('/contacts')
  } catch (error) {
    console.error('Registrasi gagal di View:', error.message)
  }
}
</script>
