<template>
  <v-app>
    <v-main
      class="d-flex align-center justify-center"
      style="background-color: #F7F9FC; min-height: 100vh;"
    >
      <v-container fluid class="pa-4">
        <v-row align="center" justify="center" class="ga-0">
          <v-col cols="12" class="d-flex justify-center">
            <slot></slot>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
/**
 * AuthLayout menyediakan tata letak yang konsisten untuk halaman login dan registrasi.
 */
</script>
