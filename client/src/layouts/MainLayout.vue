<template>
  <v-app>
    <!-- Bilah Aplikasi -->
    <v-app-bar
      elevation="1"
      style="background-color: white; border-bottom: 1px solid #DFE2F1;"
    >
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon
            icon="mdi-shield-lock"
            color="#1DA88B"
            class="mr-2"
            size="28"
          ></v-icon>
          <span class="font-weight-bold" style="color: #2D3748;">SEChatbox</span>
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Menu Pengguna -->
      <v-menu v-if="!unlockModal.needsUnlock.value" location="bottom end">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            variant="text"
            class="text-none"
            style="color: #2D3748;"
          >
            <v-icon left class="mr-2">mdi-account-circle</v-icon>
            {{ authStore.user?.email }}
            <v-icon right class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="handleLogout">
            <template v-slot:prepend>
              <v-icon icon="mdi-logout" color="#E53E3E"></v-icon>
            </template>
            <v-list-item-title style="color: #E53E3E;">Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Konten Utama -->
    <v-main style="background-color: #F7F9FC;" :class="{ 'blur-content': unlockModal.showModal.value }">
      <v-container fluid class="pa-6" style="height: 100%;">
        <slot></slot>
      </v-container>
    </v-main>

    <!-- Overlay Modal Buka Kunci -->
    <v-dialog
      v-model="unlockModal.showModal.value"
      persistent
      max-width="450"
      :scrim="true"
      scrim-class="blur-scrim"
    >
      <v-card class="rounded-xl pa-4" style="background: white;">
        <v-card-title class="text-h5 font-weight-bold text-center mb-4" style="color: #2D3748;">
          <v-icon icon="mdi-lock-open-outline" color="#1DA88B" size="32" class="mb-2"></v-icon>
          <div>Buka Kunci Aman</div>
        </v-card-title>

        <v-card-text class="text-center mb-4">
          <p style="color: #718096;">
            Masukkan password untuk membuka kunci privat dan melanjutkan obrolan.
          </p>
        </v-card-text>

        <v-card-text>
          <v-text-field
            v-model="unlockModal.password.value"
            type="password"
            label="Password"
            placeholder="Masukkan password Anda"
            variant="outlined"
            rounded="lg"
            bg-color="#F7F9FC"
            :error-messages="unlockModal.error.value"
            @keyup.enter="unlockModal.unlock"
            :disabled="unlockModal.loading.value"
            autofocus
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="flex-column gap-2">
          <v-btn
            color="#1DA88B"
            variant="flat"
            rounded="lg"
            block
            size="large"
            :loading="unlockModal.loading.value"
            @click="unlockModal.unlock"
          >
            Buka Kunci
          </v-btn>

          <v-btn
            variant="text"
            color="#718096"
            block
            @click="unlockModal.logout"
          >
            Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../store/authStore'
import { useRouter } from 'vue-router'
import { useUnlockModal } from '../composables/useUnlockModal'

const authStore = useAuthStore()
const router = useRouter()
const unlockModal = useUnlockModal()

// Memeriksa status kunci saat layout dimuat
onMounted(() => {
  unlockModal.checkAndShow()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.blur-content {
  filter: blur(4px);
  pointer-events: none;
}

:deep(.blur-scrim) {
  backdrop-filter: blur(8px);
  background-color: rgba(0, 0, 0, 0.5) !important;
}
</style>
