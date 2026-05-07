<script setup>
import { RouterView } from 'vue-router'
import { useToast } from './composables/useToast'

const { show, message, color, timeout } = useToast()
</script>

<template>
  <v-app>
    <RouterView />
    
    <!-- Global Snackbar for Toasts -->
    <v-snackbar
      v-model="show"
      :color="color"
      :timeout="timeout"
      location="top right"
      variant="flat"
      elevation="4"
      class="mt-4 mr-4"
    >
      <div class="d-flex align-center">
        <v-icon
          start
          :icon="color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
          class="mr-2"
        ></v-icon>
        <span class="font-medium">{{ message }}</span>
      </div>
      
      <template v-slot:actions>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="show = false"
          size="small"
        ></v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style>
/* Reset basic styles if needed */
body {
  margin: 0;
  padding: 0;
}
</style>
