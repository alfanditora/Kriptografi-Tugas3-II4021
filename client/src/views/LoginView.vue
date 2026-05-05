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
      <!-- Logo Section -->
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
          Welcome Back
        </h1>
        <p class="text-sm" style="color: #718096;">
          Enter your details to jump back into your box
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
        <!-- Email Field -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Email Address
          </label>
          <v-text-field
            v-model="formData.email"
            type="email"
            placeholder="name@company.com"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="comfortable"
            hide-details="auto"
            class="rounded-lg"
            bg-color="#F7F9FC"
            style="--v-field-border-color: #CBD5E0;"
          ></v-text-field>
        </div>

        <!-- Password Field -->
        <div class="mb-4">
          <label class="block text-sm font-semibold mb-1.5" style="color: #2D3748;">
            Password
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

        <!-- Remember Me & Forgot Password -->
        <div class="flex items-center justify-between mb-6">
          <v-checkbox
            v-model="rememberMe"
            label="Remember me"
            hide-details
            density="compact"
            color="#1DA88B"
            class="text-sm"
            style="color: #718096;"
          ></v-checkbox>
          <a
            href="#"
            class="text-sm font-medium hover:underline"
            style="color: #1DA88B;"
          >
            Forgot password?
          </a>
        </div>

        <!-- Submit Button -->
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
          Sign In
        </v-btn>
      </v-form>

      <!-- Divider -->
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full" style="border-top: 1px solid #DFE2F1;"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white" style="color: #718096;">
            Or sign in with
          </span>
        </div>
      </div>

      <!-- Google Sign In Button -->
      <v-btn
        block
        size="large"
        variant="outlined"
        class="rounded-lg font-semibold text-none py-3"
        style="background-color: #DFF1EE; color: #1DA88B; border-color: #DFF1EE;"
        elevation="0"
      >
        <v-icon left class="mr-2">mdi-google</v-icon>
        Sign in with Google
      </v-btn>

      <!-- Sign Up Link -->
      <div class="text-center mt-8 text-sm" style="color: #718096;">
        Don't have an account?
        <router-link
          to="/register"
          class="ml-1 font-semibold hover:underline"
          style="color: #1DA88B;"
        >
          Sign up
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
import AuthLayout from '../layouts/AuthLayout.vue'

const router = useRouter()
const authStore = useAuthStore()
const cryptoStore = useCryptoStore()

// State formulir
const formData = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const rememberMe = ref(false)

// Aturan validasi
const rules = {
  required: (v) => !!v || 'Field ini wajib diisi',
  email: (v) => /.+@.+\..+/.test(v) || 'Harap masukkan email yang valid'
}

// Menangani pengiriman formulir
async function handleSubmit() {
  console.log('Mencoba login untuk:', formData.value.email);
  
  try {
    const response = await authStore.login({
      email: formData.value.email,
      password: formData.value.password
    })
    
    console.log('Login berhasil, respons API:', response);

    // Inisialisasi kunci privat setelah login berhasil (Phase 5.2)
    if (response && response.crypto) {
      console.log('Mendekripsi kunci privat menggunakan password...');
      // Memanggil fungsi yang benar di cryptoStore
      await cryptoStore.decryptPrivateKey(
        formData.value.password, 
        response.crypto.encryptedPrivateKey,
        response.crypto.kdf.salt,
        response.crypto.kdf.iterations
      )
      console.log('Kunci privat berhasil dimuat ke memori.');
    }

    router.push('/contacts')
  } catch (error) {
    console.error('Login gagal di View:', error.message)
  }
}
</script>

