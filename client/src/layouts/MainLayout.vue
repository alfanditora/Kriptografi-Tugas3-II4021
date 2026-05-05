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
      <v-menu location="bottom end">
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
    <v-main style="background-color: #F7F9FC;">
      <v-container fluid class="pa-6" style="height: 100%;">
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { useAuthStore } from '../store/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
